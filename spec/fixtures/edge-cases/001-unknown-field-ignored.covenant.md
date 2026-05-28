---
covenant_version: "1.0"
name: forward-compatible
version: "1.0.0"
future_field: "validators must ignore this"

domain:
  purpose: A skill that uses a future field.
  unknown_subfield: ok

interface:
  surface:
    - name: do_it
      accepts: [x]
      returns: [y]

contracts:
  inputs:
    x: { type: string, required: true }
  outputs:
    y: { type: string }
---
