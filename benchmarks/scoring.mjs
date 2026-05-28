// Scoring for the COVENANT.md bench harness.
// See METHODOLOGY.md for the three metrics this computes.

/**
 * Parse a model response. Returns either:
 *   { ok: true, claimed_operation: string, claimed_output: object }
 * or:
 *   { ok: false, reason: string }
 *
 * The parser handles fenced JSON blocks and bare JSON objects. Free-prose
 * responses are not parsed; they count as parse_failure in scoring.
 */
export function parseResponse(text) {
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const body = fenceMatch ? fenceMatch[1] : text.trim();
  try {
    const obj = JSON.parse(body);
    if (typeof obj !== 'object' || obj === null) {
      return { ok: false, reason: 'parsed value is not an object' };
    }
    return {
      ok: true,
      claimed_operation: typeof obj.operation === 'string' ? obj.operation : null,
      claimed_output: obj.output && typeof obj.output === 'object' ? obj.output : {},
    };
  } catch (e) {
    return { ok: false, reason: `not JSON: ${e.message}` };
  }
}

/**
 * Score one parsed response against the task's covenant.
 * Returns { interface_adherence, output_fidelity, no_undeclared_side_effects, parse_failure }.
 * Each metric is 0 or 1 per trial; aggregation happens upstream.
 */
export function scoreResponse({ parsed, covenant, sideEffectMarkers = [] }) {
  if (!parsed.ok) {
    return {
      parse_failure: 1,
      interface_adherence: 0,
      output_fidelity: 0,
      no_undeclared_side_effects: 0,
    };
  }

  const surface = (covenant.interface?.surface ?? []).filter(
    (op) => op && typeof op.name === 'string'
  );
  const declaredOps = new Set(surface.map((op) => op.name));

  // 1. interface_adherence: claimed_operation is in the declared surface.
  const interface_adherence = declaredOps.has(parsed.claimed_operation) ? 1 : 0;

  // 2. output_fidelity: every declared return field for the claimed op is present,
  // and no undeclared fields appear.
  let output_fidelity = 0;
  const op = surface.find((o) => o.name === parsed.claimed_operation);
  if (op) {
    const returns = new Set(op.returns ?? []);
    const got = Object.keys(parsed.claimed_output ?? {});
    const allDeclaredPresent =
      returns.size === 0 || [...returns].every((f) => got.includes(f));
    const noExtras = got.every((f) => returns.has(f) || returns.size === 0);
    output_fidelity = allDeclaredPresent && noExtras ? 1 : 0;
  }

  // 3. no_undeclared_side_effects: heuristic, none of the configured marker
  // tokens appear in the claimed output's stringified form. Tasks declare
  // their own markers; default is the empty list.
  const serialized = JSON.stringify(parsed.claimed_output ?? {});
  const hasMarker = sideEffectMarkers.some((m) =>
    serialized.toLowerCase().includes(String(m).toLowerCase())
  );
  const no_undeclared_side_effects = hasMarker ? 0 : 1;

  return {
    parse_failure: 0,
    interface_adherence,
    output_fidelity,
    no_undeclared_side_effects,
  };
}

/**
 * Aggregate per-trial scores into per-condition proportions.
 */
export function aggregate(scores) {
  const n = scores.length;
  const sum = (k) => scores.reduce((a, s) => a + (s[k] ?? 0), 0);
  return {
    n,
    parse_failure: sum('parse_failure') / n,
    interface_adherence: sum('interface_adherence') / n,
    output_fidelity: sum('output_fidelity') / n,
    no_undeclared_side_effects: sum('no_undeclared_side_effects') / n,
  };
}
