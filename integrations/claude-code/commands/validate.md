# /covenant:validate

Validate every `COVENANT.md` file in the project against the COVENANT.md spec
and report results.

Find all `COVENANT.md` files using
`find . -name "COVENANT.md" -not -path "*/node_modules/*" -not -path "*/.git/*"`.

For each file found:

1. Call the `covenant_validate` MCP tool with `file_path` set to the file's path.
2. Note the returned `{valid, errors, warnings}` payload.

Present results for each file:

- File path as a header or in bold.
- Validation status: VALID or INVALID.
- If invalid, list every `error` returned.
- List any `warnings` (e.g. newer-minor-than-validator notes).

At the end, print a summary:

```
Summary: X valid, Y invalid, Z warnings total
```

If no `COVENANT.md` files are found, say so and suggest `/covenant:init` to
scaffold one.
