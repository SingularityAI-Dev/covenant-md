# COVENANT.md Framework

An implementation of the COVENANT.md specification for AI agent skills. This framework provides tools to validate, test, and generate skills that conform to the COVENANT.md design contract standard.

## What is COVENANT.md?

COVENANT.md is a design contract layer for AI agent skills that declares:
- **Domain**: What the skill does and its ubiquitous language
- **Interface**: What operations the skill exposes
- **Dependencies**: What the skill needs to function
- **Contracts**: Typed inputs/outputs, side effects, and invariants
- **Quality**: TDD fixtures and quality gates for proof of correctness

## Features

- **Validation**: Check COVENANT.md files for specification compliance
- **Testing**: Execute quality fixtures defined in skills
- **Generation**: Create new skill blueprints from templates
- **Examples**: Four reference skills covering docx-generation, pdf-generation, markdown-to-html, and template-rendering, including a real `dependencies.skills` edge for graph walks

## Installation

```bash
npm install
```

## Usage

### Validate a COVENANT.md file
```bash
npm run validate -- examples/docx-generation/COVENANT.md
```

### Run framework unit tests

Jest test suite covering validator, test runner, and generator behavior:

```bash
npm test
# or, equivalently:
npm run test:framework
```

### Run skill fixtures

Execute the COVENANT.md fixtures of an example skill via the CLI's contract-driven generic runner (no per-skill code; the runner is steered entirely by `contracts.inputs` / `contracts.outputs` / `quality.fixtures`):

```bash
npm run test:fixtures
# or, against an arbitrary skill:
node src/cli.js test path/to/skill/
```

### Generate a new skill
```bash
npm run generate -- my-new-skill
```

### Lint a skill
```bash
node src/cli.js lint examples/pdf-generation/COVENANT.md
node src/cli.js lint examples/pdf-generation/COVENANT.md --strict   # fail on warning
```

### Diff two COVENANT.md files
```bash
node src/cli.js diff examples/docx-generation/COVENANT.md examples/pdf-generation/COVENANT.md
```

### Graph a skills directory
```bash
node src/cli.js graph examples/                       # DOT to stdout
node src/cli.js graph examples/ --format json         # JSON to stdout
node src/cli.js graph examples/ | dot -Tpng -o graph.png   # render via graphviz
```

### Available Commands
- `validate <filePath>` - Validate a COVENANT.md file
- `test <skillPath>` - Run COVENANT.md fixtures for a skill via the generic contract-driven runner
- `generate <skillName>` - Generate a new skill blueprint
- `lint <skillPath>` - Run heuristic design-quality checks (shallow-deep, missing-invariants, undeclared-side-effects); use `--strict` to fail on warnings
- `diff <oldPath> <newPath>` - Diff two COVENANT.md files; classify changes as breaking/additive/cosmetic
- `graph <skillsDir>` - Walk a skills directory and emit a dependency graph (`--format dot` default, or `json`)

## Example Skills

This framework includes four example skills that demonstrate COVENANT.md usage:

1. **docx-generation** - Create, read, and edit Microsoft Word documents
2. **pdf-generation** - Generate PDF documents from structured content
3. **markdown-to-html** - Convert markdown to HTML; demonstrates `dependencies.skills`
4. **template-rendering** - Pure template-application skill; leaf node in the dependency graph

Each example includes:
- A complete COVENANT.md file following the specification
- A corresponding SKILL.md with procedural instructions

## Implementation Details

The framework consists of several core modules:

- **validator.js**: Validates COVENANT.md files against the specification
- **test-runner.js**: Executes quality fixtures defined in COVENANT.md
- **generator.js**: Creates new skill blueprints from templates
- **cli.js**: Command-line interface tying everything together
- **index.js**: Main entry point

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.