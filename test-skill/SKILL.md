# test-skill Skill

## Overview
A test skill for demonstration that simulates docx-generation behavior for testing COVENANT fixtures.

## Interface

### Entry Point
The primary interface for this skill is defined in COVENANT.md.

### Operations

#### create
Generates a new .docx file from a content object and writes it to the specified output path.

**Accepts:**
- `content` (object): A structured content object containing at minimum a `title` string field
- `output_path` (string): Absolute path ending in .docx for file creation

**Returns:**
- `file_path` (string): Absolute path to the created .docx file
- `validation_result` (object): Result of internal validation with `valid` boolean and optional `errors` array

#### read
Parses an existing .docx file and returns its content as a structured content object.

**Accepts:**
- `input_path` (string): Absolute path to an existing .docx file

**Returns:**
- `content` (object): Parsed content object extracted from the .docx file
- `validation_result` (object): Result of internal validation with `valid` boolean and optional `errors` array

#### edit
Applies a set of structured edits to an existing .docx file in place. Returns the updated file path.

**Accepts:**
- `input_path` (string): Absolute path to an existing .docx file
- `edits` (array): Array of structured edit operations, each with `target` and `replacement`

**Returns:**
- `file_path` (string): Absolute path to the edited .docx file
- `validation_result` (object): Result of internal validation with `valid` boolean and optional `errors` array

## Usage Examples

### Basic Usage
```javascript
const testSkill = require('./src/index');

// Create a document
const createResult = testSkill.create(
  { title: "Test Document", sections: [{ heading: "Introduction", body: "This is a test." }] },
  "/tmp/test-output.docx"
);

if (createResult.validation_result.valid) {
  console.log(`Document created at: ${createResult.file_path}`);
  
  // Read the document back
  const readResult = testSkill.read(createResult.file_path);
  if (readResult.validation_result.valid) {
    console.log("Read content:", readResult.content);
    
    // Edit the document
    const editResult = testSkill.edit(
      createResult.file_path,
      [{ target: "Introduction", replacement: { heading: "Updated", body: "This has been updated." } }]
    );
    
    if (editResult.validation_result.valid) {
      console.log(`Document edited at: ${editResult.file_path}`);
    }
  }
}
```

### Error Handling
All operations return validation results that should be checked before proceeding.
The validation_result object always contains a `valid` boolean field.
When `valid` is false, the `errors` array contains descriptive error messages.

## Configuration
This skill can be configured through environment variables as specified in the COVENANT.md file:
- `NODE_VERSION`: Must be >=18
- `DOCX_OUTPUT_DIR`: Optional override for output directory

## Dependencies
Refer to the dependencies section in COVENANT.md for required skills, MCP servers, packages, and environment variables.
