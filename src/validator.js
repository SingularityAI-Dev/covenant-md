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
  
  // Validate covenant_version
  if (data.covenant_version) {
    // Currently only "1.0" is supported
    if (data.covenant_version !== '1.0') {
      result.warnings.push(`Unsupported covenant_version: ${data.covenant_version}. Only "1.0" is currently supported.`);
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
    
    // Validate depends_on references
    if (fixture.depends_on) {
      const dependencyIds = fixtures
        .filter(f => f && f.id)
        .map(f => f.id);
      
      if (!dependencyIds.includes(fixture.depends_on)) {
        result.errors.push(`quality.fixtures[${index}].depends_on references non-existent fixture id: ${fixture.depends_on}`);
      }
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