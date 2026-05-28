---
covenant_version: "1.0"
name: with-fixtures
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

quality:
  fixtures:
    - id: greets-by-name
      operation: greet
      input:
        recipient: world
      expect:
        message: "Hello, world"
---
