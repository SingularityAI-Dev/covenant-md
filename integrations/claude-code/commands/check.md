# /covenant:check

Run heuristic design-quality lint on a single skill's `COVENANT.md`.

**Argument:** `<skill_path>`: path to a skill directory containing `COVENANT.md`,
or a direct path to a `COVENANT.md` file.

If no argument was given, ask the user which skill to lint and stop.

Call the `covenant_lint` MCP tool with:

- `skill_path`: the argument.
- `strict`: false unless the user explicitly asks for strict mode (in which case
  pass `true`).

Present the result:

- The `findings` array, formatted as one line per finding with its `level`
  (error / warning / info), its `id`, and its `message`.
- The exit `code` returned (0 = no fail, non-zero = at least one finding that
  raised the code).

If there are zero findings, say "No findings; the skill passes the design-quality
heuristics." Then suggest `/covenant:validate` to also run a spec-conformance
check.
