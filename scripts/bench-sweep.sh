#!/usr/bin/env bash
#
# bench-sweep.sh
# Run one COVENANT.md bench task across the NIM MoE / hybrid panel and write
# every result into a single sweep directory plus a summary table.
#
# Usage: bash scripts/bench-sweep.sh [task-dir] [trials] [temperature]
# Defaults: tasks/structured-analyze, 30, 0.7

set -uo pipefail

TASK="${1:-tasks/structured-analyze}"
TRIALS="${2:-30}"
TEMP="${3:-0.7}"

if [ -z "${NVIDIA_API_KEY:-}" ]; then
  echo "ABORT: NVIDIA_API_KEY not set. export NVIDIA_API_KEY=<your-nim-key> first."
  exit 2
fi

cd "$(dirname "$0")/.."
cd benchmarks
[ -d node_modules ] || npm install --silent

MODELS=(
  "deepseek-ai/deepseek-v3_1-terminus"
  "moonshotai/kimi-k2-instruct-0905"
  "minimaxai/minimax-m2.7"
  "nvidia/nemotron-3-super-120b-a12b"
  "nvidia/nemotron-3-nano-30b-a3b"
)

STAMP="$(date +%Y%m%d-%H%M%S)"
SWEEP_DIR="results/sweep-$STAMP"
mkdir -p "$SWEEP_DIR"

echo "Task:        $TASK"
echo "Trials:      $TRIALS per condition"
echo "Temperature: $TEMP"
echo "Models:      ${#MODELS[@]}"
echo "Output:      benchmarks/$SWEEP_DIR/"
echo ""

declare -a STATUS
for m in "${MODELS[@]}"; do
  safe="$(echo "$m" | tr '/' '_')"
  out="$SWEEP_DIR/$safe"
  echo "=== $m ==="
  if node run.mjs --task "$TASK" --adapter nim --trials "$TRIALS" --temperature "$TEMP" --model "$m" --out-dir "$out" > "$out.log" 2>&1; then
    STATUS+=("OK  $m")
  else
    STATUS+=("ERR $m  (see $out.log)")
  fi
  echo ""
done

echo "================================================================"
echo "Sweep summary"
echo "================================================================"
for line in "${STATUS[@]}"; do
  echo "  $line"
done
echo ""
echo "Per-model run.json files are under benchmarks/$SWEEP_DIR/"
echo "Each model's results are at benchmarks/$SWEEP_DIR/<provider>_<slug>/run.json"
