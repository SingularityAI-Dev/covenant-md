---
covenant_version: "1.0"
name: skill-y
version: "1.0.0"
stability: stable

domain:
  purpose: >
    Graph cycle fixture: skill-y depends back on skill-x, completing
    the cycle. Used to exercise the graph CLI's cycle-detection branch.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: bar
      description: Transform input_y into output_y.
      accepts:
        - input_y
      returns:
        - output_y
  breaking_changes:
    - removing an operation from surface

dependencies:
  skills:
    - name: skill-x
      version: ">=1.0.0"
      covenant: ../skill-x/COVENANT.md

contracts:
  inputs:
    input_y:
      type: string
      required: true
      description: Source value.

  outputs:
    output_y:
      type: string
      description: Transformed value.

  side_effects:
    - No I/O, pure transformation.

  invariants:
    - bar is a pure function of input_y.

quality:
  fixtures:
    - id: bar-basic
      description: Transforms a basic input.
      operation: bar
      input:
        input_y: "hello"
      expect:
        output_y: ""
      tags: [happy-path]
---

# COVENANT.md for skill-y (graph cycle fixture)

Cycle pair half, skill-y → skill-x.
