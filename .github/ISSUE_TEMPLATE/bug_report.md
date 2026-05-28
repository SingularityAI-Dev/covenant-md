---
name: Bug report
about: Report a defect in @covenant-md/core, @covenant-md/cli, or the spec
title: ""
labels: bug
assignees: ""
---

## Summary

<!-- One sentence describing the unexpected behaviour. -->

## Environment

- **covenant_version in file:** <!-- e.g. "1.0" -->
- **Package version:** <!-- output of `npm list -g @covenant-md/cli` once published, or the commit you are on -->
- **Node version:** <!-- output of `node --version` -->
- **OS:** <!-- e.g. macOS 14.5, Ubuntu 22.04 -->

## Minimal reproduction

<!-- Smallest COVENANT.md that demonstrates the issue. -->

```yaml
---
covenant_version: "1.0"
name: reproduce-bug
---
```

## Steps to reproduce

1. Save the above as `COVENANT.md`
2. Run `covenant validate COVENANT.md`
3. <!-- observe -->

## Expected behaviour

<!-- What you expected to happen. -->

## Actual behaviour

<!-- What actually happened. Include any error output verbatim. -->

```text
<!-- paste output here -->
```

## Additional context

<!-- Links to related issues, spec sections, or conformance fixtures. -->
