#!/usr/bin/env node

import { program } from 'commander';

// Import command modules
import { validateCovenant as validate } from './validator.js';
import { CovenantTestRunner } from './test.js';
import { createSkillRunner } from './skill-runner.js';

program
  .name('covenant')
  .description('CLI for the COVENANT framework')
  .version('1.0.0');

program
  .command('validate <filePath>')
  .description('Validate a Covenant configuration file at the specified path')
  .action((filePath) => {
    validate(filePath);
  });

program
  .command('test <skillPath>')
  .description('Run fixtures for a skill against its COVENANT.md contracts')
  .action(async (skillPath) => {
    try {
      const covenantPath = `${skillPath}/COVENANT.md`;
      const skillRunner = await createSkillRunner({ covenantPath });
      const testRunner = new CovenantTestRunner({ covenantPath, skillRunner });
      const results = await testRunner.run();

      // Existing result-printing block — preserved verbatim from prior cli.js:
      if (results.overall) {
        console.log(`✅ All tests passed! (${results.passedCount}/${results.fixtureCount} fixtures passed, ${results.failedCount} failed, ${results.skippedCount} skipped)`);
      } else {
        console.log(`❌ Some tests failed! (${results.passedCount}/${results.fixtureCount} fixtures passed, ${results.failedCount} failed, ${results.skippedCount} skipped)`);
        if (results.error) {
          console.log(`Error: ${results.error}`);
        }
        results.fixtures.forEach(fixture => {
          if (!fixture.passed) {
            let reason = fixture.reason || 'Failed';
            if (fixture.error) {
              reason += ` - ${fixture.error.message || fixture.error}`;
            }
            console.log(`  - ${fixture.name}: ${reason}`);
          }
        });
        process.exit(1);
      }
    } catch (error) {
      console.log(`Error running tests: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('lint <skillPath>')
  .description("Run heuristic design-quality checks on a skill's COVENANT.md")
  .option('--strict', 'Exit non-zero if any warning fires')
  .action(async (skillPath, opts) => {
    try {
      const { lintCovenant, printFindings } = await import('./lint.js');
      const { code, findings } = await lintCovenant(skillPath, opts);
      printFindings(findings);
      process.exit(code);
    } catch (err) {
      console.error(`Error linting: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('diff <oldPath> <newPath>')
  .description('Diff two COVENANT.md files; classify changes as breaking/additive/cosmetic')
  .option('--strict', 'Exit non-zero if breaking detected without major version bump')
  .action(async (oldPath, newPath, opts) => {
    try {
      const { diffCovenants, printDiff } = await import('./diff.js');
      const { code, sections } = await diffCovenants(oldPath, newPath, opts);
      printDiff(sections);
      process.exit(code);
    } catch (err) {
      console.error(`Error diffing: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('graph <skillsDir>')
  .description('Walk a skills directory and emit a dependency graph (DOT or JSON)')
  .option('--format <fmt>', 'Output format: dot (default) or json', 'dot')
  .action(async (skillsDir, opts) => {
    try {
      const { graphSkills } = await import('./graph.js');
      const result = await graphSkills(skillsDir, opts);
      if (result.error) {
        process.stderr.write(`${result.error}\n`);
      }
      if (result.output) {
        process.stdout.write(result.output);
        if (!result.output.endsWith('\n')) process.stdout.write('\n');
      }
      process.exit(result.code);
    } catch (err) {
      console.error(`Error graphing: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate a new skill blueprint from templates')
  .action(async () => {
    try {
      const { main } = await import('./generate.js');
      await main();
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
