# Roadmap

> Last updated: 2026-05-27
>
> v1.0 MVP shipped. Detailed milestone plans live in `.planning/`. This file is the public-facing summary.

## Shipped (v1.0)

- [x] `docs/COVENANT.md`: canonical specification (CC-BY-4.0).
- [x] `@covenant-md/core` and `@covenant-md/cli` on npm, with bin `covenant`.
- [x] Six-command CLI: `validate`, `test`, `generate`, `lint`, `diff`, `graph`.
- [x] Four worked example skills exercised as fixtures.
- [x] **PUB-01**: published to npm under `@covenant-md/*` scope.
- [x] **VALIDATOR-VERSIONING**: validator rejects unrecognised major
  `covenant_version` per spec §Versioning; unknown fields under known sections
  are ignored.
- [x] **F-08**: canonical `spec/schema.json` (JSON Schema draft 2020-12) plus
  conformance fixtures and parser/runtime/full tiers; `IMPLEMENTER-GUIDE.md`.
- [x] Repo governance: SECURITY, CODE_OF_CONDUCT, issue and PR templates,
  CODEOWNERS, dependabot, the reusable `covenant-validate` GitHub Action, Biome.
- [x] CI on Node 20 and 22; conformance fixtures run on every push.

## Next (v1.1 candidates)

- [ ] **SPEC-01**: extend the spec with `pattern`, `format`, or `endsWith` on
  string contracts. The docx-generation `invalid-output-path` fixture was
  dropped at public launch because v1.0 cannot express the constraint;
  reinstate it once this lands.
- [x] **MCP-01**: `@covenant-md/mcp` server exposing validate, test, lint, diff,
  graph, and list_templates as MCP tools over stdio.
- [x] **PORT-01**: Python SDK on PyPI as `covenant-md` (alpha). Parser and
  validator conformance-tested against the same `spec/fixtures/` as the JS core.
- [ ] **DOC-01**: documentation site generated from the spec and examples.

## Later

- [x] Claude Code plugin with `/covenant:` slash commands (`integrations/claude-code/`).
- [ ] VSCode extension (syntax, snippets, inline validation).
- [ ] Eval benchmark harness measuring the contract thesis.
- [ ] Skill marketplace / registry (separate product).
- [ ] Full LOGIC.md runtime integration (separate repo).
- [ ] Changelog generation from `covenant diff` output.
- [ ] Deprecation warnings propagated to consumers via `stability: deprecated`.
- [ ] Shared domain-language merging across skills in a library.
