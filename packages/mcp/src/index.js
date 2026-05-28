#!/usr/bin/env node
// Entry point for the @covenant-md/mcp server. Default transport: stdio.

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

// Redirect any stray console output to stderr so the stdout stream stays
// pure JSON-RPC for the MCP transport.
const origLog = console.log;
console.log = (...args) => {
  process.stderr.write(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n');
};

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('unhandledRejection', (reason) => {
  process.stderr.write(`Unhandled rejection: ${String(reason)}\n`);
  process.exit(1);
});

// stdin close = client disconnected
process.stdin.on('close', () => process.exit(0));

const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write('@covenant-md/mcp listening on stdio\n');

// origLog is retained in case a future transport (HTTP) needs to log to stdout
void origLog;
