import { describe, test, expect } from '@jest/globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { graphSkills } from '../src/graph.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fxDir = (name) => path.resolve(__dirname, 'fixtures', name);
const examplesDir = path.resolve(__dirname, '..', '..', '..', 'examples');

describe('graph: DOT format', () => {
  test('emits valid DOT for a 2-node 1-edge graph', async () => {
    const { code, output } = await graphSkills(fxDir('graph-skills'));
    expect(code).toBe(0);
    expect(output).toContain('digraph covenant_skills {');
    expect(output).toContain('"skill-a"');
    expect(output).toContain('"skill-b"');
    expect(output).toContain('"skill-a" -> "skill-b"');
    expect(output.trimEnd().endsWith('}')).toBe(true);
  });
});

describe('graph: JSON format', () => {
  test('emits valid JSON with skills + cycles arrays', async () => {
    const { code, output } = await graphSkills(fxDir('graph-skills'), { format: 'json' });
    expect(code).toBe(0);
    const parsed = JSON.parse(output);
    expect(parsed.skills).toHaveLength(2);
    expect(parsed.cycles).toEqual([]);
    const a = parsed.skills.find((s) => s.name === 'skill-a');
    expect(a).toBeDefined();
    expect(a.dependencies).toEqual([{ name: 'skill-b', external: false }]);
    const b = parsed.skills.find((s) => s.name === 'skill-b');
    expect(b.dependencies).toEqual([]);
  });
});

describe('graph: cycle detection', () => {
  test('detects cycle and exits 1 with cyclePath', async () => {
    const { code, output, error, cyclePath } = await graphSkills(fxDir('graph-cycle'));
    expect(code).toBe(1);
    expect(output).toBeNull();
    expect(error).toMatch(/cycle/i);
    expect(cyclePath).toBeDefined();
    expect(cyclePath.length).toBeGreaterThanOrEqual(3);
    // First and last entries are the same node (cycle closes back)
    expect(cyclePath[0]).toBe(cyclePath[cyclePath.length - 1]);
  });
});

describe('graph: external dependency markers', () => {
  test('marks unresolvable dependencies as external in JSON', async () => {
    // docx-generation declares file-system at ./shared/file-system/COVENANT.md
    // which does not exist in examples/. Should appear as external.
    const { code, output } = await graphSkills(examplesDir, { format: 'json' });
    expect(code).toBe(0);
    const parsed = JSON.parse(output);
    const docx = parsed.skills.find((s) => s.name === 'docx-generation');
    expect(docx).toBeDefined();
    const fileSystem = docx.dependencies.find((d) => d.name === 'file-system');
    expect(fileSystem).toBeDefined();
    expect(fileSystem.external).toBe(true);
  });
});

describe('graph: walks real examples/ end-to-end (CLI-04 + EX-02 integration)', () => {
  test('shows markdown-to-html → template-rendering edge from real examples', async () => {
    const { code, output } = await graphSkills(examplesDir);
    expect(code).toBe(0);
    expect(output).toContain('"markdown-to-html"');
    expect(output).toContain('"template-rendering"');
    expect(output).toMatch(/"markdown-to-html"\s*->\s*"template-rendering"/);
    // All 4 example skills should appear (docx, pdf, markdown-to-html, template-rendering)
    expect(output).toContain('"docx-generation"');
    expect(output).toContain('"pdf-generation"');
  });

  test('JSON shape is valid for real examples and resolves the EX-02 edge as internal', async () => {
    const { code, output } = await graphSkills(examplesDir, { format: 'json' });
    expect(code).toBe(0);
    const parsed = JSON.parse(output);
    expect(parsed.skills.length).toBeGreaterThanOrEqual(4);
    const mh = parsed.skills.find((s) => s.name === 'markdown-to-html');
    expect(mh).toBeDefined();
    expect(mh.dependencies).toEqual([{ name: 'template-rendering', external: false }]);
  });
});
