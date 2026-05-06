import { describe, test, expect } from '@jest/globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffCovenants } from '../src/diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fx = (name) => path.resolve(__dirname, 'fixtures', name);

describe('diff: removed operation', () => {
  test('classifies as breaking when rule matches "removing an operation"', async () => {
    const { sections } = await diffCovenants(fx('diff-base.md'), fx('diff-removed-op.md'));
    expect(sections.breaking.length).toBeGreaterThan(0);
    expect(sections.breaking.some((e) => /gamma/i.test(e))).toBe(true);
  });
});

describe('diff: type change', () => {
  test('classifies input type change as breaking', async () => {
    const { sections } = await diffCovenants(fx('diff-base.md'), fx('diff-type-change.md'));
    expect(sections.breaking.length).toBeGreaterThan(0);
    expect(sections.breaking.some((e) => /input_a/i.test(e) && /type/i.test(e))).toBe(true);
  });
});

describe('diff: added operation', () => {
  test('classifies new op as additive (not breaking)', async () => {
    const { sections } = await diffCovenants(fx('diff-base.md'), fx('diff-added-op.md'));
    expect(sections.additive.some((e) => /delta/i.test(e))).toBe(true);
    expect(sections.breaking.length).toBe(0);
  });
});

describe('diff: cosmetic-only changes', () => {
  test('classifies description text edits as cosmetic, not breaking/additive', async () => {
    const { sections } = await diffCovenants(fx('diff-base.md'), fx('diff-cosmetic-only.md'));
    expect(sections.cosmetic.length).toBeGreaterThan(0);
    expect(sections.breaking.length).toBe(0);
    // Additive may be empty OR contain version bump info — accept both
  });
});

describe('diff: --strict semantics', () => {
  test('strict + breaking + non-major bump → code 1', async () => {
    // diff-type-change has version "1.1.0" (minor bump) but introduces a breaking type change
    const { code } = await diffCovenants(
      fx('diff-base.md'),
      fx('diff-type-change.md'),
      { strict: true }
    );
    expect(code).toBe(1);
  });

  test('strict + breaking + major bump → code 0', async () => {
    // diff-removed-op has version "2.0.0" (major bump) — proper semver
    const { code } = await diffCovenants(
      fx('diff-base.md'),
      fx('diff-removed-op.md'),
      { strict: true }
    );
    expect(code).toBe(0);
  });

  test('default (no strict) always exits 0 even with breaking', async () => {
    const { code } = await diffCovenants(fx('diff-base.md'), fx('diff-type-change.md'));
    expect(code).toBe(0);
  });
});

describe('diff: warning header', () => {
  test('header warns when breaking detected without major bump', async () => {
    const { sections } = await diffCovenants(fx('diff-base.md'), fx('diff-type-change.md'));
    expect(sections.header).toMatch(/breaking/i);
  });
});
