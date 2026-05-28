// MCP server for COVENANT.md. Wraps @covenant-md/core as tools.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  validateCovenant,
  CovenantTestRunner,
  createSkillRunner,
  lintCovenant,
  diffCovenants,
  graphSkills,
} from '@covenant-md/core';

/**
 * Wrap a result as the MCP tool content shape.
 * @param {any} payload
 */
function jsonResult(payload) {
  return {
    content: [
      { type: 'text', text: JSON.stringify(payload, null, 2) },
    ],
  };
}

/**
 * Run a function with console.log silenced (the underlying core is chatty;
 * stdout must stay clean for JSON-RPC).
 */
function quiet(fn) {
  const origLog = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = origLog;
  }
}

export function createServer() {
  const server = new McpServer({
    name: '@covenant-md/mcp',
    version: '1.0.0',
  });

  server.tool(
    'covenant_validate',
    'Validate a COVENANT.md file against the COVENANT.md specification.',
    {
      file_path: z.string().describe('Filesystem path to the COVENANT.md file to validate'),
    },
    async ({ file_path }) => {
      const result = quiet(() => validateCovenant(file_path));
      return jsonResult(result);
    }
  );

  server.tool(
    'covenant_test',
    "Run a skill's quality fixtures through the contract-driven test runner.",
    {
      skill_path: z.string().describe('Filesystem path to the skill directory containing COVENANT.md'),
    },
    async ({ skill_path }) => {
      const covenantPath = `${skill_path}/COVENANT.md`;
      const skillRunner = await createSkillRunner({ covenantPath });
      const runner = new CovenantTestRunner({ covenantPath, skillRunner });
      const results = await quiet(() => runner.run());
      return jsonResult(results);
    }
  );

  server.tool(
    'covenant_lint',
    "Run heuristic design-quality lint checks on a skill's COVENANT.md.",
    {
      skill_path: z.string().describe('Filesystem path to the skill directory or COVENANT.md file'),
      strict: z.boolean().optional().describe('Exit non-zero if any warning fires'),
    },
    async ({ skill_path, strict }) => {
      const { code, findings } = await quiet(() => lintCovenant(skill_path, { strict }));
      return jsonResult({ code, findings });
    }
  );

  server.tool(
    'covenant_diff',
    'Semantically diff two COVENANT.md files; classify changes as breaking, additive, or cosmetic.',
    {
      old_path: z.string().describe('Path to the old COVENANT.md'),
      new_path: z.string().describe('Path to the new COVENANT.md'),
      strict: z.boolean().optional().describe('Exit non-zero on breaking changes without a major version bump'),
    },
    async ({ old_path, new_path, strict }) => {
      const { code, sections } = await quiet(() => diffCovenants(old_path, new_path, { strict }));
      return jsonResult({ code, sections });
    }
  );

  server.tool(
    'covenant_graph',
    'Walk a directory of skills and emit a dependency graph in DOT or JSON.',
    {
      skills_dir: z.string().describe('Path to a directory containing skill folders'),
      format: z.enum(['dot', 'json']).optional().describe('Output format (default: dot)'),
    },
    async ({ skills_dir, format }) => {
      const result = await quiet(() => graphSkills(skills_dir, { format: format || 'dot' }));
      return jsonResult(result);
    }
  );

  server.tool(
    'covenant_list_templates',
    'List the COVENANT.md and SKILL.md templates the generator can scaffold from.',
    {},
    async () => {
      // The generator ships one canonical pair: COVENANT.md + SKILL.md.
      // The list is fixed for v1.0; future versions may add named templates.
      return jsonResult({
        templates: [
          {
            name: 'default',
            description: 'A minimal COVENANT.md and SKILL.md pair with the five required sections.',
            files: ['COVENANT.md', 'SKILL.md'],
          },
        ],
      });
    }
  );

  return server;
}
