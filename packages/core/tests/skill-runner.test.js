import { jest, describe, it, expect } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { createSkillRunner } from '../src/skill-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');
const fixture = (name) => path.join(fixturesDir, name);

const writeReadFixture = fixture('runner-skill-write-read.md');
const processFixture = fixture('runner-skill-process.md');

describe('simulator strategy: input validation', () => {
  it('fails when a required input field is absent, error message names the field', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    const result = await runner('runner-test-skill', 'write', {
      // payload missing
      output_path: '/tmp/x.bin'
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/payload is required/);
  });

  it('fails when an input field has the wrong primitive type', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    const result = await runner('runner-test-skill', 'write', {
      payload: { id: 'abc' },
      output_path: 12345
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/output_path must be a string/);
  });

  it('fails when a required nested schema key is absent', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    const result = await runner('runner-test-skill', 'write', {
      payload: {}, // missing required `id`
      output_path: '/tmp/x.bin'
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/payload\.id is required/);
  });

  it('fails for unknown operation', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    const result = await runner('runner-test-skill', 'nonexistent', {});
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unknown operation: nonexistent/);
  });
});

describe('simulator strategy: output synthesis', () => {
  it('synthesizes output object from operation.returns + contracts.outputs schema with type-appropriate defaults', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    const result = await runner('runner-test-skill', 'write', {
      payload: { id: 'abc' },
      output_path: '/tmp/x.bin'
    });
    expect(result.success).toBe(true);
    // stored_path is a top-level string output → "" default
    expect(result.output).toHaveProperty('stored_path');
    expect(typeof result.output.stored_path).toBe('string');
  });

  it('synthesizes a number-typed required schema field as 1 (positive integer)', async () => {
    // Construct an inline number-required schema by reusing pdf-generation's shape.
    // We use the real pdf-generation COVENANT to prove genericity for number defaults.
    const pdfPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'examples',
      'pdf-generation',
      'COVENANT.md'
    );
    const runner = await createSkillRunner({ covenantPath: pdfPath });
    const result = await runner('pdf-generation', 'render', {
      content: { title: 'X' },
      output_path: '/tmp/y.pdf'
    });
    expect(result.success).toBe(true);
    expect(result.output.render_result).toBeDefined();
    expect(result.output.render_result.page_count).toBe(1);
    expect(result.output.render_result.file_path).toBe('');
  });
});

describe('simulator strategy: path-map roundtrip', () => {
  it('write-then-read returns the originally-stored payload via input_path lookup', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    const writeResult = await runner('runner-test-skill', 'write', {
      payload: { id: 'abc', body: 'hello' },
      output_path: '/tmp/r.bin'
    });
    expect(writeResult.success).toBe(true);

    const readResult = await runner('runner-test-skill', 'read', {
      input_path: '/tmp/r.bin'
    });
    expect(readResult.success).toBe(true);
    expect(readResult.output.payload).toEqual({ id: 'abc', body: 'hello' });
  });
});

describe('createSkillRunner factory: strategy selection', () => {
  it('defaults to simulator when no runner block is present', async () => {
    const runner = await createSkillRunner({ covenantPath: writeReadFixture });
    // Simulator returns synthesized stubs; no spawn happens.
    const result = await runner('runner-test-skill', 'write', {
      payload: { id: 'x' },
      output_path: '/tmp/p.bin'
    });
    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
  });

  it('returns process strategy when runner.strategy is "process"', async () => {
    // Build a fake spawn that emits a single JSON line on stdout, exits 0.
    const spawnCalls = [];
    const fakeSpawn = (cmd, args, opts) => {
      spawnCalls.push({ cmd, args, opts });
      const child = new EventEmitter();
      child.stdin = { write: jest.fn(), end: jest.fn() };
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      // Asynchronously emit data + close so the runner's listeners are wired first.
      setImmediate(() => {
        child.stdout.emit('data', Buffer.from('{"success":true,"output":{"ok":1}}'));
        child.emit('close', 0);
      });
      return child;
    };

    const runner = await createSkillRunner({
      covenantPath: processFixture,
      _spawn: fakeSpawn
    });
    const result = await runner('process-test-skill', 'ping', {});

    expect(spawnCalls.length).toBe(1);
    expect(spawnCalls[0].cmd).toBe('node');
    expect(spawnCalls[0].args).toEqual(['fake-runner.js']);
    expect(spawnCalls[0].opts.cwd).toBe(path.dirname(processFixture));
    expect(result.success).toBe(true);
    expect(result.output).toEqual({ ok: 1 });
  });

  it('process strategy returns failure when spawned process exits non-zero with non-JSON stdout', async () => {
    const fakeSpawn = () => {
      const child = new EventEmitter();
      child.stdin = { write: jest.fn(), end: jest.fn() };
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      setImmediate(() => {
        child.stderr.emit('data', Buffer.from('boom'));
        child.emit('close', 1);
      });
      return child;
    };
    const runner = await createSkillRunner({
      covenantPath: processFixture,
      _spawn: fakeSpawn
    });
    const result = await runner('process-test-skill', 'ping', {});
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/process runner failed/);
  });
});
