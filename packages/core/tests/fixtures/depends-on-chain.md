---
covenant_version: "1.0"
name: chained-skill
version: "0.1.0"

interface:
  surface:
    - name: step

contracts:
  inputs:
    label:
      type: string

quality:
  fixtures:
    - id: c
      operation: step
      input: {label: "third"}
      depends_on: b
    - id: b
      operation: step
      input: {label: "second"}
      depends_on: a
    - id: a
      operation: step
      input: {label: "first"}
---

# chained-skill
