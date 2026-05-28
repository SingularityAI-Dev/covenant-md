# covenant-md (Python SDK)

Python SDK for [COVENANT.md](https://github.com/SingularityAI-Dev/covenant-md),
the design contract layer for AI agent skills. **Alpha**: Parser and validator
at the Runtime conformance tier, producing identical verdicts to the
TypeScript-compatible reference core on the shared `spec/fixtures/` suite.

```bash
pip install covenant-md
```

```python
from covenant_md import parse_file, validate_covenant

data = parse_file("path/to/COVENANT.md")
result = validate_covenant("path/to/COVENANT.md")
# result -> {"valid": True, "errors": [], "warnings": [...]}
```

## What it covers

- Frontmatter parsing (YAML).
- JSON Schema structural validation (the canonical schema is bundled).
- Conformance rules from `docs/COVENANT.md` §Conformance:
  - Required fields, kebab-case `name`, semver `version`, `stability` enum.
  - `covenant_version` handling per §Versioning (reject unrecognised majors,
    warn on newer minor under a recognised major, ignore unknown fields under
    known sections).
  - `interface.surface[*].accepts` and `returns` cross-references against
    `contracts.inputs` / `contracts.outputs`.
  - `quality.fixtures[*].operation` cross-references against
    `interface.surface`; `quality.fixtures[*].input` keys against
    `contracts.inputs`.

The contract-driven test runner, lint heuristics, semantic diff, and dependency
graph (Full tier) are not yet implemented in Python and remain in
[`@covenant-md/core`](https://www.npmjs.com/package/@covenant-md/core).

## Conformance parity

The test suite at `sdks/python/tests/test_conformance.py` runs the Python
validator against the same `spec/fixtures/` the JavaScript core passes and
asserts identical verdicts.

Licence: MIT.
