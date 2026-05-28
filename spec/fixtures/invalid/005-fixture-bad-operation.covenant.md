---
covenant_version: "1.0"
name: bad-fixture-op
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
    - id: refs-unknown-op
      operation: shout
      input: { recipient: world }
      expect: { message: "HELLO" }
---
