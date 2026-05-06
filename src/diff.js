/**
 * COVENANT.md semantic differ.
 *
 * Exports diffCovenants(oldPath, newPath, opts?) → Promise<{ code, sections }>
 * where sections = { breaking: [], additive: [], cosmetic: [], header: string }.
 *
 * "Breaking" is determined by string-keyword matching detected changes against
 * the NEW file's interface.breaking_changes list. Name changes are always breaking
 * regardless of the breaking_changes content.
 *
 * Detection scope (per CONTEXT D-CLI-03):
 *   - interface.surface ops: added/removed (renamed → flagged as removed+added)
 *   - contracts.inputs.<field>.type changes
 *   - contracts.outputs.<field>: removed / added / type changes
 *   - description text changes (op.description, domain.purpose) → cosmetic
 *   - name change → always breaking
 *   - version bump (major/minor/patch) reported in header
 *
 * Exit code semantics:
 *   - parse error → code 1
 *   - opts.strict + breaking detected + version bump != major → code 1
 *   - otherwise → code 0
 */

import fs from 'node:fs';
import yaml from 'js-yaml';
import semver from 'semver';

function parseFrontmatter(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing YAML frontmatter: ${filePath}`);
  }
  return yaml.load(match[1]);
}

// Returns true if any rule in `rules` (array of strings) contains ALL keywords
// from `keywords` (case-insensitive substring).
function ruleMatches(rules, keywords) {
  if (!Array.isArray(rules)) return false;
  return rules.some((rule) => {
    const r = String(rule).toLowerCase();
    return keywords.every((kw) => r.includes(kw.toLowerCase()));
  });
}

function detectOperationChanges(oldOps, newOps) {
  const oldByName = new Map((oldOps || []).map((o) => [o.name, o]));
  const newByName = new Map((newOps || []).map((o) => [o.name, o]));
  const removed = [];
  const added = [];
  const descChanged = [];
  for (const [name, oldOp] of oldByName) {
    if (!newByName.has(name)) {
      removed.push(name);
    } else {
      const newOp = newByName.get(name);
      if ((oldOp.description || '') !== (newOp.description || '')) {
        descChanged.push(name);
      }
    }
  }
  for (const name of newByName.keys()) {
    if (!oldByName.has(name)) added.push(name);
  }
  return { removed, added, descChanged };
}

function detectInputTypeChanges(oldInputs, newInputs) {
  const changes = [];
  for (const [field, decl] of Object.entries(oldInputs || {})) {
    const newDecl = (newInputs || {})[field];
    if (newDecl && newDecl.type !== decl.type) {
      changes.push({ field, oldType: decl.type, newType: newDecl.type });
    }
  }
  return changes;
}

function detectOutputChanges(oldOutputs, newOutputs) {
  const removed = [];
  const added = [];
  const typeChanges = [];
  for (const [field, decl] of Object.entries(oldOutputs || {})) {
    if (!(newOutputs || {})[field]) {
      removed.push(field);
    } else if ((newOutputs || {})[field].type !== decl.type) {
      typeChanges.push({ field, oldType: decl.type, newType: (newOutputs || {})[field].type });
    }
  }
  for (const field of Object.keys(newOutputs || {})) {
    if (!(oldOutputs || {})[field]) added.push(field);
  }
  return { removed, added, typeChanges };
}

function detectDescriptionChanges(oldData, newData) {
  const cosmetic = [];
  if ((oldData?.domain?.purpose || '') !== (newData?.domain?.purpose || '')) {
    cosmetic.push('domain.purpose text changed');
  }
  return cosmetic;
}

function classifyVersionBump(oldVer, newVer) {
  if (!semver.valid(oldVer) || !semver.valid(newVer)) return 'unknown';
  if (semver.major(newVer) > semver.major(oldVer)) return 'major';
  if (semver.minor(newVer) > semver.minor(oldVer)) return 'minor';
  if (semver.patch(newVer) > semver.patch(oldVer)) return 'patch';
  return 'none';
}

export async function diffCovenants(oldPath, newPath, opts = {}) {
  let oldData, newData;
  try {
    oldData = parseFrontmatter(oldPath);
    newData = parseFrontmatter(newPath);
  } catch (err) {
    return {
      code: 1,
      sections: { breaking: [], additive: [], cosmetic: [], header: `Error: ${err.message}` }
    };
  }

  const breakingRules = newData?.interface?.breaking_changes || [];
  const breaking = [];
  const additive = [];
  const cosmetic = [];

  // 1. Name change → always breaking
  if (oldData.name !== newData.name) {
    breaking.push(`Skill name changed: ${oldData.name} → ${newData.name} (always breaking)`);
  }

  // 2. Operations
  const opChanges = detectOperationChanges(
    oldData?.interface?.surface,
    newData?.interface?.surface
  );
  for (const name of opChanges.removed) {
    if (ruleMatches(breakingRules, ['removing', 'operation'])) {
      breaking.push(`Removed operation '${name}' from interface.surface (matches rule)`);
    } else {
      additive.push(`Removed operation '${name}' but no breaking rule matches`);
    }
  }
  for (const name of opChanges.added) {
    additive.push(`Added operation '${name}' to interface.surface`);
  }
  for (const name of opChanges.descChanged) {
    cosmetic.push(`Operation '${name}' description text changed`);
  }

  // 3. Input type changes
  const inputTypeChanges = detectInputTypeChanges(
    oldData?.contracts?.inputs,
    newData?.contracts?.inputs
  );
  for (const c of inputTypeChanges) {
    if (ruleMatches(breakingRules, ['changing the type', 'contracts.inputs'])) {
      breaking.push(`Changed type of contracts.inputs.${c.field} from ${c.oldType} to ${c.newType} (matches rule)`);
    } else {
      additive.push(`Changed type of contracts.inputs.${c.field} from ${c.oldType} to ${c.newType} (no breaking rule matches)`);
    }
  }

  // 4. Output changes
  const outputChanges = detectOutputChanges(
    oldData?.contracts?.outputs,
    newData?.contracts?.outputs
  );
  for (const field of outputChanges.removed) {
    if (
      ruleMatches(breakingRules, ['removing', 'contracts.outputs']) ||
      ruleMatches(breakingRules, ['removing a field'])
    ) {
      breaking.push(`Removed contracts.outputs.${field} (matches rule)`);
    } else {
      additive.push(`Removed contracts.outputs.${field} (no breaking rule matches)`);
    }
  }
  for (const field of outputChanges.added) {
    additive.push(`Added contracts.outputs.${field}`);
  }
  for (const c of outputChanges.typeChanges) {
    if (ruleMatches(breakingRules, ['changing the type', 'contracts.outputs'])) {
      breaking.push(`Changed type of contracts.outputs.${c.field} from ${c.oldType} to ${c.newType} (matches rule)`);
    } else {
      additive.push(`Changed type of contracts.outputs.${c.field} from ${c.oldType} to ${c.newType}`);
    }
  }

  // 5. Cosmetic prose changes
  cosmetic.push(...detectDescriptionChanges(oldData, newData));

  // 6. Version bump analysis
  const bump = classifyVersionBump(oldData.version, newData.version);
  let header = `# Diff: ${oldData.name} ${oldData.version || '?'} → ${newData.version || '?'} (${bump} bump)`;
  if (breaking.length > 0 && bump !== 'major') {
    header = `⚠ Breaking changes detected but version is ${bump} — consider major bump.\n\n` + header;
  }

  let code = 0;
  if (opts.strict && breaking.length > 0 && bump !== 'major') {
    code = 1;
  }

  return { code, sections: { breaking, additive, cosmetic, header } };
}

export function printDiff(sections) {
  console.log(sections.header);
  if (sections.breaking.length > 0) {
    console.log('\n## Breaking');
    for (const e of sections.breaking) console.log(`- ${e}`);
  }
  if (sections.additive.length > 0) {
    console.log('\n## Additive');
    for (const e of sections.additive) console.log(`- ${e}`);
  }
  if (sections.cosmetic.length > 0) {
    console.log('\n## Cosmetic');
    for (const e of sections.cosmetic) console.log(`- ${e}`);
  }
  if (
    sections.breaking.length === 0 &&
    sections.additive.length === 0 &&
    sections.cosmetic.length === 0
  ) {
    console.log('\nNo differences detected.');
  }
}
