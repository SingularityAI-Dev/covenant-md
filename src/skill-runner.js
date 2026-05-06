/**
 * Generic, contract-aware skill runner.
 *
 * Exports a single factory `createSkillRunner({ covenantPath, _spawn })`
 * which reads a skill's COVENANT.md and returns an async function with
 * the signature `(skillName, operation, input) => { success, output, error? }`
 * matching the interface CovenantTestRunner invokes (src/test.js:366).
 *
 * Two strategies ship:
 *
 *   simulator (default)
 *     Validates `input` against `contracts.inputs` per-field declarations
 *     (required/type/nested-schema-required), synthesizes a stub output
 *     object from `operation.returns` + `contracts.outputs[<field>].schema`
 *     using the type-default table (string→"", number→1, boolean→true,
 *     array→[], object→{}), and maintains a path-map across invocations
 *     so write→read roundtrips return the originally-stored payload.
 *     The simulator never branches on `skillName` — it operates purely
 *     from contracts, which is what makes it generic.
 *
 *   process
 *     Spawns `runner.command[0]` with `runner.command.slice(1)` in
 *     `runner.cwd` (default: dirname(covenantPath)), writes
 *     `JSON.stringify({ skill, operation, input })` to stdin, and parses
 *     `{ success, output, error }` from stdout.
 *
 * Strategy is derived from the optional top-level `runner` block in the
 * skill's COVENANT.md frontmatter. Absent or `runner.strategy !== 'process'`
 * → simulator.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn as nodeSpawn } from 'node:child_process';
import yaml from 'js-yaml';

const TYPE_DEFAULTS = {
  string: () => '',
  number: () => 1,
  boolean: () => true,
  array: () => [],
  object: () => ({})
};

function isOfType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      // Unknown type declaration — treat as pass-through.
      return true;
  }
}

function defaultFor(type) {
  const fn = TYPE_DEFAULTS[type];
  return fn ? fn() : null;
}

function parseFrontmatter(covenantPath) {
  const fileContent = fs.readFileSync(covenantPath, 'utf8');
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`COVENANT.md missing YAML frontmatter: ${covenantPath}`);
  }
  return yaml.load(match[1]);
}

/**
 * Build the simulator runner.
 *
 * @param {Object} parsed - Parsed YAML frontmatter object.
 * @returns {Function} async (skillName, operation, input) => result
 */
function makeSimulator(parsed) {
  const surface = parsed?.interface?.surface || [];
  const inputsContract = parsed?.contracts?.inputs || {};
  const outputsContract = parsed?.contracts?.outputs || {};
  // Path-map shared across invocations of THIS runner instance.
  const pathMap = new Map();

  function validateField(fieldName, decl, value) {
    if (decl.required && (value === undefined || value === null)) {
      return `${fieldName} is required`;
    }
    if (value === undefined || value === null) return null; // optional + absent
    if (decl.type && !isOfType(value, decl.type)) {
      return `${fieldName} must be a ${decl.type}`;
    }
    if (decl.schema && isOfType(value, 'object')) {
      for (const [nestedKey, nestedDecl] of Object.entries(decl.schema)) {
        const nestedValue = value[nestedKey];
        const nestedErr = validateField(`${fieldName}.${nestedKey}`, nestedDecl, nestedValue);
        if (nestedErr) return nestedErr;
      }
    }
    return null;
  }

  function synthesizeFieldOutput(fieldName, decl, input) {
    // Generalized merge rule: if the input has a key matching this output
    // field name AND the contract type is object/array, deep-copy input[field]
    // instead of synthesizing the empty default. This is what makes
    // write→read roundtrips return the originally-stored payload.
    if (
      input &&
      Object.prototype.hasOwnProperty.call(input, fieldName) &&
      (decl.type === 'object' || decl.type === 'array') &&
      input[fieldName] !== undefined
    ) {
      return JSON.parse(JSON.stringify(input[fieldName]));
    }

    if (decl.schema) {
      const obj = {};
      for (const [key, nestedDecl] of Object.entries(decl.schema)) {
        if (nestedDecl.required) {
          obj[key] = defaultFor(nestedDecl.type);
        }
      }
      return obj;
    }
    return defaultFor(decl.type || 'object');
  }

  return async function simulator(skillName, operation, input = {}) {
    const op = surface.find((entry) => entry.name === operation);
    if (!op) {
      return { success: false, error: `Unknown operation: ${operation}` };
    }

    // 1. Validate inputs.
    const accepts = op.accepts || [];
    for (const fieldName of accepts) {
      const decl = inputsContract[fieldName];
      if (!decl) continue; // contract doesn't declare it; skip
      const err = validateField(fieldName, decl, input[fieldName]);
      if (err) return { success: false, error: err };
    }

    // 2. Path-map LOOKUP before synthesis.
    if (
      accepts.includes('input_path') &&
      typeof input.input_path === 'string' &&
      pathMap.has(input.input_path)
    ) {
      return { success: true, output: pathMap.get(input.input_path) };
    }

    // 3. Synthesize output.
    const returns = op.returns || [];
    const output = {};
    for (const fieldName of returns) {
      const decl = outputsContract[fieldName] || {};
      output[fieldName] = synthesizeFieldOutput(fieldName, decl, input);
    }

    // 4. Path-map STORE after synthesis.
    // Store the synthesized output AUGMENTED with any object/array input
    // field whose name is also declared in contracts.outputs. That way a
    // later operation that reads back from this path (with the read op's
    // `returns` listing one of those fields) can be served the originally-
    // stored payload from the lookup branch above. This is what makes
    // generic write→read roundtrips pass without any skill-specific code.
    if (accepts.includes('output_path') && typeof input.output_path === 'string') {
      const stored = { ...output };
      for (const [outputFieldName, outputDecl] of Object.entries(outputsContract)) {
        if (
          Object.prototype.hasOwnProperty.call(input, outputFieldName) &&
          (outputDecl.type === 'object' || outputDecl.type === 'array') &&
          input[outputFieldName] !== undefined
        ) {
          stored[outputFieldName] = JSON.parse(JSON.stringify(input[outputFieldName]));
        }
      }
      pathMap.set(input.output_path, stored);
    }

    return { success: true, output };
  };
}

