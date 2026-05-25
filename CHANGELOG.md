# Changelog

> Rolling log of last 20 notable changes. Full history in git.

## [Unreleased]: editorial branch `chore/covenant-editorial-pass-1`

### Added
- **`docs/editorial/`**, three-pass editorial record: `COVENANT-pass-1-structural.md`, `COVENANT-pass-2-developmental.md`, `COVENANT-pass-3-line.md` (5689b72, 5b5059e, 0d1f4a7)
- **Conformance terms** preamble defining MUST/SHOULD/MAY per RFC 2119 (91fc673)
- **File structure** subsection documenting YAML frontmatter delimiters, freeform body, legacy `covenant-fixture` block support (0ad5b89)
- **Minimum viable covenant** example, smallest validator-conformant skeleton (9a27226)
- **Versioning and forward compatibility** subsection, validators MUST reject unrecognised majors, MUST ignore unknown fields under known sections (07be9e6)
- **`runner:` subsection**, documents simulator/process strategies that the framework already shipped but the spec did not name (4254f4f)

### Changed
- **Ecosystem-placement sections merged** into one; "When to Use It" moved before The Two-Party Model so adoption gating precedes deep reading (5032079)
- **"Validation Rules" relocated** into Specification as closing subsection "Conformance rules" (8dc98c1)
- **Two-Party Model condensed** from parallel bullet lists to a single prose paragraph (e358df3)
- **All 87 em-dashes removed** from `docs/COVENANT.md` per project convention (090cce4)
- **17 MUST/SHOULD/MAY normalisations** against the new conformance preamble (65e505c)
- **Root `ROADMAP.md`**, added "Shipped (v1.0)" section enumerating CLI commands; added three previously in-spec future items to Later (b97931d)

### Removed
- **In-spec Roadmap section**, listed already-shipped CLI commands as future work; reconciled into root `ROADMAP.md` (b97931d)

## [1.0.0] - 2026-05-06: MVP

### Added
- **`covenant graph`**, DOT and JSON dependency graph with DFS cycle detection and `external: true` markers (1f97037, b2fc4bd, 0d197f6)
- **`covenant diff`**, Breaking/additive/cosmetic classification driven by `interface.breaking_changes` (c3feeae, 4a04dd6)
- **`covenant lint`**, 5 heuristics + `--strict` exit semantics (7c606b1, 2f01ef5)
- **Generic skill runner** (`src/skill-runner.js`), contract-driven simulator + process strategies (eee8a11, 660bb1b)
- **Two new example skills:** `markdown-to-html` (depends on `template-rendering`) and `template-rendering` (a8679e9, 83f2651)
- **Jest test suite**, 56 tests across 7 suites (validator, test-runner, generate, skill-runner, lint, diff, graph)

### Changed
- `cli.js` rewired to import `createSkillRunner` factory; `pdf-generation` test now exits 0 (dca9188)
- `CLAUDE.md` updated three times across phases to reflect single-tree, generic runner, and shipped CLI surface (e959d11, d38cc70, 9582aee)
- `covenant-framework/README.md` documents all 6 commands and 4 example skills (1f97037)

### Removed
- Repo-root CommonJS stub: `/src`, `/temp_end.js`, `/package.json`, `/package-lock.json` (347b064)
- `dev` placeholder command from `cli.js`, `package.json`, README (f43d541, 986a410, 7dc7b3f)
