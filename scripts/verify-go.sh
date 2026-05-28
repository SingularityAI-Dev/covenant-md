#!/usr/bin/env bash
#
# verify-go.sh
# Pre-launch verification gate. Runs every COVENANT.md quality gate and prints
# a single PASS/FAIL go-live report. Run from the repo root.

set -u
cd "$(dirname "$0")/.."

declare -a NAMES
declare -a STATUSES

run_gate() {
  local name="$1"
  shift
  echo "==> $name"
  if "$@"; then
    NAMES+=("$name")
    STATUSES+=("PASS")
  else
    NAMES+=("$name")
    STATUSES+=("FAIL")
  fi
  echo ""
}

run_gate "jest (npm test)"                    npm test --silent
run_gate "example fixtures (test:fixtures)"   npm run test:fixtures --silent
run_gate "conformance (test:conformance)"     npm run test:conformance --silent
run_gate "mcp smoke (test:mcp)"               npm run test:mcp --silent
run_gate "python parity (pytest)"             bash -c 'cd sdks/python && PYTHONPATH=src pytest -q'
run_gate "bench harness smoke"                bash -c 'cd benchmarks && [ -d node_modules ] || npm install --silent ; npm run smoke --silent'
run_gate "npm pack dry-run (core)"            npm pack --dry-run -w @covenant-md/core
run_gate "npm pack dry-run (cli)"             npm pack --dry-run -w @covenant-md/cli
run_gate "npm pack dry-run (mcp)"             npm pack --dry-run -w @covenant-md/mcp

echo "================================================================"
echo "Pre-launch verification report"
echo "================================================================"
fail=0
for i in "${!NAMES[@]}"; do
  printf "  %-44s %s\n" "${NAMES[$i]}" "${STATUSES[$i]}"
  [ "${STATUSES[$i]}" = "FAIL" ] && fail=$((fail+1))
done
echo "----------------------------------------------------------------"
if [ "$fail" -eq 0 ]; then
  echo "  GO. All gates green."
  exit 0
else
  echo "  NO-GO. $fail gate(s) failed; fix and re-run."
  exit 1
fi
