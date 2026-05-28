# Implementer guide

This guide is for anyone building a COVENANT.md implementation in a language
other than the reference TypeScript-compatible core. It names the artefacts you
need, the rules you must enforce, and the conformance gate you must clear.

## What to read first

1. [`docs/COVENANT.md`](COVENANT.md): the prose specification. Source of truth.
2. [`spec/schema.json`](../spec/schema.json): JSON Schema for the frontmatter.
3. [`spec/fixtures/`](../spec/fixtures/): golden inputs and expected outcomes.
4. [`packages/core/src/validator.js`](../packages/core/src/validator.js): the
   reference enforcement. Reads file paths, parses frontmatter, applies the
   conformance rules, returns `{ valid, errors, warnings }`.

## What you must implement, by tier

### Parser tier

- Read a COVENANT.md file. Extract the YAML frontmatter (between leading `---`
  delimiters). Parse it into an in-memory object.
- Validate the object against `spec/schema.json`. Use any JSON Schema 2020-12
  validator in your language: `ajv` in JavaScript, `jsonschema` in Python,
  `jsonschema-rs` in Rust, and so on.
- Your runner must pass every fixture in `valid/` with `valid: true` and every
  fixture in `invalid/` whose rule maps to a structural constraint.

### Runtime tier

On top of Parser, enforce the rules in `docs/COVENANT.md` §Conformance that the
schema cannot express:

- `covenant_version` handling (§Versioning). Recognised major (`1.x`)
  validates; unrecognised major MUST reject with a clear error. Newer minor
  under a recognised major validates with a warning and ignores unknown fields
  under known sections.
- `name` MUST be kebab-case: `^[a-z0-9]+(-[a-z0-9]+)*$`.
- `version` MUST be valid semver if present.
- `stability` MUST be one of `stable`, `experimental`, `deprecated`.
- Every `interface.surface[*].accepts` MUST reference a key in
  `contracts.inputs`. Every `returns` MUST reference a key in
  `contracts.outputs`. No forward references.
- Every `quality.fixtures[*].operation` MUST be a `name` in
  `interface.surface`. Every key in `fixtures[*].input` MUST be declared in
  `contracts.inputs`.
- When `dependencies.skills[*].covenant` paths are provided, resolve the
  dependency graph and reject cycles.
- Unknown fields under known top-level sections MUST be ignored, not rejected.

Pass every fixture in `valid/`, `invalid/`, and `edge-cases/` with the verdict
declared in its `*.expected.json`.

### Full tier

On top of Runtime, implement:

- A contract-driven test runner: extract `quality.fixtures` from the
  frontmatter and from legacy ` ```covenant-fixture ` JSON blocks, topologically
  sort by `depends_on`, invoke a caller-supplied skill runner, and apply
  quality-gate logic.
- Two skill-runner strategies: `simulator` (contract-aware default) and
  `process` (external script over stdin/stdout JSON, see
  `docs/COVENANT.md` §runner).
- Lint heuristics: shallow-deep depth-vs-ops, missing-invariants on stable
  skills, undeclared-side-effects on write-verb operations.
- Semantic diff: classify changes as breaking, additive, or cosmetic against
  `interface.breaking_changes`.
- Dependency graph: DOT (default) or JSON output, with cycle detection.

## Running the conformance suite

From the repo root:

```bash
npm install
npm run test:conformance
```

The runner is `spec/fixtures/run-fixtures.mjs`. To validate against your own
implementation, write an equivalent runner that calls your validator on each
`*.covenant.md` fixture and asserts the result against its `*.expected.json`.

## Known implementations

| Language | Package | Conformance |
| --- | --- | --- |
| JavaScript (TypeScript-compatible) | `@covenant-md/core` | Full |
| Python | [`covenant-md`](https://pypi.org/project/covenant-md/) (alpha) | Runtime (verdict parity against `spec/fixtures/`) |

If you build a COVENANT.md implementation in another language, open a pull
request adding it to this table along with a link to your conformance run.
