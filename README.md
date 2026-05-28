# COVENANT.md

[![CI](https://github.com/SingularityAI-Dev/covenant-md/actions/workflows/ci.yml/badge.svg)](https://github.com/SingularityAI-Dev/covenant-md/actions/workflows/ci.yml)
[![Spec: CC-BY-4.0](https://img.shields.io/badge/spec-CC--BY--4.0-blue.svg)](LICENSE-spec)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)

![A skill bound by its covenant](docs/assets/covenant-md-binding.png)

**The design contract layer for AI agent skills.**

A `SKILL.md` tells an agent *how* to use a skill. A `COVENANT.md` declares *what
the skill is*: its domain, the interface it exposes, what it depends on, the
typed contracts it promises, and the fixtures that prove it. The covenant sits
beside `SKILL.md` in a skill folder and turns an informal bundle of instructions
into something you can validate, test, and reason about before a single line of
implementation is written.

## The five questions

Every COVENANT.md answers five questions about a skill:

- **Domain: who are you?** The skill's identity and the problem space it owns.
- **Interface: what do you expose?** The operations callers may invoke, and
  nothing more. The boundary that stops internal complexity leaking outward.
- **Dependencies: what do you need?** The tools, sibling skills, and
  environment a correct invocation requires.
- **Contracts: what do you promise?** Typed inputs and outputs, plus invariants
  that hold for every invocation regardless of input.
- **Quality: how do you prove it?** Fixtures and gates that demonstrate the
  skill meets its contracts, runnable by a validator.

## How it relates to SKILL.md and LOGIC.md

**SKILL.md is the *how*; COVENANT.md is the *what*.** SKILL.md is procedural
knowledge: the steps, scripts, and tools an agent follows. COVENANT.md is the
design contract that sits above it, declaring the commitments the skill makes so
that callers can depend on a boundary rather than on the skill's internals.

**LOGIC.md is *flow*; COVENANT.md is *contract*.** LOGIC.md describes a
multi-step reasoning pipeline as a directed graph: a task-level structure of how
work flows from step to step. COVENANT.md describes a single skill as a
bilateral binding: a skill-level statement of what the skill promises and what a
caller must supply. They are complementary. A LOGIC.md step that invokes a skill
can assert against that skill's declared contracts rather than guessing at its
behaviour. A flow and a binding are never drawn the same way.

## Skills as contracts

A skill that publishes a covenant is no longer a folder you have to read in full
to trust. It is a party to an agreement. State your domain, expose a narrow
interface, declare your dependencies, promise typed contracts, and prove them
with fixtures. That is the shift: **skills as contracts.** #SkillsAsContracts

## Quickstart

Install the CLI from npm:

```bash
npm install -g @covenant-md/cli
covenant validate path/to/COVENANT.md
```

Or use the library directly:

```bash
npm install @covenant-md/core
```

### From source

The repository is an npm workspaces monorepo: `packages/core` (`@covenant-md/core`)
and `packages/cli` (`@covenant-md/cli`).

```bash
git clone https://github.com/SingularityAI-Dev/covenant-md.git
cd covenant-md
npm ci

# Validate a covenant against the spec
node packages/cli/src/cli.js validate examples/docx-generation/COVENANT.md

# Run the example skills through the contract-driven runner
npm run test:fixtures

# Scaffold a new skill (interactive blueprint)
node packages/cli/src/cli.js generate
```

The CLI ships `validate`, `test`, `generate`, `lint`, `diff`, and `graph`.

## Examples tour

Four worked example skills live under `examples/`, each a complete COVENANT.md
you can validate and run:

- **markdown-to-html**: a single pure transform; the smallest useful covenant.
- **pdf-generation**: document creation with output contracts.
- **template-rendering**: typed inputs rendered against a template.
- **docx-generation**: create, read, and edit operations with invariants,
  roundtrip fixtures, and quality gates.

Run any of them with `node packages/cli/src/cli.js test examples/<name>/`, or
`covenant test examples/<name>/` once the CLI is installed.

## Specification

The canonical specification is [docs/COVENANT.md](docs/COVENANT.md). It is the
source of truth when framework behaviour is ambiguous.

## Licensing

- **Specification** (the COVENANT.md format and its prose): [CC-BY-4.0](LICENSE-spec).
- **Reference framework** (`packages/core` and `packages/cli`): [MIT](LICENSE).
- **The "COVENANT.md" name**: see [TRADEMARK.md](TRADEMARK.md), including the
  conditions for calling a tool "COVENANT.md compliant".

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build and test instructions and the
project conventions (no em-dashes, British English, ESM only inside
`packages/`).
