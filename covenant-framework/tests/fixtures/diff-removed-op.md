---
covenant_version: "1.0"
name: diff-test
version: "2.0.0"
stability: stable

domain:
  purpose: >
    Reference COVENANT.md for diff comparisons. Two operations
    (alpha, beta) — gamma removed in this version (proper major bump).
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

  outputs:
    output_a:
      type: string
      description: String output from alpha.
    output_b:
      type: object
      description: Object output from beta.

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
# diff-test (v2.0.0 — gamma removed)

Diff fixture: same skill identity, gamma operation removed for breaking-change tests.
