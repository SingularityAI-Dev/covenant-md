---
covenant_version: "1.0"
name: sample-skill
version: "0.1.0"
stability: experimental

interface:
  surface:
    - name: do-thing
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

# sample-skill

Minimal valid skill for tests.
