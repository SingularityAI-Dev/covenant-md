# Roadmap

> Last updated: 2026-05-14
>
> v1.0 MVP shipped. Detailed milestone plans live in `.planning/`. This file is the public-facing summary.

## Now (Active)

- [ ] Review and merge `chore/covenant-editorial-pass-1` (three-pass editorial revision of `docs/COVENANT.md`; framework code untouched, 56 tests pass)

## Next (v1.1 candidates)

- [ ] **SPEC-01** — Extend COVENANT.md spec with `pattern` / `endsWith` on string contracts. Closes the impl-specific gap surfaced by Phase 2 (docx-generation `invalid-output-path` fixture).
- [ ] **VALIDATOR-VERSIONING** — Bring `validator.js` `covenant_version` handling into line with spec §Versioning. v1.0 validator warns on unrecognised versions; spec now says MUST reject unrecognised majors and MUST ignore unknown fields under known sections.
- [ ] **DOC-01** — Documentation site generated from spec + examples
- [ ] **PUB-01** — Publish framework to npm with `bin: covenant`
- [ ] **MCP-01** — `covenant doctor` command for live MCP server availability checks

## Later

- [ ] **PORT-01** — Python port of validator (read-only conformance against same fixtures)
- [ ] **F-08** — Quick-reference field index (deferred Pass 1 finding; ideally landed alongside a JSON schema export)
- [ ] Skill marketplace / registry (separate product)
- [ ] Full LOGIC.md runtime integration (separate repo)
- [ ] Changelog generation from `covenant diff` output
- [ ] Deprecation warnings propagated to consumers via `stability: deprecated`
- [ ] Shared domain-language merging across skills in a library
