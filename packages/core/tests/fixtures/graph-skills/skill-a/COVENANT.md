---
covenant_version: "1.0"
name: skill-a
version: "1.0.0"
stability: stable

domain:
  purpose: >
    Graph fixture: skill-a depends on skill-b. Used to exercise the
    graph CLI's edge resolution against a sibling skill within the
    same skills-dir tree.
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
    - changing the type of a contracts.inputs or contracts.outputs field

dependencies:
  skills:
    - name: skill-b
      version: ">=1.0.0"
      covenant: ../skill-b/COVENANT.md

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
    - No I/O, pure transformation.

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

# COVENANT.md for skill-a (graph fixture)

skill-a → skill-b edge fixture for the graph CLI.
