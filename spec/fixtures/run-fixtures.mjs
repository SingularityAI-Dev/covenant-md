#!/usr/bin/env node
/**
 * Conformance test runner for COVENANT.md spec fixtures.
 *
 * Usage: node spec/fixtures/run-fixtures.mjs
 *
 * Walks valid/, invalid/, and edge-cases/ under this directory. For each
 * <name>.covenant.md, reads <name>.expected.json and invokes the
 * @covenant-md/core validator. The expected.json declares either
 *   { "valid": true }
 * or
 *   { "valid": false, "rule": "<substring matched against an error>" }
 *
 * Exits 0 if every fixture matches its expected outcome, 1 otherwise.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCovenant } from '@covenant-md/core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATEGORIES = ['valid', 'invalid', 'edge-cases'];

let passed = 0;
let failed = 0;
const failures = [];

// The validator is chatty via console.log; silence it during fixture runs.
const origLog = console.log;
function quiet(fn) {
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = origLog;
  }
}

for (const cat of CATEGORIES) {
  const dir = join(__dirname, cat);
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue;
  }
  for (const file of entries.sort()) {
    if (!file.endsWith('.covenant.md')) continue;
    const label = `${cat}/${file}`;
    const mdPath = join(dir, file);
    const expPath = join(dir, file.replace('.covenant.md', '.expected.json'));

    let expected;
    try {
      expected = JSON.parse(readFileSync(expPath, 'utf8'));
    } catch (e) {
      failed++;
      failures.push({ label, reason: `missing or invalid expected.json: ${e.message}` });
      console.log(`  ✗ ${label}`);
      continue;
    }

    const result = quiet(() => validateCovenant(mdPath));

    if (expected.valid === true) {
      if (result.valid) {
        passed++;
        console.log(`  ✓ ${label}`);
      } else {
        failed++;
        failures.push({
          label,
          reason: `expected valid, got errors: ${(result.errors || []).join('; ')}`,
        });
        console.log(`  ✗ ${label}`);
      }
    } else if (expected.valid === false) {
      const ruleMatched = expected.rule
        ? (result.errors || []).some((e) =>
            String(e).toLowerCase().includes(String(expected.rule).toLowerCase())
          )
        : true;
      if (!result.valid && ruleMatched) {
        passed++;
        console.log(`  ✓ ${label}`);
      } else {
        failed++;
        const got = result.valid
          ? 'valid (no errors)'
          : `errors: ${(result.errors || []).join('; ')}`;
        failures.push({
          label,
          reason: `expected invalid with rule "${expected.rule || '*'}", got ${got}`,
        });
        console.log(`  ✗ ${label}`);
      }
    } else {
      failed++;
      failures.push({ label, reason: 'expected.json must declare "valid": true|false' });
      console.log(`  ✗ ${label}`);
    }
  }
}

console.log('');
console.log(`Conformance: ${passed} passed, ${failed} failed (of ${passed + failed} fixtures).`);
if (failed > 0) {
  console.log('');
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  - ${f.label}: ${f.reason}`);
  }
  process.exit(1);
}
