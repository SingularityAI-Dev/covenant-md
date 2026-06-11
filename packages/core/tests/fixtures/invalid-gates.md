---
covenant_version: "1.0"
name: bad-gates-skill
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
    - description: gate with no id
      check: "outputs.result !== null"
    - id: gate-without-check
      action: fail
    - id: gate-bad-action
      check: "outputs.result !== null"
      action: explode
    - id: gate-bad-max-retries
      check: "outputs.result !== null"
      action: retry
      max_retries: -1
    - id: gate-bad-on-exhaustion
      check: "outputs.result !== null"
      action: retry
      max_retries: 1
      on_exhaustion: 7
    - id: gate-unknown-operation
      check: "outputs.result !== null"
      action: fail
      operation: not-a-real-op
    - "not an object"
---

# bad-gates-skill

Invalid skill: every gate exercises one quality.gates failure mode
(missing id, missing check, illegal action enum, negative max_retries,
non-string on_exhaustion, unknown operation reference, non-object gate).
