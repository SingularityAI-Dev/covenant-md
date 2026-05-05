# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

All framework code lives in **`covenant-framework/`** — an ESM Node.js package (`"type": "module"`) implementing the COVENANT.md specification. There is no parallel implementation; the repo root used to host a CommonJS stub but it has been deleted.

- **`covenant-framework/`** — the framework: validator, test runner, generator, CLI. Edit here.
- **`docs/COVENANT.md`** — the canonical specification. Treat as the source of truth when validator or test-runner behavior is ambiguous.
- **`handover-docs/handover.md`** — historical handover note. Useful for context, but verify against current code before relying on its claims.
- **`test-skill/`** — a sample skill (COVENANT.md + SKILL.md) used as a fixture target.

## Working Commands

All commands run from `covenant-framework/`:

```bash
cd covenant-framework

npm install                                    # first-time setup
npm run validate -- examples/docx-generation/COVENANT.md
npm run test     -- examples/docx-generation/  # runs fixtures via simulated skill runner
npm run generate -- my-new-skill               # interactive blueprint scaffold
```

`lint`, `diff`, `graph` are CLI placeholders that exit with "not yet implemented" — don't claim they work.

There is **no test framework wired up** (jest is in devDependencies but unused; `tests/` is empty). "Tests" in this repo means COVENANT.md fixtures executed by `src/test.js`, not unit tests of the framework itself.

## Architecture

The framework implements the COVENANT.md spec — a YAML-frontmatter-plus-markdown design contract that sits alongside `SKILL.md` in a skill folder. Read `docs/COVENANT.md` for the full spec; the short version: a covenant declares a skill's `domain`, `interface.surface` (operations), `dependencies`, typed `contracts`, and `quality.fixtures`.

Four modules in `covenant-framework/src/` form the pipeline:

1. **`validator.js`** — parses YAML frontmatter, checks required fields (`covenant_version`, `name`), validates kebab-case names, semver versions, that fixtures reference operations in `interface.surface`, and detects dependency cycles when covenant paths are reachable.
2. **`test.js`** (`CovenantTestRunner`) — extracts fixtures from frontmatter **and** from legacy ` ```covenant-fixture ` JSON code blocks, topologically sorts them by `depends_on`, then invokes a caller-supplied `skillRunner(skillName, operation, input)` and applies quality-gate logic to compute pass/fail/skip.
3. **`generate.js`** — Handlebars-driven interactive scaffolder using `inquirer`; emits a COVENANT.md + SKILL.md pair from `src/templates/`.
4. **`cli.js`** — `commander`-based entrypoint that wires the three together.

### The skillRunner contract

`test.js` does not execute skills itself — it delegates to a `skillRunner` function the caller supplies. `cli.js` currently hardcodes a **simulated** skillRunner that pretends to be `docx-generation` (in-memory `Map` of created documents, validates `.docx` extensions, returns mock `validation_result` objects). Real skill execution would replace this stub. When changing fixture semantics, update both `test.js` (the orchestrator) and the `cli.js` simulator together — they are coupled.

### Fixture format

Two formats are supported and both must keep working:
- Modern: `quality.fixtures` array inside YAML frontmatter.
- Legacy: ` ```covenant-fixture ` fenced JSON blocks in the markdown body (see `src/COVENANT.md` for an example).

## Conventions

- ESM only inside `covenant-framework/` (`import`/`export`, `.js` extensions in import paths).
- `*.backup` files (`cli.js.backup`, `validator.js.backup`) are prior versions kept for reference — leave alone unless explicitly cleaning up.
- `examples/my-new-skill/` is intentionally empty (it's the target dir for `npm run generate`).
