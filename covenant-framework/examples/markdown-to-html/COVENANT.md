---
covenant_version: "1.0"
name: markdown-to-html
version: "1.0.0"
stability: stable

domain:
  purpose: >
    Convert markdown content to an HTML file, using the
    template-rendering skill to wrap the body in a layout shell.
  depth: shallow

interface:
  entry_point: SKILL.md
  surface:
    - name: convert
      description: >
        Convert a markdown string to HTML and write the result to output_path.
      accepts:
        - markdown_input
        - output_path
      returns:
        - file_path
        - byte_count
  breaking_changes:
    - removing an operation from surface
    - renaming an operation in surface
    - changing the type of a contracts.inputs or contracts.outputs field
    - removing a field from contracts.outputs

dependencies:
  skills:
    - name: template-rendering
      version: ">=1.0.0"
      covenant: ../template-rendering/COVENANT.md

contracts:
  inputs:
    markdown_input:
      type: string
      required: true
      description: A markdown source string to convert.
    output_path:
      type: string
      required: true
      description: Absolute path where the resulting HTML file is written.

  outputs:
    file_path:
      type: string
      description: Absolute path of the written HTML file.
    byte_count:
      type: number
      description: Size of the written HTML file in bytes.

  side_effects:
    - Writes a file to output_path on successful convert.

  invariants:
    - On success, file_path equals the input output_path.
    - On failure, no file is written to output_path.
    - byte_count is always a positive integer when the operation succeeds.

quality:
  fixtures:
    - id: convert-minimal
      description: Converts a minimal markdown document to HTML.
      operation: convert
      input:
        markdown_input: "# Hello"
        output_path: "/tmp/covenant-md-test.html"
      expect:
        file_path: ""
        byte_count: 1
      tags: [happy-path]
---
# COVENANT.md for markdown-to-html skill

This skill is a contract-only example demonstrating an internal node in the dependency graph: it declares one `dependencies.skills` edge to `template-rendering`.

## Design Decisions

### Why a single operation?

`convert` is the whole job. Splitting parse and render into separate operations would force consumers to thread an intermediate AST across calls, coupling them to internals they should not depend on.

### Why depend on template-rendering?

The HTML output needs a layout shell (doctype, head, body wrapper). Rather than reimplement template substitution, we declare a dependency on `template-rendering >=1.0.0`. The graph CLI in Plan 03-04 will resolve and walk this edge.
