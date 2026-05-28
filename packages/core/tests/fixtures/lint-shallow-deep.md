---
covenant_version: "1.0"
name: lint-shallow-deep
version: "1.0.0"
stability: experimental

domain:
  purpose: >
    Lint fixture: declares depth=deep but exposes more than 3 surface
    operations. Should trigger the shallow-deep heuristic and ONLY that
    heuristic (operation names are non-side-effect verbs, stability is
    experimental, invariants are present).
  depth: deep

interface:
  entry_point: SKILL.md
  surface:
    - name: alpha
      accepts:
        - input_data
      returns:
        - result
    - name: beta
      accepts:
        - input_data
      returns:
        - result
    - name: gamma
      accepts:
        - input_data
      returns:
        - result
    - name: delta
      accepts:
        - input_data
      returns:
        - result

contracts:
  inputs:
    input_data:
      type: string
      required: true
  outputs:
    result:
      type: object

  invariants:
    - alpha is idempotent for the same input.
---

# lint-shallow-deep fixture

depth=deep + 4 surface ops. Used to test the `shallow-deep` lint heuristic.
