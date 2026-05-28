---
covenant_version: "1.0"
name: lint-stable-no-invariants
version: "1.5.0"
stability: stable

domain:
  purpose: >
    Lint fixture: stable skill with no contracts.invariants. Should
    trigger the missing-invariants heuristic and ONLY that heuristic
    (single shallow op with a non-side-effect verb name; version major
    is 1 so stable-experimental-mismatch does not fire).
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: compute
      accepts:
        - input_data
      returns:
        - result
    - name: inspect
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
---

# lint-stable-no-invariants fixture

stable + no invariants. Used to test the `missing-invariants` lint heuristic.
