import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';

// Register Handlebars helpers
Handlebars.registerHelper('isObject', function(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
});

/**
 * Generate a new skill blueprint from templates
 */
class SkillGenerator {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.templatesDir = path.join(__dirname, 'templates');
    this.outputDir = process.cwd();
  }

  /**
   * Load a template file
   * @param {string} templateName - Name of the template file (without extension)
   * @returns {Promise<string>} Template content
   */
  async loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, `${templateName}.md`);
    try {
      return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load template ${templateName}: ${error.message}`);
    }
  }

  /**
   * Prompt user for skill information
   * @returns {Promise<Object>} Answers from user prompts
   */
  async promptForSkillInfo() {
    const questions = [
      {
        type: 'input',
        name: 'skillName',
        message: 'What is the name of the skill?',
        validate: (input) => {
          if (!input) {
            return 'Skill name is required';
          }
          // Check if it's a valid identifier (simplified)
          if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(input)) {
            return 'Skill name must start with a letter and contain only letters, numbers, underscores, and hyphens';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'purpose',
        message: 'What is the purpose of this skill?',
        validate: (input) => {
          if (!input) {
            return 'Purpose is required';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'depth',
        message: 'What is the depth of this skill?',
        choices: ['shallow', 'deep'],
        default: 'shallow'
      },
      {
        type: 'input',
        name: 'ubiquitousLanguage',
        message: 'Define ubiquitous language terms (JSON format, e.g., {\"term\": \"definition\"}):',
        default: '{}',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Invalid JSON format';
          }
        }
      },
      {
        type: 'input',
        name: 'surfaceOperations',
        message: 'Define surface operations (JSON array format, e.g., [{\"name\": \"create\", \"description\": \"Create something\"}]):',
        default: '[]',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Invalid JSON format';
          }
        }
      },
      {
        type: 'input',
        name: 'dependencies',
        message: 'Define dependencies (JSON format):',
        default: '{}',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Invalid JSON format';
          }
        }
      },
      {
        type: 'input',
        name: 'contracts',
        message: 'Define contracts (JSON format):',
        default: '{}',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Invalid JSON format';
          }
        }
      },
      {
        type: 'input',
        name: 'qualityFixtures',
        message: 'Define quality fixtures (JSON array format):',
        default: '[]',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Invalid JSON format';
          }
        }
      },
      {
        type: 'input',
        name: 'qualityGates',
        message: 'Define quality gates (JSON array format):',
        default: '[]',
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch (e) {
            return 'Invalid JSON format';
          }
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Provide a detailed description for the skill documentation:',
        validate: (input) => {
          if (!input) {
            return 'Description is required';
          }
          return true;
        }
      }
    ];

     return inquirer.prompt(questions);
  }

  /**
   * Process user answers into template-ready format
   * @param {Object} answers - Raw answers from prompts
   * @returns {Object} Processed data for templates
   */
  processAnswers(answers) {
    return {
      skillName: answers.skillName,
      purpose: answers.purpose,
      depth: answers.depth,
      ubiquitousLanguage: this.parseJson(answers.ubiquitousLanguage, {}),
      surface: this.parseJson(answers.surfaceOperations, []),
      dependencies: this.parseJson(answers.dependencies, {}),
      contracts: this.parseJson(answers.contracts, {}),
      quality: {
        fixtures: this.parseJson(answers.qualityFixtures, []),
        gates: this.parseJson(answers.qualityGates, [])
      },
      description: answers.description
    };
  }

  /**
   * Safely parse JSON string
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed object or default value
   */
  parseJson(jsonString, defaultValue) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn(`Failed to parse JSON: ${error.message}. Using default value.`);
      return defaultValue;
    }
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Path to directory
   */
  async ensureDirectoryExists(dirPath) {
    if (!(await fs.stat(dirPath).catch(() => false))) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generate skill files
   * @param {Object} data - Template data
   */
  async generateSkill(data) {
    const skillDir = path.join(this.outputDir, data.skillName);
    
    // Check if directory already exists
    const dirExists = await fs.stat(skillDir).then(() => true).catch(() => false);
    if (dirExists) {
       const overwrite = await prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${skillDir} already exists. Overwrite?`,
          default: false
        }
      ]);
      
      if (!overwrite.overwrite) {
        console.log('Generation cancelled.');
        return;
      }
    }
    
    // Create skill directory
    await this.ensureDirectoryExists(skillDir);
    
    try {
      // Load and process COVENANT.md template
      const covenantTemplate = await this.loadTemplate('COVENANT');
      const covenantTemplateFn = Handlebars.compile(covenantTemplate);
      const covenantContent = covenantTemplateFn(data);
      
      // Write COVENANT.md
      await fs.writeFile(
        path.join(skillDir, 'COVENANT.md'),
        covenantContent,
        'utf8'
      );
      
      // Load and process SKILL.md template
      const skillTemplate = await this.loadTemplate('SKILL');
      const skillTemplateFn = Handlebars.compile(skillTemplate);
      const skillContent = skillTemplateFn(data);
      
      // Write SKILL.md
      await fs.writeFile(
        path.join(skillDir, 'SKILL.md'),
        skillContent,
        'utf8'
      );
      
      console.log(`✅ Skill '${data.skillName}' generated successfully at ${skillDir}`);
      console.log(`📄 Created files:`);
      console.log(`   - ${path.join(skillDir, 'COVENANT.md')}`);
      console.log(`   - ${path.join(skillDir, 'SKILL.md')}`);
      
    } catch (error) {
      console.error(`❌ Failed to generate skill: ${error.message}`);
      process.exit(1);
    }
  }
}

/**
 * Main function to run the skill generator
 */
async function main() {
  const generator = new SkillGenerator();
  
  try {
    // Prompt for skill information
    const answers = await generator.promptForSkillInfo();
    
    // Process answers for template use
    const data = generator.processAnswers(answers);
    
    // Generate the skill files
    await generator.generateSkill(data);
    
  } catch (error) {
    if (error.name === 'Cancel') {
      console.log('Generation cancelled.');
      process.exit(0);
    }
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SkillGenerator, main };