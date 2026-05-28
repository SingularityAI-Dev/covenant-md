# COVENANT.md benchmarks

A harness for measuring the COVENANT.md thesis: when a skill's interface is
declared in a COVENANT.md, does a model's invocation of that skill stay closer
to the declared boundary than when only the prose `SKILL.md` is provided?

> **Honest status:** the harness is shipped and runs end-to-end against a
> deterministic mock adapter. Real cross-model results (Claude Sonnet, GPT-4o,
> open-weight) are not yet published; running them requires API credits the
> project does not yet have a budget for. The harness publishes raw outputs and
> the scoring function publishes its metric definitions, so anyone can reproduce
> a run.

## What it measures

For each task, the harness runs two conditions:

- **Condition A (control):** prompt the model with only `SKILL.md`.
- **Condition B (treatment):** prompt the model with `SKILL.md` plus the
  rendered `COVENANT.md` (the declared interface, contracts, and invariants).

Across N trials per condition per model, it scores three metrics:

- **Interface adherence:** proportion of model invocations that stay within
  the declared `interface.surface` operations.
- **Output-contract fidelity:** proportion of responses whose returned
  structure matches the operation's declared `returns` (typed, named outputs).
- **Undeclared-side-effect rate:** proportion of responses that imply an
  effect outside what the covenant declares (writes, network calls, state
  mutation not in `dependencies`).

The hypothesis is that B reduces (3) and raises (1) and (2) relative to A. The
prior cross-model finding in logic-md is that effects like this are small or
inconclusive on capable frontier models; we expect to publish a similar honest
read for COVENANT.

## Running

```bash
cd benchmarks
npm install
npm run bench -- --task tasks/interface-adherence
```

By default the run uses the deterministic mock adapter in `llm-adapter.mjs`,
which returns a fixed plausible response (useful for smoke tests and CI). To
run against a real model, pass `--adapter anthropic` (or `openai` once wired)
and set the corresponding API key environment variable.

### Anthropic (wired)

```bash
cd benchmarks
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm run bench -- --task tasks/interface-adherence --adapter anthropic --trials 10
# Override the default model with --model claude-sonnet-4-6 (default) or
# claude-opus-4-6 or claude-haiku-4-5-20251001
```

### OpenAI (stub)

The OpenAI adapter is a stub in this release; wire `openai.complete` in
`llm-adapter.mjs` before running.

Results land in `results/<timestamp>/` as raw per-trial JSON plus a summary
table.

## Reproducibility

- Trials use deterministic seeds where possible. The mock adapter is fully
  deterministic and useful for harness smoke tests in CI.
- Every published run lives under `published/<date>-<label>/` with raw outputs
  and the scoring function version pinned. See `published/INDEX.md`.

## Methodology

See [METHODOLOGY.md](METHODOLOGY.md) for the eval design, scoring functions,
threats to validity, and what we would not claim from a given result.
