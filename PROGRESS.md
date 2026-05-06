# Progress

> Last updated: 2026-05-06

## Current Status

**v1.0 MVP shipped.** 8/8 active requirements delivered across 3 phases (9 plans). The COVENANT.md framework now validates, lints, diffs, graphs, tests, and generates skills — all driven by a contract-aware generic runner. 56 Jest tests passing.

## Recently Completed

- **Phase 3 / CLI Surface Expansion** — `lint`, `diff`, `graph` commands shipped on the now-generic foundation, plus `markdown-to-html` + `template-rendering` example skills proving the dependency graph
- **Phase 2 / Generic Skill Execution** — `cli.js` reduced 239 → 94 lines; new `src/skill-runner.js` with simulator + process strategies; `pdf-generation` test now exits 0
- **Phase 1 / Foundation Hygiene** — Repo-root `/src` stub deleted; Jest suite stood up; `dev` placeholder removed

## In Progress

- (None — v1.1 not yet scoped)

## Up Next

- **`/gsd:new-milestone` for v1.1** — pick from backlog: SPEC-01 (extend spec with `pattern`/`endsWith` to close the docx fixture gap), DOC-01 (docs site), PUB-01 (npm publish), MCP-01 (`covenant doctor`), PORT-01 (Python port)

## Blocked

- (None)
