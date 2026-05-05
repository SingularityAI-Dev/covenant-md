---
covenant_version: "1.0"
name: skill-b
version: "1.0.0"

dependencies:
  skills:
    - name: skill-a
      covenant: ./cyclic-deps-a.md
---

# b → a
