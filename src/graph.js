/**
 * COVENANT.md skill dependency grapher.
 *
 * Exports graphSkills(skillsDir, opts?) → Promise<{ code, output, error?, cyclePath? }>.
 *
 * Walks `skillsDir` one level deep — each subdirectory containing a
 * COVENANT.md becomes a node. Edges are built from the parsed
 * dependencies.skills[*].covenant paths.
 *
 * Output formats (opts.format, default 'dot'):
 *   - dot: Graphviz DOT digraph
 *   - json: { skills: [...], cycles: [] }
 *
 * External-dependency markers: any dependency whose covenant path
 * resolves outside skillsDir (or doesn't resolve to a known walked
 * skill) is emitted as a node with external: true (JSON) or as a
 * plain edge target in DOT (still listed by name, but not as a top
 * level standalone node).
 *
 * Cycle detection: DFS three-color marking. On cycle, code=1, output
 * is null, error string is set, and cyclePath is populated. The CLI
 * surfaces error to stderr.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

function parseFrontmatter(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing YAML frontmatter: ${filePath}`);
  }
  return yaml.load(match[1]);
}

function walkSkillDirs(skillsDir) {
  const absSkillsDir = path.resolve(skillsDir);
  if (!fs.existsSync(absSkillsDir)) {
    throw new Error(`Skills directory not found: ${skillsDir}`);
  }
  const entries = fs.readdirSync(absSkillsDir, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const covenantPath = path.join(absSkillsDir, entry.name, 'COVENANT.md');
    if (!fs.existsSync(covenantPath)) continue;
    let parsed;
    try {
      parsed = parseFrontmatter(covenantPath);
    } catch (err) {
      throw new Error(`Failed to parse ${covenantPath}: ${err.message}`);
    }
    skills.push({
      dirName: entry.name,
      name: parsed?.name || entry.name,
      version: parsed?.version,
      covenantPath,
      deps: (parsed?.dependencies?.skills || []).map((d) => ({
        name: d?.name,
        version: d?.version,
        covenantRef: d?.covenant
      }))
    });
  }
  // Sort for deterministic walks
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { absSkillsDir, skills };
}

// Build adjacency: name → [{ name, external }]. A dep is internal iff its
// resolved covenant path is inside skillsDir AND the file exists AND a
// walked skill with the matching declared name exists.
function buildGraph(absSkillsDir, skills) {
  const skillByName = new Map(skills.map((s) => [s.name, s]));
  const adjacency = new Map();
  for (const s of skills) {
    const out = [];
    for (const d of s.deps) {
      let external = true;
      if (d.covenantRef) {
        const resolved = path.resolve(path.dirname(s.covenantPath), d.covenantRef);
        const inside =
          resolved === absSkillsDir || resolved.startsWith(absSkillsDir + path.sep);
        if (inside && fs.existsSync(resolved) && skillByName.has(d.name)) {
          external = false;
        }
      }
      out.push({ name: d.name, external });
    }
    adjacency.set(s.name, out);
  }
  return adjacency;
}

// DFS three-color cycle detection. Only follows internal edges (external deps
// can't participate in an in-graph cycle since they aren't walked nodes).
// Returns null if no cycle, else an array describing the cycle path with the
// repeated node at both ends, e.g. ["A", "B", "C", "A"].
function detectCycle(adjacency) {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  const parent = new Map();
  for (const name of adjacency.keys()) color.set(name, WHITE);

  function visit(node) {
    color.set(node, GRAY);
    for (const dep of adjacency.get(node) || []) {
      if (dep.external) continue;
      const next = dep.name;
      if (!color.has(next)) continue;
      if (color.get(next) === GRAY) {
        // Reconstruct cycle: walk parents from `node` back to `next`.
        const cycle = [next];
        let cur = node;
        const safety = adjacency.size + 1;
        let steps = 0;
        while (cur && cur !== next && steps < safety) {
          cycle.unshift(cur);
          cur = parent.get(cur);
          steps++;
        }
        cycle.unshift(next);
        return cycle;
      }
      if (color.get(next) === WHITE) {
        parent.set(next, node);
        const found = visit(next);
        if (found) return found;
      }
    }
    color.set(node, BLACK);
    return null;
  }

  for (const name of adjacency.keys()) {
    if (color.get(name) === WHITE) {
      const cycle = visit(name);
      if (cycle) return cycle;
    }
  }
  return null;
}

function emitDot(skills, adjacency) {
  const lines = ['digraph covenant_skills {'];
  const sortedNames = [...skills.map((s) => s.name)].sort();
  for (const name of sortedNames) {
    const out = adjacency.get(name) || [];
    if (out.length === 0) {
      lines.push(`  "${name}";`);
    } else {
      for (const dep of out) {
        lines.push(`  "${name}" -> "${dep.name}";`);
      }
    }
  }
  lines.push('}');
  return lines.join('\n');
}

function emitJson(skills, adjacency) {
  const sorted = [...skills].sort((a, b) => a.name.localeCompare(b.name));
  return JSON.stringify(
    {
      skills: sorted.map((s) => ({
        name: s.name,
        version: s.version,
        dependencies: (adjacency.get(s.name) || []).map((d) => ({
          name: d.name,
          external: d.external
        }))
      })),
      cycles: []
    },
    null,
    2
  );
}

export async function graphSkills(skillsDir, opts = {}) {
  const format = opts.format || 'dot';
  let absSkillsDir;
  let skills;
  try {
    ({ absSkillsDir, skills } = walkSkillDirs(skillsDir));
  } catch (err) {
    return { code: 1, output: null, error: err.message };
  }

  if (skills.length === 0) {
    const empty = format === 'json' ? '{"skills":[],"cycles":[]}' : 'digraph covenant_skills {\n}';
    return { code: 0, output: empty };
  }

  const adjacency = buildGraph(absSkillsDir, skills);
  const cycle = detectCycle(adjacency);
  if (cycle) {
    return {
      code: 1,
      output: null,
      error: `cycle detected: ${cycle.join(' → ')}`,
      cyclePath: cycle
    };
  }

  const output = format === 'json' ? emitJson(skills, adjacency) : emitDot(skills, adjacency);
  return { code: 0, output };
}
