/**
 * Mock implementation of test-skill for testing COVENANT fixtures
 * This simulates a docx-generation skill for testing purposes
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate a mock .docx file (actually just a text file for testing)
 * @param {Object} content - Content object with title and optional sections
 * @param {string} outputPath - Path where the file should be written
 * @returns {Object} Result with file_path and validation_result
 */
function create(content, outputPath) {
  // Validate input
  if (!content || typeof content !== 'object') {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: ['content must be an object']
      }
    };
  }
  
  if (!content.title || typeof content.title !== 'string') {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: ['content.title is required and must be a string']
      }
    };
  }
  
  if (!outputPath || typeof outputPath !== 'string' || !outputPath.endsWith('.docx')) {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: ['output_path must be a string ending with .docx']
      }
    };
  }
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (dir && !fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      return {
        file_path: null,
        validation_result: {
          valid: false,
          errors: [`Failed to create directory: ${err.message}`]
        }
      };
    }
  }
  
  // Create mock .docx content (just a simple text representation for testing)
  const docxContent = `Mock DOCX File\nTitle: ${content.title}\n`;
  
  if (content.sections && Array.isArray(content.sections)) {
    content.sections.forEach((section, index) => {
      docxContent += `Section ${index + 1}:\n`;
      if (section.heading) {
        docxContent += `Heading: ${section.heading}\n`;
      }
      if (section.body) {
        docxContent += `Body: ${section.body}\n`;
      }
      docxContent += '\n';
    });
  }
  
  // Write the file
  try {
    fs.writeFileSync(outputPath, docxContent);
    
    return {
      file_path: outputPath,
      validation_result: {
        valid: true,
        errors: []
      }
    };
  } catch (err) {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: [`Failed to write file: ${err.message}`]
      }
    };
  }
}

/**
 * Read a mock .docx file and return its content
 * @param {string} inputPath - Path to the .docx file to read
 * @returns {Object} Result with content and validation_result
 */
function read(inputPath) {
  // Validate input
  if (!inputPath || typeof inputPath !== 'string') {
    return {
      content: null,
      validation_result: {
        valid: false,
        errors: ['input_path must be a string']
      }
    };
  }
  
  if (!fs.existsSync(inputPath)) {
    return {
      content: null,
      validation_result: {
        valid: false,
        errors: ['File does not exist']
      }
    };
  }
  
  // Read the file
  try {
    const fileContent = fs.readFileSync(inputPath, 'utf8');
    
    // Parse the mock content back into a content object
    // This is a simple parser for our mock format
    const lines = fileContent.split('\n');
    const content = { title: '', sections: [] };
    let currentSection = null;
    
    for (const line of lines) {
      if (line.startsWith('Title: ')) {
        content.title = line.substring(7);
      } else if (line.startsWith('Section ') && line.endsWith(':')) {
        // Start of a new section
        currentSection = {};
        content.sections.push(currentSection);
      } else if (line.startsWith('Heading: ')) {
        if (currentSection) {
          currentSection.heading = line.substring(9);
        }
      } else if (line.startsWith('Body: ')) {
        if (currentSection) {
          currentSection.body = line.substring(6);
        }
      }
    }
    
    return {
      content: content,
      validation_result: {
        valid: true,
        errors: []
      }
    };
  } catch (err) {
    return {
      content: null,
      validation_result: {
        valid: false,
        errors: [`Failed to read file: ${err.message}`]
      }
    };
  }
}

/**
 * Edit a mock .docx file by applying structured edits
 * @param {string} inputPath - Path to the .docx file to edit
 * @param {Array} edits - Array of edit operations
 * @returns {Object} Result with file_path and validation_result
 */
function edit(inputPath, edits) {
  // Validate input
  if (!inputPath || typeof inputPath !== 'string') {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: ['input_path must be a string']
      }
    };
  }
  
  if (!fs.existsSync(inputPath)) {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: ['File does not exist']
      }
    };
  }
  
  if (!edits || !Array.isArray(edits)) {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: ['edits must be an array']
      }
    };
  }
  
  // First read the existing content
  const readResult = read(inputPath);
  if (!readResult.validation_result.valid) {
    return {
      file_path: null,
      validation_result: readResult.validation_result
    };
  }
  
  // Create a copy of the content to avoid modifying the original
  let content = JSON.parse(JSON.stringify(readResult.content));
  
  // Apply each edit
  for (const edit of edits) {
    if (!edit.target || !edit.replacement) {
      return {
        file_path: null,
        validation_result: {
          valid: false,
          errors: ['Each edit must have target and replacement']
        }
      };
    }
    
    // For simplicity, we'll just append a note about the edit
    // In a real implementation, this would modify the content based on target
    if (!content.sections) {
      content.sections = [];
    }
    
    content.sections.push({
      heading: `Edit: ${edit.target}`,
      body: JSON.stringify(edit.replacement)
    });
  }
  
  // Write the modified content back
  const docxContent = `Mock DOCX File\nTitle: ${content.title}\n`;
  
  if (content.sections && Array.isArray(content.sections)) {
    content.sections.forEach((section, index) => {
      docxContent += `Section ${index + 1}:\n`;
      if (section.heading) {
        docxContent += `Heading: ${section.heading}\n`;
      }
      if (section.body) {
        docxContent += `Body: ${section.body}\n`;
      }
      docxContent += '\n';
    });
  }
  
  try {
    fs.writeFileSync(inputPath, docxContent);
    
    return {
      file_path: inputPath,
      validation_result: {
        valid: true,
        errors: []
      }
    };
  } catch (err) {
    return {
      file_path: null,
      validation_result: {
        valid: false,
        errors: [`Failed to write file: ${err.message}`]
      }
    };
  }
}

module.exports = {
  create,
  read,
  edit
};
