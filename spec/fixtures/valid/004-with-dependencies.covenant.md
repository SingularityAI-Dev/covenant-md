---
covenant_version: "1.0"
name: needs-deps
version: "1.0.0"

dependencies:
  packages:
    - name: yaml
      version: "^2.3.1"
      ecosystem: npm
  environment:
    - name: NODE_VERSION
      constraint: ">=20"

interface:
  surface:
    - name: load
      accepts: [path]
      returns: [content]

contracts:
  inputs:
    path:
      type: string
      required: true
  outputs:
    content:
      type: object
---
