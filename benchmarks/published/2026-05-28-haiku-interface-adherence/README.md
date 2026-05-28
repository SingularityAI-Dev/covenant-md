# 2026-05-28 Haiku, interface-adherence

Second published COVENANT.md bench run, against the cheaper Haiku model on the
same trivial task as the Sonnet run. Same null finding, confirming the task is
the limiting factor and not the model tier.

## Setup

- Task: `tasks/interface-adherence` (single render operation, single boolean
  return).
- Model: `claude-haiku-4-5-20251001` via the Anthropic adapter.
- Trials: 10 per condition.
- Temperature: 0.2.
- Scoring function: same `benchmarks/scoring.mjs` as the Sonnet run.

## Result

| Metric | A (skill only) | B (+covenant) | Delta B - A |
| --- | --- | --- | --- |
| interface_adherence | 100.0% | 100.0% | 0.0% |
| output_fidelity | 100.0% | 100.0% | 0.0% |
| no_undeclared_side_effects | 100.0% | 100.0% | 0.0% |
| parse_failure | 0.0% | 0.0% | 0.0% |

## What this shows

Haiku, at temperature 0.2, also produces a structurally correct response with
or without the COVENANT.md injected. Combined with the Sonnet result, this
says the bottleneck on this dataset is the task, not the model. To get a
meaningful delta, the bench needs at least one of:

- A task with multiple declared outputs where models tend to add extra fields
  (summaries, explanations) the contract does not declare.
- A task with an explicit no-side-effect invariant that prose alone tends to
  violate (the model suggests persisting or sharing the result).
- A task with several operations where the model has to pick the right one
  rather than the only one available.

## Raw

`run.json` contains every per-trial response. Reproduce with:

```bash
cd benchmarks
npm install
npm run bench -- --task tasks/interface-adherence --adapter anthropic --trials 10 --model claude-haiku-4-5-20251001
```

Total Anthropic cost for this run: roughly 0.02 USD.
