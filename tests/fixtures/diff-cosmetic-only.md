---
covenant_version: "1.0"
name: diff-test
version: "1.0.1"
stability: stable

domain:
  purpose: >
    Cosmetic-only update: edited prose for diff cosmetic-classification
    tests. Structure is identical to diff-base; only descriptions changed.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: alpha
      description: Alpha operation — wording revised, behavior unchanged.
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
# diff-test (v1.0.1 — cosmetic edits)

Diff fixture: alpha description and domain.purpose text edited; structural identity preserved.
