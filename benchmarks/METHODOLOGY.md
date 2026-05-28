# Methodology

## Design

For each task `T` and model `M` we run two conditions across `N` independent
trials per condition:

- A (control): prompt = `SKILL.md` only.
- B (treatment): prompt = `SKILL.md` + `COVENANT.md`.

Each trial yields a model response. The response is parsed and scored.

## Scoring

Per response, the scorer computes three boolean signals against the task's
declared covenant:

1. `interface_adherence`: does the response invoke only operations in
   `interface.surface`?
2. `output_fidelity`: does the response's claimed output structure match the
   operation's `returns` (every declared field present, no undeclared fields
   added)?
3. `no_undeclared_side_effects`: does the response avoid implying a side
   effect outside `dependencies` and `interface`?

Aggregated across trials, each metric becomes a proportion in [0, 1].

The headline comparison is the **delta** `metric(B) - metric(A)` per model per
task, with a 95% bootstrap confidence interval over trials.

## Threats to validity

- **Prompt sensitivity.** Phrasing of the SKILL.md and the rendered COVENANT.md
  affects results. The harness ships fixed prompts and pins them per published
  run.
- **Parser fragility.** The scorer needs to extract claimed operations and
  outputs from the model's response. The parser handles structured (JSON-like)
  responses well and free-prose responses heuristically. Free-prose noise is
  reported as `parse_failure` and excluded from the headline metric (but
  reported in the raw output).
- **Selection of tasks.** Two or three tasks are not representative of the
  whole skill ecosystem. Published runs make their task set and rationale
  explicit and invite additions.
- **Model variability.** Same model, same prompt, different runs: vary. N
  trials per condition mitigates this; `temperature` is reported per run.

## What we will not claim

- That COVENANT.md "makes the model smarter".
- That a positive delta on three tasks generalises.
- That the contract thesis is proven by any single run.

The harness exists to make the claim falsifiable and reproducible, not to
manufacture a result.
