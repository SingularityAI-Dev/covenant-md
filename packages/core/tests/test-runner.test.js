import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CovenantTestRunner } from '../src/test.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');
const fixture = (name) => path.join(fixturesDir, name);

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('extractFixtures (YAML frontmatter)', () => {
  it('extracts quality.fixtures from YAML frontmatter', () => {
    const content = fs.readFileSync(fixture('depends-on-chain.md'), 'utf8');
    const runner = new CovenantTestRunner({
      covenantPath: fixture('depends-on-chain.md'),
      skillRunner: jest.fn()
    });
    const fixtures = runner.extractFixtures(content);
    expect(fixtures.length).toBe(3);
    // skill name is taken from frontmatter `name`
    expect(fixtures.every(f => f.skill === 'chained-skill')).toBe(true);
    // names come from the `id` field
    expect(fixtures.map(f => f.name).sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('extractFixtures (legacy code blocks)', () => {
  it('extracts JSON code-block fixtures when no YAML fixtures present', () => {
    const content = fs.readFileSync(fixture('legacy-fixture-block.md'), 'utf8');
    const runner = new CovenantTestRunner({
      covenantPath: fixture('legacy-fixture-block.md'),
      skillRunner: jest.fn()
    });
    const fixtures = runner.extractFixtures(content);
    expect(fixtures.length).toBeGreaterThanOrEqual(1);
    expect(fixtures[0].name).toBe('first-fixture');
    expect(fixtures[0].skill).toBe('legacy-skill');
  });
});

describe('topologicalSort', () => {
  it('orders a 3-fixture chain (a → b → c) so a runs first, c last', () => {
    const runner = new CovenantTestRunner({
      covenantPath: '/tmp/dummy',
      skillRunner: jest.fn()
    });
    const sorted = runner.topologicalSort([
      { name: 'c', depends_on: ['b'], operation: 'x' },
      { name: 'a', depends_on: [], operation: 'x' },
      { name: 'b', depends_on: ['a'], operation: 'x' },
    ]);
    expect(sorted.map(f => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('throws on circular fixture dependencies', () => {
    const runner = new CovenantTestRunner({
      covenantPath: '/tmp/dummy',
      skillRunner: jest.fn()
    });
    const cyclic = [
      { name: 'a', depends_on: ['c'], operation: 'x' },
      { name: 'b', depends_on: ['a'], operation: 'x' },
      { name: 'c', depends_on: ['b'], operation: 'x' },
    ];
    expect(() => runner.topologicalSort(cyclic)).toThrow(/Circular dependency/);
  });
});

describe('executeFixture', () => {
  it('passes when expected_outcome is fail and runner returns success: false (expect_failure match)', async () => {
    const skillRunner = jest.fn().mockResolvedValue({ success: false, output: { reason: 'as-expected' } });
    const runner = new CovenantTestRunner({
      covenantPath: '/tmp/dummy',
      skillRunner
    });
    const result = await runner.executeFixture({
      name: 'f', skill: 's', operation: 'op', input: {},
      depends_on: [], retry: 0, expected_outcome: 'fail'
    });
    expect(result.passed).toBe(true);
  });

  it('fails when expected_outcome is fail but runner returns success: true (wrong reason)', async () => {
    const skillRunner = jest.fn().mockResolvedValue({ success: true, output: {} });
    const runner = new CovenantTestRunner({
      covenantPath: '/tmp/dummy',
      skillRunner
    });
    const result = await runner.executeFixture({
      name: 'f', skill: 's', operation: 'op', input: {},
      depends_on: [], retry: 0, expected_outcome: 'fail'
    });
    expect(result.passed).toBe(false);
  });

  it('exhausts retries and returns passed: false', async () => {
    const skillRunner = jest.fn().mockRejectedValue(new Error('boom'));
    const runner = new CovenantTestRunner({
      covenantPath: '/tmp/dummy',
      skillRunner
    });
    const result = await runner.executeFixture({
      name: 'r', skill: 's', operation: 'op', input: {},
      depends_on: [], retry: 2, expected_outcome: 'pass'
    });
    expect(result.passed).toBe(false);
    // 1 initial attempt + 2 retries = 3 total invocations
    expect(skillRunner).toHaveBeenCalledTimes(3);
  });
});

describe('retry extraction (issue #21)', () => {
  it('preserves an explicit retry: 0 and defaults absent retry to 0', () => {
    const runner = new CovenantTestRunner({
      covenantPath: '/tmp/dummy',
      skillRunner: jest.fn()
    });
    const content = [
      '---',
      'covenant_version: "1.0"',
      'name: retry-extract-skill',
      'quality:',
      '  fixtures:',
      '    - id: explicit-zero',
      '      operation: op',
      '      retry: 0',
      '    - id: absent',
      '      operation: op',
      '---',
      'body'
    ].join('\n');
    const fixtures = runner.extractFixtures(content);
    expect(fixtures.find(f => f.name === 'explicit-zero').retry).toBe(0);
    expect(fixtures.find(f => f.name === 'absent').retry).toBe(0);
  });
});
