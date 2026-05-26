# Contributing to COVENANT.md

Thanks for your interest in the COVENANT.md specification and reference
framework. This guide covers how to build, test, and submit changes.

## Repository layout

- `docs/COVENANT.md`: the canonical specification. The source of truth when
  validator or test-runner behaviour is ambiguous.
- `covenant-framework/`: the reference framework: validator, test runner,
  generator, and CLI. All framework code lives here.
- `covenant-framework/examples/`: example skills exercised as fixtures.

## Build and test

All framework commands run from `covenant-framework/`:

```bash
cd covenant-framework
npm ci                 # install exact dependencies
npm test               # Jest suite (run under --experimental-vm-modules)
npm run test:fixtures  # run all four example skills end-to-end through the CLI
npm run validate -- examples/docx-generation/COVENANT.md
npm run generate -- my-new-skill
```

Both `npm test` and `npm run test:fixtures` must pass before you open a pull
request. CI runs the same two steps on Node 20 and Node 22.

## Conventions

- **ESM only** inside `covenant-framework/`: use `import` / `export` and include
  the `.js` extension in relative import paths.
- **No em-dashes** anywhere in prose, code comments, or documentation. Use
  commas, semicolons, colons, or full stops.
- **British English** spelling in documentation and prose (behaviour, licence,
  organise, colour).
- No AI-signature phrasing. Match the measured, declarative voice of the
  specification.
- Keep changes surgical: touch only what the change requires.

## Spec changes

The specification is versioned. A change that alters a normative requirement
(a MUST or SHOULD) is a spec change and must update the `covenant_version`
guidance and the conformance section accordingly. Open an issue to discuss
normative changes before sending a pull request.

## Scope

This repository holds the specification, validator, CLI, and examples only.
Please do not contribute enterprise or governance tooling here.

## Licensing of contributions

Contributions to `covenant-framework/` are accepted under the MIT License.
Contributions to the specification text are accepted under CC-BY-4.0. By
opening a pull request you agree to license your contribution under the
licence that covers the files you change.
