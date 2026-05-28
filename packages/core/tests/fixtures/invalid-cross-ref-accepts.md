---
covenant_version: "1.0"
name: cross-ref-accepts-skill
version: "0.1.0"
stability: experimental

domain:
  purpose: Fixture exercising the unknown-input-field validator branch.

interface:
  entry_point: do-thing
  surface:
    - name: do-thing
      accepts:
        - unknown_field
      returns: []

contracts:
  inputs:
    real_field:
      type: string
      required: true
  outputs: {}
---

# cross-ref-accepts-skill

Fixture: `accepts` references `unknown_field`, which is not declared in `contracts.inputs`. Validator must emit /references unknown input field/.
