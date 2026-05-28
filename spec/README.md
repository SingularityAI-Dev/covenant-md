# COVENANT.md specification

This directory holds the canonical machine-readable artefacts that define what a
conformant COVENANT.md implementation must do.

- `schema.json`: JSON Schema (draft 2020-12) for the YAML frontmatter. Use it
  for structural validation in any language that has a JSON Schema validator.
  The prose spec at `docs/COVENANT.md` is the source of truth where this schema
  is silent (cross-field references, dependency cycles, versioning behaviour).
- `fixtures/`: golden conformance fixtures, split across `valid/`, `invalid/`,
  and `edge-cases/`. Each `*.covenant.md` has a sibling `*.expected.json` that
  declares the expected outcome (`{ "valid": true }` or
  `{ "valid": false, "rule": "<substring>" }`).
- `fixtures/run-fixtures.mjs`: the reference runner. From the repo root:
  `npm run test:conformance`.

## Conformance tiers

A COVENANT.md implementation may claim one of three tiers:

- **Parser**: reads a COVENANT.md file, separates the YAML frontmatter from the
  markdown body, and parses the YAML into an in-memory object. Validates
  against `schema.json` for structural conformance.
- **Runtime**: everything Parser plus the conformance rules from
  `docs/COVENANT.md` §Conformance (`name` kebab-case, semver, cross-references
  from `accepts`/`returns` and fixture inputs, dependency-cycle detection,
  `covenant_version` handling per §Versioning). Passes every fixture in
  `valid/`, `invalid/`, and `edge-cases/` with the expected verdict.
- **Full**: everything Runtime plus the contract-driven test runner with both
  `simulator` and `process` skill-runner strategies, the lint heuristics, the
  semantic diff (breaking, additive, cosmetic), and the dependency graph.

The reference implementation is `@covenant-md/core` at Full tier. See
[`docs/IMPLEMENTER-GUIDE.md`](../docs/IMPLEMENTER-GUIDE.md) for guidance on
building a port.
