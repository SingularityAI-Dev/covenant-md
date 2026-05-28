# Claude Code plugin for COVENANT.md

Gives Claude Code users a first-class COVENANT.md experience via slash commands
that orchestrate the [`@covenant-md/mcp`](https://www.npmjs.com/package/@covenant-md/mcp)
MCP server tools (validate, test, lint, diff, graph, list-templates).

## Quick setup

**Step 1: copy the slash commands into your project**

```bash
cp -r integrations/claude-code/commands/ /your-project/.claude/commands/covenant/
```

Or symlink for a shared install:

```bash
ln -s /path/to/covenant-md/integrations/claude-code/commands /your-project/.claude/commands/covenant
```

**Step 2: add the MCP server to `.claude/settings.json`**

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

For local development against the monorepo:

```json
{
  "mcpServers": {
    "covenant-md": {
      "command": "node",
      "args": ["./packages/mcp/src/index.js"]
    }
  }
}
```

## Slash commands

| Command | What it does | Arguments | Example |
| --- | --- | --- | --- |
| `/covenant:validate` | Find every `COVENANT.md` in the project and show a validation summary. | None | `/covenant:validate` |
| `/covenant:check` | Run heuristic design-quality lint on one skill. | `<skill_path>` | `/covenant:check ./skills/docx-generation/` |
| `/covenant:init` | Scaffold a new skill (COVENANT.md + SKILL.md) interactively. | `[skill_name]` | `/covenant:init markdown-to-html` |
| `/covenant:diff` | Semantic diff between two `COVENANT.md` files: breaking, additive, or cosmetic. | `<old> <new>` | `/covenant:diff v1/COVENANT.md v2/COVENANT.md` |
| `/covenant:graph` | Emit a dependency graph over a directory of skills (DOT or JSON). | `<skills_dir> [--format json]` | `/covenant:graph ./skills` |

## CLAUDE.md integration

Add to your project's `CLAUDE.md` so Claude Code reaches for these commands:

```markdown
## Skill contracts

Use `/covenant:validate` to check every COVENANT.md in this project against the spec.
Use `/covenant:check <skill_path>` for design-quality lint on a single skill.
Use `/covenant:init` to scaffold a new skill with a COVENANT.md and SKILL.md pair.
```

## MCP tools used

The slash commands call the six tools exposed by `@covenant-md/mcp`:

| Tool | What it does |
| --- | --- |
| `covenant_validate` | Validate a COVENANT.md file against the spec. |
| `covenant_test` | Run a skill's fixtures through the contract-driven runner. |
| `covenant_lint` | Heuristic design-quality lint on a skill's COVENANT.md. |
| `covenant_diff` | Classify changes as breaking, additive, or cosmetic. |
| `covenant_graph` | Dependency graph over a directory of skills. |
| `covenant_list_templates` | Templates the generator can scaffold from. |

Licence: MIT.
