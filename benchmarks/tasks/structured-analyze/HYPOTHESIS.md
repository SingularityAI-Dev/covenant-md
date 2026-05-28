# Pre-registered hypothesis: structured-analyze

Recorded BEFORE running any condition-B trial. The bench runs and the
published results that follow do not get to redefine these predictions
retroactively.

## Setup
- Panel: deepseek-ai/deepseek-v3_1-terminus, moonshotai/kimi-k2-instruct-0905,
  minimaxai/minimax-m2.7, nvidia/nemotron-3-super-120b-a12b,
  nvidia/nemotron-3-nano-30b-a3b.
- Trials: 30 per condition, per model.
- Temperature: 0.7 (high enough to see model variance).
- Scoring: strict output_fidelity (every declared field present, no extras).

## Prediction (output_fidelity)
- Condition A (SKILL.md only): expected range 0.20 to 0.60. Models will
  tend to add extra fields (summary, explanation, notes, severity_score) or
  use field names that approximate the declared ones (severity instead of
  risk_level).
- Condition B (+ COVENANT.md): expected range 0.70 to 0.95.
- **Minimum interesting delta:** B - A >= 0.15 (15 percentage points)
  on output_fidelity, on at least 3 of the 5 models.

## Prediction (interface_adherence)
Less informative on this task because there is only one operation. Expect
near-100% under both conditions. Reported, not load-bearing.

## Prediction (no_undeclared_side_effects)
This task has no side-effect surface (analysis only), so this metric is
expected at 100% under both conditions. Reported for completeness.

## Null
If delta on output_fidelity is < 0.15 on a majority of the panel (3 or more
out of 5), this counts as a null for the structured-output thesis on this
task. Published either way.
