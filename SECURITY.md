# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in covenant-md, please report it responsibly:

1. **Do NOT open a public issue.**
2. Use [GitHub's private vulnerability reporting](https://github.com/SingularityAI-Dev/covenant-md/security/advisories/new) to submit your report.
3. Include as much detail as possible: steps to reproduce, affected versions, and potential impact.

You can expect an initial response within 72 hours. We will work with you to understand the issue and coordinate a fix before any public disclosure.

## Scope

This policy covers the reference framework packages:

- `@covenant-md/core`: validator, test runner, skill runner, lint, diff, graph
- `@covenant-md/cli`: the `covenant` CLI (`validate`, `test`, `generate`, `lint`, `diff`, `graph`) and the interactive generator

The specification text in `docs/COVENANT.md` is prose, not executable code, and is out of scope for vulnerability reports; spec ambiguities should be filed as a spec question issue instead.

## Disclosure Policy

We follow coordinated disclosure. Once a fix is available, we will publish a security advisory and credit the reporter (unless they prefer to remain anonymous).
