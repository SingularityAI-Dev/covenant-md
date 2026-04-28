---
covenant_version: "1.0"
name: pdf-generation
version: "2.0.1"
stability: stable

domain:
  purpose: >
    Generate PDF files from structured content objects using a
    headless renderer, exposing a minimal interface that hides
    all rendering complexity.
  depth: deep
  ubiquitous_language:
    inline:
      content_object: >
        A framework-agnostic representation of a document's
        semantic content. Contains no styling opinions. The skill
        owns styling.
      render_result: >
        The object returned after every render operation, containing
        a file_path string and a page_count integer. Never null.

interface:
  entry_point: SKILL.md
  surface:
    - name: render
      description: >
        Render a content object to a PDF file at the specified path.
      accepts:
        - content
        - output_path
        - options
      returns:
        - render_result
  breaking_changes:
    - removing or renaming the `render` operation
    - removing `file_path` or `page_count` from render_result schema
    - making `content.title` no longer required

dependencies:
  packages:
    - name: puppeteer
      version: "^22.0.0"
      ecosystem: npm
  environment:
    - name: CHROME_PATH
      required: false
      description: Override bundled Chromium. Falls back to bundled binary.

contracts:
  inputs:
    content:
      type: object
      required: true
      description: A content object as defined in domain.ubiquitous_language.
      schema:
        title:
          type: string
          required: true
    output_path:
      type: string
      required: true
      description: Absolute path ending in .pdf.
    options:
      type: object
      required: false
      description: Optional render overrides (page size, margins, orientation).

  outputs:
    render_result:
      type: object
      description: Always returned. Contains file_path and page_count.
      schema:
        file_path:
          type: string
          required: true
        page_count:
          type: number
          required: true

  side_effects:
    - Writes a PDF to output_path.
    - Launches a headless browser process for the duration of the render.

  invariants:
    - render_result is always an object, never null.
    - render_result.page_count is always a positive integer.
    - On failure, no file is written to output_path.

quality:
  fixtures:
    - id: render-minimal
      description: Renders a single-page PDF from minimal content.
      operation: render
      input:
        content:
          title: "Minimal PDF"
        output_path: "/tmp/minimal.pdf"
      expect:
        render_result:
          page_count: 1
      tags: [happy-path, minimal]

    - id: render-missing-title
      description: Fails gracefully when required content.title is absent.
      operation: render
      input:
        content: {}
        output_path: "/tmp/fail.pdf"
      expect_failure: true
      expect_failure_reason: "content.title is required"
      tags: [edge-case, failure]

  gates:
    - id: result-never-null
      check: "outputs.render_result !== null"
      action: fail
---
# COVENANT.md for pdf-generation skill

This skill provides a clean interface for generating PDF documents from structured content. It uses a headless browser under the hood but hides all rendering complexity from consumers.

## Design Decisions

### Why a Single `render` Operation?
Early versions exposed separate `create`, `preview`, and `export` operations. In practice, consumers always called them in sequence, creating unnecessary coupling. Collapsing to a single `render` operation hides the internal pipeline entirely.

### Why `content_object` Owns No Styling?
Styling is a rendering concern, not a content concern. Allowing callers to pass styling overrides via `content` would couple them to the renderer's internal model. Instead, styling belongs in the `options` parameter.

### Error Handling
The skill follows a fail-fast approach:
- Missing required fields produce clear validation errors
- Rendering failures don't leave partial PDF files
- All errors include actionable messages for consumers

## Usage

See SKILL.md for detailed usage instructions and code examples.