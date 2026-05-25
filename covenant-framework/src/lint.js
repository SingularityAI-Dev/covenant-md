/**
 * COVENANT.md linter — heuristic design-quality checks.
 *
 * Exports lintCovenant(skillPath, opts?) → Promise<{ code, findings }>.
 *
 * skillPath may be a directory containing COVENANT.md, or a path to the
 * COVENANT.md file directly (matches the pattern of `validate` and `test`
 * commands accepting a flexible argument).
 *
 * Five heuristics ship (per .planning Phase 3 CONTEXT D-CLI-02):
 *   1. shallow-deep                    (warning) depth=deep + surface.length > 3
 *   2. missing-invariants              (warning) stability=stable + empty/absent contracts.invariants
 *   3. undeclared-side-effects         (warning) op name in side-effect verb list + empty/absent contracts.side_effects
 *   4. shallow-skill-too-few-ops       (info)    depth=shallow + surface.length < 2
 *   5. stable-experimental-mismatch    (info)    stability=stable + version major === 0
 *
 * Exit code semantics:
 *   - parse error  → code 1
 *   - --strict + any warning fires → code 1
 *   - otherwise → code 0 (info findings never raise the code)
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import semver from 'semver';

const SIDE_EFFECT_VERBS = ['create', 'write', 'edit', 'delete', 'update', 'render', 'generate'];

function resolveCovenantPath(skillPath) {
  // Accept either a dir or a file path. If dir, append COVENANT.md.
  const stat = fs.statSync(skillPath);
  if (stat.isDirectory()) return path.join(skillPath, 'COVENANT.md');
  return skillPath;
}

function parseFrontmatter(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing YAML frontmatter: ${filePath}`);
  }
  return yaml.load(match[1]);
}

export async function lintCovenant(skillPath, opts = {}) {
  const findings = [];
  let parsed;
  try {
    const covenantPath = resolveCovenantPath(skillPath);
    parsed = parseFrontmatter(covenantPath);
  } catch (err) {
    findings.push({ id: 'parse-error', level: 'error', message: err.message });
    return { code: 1, findings };
  }

  const surface = Array.isArray(parsed?.interface?.surface) ? parsed.interface.surface : [];
  const opNames = surface.map((o) => o?.name).filter(Boolean);
  const depth = parsed?.domain?.depth;
  const stability = parsed?.stability;
  const invariants = parsed?.contracts?.invariants;
  const sideEffects = parsed?.contracts?.side_effects;
  const version = parsed?.version;

  // 1. shallow-deep: depth=deep + surface.length > 3 (warning)
  if (depth === 'deep' && surface.length > 3) {
    findings.push({
      id: 'shallow-deep',
      level: 'warning',
      message: `skill declares depth=deep but exposes ${surface.length} operations (>3) — consider whether interface is truly minimal`
    });
  }

  // 2. missing-invariants: stable + empty/absent invariants (warning)
  if (stability === 'stable' && (!Array.isArray(invariants) || invariants.length === 0)) {
    findings.push({
      id: 'missing-invariants',
      level: 'warning',
      message: 'stable skill has no contracts.invariants — at least one is expected'
    });
  }

  // 3. undeclared-side-effects: side-effect verb in op names + empty/absent side_effects (warning)
  const offending = opNames.filter((n) => SIDE_EFFECT_VERBS.includes(n));
  if (offending.length > 0 && (!Array.isArray(sideEffects) || sideEffects.length === 0)) {
    findings.push({
      id: 'undeclared-side-effects',
      level: 'warning',
      message: `operations [${offending.join(', ')}] suggest side effects but contracts.side_effects is empty/absent`
    });
  }

  // 4. shallow-skill-too-few-ops: depth=shallow + surface.length < 2 (info)
  if (depth === 'shallow' && surface.length < 2) {
    findings.push({
      id: 'shallow-skill-too-few-ops',
      level: 'info',
      message: `shallow skill exposes only ${surface.length} operation${surface.length === 1 ? '' : 's'} — may be too narrow to justify its own folder`
    });
  }

  // 5. stable-experimental-mismatch: stable + version major === 0 (info)
  if (stability === 'stable' && version && semver.valid(version) && semver.major(version) === 0) {
    findings.push({
      id: 'stable-experimental-mismatch',
      level: 'info',
      message: `stable skill at v${version} (major=0) is unusual — stable typically implies major>=1`
    });
  }

  // Determine exit code.
  const hasError = findings.some((f) => f.level === 'error');
  const hasWarning = findings.some((f) => f.level === 'warning');
  let code = 0;
  if (hasError) code = 1;
  else if (opts.strict && hasWarning) code = 1;

  return { code, findings };
}

export function printFindings(findings) {
  if (!Array.isArray(findings) || findings.length === 0) {
    console.log('No lint findings.');
    return;
  }
  for (const f of findings) {
    console.log(`[${f.level}] ${f.id}: ${f.message}`);
  }
}
