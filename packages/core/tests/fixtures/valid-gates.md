---
covenant_version: "1.0"
name: gated-skill
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
  gates:
    - id: result-never-null
      description: >
        Every successful operation must return a non-null result.
      check: "outputs.result !== null"
      action: retry
      max_retries: 2
      on_exhaustion: fail
    - id: no-partial-write
      check: "!failure"
      action: fail
---

# gated-skill

Valid skill whose quality.gates conform to the spec: required id and check,
action in the legal enum, integer max_retries, string on_exhaustion.
