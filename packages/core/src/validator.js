/**
 * COVENANT.md Validator
 * Validates COVENANT.md files against the specification
 */

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

/**
 * Validates a COVENANT.md file
 * @param {string} filePath - Path to the COVENANT.md file
 * @returns {Object} Validation result with errors and warnings
 */
function validateCovenant(filePath) {
  console.log(`Starting validation of COVENANT.md: ${filePath}`);
  const result = {
    valid: false,
    errors: [],
    warnings: []
  };

  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('File read successfully');
    
    // Extract YAML frontmatter
    const yamlMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      result.errors.push('COVENANT.md must have YAML frontmatter enclosed in ---');
      console.log('Validation failed: Missing YAML frontmatter');
      return result;
    }
    console.log('YAML frontmatter extracted');
    
    const yamlContent = yamlMatch[1];
    let covenantData;
    
    try {
      covenantData = yaml.load(yamlContent);
      console.log('YAML parsed successfully');
    } catch (e) {
      result.errors.push(`Invalid YAML in COVENANT.md: ${e.message}`);
      console.log('Validation failed: Invalid YAML');
      return result;
    }
    
    // Validate required fields
    validateRequiredFields(covenantData, result);
    console.log('Required fields validation complete');
    
    // If we have errors in required fields, don't continue
    if (result.errors.length > 0) {
      console.log('Validation failed: Required fields errors');
      return result;
    }
    
    // Validate field formats
    validateFieldFormats(covenantData, result);
    console.log('Field formats validation complete');
    
    // Validate interface surface operations reference valid contracts
    validateInterfaceSurface(covenantData, result);
    console.log('Interface surface validation complete');
    
    // Validate fixture operations and inputs
    validateFixtures(covenantData, result);
    console.log('Fixtures validation complete');

    // Validate quality gates
    validateQualityGates(covenantData, result);
    console.log('Quality gates validation complete');

    // Check for dependency cycles (if covenant paths are provided)
    validateDependencyCycles(covenantData, path.dirname(filePath), result);
    console.log('Dependency cycles check complete');
    
    // If no errors, the covenant is valid
    result.valid = result.errors.length === 0;
    console.log(`Validation complete. Valid: ${result.valid}, Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings);
    }
    
  } catch (e) {
    result.errors.push(`Failed to read COVENANT.md: ${e.message}`);
    console.log(`Validation failed: ${e.message}`);
  }
  
  return result;
}

/**
 * Validates required fields (covenant_version, name)
 * @param {Object} data - Parsed COVENANT data
 * @param {Object} result - Validation result object
 */
function validateRequiredFields(data, result) {
  if (!data.covenant_version || data.covenant_version.trim() === '') {
    result.errors.push('Missing required field: covenant_version');
  }
  
  if (!data.name || data.name.trim() === '') {
    result.errors.push('Missing required field: name');
  }
}

/**
 * Validates field formats (kebab-case name, semver version, etc.)
 * @param {Object} data - Parsed COVENANT data
 * @param {Object} result - Validation result object
 */
function validateFieldFormats(data, result) {
  // Validate name format (kebab-case)
  if (data.name) {
    const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!kebabCaseRegex.test(data.name)) {
      result.errors.push('Field "name" must be kebab-case (lowercase alphanumeric with hyphens)');
    }
  }
  
  // Validate covenant_version (spec §Versioning)
  // - Recognised major (1.x), known minor: validate.
  // - Recognised major (1.x), newer minor: validate; warn that unknown fields will be ignored.
  // - Unrecognised major (anything not 1.x): MUST reject.
  if (data.covenant_version) {
    const m = String(data.covenant_version).match(/^(\d+)\.(\d+)$/);
    if (!m) {
      result.errors.push(`Invalid covenant_version: "${data.covenant_version}". Expected the form "<major>.<minor>".`);
    } else {
      const major = parseInt(m[1], 10);
      const minor = parseInt(m[2], 10);
      if (major !== 1) {
        result.errors.push(`Unrecognised covenant_version major: "${data.covenant_version}". This validator supports major 1.x; got ${major}.x.`);
      } else if (minor > 0) {
        result.warnings.push(`covenant_version ${data.covenant_version} is newer than this validator's known minor (1.0); unknown fields under known sections will be ignored.`);
      }
    }
  }
  
  // Validate version format (if present)
  if (data.version && data.version.trim() !== '') {
    if (!semver.valid(data.version)) {
      result.errors.push('Field "version" must be valid semver if present');
    }
  }
  
  // Validate stability values
  if (data.stability) {
    const validStabilities = ['stable', 'experimental', 'deprecated'];
    if (!validStabilities.includes(data.stability)) {
      result.errors.push('Field "stability" must be one of: stable, experimental, deprecated');
    }
  }
  
  // Validate contracts inputs and outputs if present
  if (data.contracts) {
    if (data.contracts.inputs) {
      validateContractsInputs(data.contracts.inputs, result);
    }
    
    if (data.contracts.outputs) {
      validateContractsOutputs(data.contracts.outputs, result);
    }
  }
}

