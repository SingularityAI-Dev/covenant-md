---
covenant_version: "1.0"
name: expect-cross-ref-skill
version: "0.1.0"
stability: experimental

interface:
  surface:
    - name: do-thing
      accepts:
        - input_data
      returns:
        - result_id

contracts:
  inputs:
    input_data:
      type: string
      required: true
  outputs:
    result_id:
      type: string

quality:
  fixtures:
    - id: typo-in-expect
      operation: do-thing
      input:
        input_data: "x"
      expect:
        resultId: "abc"
---

# expect-cross-ref-skill

Invalid fixture: `expect` references `resultId`, which is not declared in
`contracts.outputs` (the declared field is `result_id`). The validator must
reject this at authoring time instead of letting it surface as a confusing
runtime mismatch.
