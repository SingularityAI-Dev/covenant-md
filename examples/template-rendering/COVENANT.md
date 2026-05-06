---
covenant_version: "1.0"
name: template-rendering
version: "1.0.0"
stability: stable

domain:
  purpose: >
    Apply a template string to a content object and return the
    rendered result. Pure transformation — no I/O, no state.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: render
      description: >
        Apply a template to a content object and return the rendered string.
      accepts:
        - template
        - content
      returns:
        - rendered
    - name: validate_template
      description: >
        Check whether a template string is well-formed.
      accepts:
        - template
      returns:
        - is_valid
  breaking_changes:
    - removing an operation from surface
    - renaming an operation in surface
    - changing the type of a contracts.inputs or contracts.outputs field
    - removing a field from contracts.outputs

contracts:
  inputs:
    template:
      type: string
      required: true
      description: A template string with placeholders for content fields.
    content:
      type: object
      required: true
      description: A flat key/value object whose fields are interpolated into the template.

  outputs:
    rendered:
      type: string
      description: The template with placeholders replaced by content values.
    is_valid:
      type: boolean
      description: True when the template is well-formed.

  side_effects:
    - No file system or network I/O — pure transformation.

  invariants:
    - render is a pure function of (template, content); the same inputs always produce the same output.
    - validate_template never raises; it returns a boolean.

quality:
  fixtures:
    - id: render-simple
      description: Renders a basic template with a single placeholder.
      operation: render
      input:
        template: "Hello {{name}}"
        content:
          name: "World"
      expect:
        rendered: ""
      tags: [happy-path]

    - id: validate-ok
      description: A well-formed template passes validation.
      operation: validate_template
      input:
        template: "Hello {{name}}"
      expect:
        is_valid: true
      tags: [happy-path]
---
# COVENANT.md for template-rendering skill

This skill is a contract-only example demonstrating a leaf node in the dependency graph: it has zero `dependencies.skills` entries.

## Why two operations?

`render` does the substitution; `validate_template` is the dry-run check. Splitting them lets consumers verify a template before binding content to it. The interface is intentionally narrow — `depth: shallow` matches that.
