# Roadmap

> Last updated: 2026-05-10
>
> v1.0 MVP shipped. Detailed milestone plans live in `.planning/`. This file is the public-facing summary.

## Shipped (v1.0)

CLI commands implemented in `covenant-framework/`:

- [x] `covenant validate` — conformance check against the spec
- [x] `covenant test` — runs quality fixtures, reports pass/fail
- [x] `covenant generate` — interactive blueprint scaffold
- [x] `covenant lint` — heuristic checks (shallow depth, missing invariants, undeclared side effects)
- [x] `covenant diff` — semantic diff highlighting breaking changes
- [x] `covenant graph` — emits the dependency graph of a skill library
- [x] Dependency cycle detection in the validator and `graph` command

## Now (Active)

- (none — v1.1 not yet scoped; run `/gsd:new-milestone` to start)

## Next (v1.1 candidates)

- [ ] **SPEC-01** — Extend COVENANT.md spec with `pattern` / `endsWith` on string contracts. Closes the impl-specific gap surfaced by Phase 2 (docx-generation `invalid-output-path` fixture).
- [ ] **DOC-01** — Documentation site generated from spec + examples
- [ ] **PUB-01** — Publish framework to npm with `bin: covenant`
- [ ] **MCP-01** — `covenant doctor` command for live MCP server availability checks

## Later

- [ ] **PORT-01** — Python port of validator (read-only conformance against same fixtures)
- [ ] Skill marketplace / registry (separate product)
- [ ] Full LOGIC.md runtime integration (separate repo)
- [ ] Changelog generation from `covenant diff` output
- [ ] Deprecation warnings propagated to consumers via `stability: deprecated`
- [ ] Shared domain-language merging across skills in a library
