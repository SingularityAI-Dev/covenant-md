# /covenant:graph

Walk a directory of skills and emit the dependency graph.

**Arguments:** `<skills_dir> [--format json]`: directory containing one
`COVENANT.md` per skill subfolder. Format defaults to DOT; pass `--format json`
for the JSON shape.

If no directory is given, ask the user which directory to walk.

Call the `covenant_graph` MCP tool with:

- `skills_dir`: the argument.
- `format`: `"dot"` (default) or `"json"` if the user requested JSON.

Present the result:

- If `result.output` is non-empty, print it verbatim in a fenced code block
  tagged with the format (`dot` or `json`).
- If `result.error` is non-empty (e.g. a cycle was detected), print the error
  and the `cyclePath` if present.
- End with the exit `code`.

If a cycle is reported, explain that COVENANT.md skill graphs must be acyclic
and point at the cycle's nodes.
