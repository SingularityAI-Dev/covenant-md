---
covenant_version: "1.0"
name: cyclic-fixtures-skill
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

quality:
  fixtures:
    - id: a
      operation: do-thing
      input:
        input_data: "x"
      depends_on: b
    - id: b
      operation: do-thing
      input:
        input_data: "y"
      depends_on: a
---

# cyclic-fixtures-skill

Invalid skill: fixture a depends on b and b depends on a. Every depends_on
reference exists, so the existence check passes, but the graph is cyclic and
the validator must reject it without needing the test runner to execute.
