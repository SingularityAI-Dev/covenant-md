# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

All framework code lives in **`covenant-framework/`**, an ESM Node.js package (`"type": "module"`) implementing the COVENANT.md specification. There is no parallel implementation; the repo root used to host a CommonJS stub but it has been deleted.

- **`covenant-framework/`**, the framework: validator, test runner, generator, CLI. Edit here.
- **`docs/COVENANT.md`**, the canonical specification. Treat as the source of truth when validator or test-runner behavior is ambiguous.
- **`handover-docs/handover.md`**, historical handover note. Useful for context, but verify against current code before relying on its claims.
- **`test-skill/`**, a sample skill (COVENANT.md + SKILL.md) used as a fixture target.

## Working Commands

All commands run from `covenant-framework/`:

```bash
cd covenant-framework

npm install                                    # first-time setup
npm run validate -- examples/docx-generation/COVENANT.md
npm run test     -- examples/docx-generation/  # runs fixtures via simulated skill runner
npm run generate -- my-new-skill               # interactive blueprint scaffold
```

The CLI ships six commands: `validate`, `test`, `generate`, `lint`, `diff`, `graph`. `lint <skill-path>` runs heuristic design-quality checks (shallow-deep depth-vs-ops, missing-invariants on stable skills, undeclared-side-effects on write-verb operations); pass `--strict` to make warnings fail the exit code. `diff <old> <new>` semantically diffs two COVENANT.md files, classifying each change as breaking / additive / cosmetic against the new file's `interface.breaking_changes` declaration; `--strict` raises exit 1 when breaking changes appear without a major version bump. `graph <skills-dir>` walks a directory of skills and emits the dependency graph in DOT (default) or JSON (`--format json`); cycles exit 1 with the cycle path on stderr.

Tests live in `tests/` (Jest, run via `npm test` under `node --experimental-vm-modules`) plus on-disk COVENANT.md fixtures executed by `src/test.js` (run via `npm run test:fixtures`). The Jest suite covers the framework modules; the fixture runner exercises example skills end-to-end through the CLI.

## Architecture

The framework implements the COVENANT.md spec, a YAML-frontmatter-plus-markdown design contract that sits alongside `SKILL.md` in a skill folder. Read `docs/COVENANT.md` for the full spec; the short version: a covenant declares a skill's `domain`, `interface.surface` (operations), `dependencies`, typed `contracts`, and `quality.fixtures`.

Four modules in `covenant-framework/src/` form the pipeline:

1. **`validator.js`**, parses YAML frontmatter, checks required fields (`covenant_version`, `name`), validates kebab-case names, semver versions, that fixtures reference operations in `interface.surface`, and detects dependency cycles when covenant paths are reachable.
2. **`test.js`** (`CovenantTestRunner`), extracts fixtures from frontmatter **and** from legacy ` ```covenant-fixture ` JSON code blocks, topologically sorts them by `depends_on`, then invokes a caller-supplied `skillRunner(skillName, operation, input)` and applies quality-gate logic to compute pass/fail/skip.
3. **`generate.js`**, Handlebars-driven interactive scaffolder using `inquirer`; emits a COVENANT.md + SKILL.md pair from `src/templates/`.
4. **`cli.js`**, `commander`-based entrypoint that wires the three together.

### The skillRunner contract

`test.js` does not execute skills itself; it delegates to a `skillRunner(skillName, operation, input)` function the caller supplies. `cli.js` builds that function by calling `createSkillRunner({ covenantPath })` from `src/skill-runner.js`, which inspects the skill's COVENANT.md and returns one of two strategies:

- **`simulator`** (default), A contract-aware simulator. It validates inputs against `contracts.inputs` (required fields, types, nested schema), synthesizes outputs from each operation's `returns` list combined with `contracts.outputs[<field>].schema` defaults, and maintains a write/read path-map so roundtrip fixtures (write to `output_path`, then read from the same `input_path`) work generically across any skill.
- **`process`**, Spawns an external runner script declared by the skill via a top-level `runner: { strategy: process, command: [...] }` block in COVENANT.md. The runner exchanges JSON `{operation, input}` / `{success, output, error}` over stdin/stdout. No example skill ships using this strategy yet.

The runner has no hardcoded knowledge of any specific skill. To support a new skill, write its COVENANT.md; no framework changes required.

#### Known fixture gap

The `examples/docx-generation/COVENANT.md` skill used to ship an `invalid-output-path` fixture asserting the runner rejects an `output_path` that does not end in `.docx`. That constraint is not expressible in COVENANT.md v1.0 (no `pattern` / `format` / `endsWith` field on string contracts), so the contract-driven simulator could not reproduce it and docx-generation ran at 4/5. The fixture has been dropped pending the v1.1 spec extension (string `pattern` / `endsWith`), tracked as **SPEC-01** in `.planning/ROADMAP.md` and root `ROADMAP.md` (archived v1.0 requirements at `.planning/milestones/v1.0-REQUIREMENTS.md`). When SPEC-01 lands, reinstate the fixture against the new constraint. All four example skills now pass under `npm run test:fixtures`.

### Fixture format

Two formats are supported and both must keep working:
- Modern: `quality.fixtures` array inside YAML frontmatter.
- Legacy: ` ```covenant-fixture ` fenced JSON blocks in the markdown body (see `src/COVENANT.md` for an example).

## Conventions

- ESM only inside `covenant-framework/` (`import`/`export`, `.js` extensions in import paths).
- `*.backup` files (`cli.js.backup`, `validator.js.backup`) are prior versions kept for reference, leave alone unless explicitly cleaning up.
- `examples/my-new-skill/` is intentionally empty (it's the target dir for `npm run generate`).