/**
 * Validates interface surface operations reference valid contracts
 * @param {Object} data - Parsed COVENANT data
 * @param {Object} result - Validation result object
 */
function validateInterfaceSurface(data, result) {
  if (!data.interface || !data.interface.surface) {
    return; // Optional field
  }
  
  const surface = data.interface.surface;
  if (!Array.isArray(surface)) {
    result.errors.push('Field "interface.surface" must be an array');
    return;
  }
  
  // Get valid input and output field names
  const validInputs = data.contracts && data.contracts.inputs ? 
    Object.keys(data.contracts.inputs) : [];
  const validOutputs = data.contracts && data.contracts.outputs ? 
    Object.keys(data.contracts.outputs) : [];
  
  surface.forEach((operation, index) => {
    if (!operation || typeof operation !== 'object') {
      result.errors.push(`interface.surface[${index}] must be an object`);
      return;
    }
    
    if (!operation.name) {
      result.errors.push(`interface.surface[${index}] missing required field: name`);
      return;
    }
    
    // Validate accepts references
    if (operation.accepts && Array.isArray(operation.accepts)) {
      operation.accepts.forEach((field, fieldIndex) => {
        if (!validInputs.includes(field)) {
          result.errors.push(`interface.surface[${index}].accepts[${fieldIndex}] references unknown input field: ${field}`);
        }
      });
    }
    
    // Validate returns references
    if (operation.returns && Array.isArray(operation.returns)) {
      operation.returns.forEach((field, fieldIndex) => {
        if (!validOutputs.includes(field)) {
          result.errors.push(`interface.surface[${index}].returns[${fieldIndex}] references unknown output field: ${field}`);
        }
      });
    }
  });
  
  // Validate depth declaration heuristic
  if (data.domain && data.domain.depth === 'deep') {
    if (surface.length > 3) {
      result.warnings.push('Deep skills should have 3 or fewer interface operations (heuristic)');
    }
  }
}

/**
 * Validates fixture operations and inputs
 * @param {Object} data - Parsed COVENANT data
 * @param {Object} result - Validation result object
 */
function validateFixtures(data, result) {
  if (!data.quality || !data.quality.fixtures) {
    return; // Optional field
  }
  
  const fixtures = data.quality.fixtures;
  if (!Array.isArray(fixtures)) {
    result.errors.push('Field "quality.fixtures" must be an array');
    return;
  }
  
  // Get valid operation names
  const validOperations = data.interface && data.interface.surface ?
    data.interface.surface.map(op => op.name) : [];
  
  // Get valid input field names
  const validInputs = data.contracts && data.contracts.inputs ?
    Object.keys(data.contracts.inputs) : [];

  // Get valid output field names
  const validOutputs = data.contracts && data.contracts.outputs ?
    Object.keys(data.contracts.outputs) : [];

  // Comparison operators allowed at any level of an expect block
  const expectOperators = ['>', '>=', '<', '<='];

  fixtures.forEach((fixture, index) => {
    if (!fixture || typeof fixture !== 'object') {
      result.errors.push(`quality.fixtures[${index}] must be an object`);
      return;
    }
    
    // Validate operation
    if (!fixture.operation) {
      result.errors.push(`quality.fixtures[${index}] missing required field: operation`);
      return;
    }
    
    if (!validOperations.includes(fixture.operation)) {
      result.errors.push(`quality.fixtures[${index}].operation references unknown operation: ${fixture.operation}`);
    }
    
    // Validate fixture input conformance
    if (fixture.input && typeof fixture.input === 'object') {
      Object.keys(fixture.input).forEach(field => {
        if (!validInputs.includes(field)) {
          result.errors.push(`quality.fixtures[${index}].input references unknown input field: ${field}`);
        }
      });
    }

    // Validate fixture expect conformance against contracts.outputs
    // Mirrors the input cross-check above: an expect block may only
    // reference declared output fields (comparison operators excepted).
    if (fixture.expect && typeof fixture.expect === 'object' && !Array.isArray(fixture.expect)) {
      Object.keys(fixture.expect).forEach(field => {
        if (expectOperators.includes(field)) return;
        if (!validOutputs.includes(field)) {
          result.errors.push(`quality.fixtures[${index}].expect references unknown output field: ${field}`);
        }
      });
    }


    // Validate retry is a non-negative integer if present
    if (fixture.retry !== undefined) {
      if (typeof fixture.retry !== 'number' || !Number.isInteger(fixture.retry) || fixture.retry < 0) {
        result.errors.push(`quality.fixtures[${index}].retry must be a non-negative integer`);
      }
    }

    // Validate depends_on references (string or array of strings)
    if (fixture.depends_on) {
      const dependencyIds = fixtures
        .filter(f => f && f.id)
        .map(f => f.id);

      const deps = Array.isArray(fixture.depends_on) ? fixture.depends_on : [fixture.depends_on];
      deps.forEach(dep => {
        if (!dependencyIds.includes(dep)) {
          result.errors.push(`quality.fixtures[${index}].depends_on references non-existent fixture id: ${dep}`);
        }
      });
    }
  });

  // Validate the depends_on graph is acyclic. The test runner also detects
  // cycles at execution time, but consumers that validate without executing
  // (IDE plugins, CI lint-only mode, the MCP covenant_validate tool) need
  // the validator to catch it too.
  const cyclePath = findFixtureCycle(fixtures);
  if (cyclePath) {
    result.errors.push(`quality.fixtures depends_on graph contains a cycle: ${cyclePath.join(' -> ')}`);
  }
}

