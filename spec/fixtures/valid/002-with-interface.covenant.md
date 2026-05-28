---
covenant_version: "1.0"
name: hello-world
version: "1.0.0"

interface:
  surface:
    - name: greet
      accepts: [recipient]
      returns: [message]

contracts:
  inputs:
    recipient:
      type: string
      required: true
  outputs:
    message:
      type: string
---

# hello-world

A single pure operation with typed input and output.
