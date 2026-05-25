---
covenant_version: "1.0"
name: diff-test
version: "1.1.0"
stability: stable

domain:
  purpose: >
    Reference COVENANT.md for diff comparisons. Adds operation `delta`
    reusing input_a/output_a — additive change with proper minor bump.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: alpha
      description: First reference operation; processes input_a into output_a.
      accepts:
        - input_a
      returns:
        - output_a
    - name: beta
      description: Second reference operation; processes input_b into output_b.
      accepts:
        - input_b
      returns:
        - output_b
    - name: gamma
      description: Third reference operation; processes input_c into output_c.
      accepts:
        - input_c
      returns:
        - output_c
    - name: delta
      description: Fourth operation added in this version; reuses input_a/output_a.
      accepts:
        - input_a
      returns:
        - output_a
  breaking_changes:
    - removing an operation from surface
    - renaming an operation in surface
    - changing the type of a contracts.inputs or contracts.outputs field
    - removing a field from contracts.outputs

contracts:
  inputs:
    input_a:
      type: string
      required: true
      description: String input for alpha.
    input_b:
      type: object
      required: true
      description: Object input for beta.
    input_c:
      type: number
      required: true
      description: Number input for gamma.

  outputs:
    output_a:
      type: string
      description: String output from alpha.
    output_b:
      type: object
      description: Object output from beta.
    output_c:
      type: number
      description: Number output from gamma.

  invariants:
    - All operations are pure transformations with no side effects.

quality:
  fixtures:
    - id: alpha-happy-path
      description: Alpha returns a string for any string input.
      operation: alpha
      input:
        input_a: "hello"
      expect:
        output_a: ""
      tags: [happy-path]
---
# diff-test (v1.1.0 — delta added)

Diff fixture: adds operation `delta` reusing existing input/output declarations.
