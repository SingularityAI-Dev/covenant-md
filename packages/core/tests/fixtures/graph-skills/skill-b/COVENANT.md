---
covenant_version: "1.0"
name: skill-b
version: "1.0.0"
stability: stable

domain:
  purpose: >
    Graph fixture: skill-b is a leaf node with no skill dependencies.
    Used to exercise the graph CLI's standalone-node emission.
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
    - changing the type of a contracts.inputs or contracts.outputs field

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

# COVENANT.md for skill-b (graph fixture)

Leaf node fixture for the graph CLI.
