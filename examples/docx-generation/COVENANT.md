---
covenant_version: "1.0"
name: docx-generation
version: "1.2.0"
stability: stable

domain:
  purpose: >
    Create, read, and edit professional-quality .docx files from
    structured content objects, handling all Office XML complexity
    internally.
  depth: deep
  ubiquitous_language:
    inline:
      content_object: >
        A structured data object containing the document's semantic
        content (headings, body text, tables, lists) with no
        formatting opinions. The skill applies formatting.
      output_path: >
        An absolute file system path ending in .docx where the
        generated file will be written.
      validation_result: >
        An object returned by the skill's internal validator,
        containing at minimum a boolean `valid` field and an array
        of `errors` if validation fails.

interface:
  entry_point: SKILL.md
  surface:
    - name: create
      description: >
        Generate a new .docx file from a content object and write
        it to the specified output path.
      accepts:
        - content
        - output_path
      returns:
        - file_path
        - validation_result
    - name: read
      description: >
        Parse an existing .docx file and return its content as a
        structured content object.
      accepts:
        - input_path
      returns:
        - content
    - name: edit
      description: >
        Apply a set of structured edits to an existing .docx file
        in place. Returns the updated file path.
      accepts:
        - input_path
        - edits
      returns:
        - file_path
        - validation_result
  breaking_changes:
    - removing an operation from surface
    - renaming an operation in surface
    - changing the type of a contracts.inputs or contracts.outputs field
    - removing a field from contracts.outputs

dependencies:
  skills:
    - name: file-system
      version: ">=1.0.0"
      covenant: ./shared/file-system/COVENANT.md
  mcp_servers:
    - name: google-drive
      url: https://drivemcp.googleapis.com/mcp/v1
      required: false
      fallback: local file system only
  packages:
    - name: docx
      version: "^9.0.0"
      ecosystem: npm
    - name: python-docx
      version: ">=1.1.0"
      ecosystem: pip
  environment:
    - name: NODE_VERSION
      constraint: ">=18"
    - name: DOCX_OUTPUT_DIR
      required: false
      description: >
        Override the default output directory. Falls back to the
        path specified in output_path if not set.

contracts:
  inputs:
    content:
      type: object
      required: true
      description: >
        A structured content object. Must contain at minimum a
        `title` string field. All other fields are optional and
        will be rendered if present.
      schema:
        title:
          type: string
          required: true
        sections:
          type: array
          required: false
    output_path:
      type: string
      required: true
      description: Absolute path ending in .docx for file creation operations.
    input_path:
      type: string
      required: false
      description: Absolute path to an existing .docx for read and edit operations.
    edits:
      type: array
      required: false
      description: >
        Array of structured edit operations. Each edit is an object
        with `target` (section title or paragraph index) and
        `replacement` (new content object).

  outputs:
    file_path:
      type: string
      description: Absolute path to the created or edited .docx file.
    content:
      type: object
      description: >
        Parsed content object extracted from a .docx file. Same
        schema as the `content` input field.
    validation_result:
      type: object
      description: >
        Result of internal validation. Always contains `valid`
        (boolean). Contains `errors` (array of strings) when
        valid is false.
      schema:
        valid:
          type: boolean
          required: true
        errors:
          type: array
          required: false

  side_effects:
    - Writes a file to output_path when operation is `create` or `edit`.
    - Does not modify any file not referenced in the accepted inputs.

  invariants:
    - outputs.validation_result.valid is always a boolean, never null.
    - A failed operation never partially writes to output_path.
    - The content schema returned by `read` is always compatible with the content schema accepted by `create`.

quality:
  fixtures:
    - id: create-minimal
      description: Creates a valid .docx from the minimum required content.
      operation: create
      input:
        content:
          title: "Test Document"
        output_path: "/tmp/covenant-test.docx"
      expect:
        validation_result:
          valid: true
      tags: [happy-path, minimal]

    - id: create-full-content
      description: >
        Creates a .docx with all supported content types and validates
        that no sections are dropped.
      operation: create
      input:
        content:
          title: "Full Content Test"
          sections:
            - heading: "Introduction"
              body: "This is the introduction body."
            - heading: "Conclusion"
              body: "This is the conclusion body."
        output_path: "/tmp/covenant-full.docx"
      expect:
        validation_result:
          valid: true
      tags: [happy-path, full]

    - id: read-roundtrip
      description: >
        Content written by `create` and then read by `read` must
        be structurally identical to the original content object.
      operation: read
      depends_on: create-full-content  # runs after, uses its output
      input:
        input_path: "/tmp/covenant-full.docx"
      expect:
        content:
          title: "Full Content Test"
      tags: [roundtrip, invariant]

    - id: missing-title
      description: Fails gracefully when the required title field is absent.
      operation: create
      input:
        content: {}
        output_path: "/tmp/covenant-fail.docx"
      expect_failure: true
      expect_failure_reason: "content.title is required"
      tags: [edge-case, failure]

  gates:
    - id: output-always-valid
      description: >
        Every successful create or edit operation must return
        a validation_result with valid: true.
      check: "outputs.validation_result.valid === true"
      action: retry
      max_retries: 2
      on_exhaustion: fail

    - id: no-partial-write
      description: >
        On failure, output_path must not exist or must be unchanged.
      check: "!failure || file_unchanged(inputs.output_path)"
      action: fail
---
# COVENANT.md for docx-generation skill

This skill provides a robust interface for working with Microsoft Word (.docx) documents. It abstracts away the complexity of the Office Open XML format while providing a clean, predictable API for document creation, reading, and modification.

## Design Decisions

### Why three operations?
The skill exposes exactly three operations: `create`, `read`, and `edit`. This follows the principle of minimal interface depth - providing just enough functionality to handle the most common document workflows without overwhelming consumers with options.

### Deep vs Shallow Design
We declared `depth: deep` because this skill hides significant complexity behind its interface. Consumers don't need to understand:
- The intricacies of Office Open XML schema
- Relationships between document parts
- XML namespace management
- Proper OpenXML SDK usage patterns

All of this complexity is encapsulated within the skill implementation.

### Validation Approach
The skill includes an internal validator that checks document integrity before and after operations. This ensures that:
- Generated documents are always valid .docx files
- Corrupted input documents are handled gracefully
- Edit operations don't produce malformed documents

### Error Handling Philosophy
All operations follow a fail-fast, fail-safe approach:
- Invalid inputs produce clear error messages without side effects
- Failed operations never leave partial files
- Validation results always indicate success/failure status clearly

## Usage Examples

See SKILL.md for detailed usage instructions and code examples.