---
covenant_version: "1.0"
name: strict-output-type-skill
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
      type: string

quality:
  fixtures:
    - id: strict-as-string
      operation: do-thing
      input:
        input_data: "x"
      strict_output: "yes"
---

# strict-output-type-skill

Invalid fixture: strict_output must be a boolean, not a string.