/**
 * Build the process-strategy runner. Spawns an external command that
 * speaks JSON over stdio.
 *
 * @param {Object} parsed - Parsed YAML frontmatter object.
 * @param {string} covenantPath - Absolute path to COVENANT.md (for cwd resolution).
 * @param {Function} spawnFn - Spawn function (defaults to node:child_process spawn).
 * @returns {Function} async (skillName, operation, input) => result
 */
function makeProcessRunner(parsed, covenantPath, spawnFn) {
  const runnerCfg = parsed.runner || {};
  const command = runnerCfg.command;
  if (!Array.isArray(command) || command.length === 0) {
    throw new Error('runner.strategy=process requires runner.command (array)');
  }
  const baseDir = path.dirname(covenantPath);
  const cwd = runnerCfg.cwd ? path.resolve(baseDir, runnerCfg.cwd) : baseDir;

  return function processRunner(skillName, operation, input = {}) {
    return new Promise((resolve) => {
      let child;
      try {
        child = spawnFn(command[0], command.slice(1), {
          cwd,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (err) {
        resolve({ success: false, error: `process runner failed: ${err.message}` });
        return;
      }

      let stdout = '';
      let stderr = '';

      if (child.stdout && typeof child.stdout.on === 'function') {
        child.stdout.on('data', (chunk) => {
          stdout += chunk.toString();
        });
      }
      if (child.stderr && typeof child.stderr.on === 'function') {
        child.stderr.on('data', (chunk) => {
          stderr += chunk.toString();
        });
      }

      child.on('error', (err) => {
        resolve({ success: false, error: `process runner failed: ${err.message}` });
      });

      child.on('close', (code) => {
        const trimmed = stdout.trim();
        if (trimmed) {
          try {
            const parsedOut = JSON.parse(trimmed);
            resolve(parsedOut);
            return;
          } catch (_e) {
            // fall through to error path
          }
        }
        resolve({
          success: false,
          error: `process runner failed: ${stderr.trim() || `exit ${code}`}`
        });
      });

      // Send the request payload on stdin.
      try {
        const payload = JSON.stringify({ skill: skillName, operation, input }) + '\n';
        if (child.stdin && typeof child.stdin.write === 'function') {
          child.stdin.write(payload);
        }
        if (child.stdin && typeof child.stdin.end === 'function') {
          child.stdin.end();
        }
      } catch (err) {
        resolve({ success: false, error: `process runner failed: ${err.message}` });
      }
    });
  };
}

/**
 * Public factory.
 *
 * @param {Object} options
 * @param {string} options.covenantPath - Absolute path to a skill's COVENANT.md.
 * @param {Function} [options._spawn] - Test seam; production callers should
 *                                       not pass this. Defaults to node:child_process spawn.
 * @returns {Promise<Function>} async (skillName, operation, input) => { success, output, error? }
 */
export async function createSkillRunner({ covenantPath, _spawn } = {}) {
  if (!covenantPath) {
    throw new Error('covenantPath is required');
  }
  const parsed = parseFrontmatter(covenantPath);
  const strategy = parsed?.runner?.strategy;
  if (strategy === 'process') {
    return makeProcessRunner(parsed, covenantPath, _spawn || nodeSpawn);
  }
  return makeSimulator(parsed);
}
