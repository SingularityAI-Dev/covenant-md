import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { SkillGenerator } from '../src/generate.js';
import { validateCovenant } from '../src/validator.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-test-'));
});
afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('SkillGenerator (programmatic)', () => {
  it('produces a COVENANT.md that validateCovenant accepts', async () => {
    const generator = new SkillGenerator();
    generator.outputDir = tmpDir;
    const data = generator.processAnswers({
      skillName: 'sample-skill',
      purpose: 'tests',
      depth: 'shallow',
      ubiquitousLanguage: '{}',
      surfaceOperations: '[]',
      dependencies: '{}',
      contracts: '{}',
      qualityFixtures: '[]',
      qualityGates: '[]',
      description: 'A sample skill for tests.'
    });
    await generator.generateSkill(data);

    const covenantPath = path.join(tmpDir, 'sample-skill', 'COVENANT.md');
    expect(fs.existsSync(covenantPath)).toBe(true);

    const result = validateCovenant(covenantPath);
    // Asserted truth: the generator produces a covenant with required fields present.
    const requiredFieldErrors = result.errors.filter(e => /Missing required field/.test(e));
    expect(requiredFieldErrors).toEqual([]);
  });
});