/**
 * Detects a cycle in the fixture depends_on graph.
 * @param {Array} fixtures - quality.fixtures array
 * @returns {Array|null} The cycle path as fixture ids, or null when acyclic
 */
function findFixtureCycle(fixtures) {
  const byId = new Map();
  fixtures.forEach(f => {
    if (f && typeof f === 'object' && f.id) {
      byId.set(f.id, f);
    }
  });

  const visited = new Set();
  const stack = [];
  const inStack = new Set();

  function visit(id) {
    if (inStack.has(id)) {
      return stack.slice(stack.indexOf(id)).concat(id);
    }
    if (visited.has(id)) return null;
    visited.add(id);
    stack.push(id);
    inStack.add(id);

    const node = byId.get(id);
    const deps = node && node.depends_on ?
      (Array.isArray(node.depends_on) ? node.depends_on : [node.depends_on]) : [];
    for (const dep of deps) {
      if (byId.has(dep)) {
        const cycle = visit(dep);
        if (cycle) return cycle;
      }
    }

    stack.pop();
    inStack.delete(id);
    return null;
  }

  for (const id of byId.keys()) {
    const cycle = visit(id);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * Validates quality gates per spec: gates is an array of objects with a
 * required id and check, an optional action (retry | fail), an optional
 * non-negative integer max_retries, and an optional on_exhaustion string.
 * A gate that names an operation must reference one declared in
 * interface.surface, same cross-section rule as fixture.operation.
 * @param {Object} data - Parsed COVENANT data
 * @param {Object} result - Validation result object
 */
function validateQualityGates(data, result) {
  if (!data.quality || data.quality.gates === undefined) {
    return; // Optional field
  }

  const gates = data.quality.gates;
  if (!Array.isArray(gates)) {
    result.errors.push('Field "quality.gates" must be an array');
    return;
  }

  const validOperations = data.interface && data.interface.surface && Array.isArray(data.interface.surface) ?
    data.interface.surface.map(op => op && op.name).filter(Boolean) : [];
  const validActions = ['retry', 'fail'];

  gates.forEach((gate, index) => {
    if (!gate || typeof gate !== 'object' || Array.isArray(gate)) {
      result.errors.push(`quality.gates[${index}] must be an object`);
      return;
    }

    if (!gate.id || typeof gate.id !== 'string' || gate.id.trim() === '') {
      result.errors.push(`quality.gates[${index}] missing required field: id`);
    }

    if (!gate.check || typeof gate.check !== 'string' || gate.check.trim() === '') {
      result.errors.push(`quality.gates[${index}] missing required field: check`);
    }

    if (gate.action !== undefined && !validActions.includes(gate.action)) {
      result.errors.push(`quality.gates[${index}].action must be one of: ${validActions.join(', ')}`);
    }

    if (gate.max_retries !== undefined) {
      if (typeof gate.max_retries !== 'number' || !Number.isInteger(gate.max_retries) || gate.max_retries < 0) {
        result.errors.push(`quality.gates[${index}].max_retries must be a non-negative integer`);
      }
    }

    if (gate.on_exhaustion !== undefined && typeof gate.on_exhaustion !== 'string') {
      result.errors.push(`quality.gates[${index}].on_exhaustion must be a string`);
    }

    if (gate.description !== undefined && typeof gate.description !== 'string') {
      result.errors.push(`quality.gates[${index}].description must be a string`);
    }

    if (gate.operation !== undefined && !validOperations.includes(gate.operation)) {
      result.errors.push(`quality.gates[${index}].operation references unknown operation: ${gate.operation}`);
    }
  });
}

/**
 * Validates contracts inputs
 * @param {Object} inputs - Contracts inputs object
 * @param {Object} result - Validation result object
 */
function validateContractsInputs(inputs, result) {
  if (typeof inputs !== 'object' || inputs === null || Array.isArray(inputs)) {
    result.errors.push('Field "contracts.inputs" must be an object');
    return;
  }
  
  Object.keys(inputs).forEach(fieldName => {
    const field = inputs[fieldName];
    if (!field || typeof field !== 'object') {
      result.errors.push(`contracts.inputs.${fieldName} must be an object`);
      return;
    }
    
    // Validate type
    if (!field.type) {
      result.errors.push(`contracts.inputs.${fieldName} missing required field: type`);
    } else {
      const validTypes = ['string', 'number', 'boolean', 'object', 'array'];
      const isUnionType = field.type.includes(' | ') && field.type.split(' | ').every(t => validTypes.includes(t.trim()));
      if (!validTypes.includes(field.type) && !isUnionType) {
        result.errors.push(`contracts.inputs.${fieldName}.type must be one of: string, number, boolean, object, array, or a union type`);
      }
    }
    
    // Validate required is boolean if present
    if (field.required !== undefined && typeof field.required !== 'boolean') {
      result.errors.push(`contracts.inputs.${fieldName}.required must be a boolean`);
    }
  });
}

/**
 * Validates contracts outputs
 * @param {Object} outputs - Contracts outputs object
 * @param {Object} result - Validation result object
 */
function validateContractsOutputs(outputs, result) {
  if (typeof outputs !== 'object' || outputs === null || Array.isArray(outputs)) {
    result.errors.push('Field "contracts.outputs" must be an object');
    return;
  }
  
  Object.keys(outputs).forEach(fieldName => {
    const field = outputs[fieldName];
    if (!field || typeof field !== 'object') {
      result.errors.push(`contracts.outputs.${fieldName} must be an object`);
      return;
    }
    
    // Validate type
    if (!field.type) {
      result.errors.push(`contracts.outputs.${fieldName} missing required field: type`);
    } else {
      const validTypes = ['string', 'number', 'boolean', 'object', 'array'];
      const isUnionType = field.type.includes(' | ') && field.type.split(' | ').every(t => validTypes.includes(t.trim()));
      if (!validTypes.includes(field.type) && !isUnionType) {
        result.errors.push(`contracts.outputs.${fieldName}.type must be one of: string, number, boolean, object, array, or a union type`);
      }
    }
  });
}

/**
 * Detects dependency cycles when covenant paths are provided
 * @param {Object} data - Parsed COVENANT data
 * @param {string} basePath - Base path for resolving relative covenant paths
 * @param {Object} result - Validation result object
 */
function validateDependencyCycles(data, basePath, result) {
  if (!data.dependencies || !data.dependencies.skills) {
    return; // Optional field
  }
  
  const skills = data.dependencies.skills;
  if (!Array.isArray(skills)) {
    result.errors.push('Field "dependencies.skills" must be an array');
    return;
  }
  
  // Build dependency graph
  const graph = new Map();
  const skillNames = new Set();
  
  // Add self to graph
  if (data.name) {
    skillNames.add(data.name);
    graph.set(data.name, []);
  }
  
  // Add dependencies to graph
  skills.forEach((skillDep, index) => {
    if (!skillDep || typeof skillDep !== 'object') {
      result.errors.push(`dependencies.skills[${index}] must be an object`);
      return;
    }
    
    if (!skillDep.name) {
      result.errors.push(`dependencies.skills[${index}] missing required field: name`);
      return;
    }
    
    skillNames.add(skillDep.name);
    
    // Initialize dependency array for this skill if not present
    if (!graph.has(skillDep.name)) {
      graph.set(skillDep.name, []);
    }
    
    // Add edge from current skill to dependency
    if (data.name) {
      const currentDeps = graph.get(data.name) || [];
      currentDeps.push(skillDep.name);
      graph.set(data.name, currentDeps);
    }
    
    // Check for obvious self-dependencies
    if (skillDep.name === data.name) {
      result.errors.push(`Circular dependency detected: skill depends on itself`);
    }
  });
  
  // Simple cycle detection using DFS
  const visited = new Set();
  const recStack = new Set();
  
  function hasCycle(node) {
    if (!visited.has(node)) {
      visited.add(node);
      recStack.add(node);
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
    }
    recStack.delete(node);
    return false;
  }
  
  // Check for cycles starting from each node
  for (const node of skillNames) {
    if (!visited.has(node)) {
      if (hasCycle(node)) {
        result.errors.push('Circular dependency detected in skill dependencies');
        break;
      }
    }
  }
}

export { validateCovenant };