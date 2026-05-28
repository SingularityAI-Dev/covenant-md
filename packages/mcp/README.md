# @covenant-md/mcp

The Model Context Protocol server for
[COVENANT.md](https://github.com/SingularityAI-Dev/covenant-md). Six tools wrap
`@covenant-md/core` and expose the COVENANT.md workflow to any MCP-compatible
host (Claude Desktop, Cursor, Windsurf, and others).

```bash
npm install -g @covenant-md/mcp
```

## Tools

| Tool | Description |
| --- | --- |
| `covenant_validate` | Validate a COVENANT.md file against the spec. |
| `covenant_test` | Run a skill's fixtures through the contract-driven runner. |
| `covenant_lint` | Heuristic design-quality lint on a skill's COVENANT.md. |
| `covenant_diff` | Semantic diff: breaking, additive, or cosmetic. |
| `covenant_graph` | Dependency graph (DOT or JSON) over a skills directory. |
| `covenant_list_templates` | Templates the generator can scaffold from. |

## Use with an MCP host

Add to your MCP host config:

```json
{
  "mcpServers": {
    "covenant-md": {
      "command": "npx",
      "args": ["-y", "@covenant-md/mcp"]
    }
  }
}
```

Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible host with
no npm install on the host side.

## Transport

Default transport is stdio (JSON-RPC over stdin/stdout). The server logs
diagnostic output to stderr to keep the stdout stream pure JSON-RPC.

Licence: MIT.
