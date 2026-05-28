---
covenant_version: "1.0"
name: process-test-skill
version: "1.0.0"
runner:
  strategy: process
  command: ["node", "fake-runner.js"]
interface:
  surface:
    - name: ping
      accepts: []
      returns: [ok]
contracts:
  inputs: {}
  outputs:
    ok:
      type: number
---
# Test fixture skill (process strategy).
