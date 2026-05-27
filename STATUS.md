# Status

> Updated: 2026-05-25

## Where we are

COVENANT.md is public at github.com/SingularityAI-Dev/covenant-md: the canonical
specification (`docs/COVENANT.md`) plus the reference framework (`covenant-framework/`),
with CI green on Node 20 and 22. The framework ships a validator, a contract-driven test
runner and skill runner, an interactive generator, and a six-command CLI (`validate`,
`test`, `generate`, `lint`, `diff`, `graph`). 56 Jest tests pass and four example skills
pass their fixtures.

## Recent

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
