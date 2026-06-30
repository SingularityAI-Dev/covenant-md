# Status

Updated: 2026-06-09

## Where we are

COVENANT.md is public at github.com/SingularityAI-Dev/covenant-md: the canonical
specification (`docs/COVENANT.md`) plus the reference framework (an npm workspaces
monorepo: `packages/core` as `@covenant-md/core` and `packages/cli` as `@covenant-md/cli`),
with CI green on Node 20 and 22. The framework ships a validator, a contract-driven test
runner and skill runner, an interactive generator, and a six-command CLI (`validate`,
`test`, `generate`, `lint`, `diff`, `graph`). 56 Jest tests pass and four example skills
pass their fixtures.

## Recent

- 2026-05-28: P7 eval harness landed at `benchmarks/`. Three scored metrics
  (interface adherence, output fidelity, undeclared side effects), mock adapter
  for CI smoke, Anthropic adapter wired for real runs. `scripts/verify-go.sh`
  added: a single pre-launch gate that runs every quality check and prints
  PASS/FAIL.
- 2026-05-28: P6 Claude Code plugin landed at `integrations/claude-code/`. Five slash commands
  (`/covenant:validate`, `/covenant:check`, `/covenant:init`, `/covenant:diff`,
  `/covenant:graph`) orchestrating the `@covenant-md/mcp` tools.
- 2026-05-28: P5 Python SDK (alpha) landed. `sdks/python/covenant-md`; parser + validator at
  Runtime tier with verdict parity against the shared `spec/fixtures/` (24/24 tests including
  15-fixture parity). Ready for PyPI publish.
- 2026-05-28: P4 `@covenant-md/mcp` MCP server published to npm. Six tools (`covenant_validate`,
  `covenant_test`, `covenant_lint`, `covenant_diff`, `covenant_graph`, `covenant_list_templates`)
  over stdio.
- 2026-05-28: P3 spec conformance landed. `spec/schema.json` (JSON Schema 2020-12), 15 fixtures
  across valid/invalid/edge-cases, `run-fixtures.mjs`, three conformance tiers, IMPLEMENTER-GUIDE.
  VALIDATOR-VERSIONING fix.
- 2026-05-27: P1 governance (CoC, templates, dependabot, CODEOWNERS, validate Action, Biome
  config) and P2 npm packaging landed. Split into the workspaces monorepo `@covenant-md/core` and
  `@covenant-md/cli`, examples moved to the repo root, 56 tests and four fixtures green.
- 2026-05-25: public launch landed. README leading with the binding visual and the five
  questions, MIT licence for the framework and CC-BY-4.0 for the spec, TRADEMARK note,
  CONTRIBUTING guide, GitHub Actions CI. Em-dash sweep across the tree. Node 20+ required.

## Next

The parity arc toward production-grade tooling, mirroring the sibling logic-md project:

- Repo governance and Biome (in progress).
- npm publish as `@covenant-md/core` and `@covenant-md/cli`.
- Canonical `spec/schema.json` with conformance fixtures and parser, runtime, and full tiers.
- An MCP server, a Python SDK on PyPI, and a Claude Code plugin.
- An eval harness measuring the contract thesis.
