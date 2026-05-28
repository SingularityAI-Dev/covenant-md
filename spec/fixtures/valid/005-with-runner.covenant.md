---
covenant_version: "1.0"
name: external-runner
version: "1.0.0"

runner:
  strategy: process
  command: ["python3", "scripts/runner.py"]

interface:
  surface:
    - name: run
      accepts: [input]
      returns: [output]

contracts:
  inputs:
    input:
      type: object
      required: true
  outputs:
    output:
      type: object
---
