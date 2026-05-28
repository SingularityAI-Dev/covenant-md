---
covenant_version: "1.0"
name: cross-ref-returns-skill
version: "0.1.0"
stability: experimental

domain:
  purpose: Fixture exercising the unknown-output-field validator branch.

interface:
  entry_point: do-thing
  surface:
    - name: do-thing
      accepts: []
      returns:
        - phantom_output

contracts:
  inputs: {}
  outputs:
    real_output:
      type: string
---

# cross-ref-returns-skill

Fixture: `returns` references `phantom_output`, which is not declared in `contracts.outputs`. Validator must emit /references unknown output field/.
