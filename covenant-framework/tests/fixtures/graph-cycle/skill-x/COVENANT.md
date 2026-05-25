---
covenant_version: "1.0"
name: skill-x
version: "1.0.0"
stability: stable

domain:
  purpose: >
    Graph cycle fixture: skill-x depends on skill-y, and skill-y
    depends back on skill-x. Used to exercise the graph CLI's
    cycle-detection branch.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: foo
      description: Transform input_x into output_x.
      accepts:
        - input_x
      returns:
        - output_x
  breaking_changes:
    - removing an operation from surface

dependencies:
  skills:
    - name: skill-y
      version: ">=1.0.0"
      covenant: ../skill-y/COVENANT.md

contracts:
  inputs:
    input_x:
      type: string
      required: true
      description: Source value.

  outputs:
    output_x:
      type: string
      description: Transformed value.

  side_effects:
    - No I/O — pure transformation.

  invariants:
    - foo is a pure function of input_x.

quality:
  fixtures:
    - id: foo-basic
      description: Transforms a basic input.
      operation: foo
      input:
        input_x: "hello"
      expect:
        output_x: ""
      tags: [happy-path]
---

# COVENANT.md for skill-x (graph cycle fixture)

Cycle pair half — skill-x → skill-y.
