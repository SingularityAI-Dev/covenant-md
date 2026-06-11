import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { SkillGenerator } from '../src/generate.js';
import { validateCovenant } from '@covenant-md/core';
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

describe('ensureDirectoryExists error handling (issue #23)', () => {
  it('propagates non-ENOENT stat errors instead of treating them as nonexistence', async () => {
    const generator = new SkillGenerator();
    const eacces = Object.assign(new Error('permission denied'), { code: 'EACCES' });
    const statSpy = jest.spyOn(fs.promises, 'stat').mockRejectedValue(eacces);
    const mkdirSpy = jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    try {
      await expect(generator.ensureDirectoryExists('/locked/dir')).rejects.toThrow(/permission denied/);
      // The masking behaviour was: swallow EACCES, then call mkdir anyway.
      expect(mkdirSpy).not.toHaveBeenCalled();
    } finally {
      statSpy.mockRestore();
      mkdirSpy.mockRestore();
    }
  });

  it('still creates the directory on a genuine ENOENT', async () => {
    const generator = new SkillGenerator();
    const enoent = Object.assign(new Error('no such file'), { code: 'ENOENT' });
    const statSpy = jest.spyOn(fs.promises, 'stat').mockRejectedValue(enoent);
    const mkdirSpy = jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    try {
      await generator.ensureDirectoryExists('/brand/new/dir');
      expect(mkdirSpy).toHaveBeenCalledWith('/brand/new/dir', { recursive: true });
    } finally {
      statSpy.mockRestore();
      mkdirSpy.mockRestore();
    }
  });
});
