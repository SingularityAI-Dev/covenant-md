---
covenant_version: "1.0"
name: lint-undeclared-side-effects
version: "0.2.0"
stability: experimental

domain:
  purpose: >
    Lint fixture: operation named exactly `create` (a side-effect verb)
    with no contracts.side_effects declared. Should trigger the
    undeclared-side-effects heuristic. Stability is experimental and
    invariants are present so other heuristics stay quiet.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: create
      accepts:
        - input_data
      returns:
        - result
    - name: inspect
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

  invariants:
    - create returns a result object.
---

# lint-undeclared-side-effects fixture

create op + no side_effects. Used to test the `undeclared-side-effects` lint heuristic.
