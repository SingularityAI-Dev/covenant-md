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
- **Examples**: Complete reference implementations for docx-generation and pdf-generation skills

## Installation

```bash
npm install
```

## Usage

### Validate a COVENANT.md file
```bash
npm run validate -- examples/docx-generation/COVENANT.md
```

### Run skill tests
```bash
npm run test -- examples/docx-generation/
```

### Generate a new skill
```bash
npm run generate -- my-new-skill
```

### Available Commands
- `validate <filePath>` - Validate a COVENANT.md file
- `test <skillPath>` - Run tests for a skill
- `generate <skillName>` - Generate a new skill blueprint
- `lint` - Lint the codebase (not yet implemented)
- `diff` - Show differences between versions (not yet implemented)
- `graph` - Generate dependency graph (not yet implemented)

## Example Skills

This framework includes two example skills that demonstrate COVENANT.md usage:

1. **docx-generation** - Create, read, and edit Microsoft Word documents
2. **pdf-generation** - Generate PDF documents from structured content

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