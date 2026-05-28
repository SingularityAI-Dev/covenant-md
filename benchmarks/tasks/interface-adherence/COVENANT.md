---
covenant_version: "1.0"
name: bench-render
version: "1.0.0"

interface:
  surface:
    - name: render
      accepts: [content]
      returns: [success]

contracts:
  inputs:
    content:
      type: object
      required: true
  outputs:
    success:
      type: boolean
---

# bench-render

A minimal render skill used by the COVENANT.md eval harness. Exposes a single
operation, `render`, that takes a `content` object and returns `success: true`
on a clean render.
