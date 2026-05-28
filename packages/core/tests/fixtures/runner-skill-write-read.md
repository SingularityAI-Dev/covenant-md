---
covenant_version: "1.0"
name: runner-test-skill
version: "1.0.0"
interface:
  surface:
    - name: write
      accepts: [payload, output_path]
      returns: [stored_path]
    - name: read
      accepts: [input_path]
      returns: [payload]
contracts:
  inputs:
    payload:
      type: object
      required: true
      schema:
        id:
          type: string
          required: true
    output_path:
      type: string
      required: true
    input_path:
      type: string
      required: true
  outputs:
    stored_path:
      type: string
    payload:
      type: object
      schema:
        id:
          type: string
          required: true
---
# Test fixture skill (write/read).
