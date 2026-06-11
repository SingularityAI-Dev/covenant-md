import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { validateCovenant } from '../src/validator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

// Helper used by every test to load a fixture by filename.
const fixture = (name) => path.join(fixturesDir, name);

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('required fields', () => {
  it('rejects when covenant_version is missing', () => {
    const result = validateCovenant(fixture('invalid-required.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => /Missing required field: covenant_version/.test(e))).toBe(true);
  });

  it('rejects when name is missing', () => {
    const result = validateCovenant(fixture('invalid-required.md'));
    expect(result.errors.some(e => /Missing required field: name/.test(e))).toBe(true);
  });
});

describe('field formats', () => {
  it('rejects non-kebab-case name', () => {
    const result = validateCovenant(fixture('invalid-kebab.md'));
    expect(result.errors.some(e => /must be kebab-case/.test(e))).toBe(true);
  });

  it('rejects non-semver version', () => {
    const result = validateCovenant(fixture('invalid-semver.md'));
    expect(result.errors.some(e => /must be valid semver/.test(e))).toBe(true);
  });
});

describe('interface surface cross-refs', () => {
  it('accepts valid accepts/returns referencing declared contracts', () => {
    const result = validateCovenant(fixture('valid-skill.md'));
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects accepts referencing unknown input field', () => {
    // Loads tests/fixtures/invalid-cross-ref-accepts.md from disk.
    const result = validateCovenant(fixture('invalid-cross-ref-accepts.md'));
    expect(result.errors.some(e => /references unknown input field/.test(e))).toBe(true);
  });

  it('rejects returns referencing unknown output field', () => {
    // Loads tests/fixtures/invalid-cross-ref-returns.md from disk.
    const result = validateCovenant(fixture('invalid-cross-ref-returns.md'));
    expect(result.errors.some(e => /references unknown output field/.test(e))).toBe(true);
  });
});

describe('dependency cycle detection', () => {
  it('detects self-dependency', () => {
    const result = validateCovenant(fixture('cyclic-deps-a.md'));
    expect(result.errors.some(e => /skill depends on itself/.test(e))).toBe(true);
  });
});

describe('fixture expect cross-refs (issue #18)', () => {
  it('rejects expect referencing unknown output field', () => {
    const result = validateCovenant(fixture('invalid-expect-cross-ref.md'));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => /expect references unknown output field: resultId/.test(e))).toBe(true);
  });

  it('accepts expect referencing declared output fields', () => {
    const result = validateCovenant(fixture('strict-output-skill.md'));
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
