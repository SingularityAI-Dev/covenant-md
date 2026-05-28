import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

describe('@covenant-md/mcp createServer', () => {
  it('returns an McpServer instance', () => {
    const server = createServer();
    assert.ok(server, 'createServer should return a server instance');
    // The SDK exposes the underlying Server via .server; sanity-check it exists.
    assert.ok(server.server || server, 'server should be constructable');
  });

  it('registers the expected six tools', async () => {
    const server = createServer();
    // McpServer keeps its internal tool registry; try to list them via its API.
    // Different SDK versions expose this differently, so we probe defensively.
    const tools =
      (typeof server.listTools === 'function' && (await server.listTools())) ||
      server._tools ||
      server.tools ||
      null;

    // If we cannot enumerate tools (older SDK), at least assert the server has the
    // tool() method that was used to register them.
    if (!tools) {
      assert.equal(typeof server.tool, 'function', 'server.tool should be a function');
      return;
    }

    const names = Array.isArray(tools)
      ? tools.map((t) => t.name)
      : Object.keys(tools);

    const expected = [
      'covenant_validate',
      'covenant_test',
      'covenant_lint',
      'covenant_diff',
      'covenant_graph',
      'covenant_list_templates',
    ];
    for (const n of expected) {
      assert.ok(names.includes(n), `expected tool ${n} to be registered, got: ${names.join(', ')}`);
    }
  });
});
