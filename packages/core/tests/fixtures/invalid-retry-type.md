---
covenant_version: "1.0"
name: retry-type-skill
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
    - id: retry-as-string
      operation: do-thing
      input:
        input_data: "x"
      retry: "yes"
    - id: retry-as-float
      operation: do-thing
      input:
        input_data: "x"
      retry: 1.5
    - id: retry-negative
      operation: do-thing
      input:
        input_data: "x"
      retry: -2
---

# retry-type-skill

Invalid fixtures: retry must be a non-negative integer. "yes", 1.5 and -2
must each be rejected at validation time rather than silently coerced to
zero retries at execution time.
