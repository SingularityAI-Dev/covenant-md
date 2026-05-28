#!/usr/bin/env node
// COVENANT.md bench harness.
//
// Usage:
//   node run.mjs --task tasks/<name> [--adapter mock|openai|anthropic] [--trials 10] [--temperature 0.2]
//
// Outputs results under ./results/<timestamp>/run.json plus a summary table.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

import { selectAdapter } from './llm-adapter.mjs';
import { parseResponse, scoreResponse, aggregate } from './scoring.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { adapter: 'mock', trials: 10, temperature: 0.2, model: undefined, outDir: undefined };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--task') args.task = argv[++i];
    else if (a === '--adapter') args.adapter = argv[++i];
    else if (a === '--trials') args.trials = parseInt(argv[++i], 10);
    else if (a === '--temperature') args.temperature = parseFloat(argv[++i]);
    else if (a === '--model') args.model = argv[++i];
    else if (a === '--out-dir') args.outDir = argv[++i];
  }
  if (!args.task) {
    console.error('Usage: node run.mjs --task tasks/<name> [--adapter mock|openai|anthropic]');
    process.exit(2);
  }
  return args;
}

async function loadTask(taskDir) {
  const taskAbs = resolve(__dirname, taskDir);
  const meta = JSON.parse(await readFile(join(taskAbs, 'task.json'), 'utf8'));
  const skill = await readFile(join(taskAbs, 'SKILL.md'), 'utf8');
  const covenantRaw = await readFile(join(taskAbs, 'COVENANT.md'), 'utf8');
  const fm = covenantRaw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) throw new Error('task COVENANT.md missing YAML frontmatter');
  const covenant = yaml.load(fm[1]);
  const userPromptBase = await readFile(join(taskAbs, 'prompt.md'), 'utf8');
  return { taskAbs, meta, skill, covenant, covenantRaw, userPromptBase };
}

function buildPrompt({ skill, covenantRaw, userPromptBase, condition }) {
  if (condition === 'A') {
    return `${skill}\n\n---\n\n${userPromptBase}`;
  }
  // Condition B: include the COVENANT.md alongside the SKILL.md.
  return `${skill}\n\n---\n\n${covenantRaw}\n\n---\n\n${userPromptBase}`;
}

async function runCondition({ adapter, system, condition, task, trials, temperature, model }) {
  const scores = [];
  const trials_raw = [];
  for (let i = 0; i < trials; i++) {
    const user = buildPrompt({
      skill: task.skill,
      covenantRaw: task.covenantRaw,
      userPromptBase: task.userPromptBase,
      condition,
    });
    const { text } = await adapter.complete({ system, user, temperature, model });
    const parsed = parseResponse(text);
    const s = scoreResponse({
      parsed,
      covenant: task.covenant,
      sideEffectMarkers: task.meta.side_effect_markers ?? [],
    });
    scores.push(s);
    trials_raw.push({ trial: i, response: text, parsed, scores: s });
  }
  return { aggregate: aggregate(scores), trials_raw };
}

function fmtMetric(x) {
  return (x * 100).toFixed(1) + '%';
}

function printSummary({ args, task, A, B }) {
  console.log('');
  console.log(`Task:    ${task.meta.id}`);
  console.log(`Adapter: ${args.adapter}`);
  console.log(`Trials:  ${args.trials} per condition (temperature ${args.temperature})`);
  console.log('');
  const rows = [
    ['Metric', 'A (skill only)', 'B (+covenant)', 'Delta B - A'],
    [
      'interface_adherence',
      fmtMetric(A.interface_adherence),
      fmtMetric(B.interface_adherence),
      fmtMetric(B.interface_adherence - A.interface_adherence),
    ],
    [
      'output_fidelity',
      fmtMetric(A.output_fidelity),
      fmtMetric(B.output_fidelity),
      fmtMetric(B.output_fidelity - A.output_fidelity),
    ],
    [
      'no_undeclared_side_effects',
      fmtMetric(A.no_undeclared_side_effects),
      fmtMetric(B.no_undeclared_side_effects),
      fmtMetric(B.no_undeclared_side_effects - A.no_undeclared_side_effects),
    ],
    [
      'parse_failure',
      fmtMetric(A.parse_failure),
      fmtMetric(B.parse_failure),
      fmtMetric(B.parse_failure - A.parse_failure),
    ],
  ];
  const widths = rows[0].map((_, c) => Math.max(...rows.map((r) => String(r[c]).length)));
  for (const r of rows) {
    console.log(r.map((cell, c) => String(cell).padEnd(widths[c] + 2)).join(' '));
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const task = await loadTask(args.task);
  const adapter = selectAdapter(args.adapter);

  const system =
    'You are an agent invoking a single declared skill operation. Respond with a JSON object describing the operation you invoked and the output you produced, fenced as ```json.';

  const A = await runCondition({
    adapter,
    system,
    condition: 'A',
    task,
    trials: args.trials,
    temperature: args.temperature,
    model: args.model,
  });
  const B = await runCondition({
    adapter,
    system,
    condition: 'B',
    task,
    trials: args.trials,
    temperature: args.temperature,
    model: args.model,
  });

  printSummary({ args, task, A: A.aggregate, B: B.aggregate });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = args.outDir
    ? resolve(args.outDir)
    : resolve(__dirname, 'results', ts);
  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, 'run.json'),
    JSON.stringify(
      {
        meta: {
          task: task.meta.id,
          adapter: adapter.name,
          model: args.model || null,
          trials: args.trials,
          temperature: args.temperature,
          timestamp: new Date().toISOString(),
        },
        A: A.aggregate,
        B: B.aggregate,
        delta: {
          interface_adherence: B.aggregate.interface_adherence - A.aggregate.interface_adherence,
          output_fidelity: B.aggregate.output_fidelity - A.aggregate.output_fidelity,
          no_undeclared_side_effects:
            B.aggregate.no_undeclared_side_effects - A.aggregate.no_undeclared_side_effects,
        },
        trials_A: A.trials_raw,
        trials_B: B.trials_raw,
      },
      null,
      2
    )
  );
  console.log('');
  console.log(`Raw results: ${outDir}/run.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
