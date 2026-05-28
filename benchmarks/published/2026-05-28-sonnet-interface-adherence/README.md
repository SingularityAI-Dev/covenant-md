# 2026-05-28 Sonnet, interface-adherence

First published COVENANT.md bench run. Honest disclosure: no measurable effect on
this task at this model.

## Setup

- Task: `tasks/interface-adherence` (single render operation, single boolean
  return).
- Model: `claude-sonnet-4-6` via the Anthropic adapter.
- Trials: 10 per condition.
- Temperature: 0.2.
- Scoring function: `benchmarks/scoring.mjs` at commit `<post-p7>` (accepts
  either `output` or `outputs` as the response container; see the patch note in
  that file).

## Result

| Metric | A (skill only) | B (+covenant) | Delta B - A |
| --- | --- | --- | --- |
| interface_adherence | 100.0% | 100.0% | 0.0% |
| output_fidelity | 100.0% | 100.0% | 0.0% |
| no_undeclared_side_effects | 100.0% | 100.0% | 0.0% |
| parse_failure | 0.0% | 0.0% | 0.0% |

## What this shows

Nothing about the contract thesis on harder tasks, and nothing about weaker
models. It shows that for this specific trivial task, Sonnet produces a
structurally correct response with or without the covenant injected into the
prompt, so the strict metrics this scorer computes cannot distinguish the two
conditions.

This is exactly the kind of inconclusive-on-easy-tasks finding logic-md
published on its own bench. The value of the COVENANT.md layer is structural
(validation, auditability, conformance across implementations), not output
quality on a single invocation.

## What would be more informative next

- A task where the model defaults to the wrong output shape without an explicit
  contract (e.g. nested outputs with multiple typed fields, a roundtrip).
- Weaker open-weight models (`claude-haiku-4-5-20251001`, Llama 3.1, GPT-4o
  mini) where instruction following is looser.
- More trials per condition (50 to 100) with bootstrap confidence intervals
  for the delta.

## Raw

Full per-trial responses, scores, and metadata are in `run.json`. Anyone can
reproduce this by checking out the repo at the same commit, exporting
`ANTHROPIC_API_KEY`, and running:

```bash
cd benchmarks
npm install
npm run bench -- --task tasks/interface-adherence --adapter anthropic --trials 10 --model claude-sonnet-4-6
```
