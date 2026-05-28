---
covenant_version: "1.1"
name: newer-minor
version: "1.0.0"

interface:
  surface:
    - name: ping
      accepts: [request]
      returns: [response]

contracts:
  inputs:
    request: { type: string, required: true }
  outputs:
    response: { type: string }
---
