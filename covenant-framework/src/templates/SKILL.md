# {{skillName}} Skill

## Overview
{{purpose}}

## Interface

### Entry Point
The primary interface for this skill is defined in COVENANT.md.

### Operations
{{#each interface.surface}}
#### {{name}}
{{description}}

**Accepts:**
{{#each accepts}}
- `{{this}}` - {{#if (eq this "content")}}A structured content object containing the document's semantic content{{/if}}{{#if (eq this "output_path")}}An absolute file system path where the output will be written{{/if}}{{#if (eq this "input_path")}}An absolute path to an existing file for read operations{{/if}}{{#if (eq this "edits")}}Array of structured edit operations{{/if}}{{#if (eq this "file_path")}}Absolute path to the created or edited file{{/if}}{{#if (eq this "validation_result")}}Result of internal validation containing validity status and errors{{/if}}
{{/each}}

**Returns:**
{{#each returns}}
- `{{this}}` - {{#if (eq this "file_path")}}Absolute path to the created or edited file{{/if}}{{#if (eq this "content")}}Parsed content object extracted from a file{{/if}}{{#if (eq this "validation_result")}}Result of internal validation containing validity status and errors{{/if}}
{{/each}}

{{/each}}

## Usage Examples

### Basic Usage
```javascript
const { {{skillName}} } = require('covenant-framework');

// Example usage would go here
```

### Error Handling
All operations return validation results that should be checked before proceeding.

## Configuration
This skill can be configured through environment variables and dependency injection as specified in the COVENANT.md file.

## Dependencies
Refer to the dependencies section in COVENANT.md for required skills, MCP servers, packages, and environment variables.