---
covenant_version: "1.0"
name: strict-output-skill
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
    - id: strict-fixture
      operation: do-thing
      input:
        input_data: "x"
      expect:
        result: "ok"
      strict_output: true
    - id: loose-fixture
      operation: do-thing
      input:
        input_data: "x"
      expect:
        result: "ok"
---

# strict-output-skill

Two fixtures over the same operation. The strict one opts in to
strict_output and must fail when the actual output carries fields that are
not declared in contracts.outputs. The loose one keeps the default partial
matching behaviour and must pass on the same output.
