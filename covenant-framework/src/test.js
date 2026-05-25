import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

/**
 * Test runner for COVENANT framework
 * Loads COVENANT.md, extracts fixtures, executes them with skill operations,
 * handles dependencies, quality gates, and reports results.
 */
class CovenantTestRunner {
  /**
   * @param {Object} options
   * @param {string} options.covenantPath - Path to COVENANT.md file
   * @param {Function} options.skillRunner - Function to execute skills: (skillName, input) => Promise<{success: boolean, output: any}>
   */
  constructor({ covenantPath, skillRunner }) {
    if (!covenantPath) throw new Error('covenantPath is required');
    if (!skillRunner || typeof skillRunner !== 'function') throw new Error('skillRunner is required and must be a function');
    
    this.covenantPath = covenantPath;
    this.skillRunner = skillRunner;
    this.fixtures = [];
    this.results = new Map();
  }

  /**
   * Load and parse COVENANT.md to extract fixtures
   * @returns {Promise<Array>} Array of fixture objects
   */
  async loadCovenant() {
    try {
      const content = await fs.promises.readFile(this.covenantPath, 'utf8');
      return this.extractFixtures(content);
    } catch (error) {
      throw new Error(`Failed to load COVENANT.md: ${error.message}`);
    }
  }

  /**
   * Extract fixtures from COVENANT.md content
   * First tries to extract from YAML frontmatter, then falls back to JSON code blocks
   * @param {string} content - Markdown content of COVENANT.md
   * @returns {Array} Array of fixture objects
   */
  extractFixtures(content) {
    // Try to extract from YAML frontmatter first
    const yamlFixtures = this.extractFixturesFromYamlFrontmatter(content);
    if (yamlFixtures.length > 0) {
      return yamlFixtures;
    }
    
    // Fall back to JSON code blocks (legacy format)
    return this.extractFixturesFromJsonCodeBlocks(content);
  }

  /**
   * Extract fixtures from YAML frontmatter
   * Assumes fixtures are defined in the quality.fixtures section of YAML frontmatter
   * @param {string} content - Markdown content of COVENANT.md
   * @returns {Array} Array of fixture objects
   */
  extractFixturesFromYamlFrontmatter(content) {
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      return [];
    }
    
