# Changelog

> Rolling log of last 20 notable changes. Full history in git.

## [1.0.0] - 2026-05-06 — MVP

### Added
- **`covenant graph`** — DOT and JSON dependency graph with DFS cycle detection and `external: true` markers (1f97037, b2fc4bd, 0d197f6)
- **`covenant diff`** — Breaking/additive/cosmetic classification driven by `interface.breaking_changes` (c3feeae, 4a04dd6)
- **`covenant lint`** — 5 heuristics + `--strict` exit semantics (7c606b1, 2f01ef5)
- **Generic skill runner** (`src/skill-runner.js`) — contract-driven simulator + process strategies (eee8a11, 660bb1b)
- **Two new example skills:** `markdown-to-html` (depends on `template-rendering`) and `template-rendering` (a8679e9, 83f2651)
- **Jest test suite** — 56 tests across 7 suites (validator, test-runner, generate, skill-runner, lint, diff, graph) (multiple commits)

### Changed
- `cli.js` rewired to import `createSkillRunner` factory; `pdf-generation` test now exits 0 (dca9188)
- `cli.js` grew from 94 → 124 lines after wiring lint/diff/graph (still well under 180-line budget)
- `CLAUDE.md` updated three times across phases to reflect single-tree, generic runner, and shipped CLI surface (e959d11, d38cc70, 9582aee)
- `covenant-framework/README.md` documents all 6 commands and 4 example skills (1f97037)

### Removed
- Repo-root CommonJS stub: `/src`, `/temp_end.js`, `/package.json`, `/package-lock.json` (347b064)
- `dev` placeholder command from `cli.js`, `package.json`, README (f43d541, 986a410, 7dc7b3f)

### Documented
- **SPEC-01** logged for v1.1: extend COVENANT.md spec with `pattern`/`endsWith` on string contracts (closes the docx-generation `invalid-output-path` impl-specific fixture gap)

## [pre-1.0] - earlier

- Initial framework implementation: validator, test-runner, generator, CLI (`covenant-framework/`) — see git history pre-`d386c76`
