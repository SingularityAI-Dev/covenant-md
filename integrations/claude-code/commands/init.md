# /covenant:init

Scaffold a new skill (`COVENANT.md` + `SKILL.md` pair) in the current project.

**Argument:** `[skill_name]`: optional kebab-case name for the new skill. If
omitted, ask the user for a name before doing anything else.

Steps:

1. Call the `covenant_list_templates` MCP tool to discover available templates.
   For v1.0 this returns a single `default` template with the canonical
   COVENANT.md and SKILL.md pair.
2. Ask the user for a target directory if it is not obvious from context.
   Default to `./skills/<skill_name>/`.
3. Create the directory if it does not exist. Render the template by writing
   two files in that directory:

   - `COVENANT.md` with frontmatter that has `covenant_version: "1.0"` and
     `name: <skill_name>` populated, plus placeholder sections for `domain`,
     `interface.surface`, `dependencies`, `contracts`, and `quality.fixtures`
     that the user is meant to fill in.
   - `SKILL.md` with a minimal procedural skeleton (Purpose, Operations, Usage).

4. Run `covenant_validate` on the newly written `COVENANT.md` to confirm it is
   structurally valid (the placeholder version should pass with the two required
   fields populated and the optional sections left empty or with sensible
   defaults).
5. Tell the user the files were created and prompt them to flesh out the five
   sections.

If the user later wants design-quality feedback, suggest `/covenant:check
<skill_path>`.
