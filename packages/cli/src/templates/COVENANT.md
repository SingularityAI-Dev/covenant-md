---
covenant_version: "1.0"
name: {{skillName}}
version: "1.0.0"
stability: stable

domain:
  purpose: >
    {{purpose}}
  depth: {{depth}}
  ubiquitous_language:
{{#each ubiquitousLanguage}}
    {{key}}: >
      {{value}}
{{else}}
    # No ubiquitous language terms defined
{{/each}}

interface:
  entry_point: SKILL.md
  surface:
{{#each surface}}
    - name: {{name}}
      description: >
        {{description}}
      accepts:
{{#each accepts}}
        - {{this}}
{{/each}}
      returns:
{{#each returns}}
        - {{this}}
{{/each}}
{{/each}}
  breaking_changes:
    - removing an operation from surface
    - renaming an operation in surface
    - changing the type of a contracts.inputs or contracts.outputs field
    - removing a field from contracts.outputs

dependencies:
  skills:
{{#each dependencies.skills}}
    - name: {{name}}
      version: "{{version}}"
      covenant: {{covenant}}
{{/each}}
  mcp_servers:
{{#each dependencies.mcpServers}}
    - name: {{name}}
      url: {{url}}
      required: {{required}}
      fallback: {{fallback}}
{{/each}}
  packages:
{{#each dependencies.packages}}
    - name: {{name}}
      version: "{{version}}"
      ecosystem: {{ecosystem}}
{{/each}}
  environment:
{{#each dependencies.environment}}
    - name: {{name}}
      constraint: "{{constraint}}"
      required: {{required}}
      description: >
        {{description}}
{{/each}}

contracts:
  inputs:
{{#if contracts.inputs}}
{{#each contracts.inputs}}
    {{key}}:
      type: {{type}}
      required: {{required}}
      description: >
        {{description}}
{{#if schema}}
      schema:
{{#each schema}}
        {{key}}:
          type: {{type}}
          required: {{required}}
{{/each}}
{{/if}}
{{/each}}
{{else}}
    # No input fields defined
{{/if}}
  outputs:
{{#if contracts.outputs}}
{{#each contracts.outputs}}
    {{key}}:
      type: {{type}}
      description: >
        {{description}}
{{#if schema}}
      schema:
{{#each schema}}
        {{key}}:
          type: {{type}}
          required: {{required}}
{{/each}}
{{/if}}
{{/each}}
{{else}}
    # No output fields defined
{{/if}}
  side_effects:
{{#if contracts.sideEffects}}
{{#each contracts.sideEffects}}
    - {{this}}
{{/each}}
{{else}}
    # No side effects defined
{{/if}}
  invariants:
{{#if contracts.invariants}}
{{#each contracts.invariants}}
    - {{this}}
{{/each}}
{{else}}
    # No invariants defined
{{/if}}

quality:
  fixtures:
{{#each quality.fixtures}}
    - id: {{id}}
      description: >
        {{description}}
      operation: {{operation}}
      input:
{{#each input}}
        {{key}}:
{{#if (isObject this)}}
{{#each this}}
          {{key}}: {{value}}
{{/each}}
{{else}}
          {{this}}
{{/if}}
{{/each}}
      expect:
{{#each expect}}
        {{key}}:
{{#if (isObject this)}}
{{#each this}}
          {{key}}: {{value}}
{{/each}}
{{else}}
          {{this}}
{{/if}}
{{/each}}
{{#if expectFailure}}
      expect_failure: true
      expect_failure_reason: "{{expectFailureReason}}"
{{/if}}
      tags: {{tags}}
{{/each}}
  gates:
{{#each quality.gates}}
    - id: {{id}}
      description: >
        {{description}}
      check: "{{check}}"
      action: "{{action}}"
      max_retries: {{maxRetries}}
      on_exhaustion: "{{onExhaustion}}"
{{/each}}
---
# COVENANT.md for {{skillName}} skill

{{description}}

## Design Decisions

### Why this interface?
This skill provides a focused interface for {{purpose}}. The design follows the COVENANT principles of clarity, stability, and minimal necessary complexity.

### Validation Approach
The skill includes internal validation to ensure data integrity and proper error handling.

### Error Handling Philosophy
All operations follow a fail-fast, fail-safe approach:
- Invalid inputs produce clear error messages without side effects
- Failed operations never leave partial files or inconsistent state
- Validation results always indicate success/failure status clearly

## Usage Examples

See SKILL.md for detailed usage instructions and code examples.