    try {
      const yamlContent = yamlMatch[1];
      const parsed = yaml.parse(yamlContent);
      
      // Extract skill name from parsed data
      const skillName = parsed.name || 'unknown';
      
      // Extract fixtures from quality.fixtures
      const fixturesData = parsed.quality && parsed.quality.fixtures ? parsed.quality.fixtures : [];
      
      if (!Array.isArray(fixturesData)) {
        return [];
      }
      
      return fixturesData.map(fixture => {
        // Convert YAML fixture to internal format
        const internalFixture = {
          name: fixture.id || fixture.name, // Use id or name as fixture identifier
          skill: skillName, // The skill this fixture belongs to
          operation: fixture.operation,
          input: fixture.input || {},
          depends_on: Array.isArray(fixture.depends_on) ? fixture.depends_on : 
                     typeof fixture.depends_on === 'string' ? [fixture.depends_on] : [],
          retry: fixture.retry || 0,
          expected_outcome: fixture.expect_failure ? 'fail' : 'pass',
          description: fixture.description,
          expect: fixture.expect,
          expect_failure: fixture.expect_failure,
          expect_failure_reason: fixture.expect_failure_reason,
          tags: fixture.tags || []
        };
        
        return internalFixture;
      });
    } catch (error) {
      console.warn(`Failed to parse YAML frontmatter: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract fixtures from JSON code blocks (legacy format)
   * Assumes fixtures are defined in JSON code blocks with language 'covenant-fixture'
   * @param {string} content - Markdown content of COVENANT.md
   * @returns {Array} Array of fixture objects
   */
  extractFixturesFromJsonCodeBlocks(content) {
    const fixtureRegex = /```covenant-fixture\n([\s\S]*?)\n```/g;
    const fixtures = [];
    let match;
    
    while ((match = fixtureRegex.exec(content)) !== null) {
      try {
        const fixture = JSON.parse(match[1]);
        // Validate required fields
        if (!fixture.name || !fixture.skill) {
          console.warn(`Skipping invalid fixture: missing name or skill`, fixture);
          continue;
        }
        // Set defaults
        fixture.depends_on = fixture.depends_on || [];
        fixture.retry = fixture.retry || 0;
        fixture.expected_outcome = fixture.expected_outcome || 'pass';
        fixtures.push(fixture);
      } catch (parseError) {
        console.warn(`Failed to parse fixture block: ${parseError.message}`);
      }
    }
    
    return fixtures;
  }

  /**
   * Topologically sort fixtures based on dependencies
   * @param {Array} fixtures - Array of fixture objects
   * @returns {Array} Sorted fixtures array
   */
  topologicalSort(fixtures) {
    // Detect circular dependencies
    if (this.hasCircularDependencies(fixtures)) {
      throw new Error('Circular dependency detected in fixtures');
    }
    
    const graph = new Map();
    const inDegree = new Map();
    const nameToFixture = new Map();
    
    // Initialize graph
    fixtures.forEach(fixture => {
      nameToFixture.set(fixture.name, fixture);
      graph.set(fixture.name, new Set());
      inDegree.set(fixture.name, 0);
    });
    
    // Build dependency graph: only consider dependencies that are in the fixture set
    fixtures.forEach(fixture => {
      fixture.depends_on.forEach(dep => {
        if (nameToFixture.has(dep)) {
          graph.get(dep).add(fixture.name);
          inDegree.set(fixture.name, inDegree.get(fixture.name) + 1);
        }
        // Ignore dependencies that are not in the fixture list (they will be handled during execution)
      });
    });
    
    // Kahn's algorithm for topological sort
    const queue = [];
    inDegree.forEach((degree, name) => {
      if (degree === 0) queue.push(name);
    });
    
    const sorted = [];
    while (queue.length) {
      const name = queue.shift();
      sorted.push(nameToFixture.get(name));
      
      graph.get(name).forEach(dependent => {
        inDegree.set(dependent, inDegree.get(dependent) - 1);
        if (inDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      });
    }
    
    return sorted;
  }

  /**
   * Check if there are circular dependencies in fixtures
   * @param {Array} fixtures - Array of fixture objects
   * @returns {boolean} True if circular dependencies exist
   */
  hasCircularDependencies(fixtures) {
    const nameToFixture = new Map();
    fixtures.forEach(fixture => {
      nameToFixture.set(fixture.name, fixture);
    });
    
    const visited = new Set();
    const recStack = new Set();
    
    function hasCycle(nodeName) {
      if (!visited.has(nodeName)) {
        visited.add(nodeName);
        recStack.add(nodeName);
        
        const fixture = nameToFixture.get(nodeName);
        if (fixture) {
          const dependencies = fixture.depends_on || [];
          for (const dep of dependencies) {
            if (!nameToFixture.has(dep)) {
              // Ignore dependencies that are not in the fixture list
              continue;
            }
            if (!visited.has(dep)) {
              if (hasCycle(dep)) {
                return true;
              }
            } else if (recStack.has(dep)) {
              return true;
            }
          }
        }
      }
      recStack.delete(nodeName);
      return false;
    }
    
    for (const fixture of fixtures) {
      if (!visited.has(fixture.name)) {
        if (hasCycle(fixture.name)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Validate fixture output against expected value
   * Supports deep comparison, special operators in expect field, and partial matching for objects
   * @param {*} actual - Actual output from skill execution
   * @param {*} expected - Expected value from fixture
   * @returns {boolean} True if output matches expectation
   */
  validateOutput(actual, expected) {
    // Handle special comparison operators
    if (typeof expected === 'object' && expected !== null) {
      // Handle greater than operator
      if (expected['>'] !== undefined) {
        return actual > expected['>'];
      }
      // Handle greater than or equal operator
      if (expected['>='] !== undefined) {
        return actual >= expected['>='];
      }
      // Handle less than operator
      if (expected['<'] !== undefined) {
        return actual < expected['<'];
      }
      // Handle less than or equal operator
      if (expected['<='] !== undefined) {
        return actual <= expected['<='];
      }
    }
    
    // For objects, perform partial matching (actual must contain at least all expected fields)
    if (typeof actual === 'object' && actual !== null && 
        typeof expected === 'object' && expected !== null) {
      return this.partialEqual(actual, expected);
    }
    
    // For primitives, use strict equality
    return actual === expected;
  }
  
  /**
   * Partial equality check for objects (actual must contain at least all expected fields)
   * @param {*} actual - Actual object
   * @param {*} expected - Expected object (subset)
   * @returns {boolean} True if actual contains at least all expected fields with matching values
   */
  partialEqual(actual, expected) {
    if (actual == null || expected == null) return actual === expected;
    
    if (typeof actual !== 'object' || typeof expected !== 'object') 
      return actual === expected;
    
    const expectedKeys = Object.keys(expected);
    
    for (let key of expectedKeys) {
      if (!actual.hasOwnProperty(key)) return false;
      if (!this.deepEqual(actual[key], expected[key])) return false;
    }
    
    return true;
  }

  /**
   * Deep equality check for objects
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} True if objects are deeply equal
   */
  deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') 
      return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }

  /**
   * Execute a single fixture with retries and dependency checking
   * @param {Object} fixture - Fixture object to execute
   * @returns {Promise<Object>} Result object
   */
  async executeFixture(fixture) {
    const { name, skill, input, depends_on, retry, expected_outcome } = fixture;
    const startTime = Date.now();
    let lastError = null;
    let lastOutput = null;
    let outputError = null;
    let attempts = 0;
    
    // Check dependencies
    for (const dep of depends_on) {
      const depResult = this.results.get(dep);
      if (!depResult || !depResult.passed) {
        return {
          name,
          passed: false,
          skipped: true,
          reason: `Dependency '${dep}' failed or was skipped`,
          attempts: 0,
          duration: Date.now() - startTime
        };
      }
    }
    
    // Execute with retries
    while (attempts <= retry) {
      try {
        attempts++;
        const result = await this.skillRunner(skill, fixture.operation, input);
        const { success, output } = result;
        lastOutput = output;
        
         // Check if outcome matches expectation
        const expectedPass = expected_outcome === 'pass';
        const passed = success === expectedPass;
        
        // If execution success matches expectation, now check output validity
        let outputValid = true;
        let outputError = null;
        if (passed && this.expect) {
          try {
            outputValid = this.validateOutput(output, this.expect);
            if (!outputValid) {
              outputError = `Output does not match expected value`;
            }
          } catch (e) {
            outputValid = false;
            outputError = `Error validating output: ${e.message}`;
          }
        }
        
        if (passed && outputValid) {
          return {
            name,
            passed: true,
            skipped: false,
            expectedOutcome: expected_outcome,
            actualSuccess: success,
            output,
            attempts,
            duration: Date.now() - startTime
          };
        }
         // If we got here, either the execution failed or output validation failed
         if (!passed) {
           return {
             name,
             passed: false,
             skipped: false,
             expectedOutcome: expected_outcome,
             actualSuccess: false,
             output,
             attempts,
             duration: Date.now() - startTime,
             error: `Execution failed: success=${success}`
           };
         }
         if (!outputValid) {
           return {
             name,
             passed: false,
             skipped: false,
             expectedOutcome: expected_outcome,
             actualSuccess: false,
             output,
             attempts,
             duration: Date.now() - startTime,
             error: `Output validation failed: expected=${JSON.stringify(this.expect)}, actual=${JSON.stringify(output)}`
           };
         }
         // If not passed but we have retries left, continue loop
       } catch (error) {
         lastError = error;
         // If this is our last attempt, break
         if (attempts > retry) break;
       }
     }
     
     // All attempts failed
     return {
       name,
       passed: false,
       skipped: false,
       expectedOutcome: expected_outcome,
       actualSuccess: false, // Since we failed
       error: lastError || outputError || 'Output validation failed',
       output: lastOutput,
       attempts,
       duration: Date.now() - startTime
     };
  }

  /**
   * Run all tests and return results
   * @returns {Promise<Object>} Test results summary
   */
  async run() {
    try {
      // Load and parse fixtures
      this.fixtures = await this.loadCovenant();
      
      if (this.fixtures.length === 0) {
        return {
          overall: true,
          message: 'No fixtures found in COVENANT.md',
          fixtures: []
        };
      }
      
      // Sort fixtures by dependencies
      const sortedFixtures = this.topologicalSort(this.fixtures);
      
      // Execute each fixture
      for (const fixture of sortedFixtures) {
        const result = await this.executeFixture(fixture);
        this.results.set(fixture.name, result);
      }
      
       // Calculate overall result
       const fixtureResults = Array.from(this.results.values());
       const passedCount = fixtureResults.filter(r => r.passed && !r.skipped).length;
       const failedCount = fixtureResults.filter(r => !r.passed && !r.skipped).length;
       const skippedCount = fixtureResults.filter(r => r.skipped).length;
       const allPassed = failedCount === 0; // Only failed fixtures affect overall result
       
       return {
         overall: allPassed,
         fixtureCount: this.fixtures.length,
         passedCount,
         failedCount,
         skippedCount,
         fixtures: fixtureResults
       };
     } catch (error) {
       // Calculate counts from processed fixtures even in error case
       const fixtureResults = Array.from(this.results.values());
       const passedCount = fixtureResults.filter(r => r.passed && !r.skipped).length;
       const failedCount = fixtureResults.filter(r => !r.passed && !r.skipped).length;
       const skippedCount = fixtureResults.filter(r => r.skipped).length;
       
       return {
         overall: false,
         error: error.message,
         fixtureCount: this.fixtures.length,
         passedCount,
         failedCount,
         skippedCount,
         fixtures: fixtureResults
       };
     }
   }
}

export { CovenantTestRunner };