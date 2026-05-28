# /covenant:diff

Semantically diff two `COVENANT.md` files. Classify every change as breaking,
additive, or cosmetic against the new file's `interface.breaking_changes`.

**Arguments:** `<old_path> <new_path>`: paths to two `COVENANT.md` files.

If either argument is missing, ask the user for both before doing anything else.

Call the `covenant_diff` MCP tool with:

- `old_path`: the first argument.
- `new_path`: the second argument.
- `strict`: false unless the user asks for strict mode.

Present the result by section:

- For each entry in the returned `sections` array, print:
  - the classification (breaking / additive / cosmetic),
  - the field path,
  - a short description of the change.

End with the exit `code`: 0 if no breaking changes, non-zero if breaking changes
appear without a major version bump under strict mode.

If `breaking` changes are present, remind the user that releasing this without
bumping the major version (per `interface.breaking_changes`) would silently
break callers.
