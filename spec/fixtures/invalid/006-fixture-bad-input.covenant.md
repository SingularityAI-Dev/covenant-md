---
covenant_version: "1.0"
name: bad-fixture-input
version: "1.0.0"

interface:
  surface:
    - name: greet
      accepts: [recipient]
      returns: [message]

contracts:
  inputs:
    recipient: { type: string, required: true }
  outputs:
    message: { type: string }

quality:
  fixtures:
    - id: passes-undeclared-field
      operation: greet
      input: { recipient: world, unknown_field: 42 }
      expect: { message: "Hello" }
---
