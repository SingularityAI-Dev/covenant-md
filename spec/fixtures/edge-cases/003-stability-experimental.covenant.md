---
covenant_version: "1.0"
name: still-cooking
version: "0.1.0"
stability: experimental

interface:
  surface:
    - name: try_it
      accepts: [args]
      returns: [result]

contracts:
  inputs:
    args: { type: object, required: true }
  outputs:
    result: { type: object }
---
