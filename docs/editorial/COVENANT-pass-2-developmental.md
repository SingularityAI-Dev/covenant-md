# COVENANT.md — Editorial Pass 2: Developmental Summary

**Subject:** `docs/COVENANT.md`
**Pass:** 2 of 3 (developmental — section-level coherence, structural execution of Pass 1 findings)
**Out of scope:** sentence-level rhythm, British English audit, em-dash policy, typos (Pass 3)
**Branch:** `chore/covenant-editorial-pass-1`
**Pass 1 input:** [`docs/editorial/COVENANT-pass-1-structural.md`](./COVENANT-pass-1-structural.md) (untouched in this pass)

---

## Summary

11 of 13 Pass 1 findings executed across 11 atomic commits, each landed and reviewable in isolation. Spec went from 706 lines (single-pass survey before Pass 1) to a slightly larger but better-organised document, with the major shifts being (a) merging two ecosystem-placement sections into one, (b) moving "When to Use It" before the conceptual sections so adoption gating precedes deep reading, (c) collapsing Validation Rules into Specification as a closing "Conformance rules" subsection, (d) deleting the stale in-spec Roadmap, and (e) adding five additive subsections that codify behaviour the framework already supports (Conformance terms, File structure, Minimum viable covenant, runner, Versioning and forward compatibility).

F-08 (quick-reference field index) was deferred per the brief and remains a v1.1 candidate, ideally landing alongside a JSON schema export.

All 56 framework tests pass after the spec changes (verified with `npm test` from `covenant-framework/`). No contract changes; the spec edits are prose and structural moves plus additive subsections that document existing behaviour.

---

## Per-finding execution

### F-01 — Merge "Ecosystem Placement" + "Relationship to the Ecosystem"
**Commit:** `5032079`
**What was done:** Folded the three subsections from "Relationship to the Ecosystem" (LOGIC.md, SKILL.md, CLAUDE.md/AGENTS.md) into "Ecosystem Placement" as H3 subsections, immediately after the ASCII stack diagram. The LOGIC.md YAML example (which was previously buried late in the document) now sits in the ecosystem-orientation section where it does the most explanatory work. The duplicate H2 was deleted.
**Also bundled:** The When-to-Use section move (success-criteria-mandated final order requires it between What It Is and Two-Party Model). Bundling the move with F-01 kept the "big restructure" as a single reviewable commit rather than fragmenting it.
**Developmental editing:** Tightened the bridging paragraph between the diagram and the first subsection to acknowledge that the subsections describe each peer relationship in turn, rather than leaving the H3 jumps unmotivated.

### F-02 — Move "Validation Rules" into Specification as "Conformance rules"
**Commit:** `8dc98c1`
**What was done:** Lifted the entire H2 "Validation Rules" section, downgraded it to an H3 inside Specification, renamed it to "Conformance rules", and placed it immediately after "Versioning and forward compatibility". The lead sentence rewritten to bridge from the format-defining subsections to the conformance checks ("The preceding subsections describe the format. This subsection lists what a conformant validator MUST check.").
**Rule content:** Unchanged except for the F-11 simplification of the depth heuristic entry (which landed in a separate commit). No rules added, removed, or weakened.

### F-03 — Delete in-spec Roadmap; reconcile to root ROADMAP.md
**Commit:** `b97931d`
**What was done:** Deleted the H2 Roadmap section (28 lines listing lint, diff, graph, dependency-cycle detection as future work — all of which shipped in v1.0). Updated root `ROADMAP.md` to add a "Shipped (v1.0)" section enumerating the implemented CLI commands, and added three previously-in-spec future items to "Later" (changelog generation from `covenant diff`, deprecation warning propagation, shared domain-language merging).
**Cross-check:** Confirmed against `CLAUDE.md` that lint, diff, graph, and cycle detection are implemented in `covenant-framework/src/`. Confirmed root ROADMAP.md's existing Next/Later already covered SPEC-01, DOC-01, PUB-01, MCP-01, PORT-01, marketplace, and LOGIC.md runtime.

### F-04 — Conformance terms preamble
**Commit:** `91fc673`
**What was done:** Added an H3 "Conformance terms" subsection at the head of "Specification" defining MUST, SHOULD, MAY in the RFC 2119 sense. Existing prose was deliberately not retrofitted; the preamble defines the registers so Pass 3 (or a later audit) can normalise existing usage without that work polluting Pass 2.
**Carry-through:** Subsequent additive subsections (F-05, F-06, F-07, F-12) use the capitalised normative keywords with their formal meaning; the preamble makes that usage non-arbitrary.

### F-05 — Versioning and forward compatibility
**Commit:** `07be9e6`
**What was done:** Added an H3 subsection at the end of Specification (just before Conformance rules) defining: minor bumps add optional fields; major bumps may break; validators MUST reject unrecognised majors; SHOULD warn on newer minors; MUST ignore unknown fields under known top-level sections (forward compat).
**⚠ Validator divergence flagged:** The current v1.0 validator (`covenant-framework/src/validator.js:124-129`) only **warns** on unrecognised `covenant_version` rather than rejecting. The spec's "MUST reject" is forward-looking and will require a validator update before any v1.1 spec ships. This divergence does not break any current fixture (the validator still accepts "1.0"), but it is a known item to reconcile. **Recommended next step:** add to v1.1 backlog as something like "VALIDATOR-VERSIONING — bring validator covenant_version handling into line with spec §Versioning".

### F-06 — File structure subsection
**Commit:** `0ad5b89`
**What was done:** Added an H3 "File structure" subsection at the head of Specification (between Conformance terms and Root fields) defining the YAML/markdown extraction contract: `---` frontmatter delimiters, freeform body, and the legacy ` ```covenant-fixture ` block format. The legacy form is described as "supported for backward compatibility but no longer recommended", aligning with how `test.js` actually treats it.
**No behavioural change:** Codifies what the validator already does.

### F-07 — `runner` subsection
**Commit:** `4254f4f`
**What was done:** Added an H3 "runner" subsection between `dependencies` and `contracts`, documenting the two strategies (`simulator` default, `process`), the `command` array, and the JSON-over-stdio protocol (`{operation, input}` request, `{success, output, error}` response). Source of truth: `CLAUDE.md`'s skillRunner contract section, which is the canonical description.
**Closes spec/impl drift:** The framework ships this feature; the spec previously did not mention it. Authors can now discover the field through the spec rather than informal channels.

### F-09 — Condense "The Two-Party Model"
**Commit:** `e358df3`
**What was done:** Replaced two parallel bullet lists (5 + 4 obligations) with a single prose paragraph that names the commitments inline. Kept the section's framing (covenant-as-binding-agreement, the two parties identified) and the closing claim ("This mutual obligation is what has been missing"). Net change: 20 lines → 7 lines.
**Developmental editing:** Added a sentence making explicit what the section is *for* — "the fields in the rest of this spec are how those commitments are written down; this section is the framing that explains why those particular fields exist". Previously the section's relationship to the rest of the spec was implicit.

### F-10 — Forward reference inside "What It Is"
**Commit:** `3949a5c`
**What was done:** Added one sentence at the end of "What It Is" pointing to the When-to-Use section. The sentence positioned after the "everything else is optional but purposeful" close so the reader receives the in-format pitch first, then the off-ramp.
**Note on the F-10/section-order tension:** The Pass 1 brief said "Do NOT move the section" while the success criteria final order placed When-to-Use right after What It Is. Resolved by reading "Do NOT move the section" as referring to "What It Is" (don't restructure What It Is itself), with the When-to-Use repositioning landing as part of F-01's restructure commit. The forward-reference link remains valid after the move.

### F-11 — Deduplicate depth-vs-operation-count heuristic
**Commit:** `bd7d576`
**What was done:** Consolidated the heuristic ("a `deep` skill SHOULD have ≤ 3 operations") into a single canonical statement under `domain.depth`. The `interface.surface` description now references it ("see §domain.depth"), and the Conformance rules entry simplified to "validators SHOULD warn when `domain.depth: deep` and `interface.surface` has more than three operations (see §domain.depth)".
**Landed before F-02:** F-11 had to touch the Validation Rules entry; F-02 then moved the whole rules section. Doing F-11 first kept each commit focused.

### F-12 — Expand `interface.entry_point`
**Commit:** `b911957`
**What was done:** Replaced the one-sentence description with three sentences specifying: path is relative to the COVENANT.md directory; SHOULD point to an existing file; validators MAY warn but MUST NOT fail when missing. The "MUST NOT fail" clause preserves the TDD path (covenant before SKILL.md), which the framework already supports.

### F-13 — Minimum viable covenant
**Commit:** `9a27226`
**What was done:** Added an H3 "Minimum viable covenant" subsection between Root fields and `domain`, containing a 28-line skeleton example: `covenant_version`, `name`, one `interface.surface` operation, one `quality.fixtures` entry, plus the minimum `contracts.inputs`/`contracts.outputs` fields needed for that operation. Closes with one sentence directing the reader to the rest of the spec for "what to add — and why".
**Conformance check:** The skeleton was hand-traced against the validator's `validateRequiredFields`, `validateInterfaceSurface`, `validateContractsInputs/Outputs`, and `validateFixtures` — every reference resolves; every required field is present.

---

## Findings deferred (not executed)

### F-08 — Quick-reference / field index
**Status:** Deferred per the brief.
**Why deferred:** The brief noted "Revisit for v1.1 alongside JSON schema export". The reasoning holds: a hand-written field table will drift from the YAML schema; better to land it once with a generator. Recommended placement: end of "Specification", possibly in an appendix, sourced from the same descriptors as a future JSON Schema export.

---

## Carry-over for Pass 3

These items are explicitly Pass 3 work (line-level / sentence rhythm / consistency) and should be addressed in a separate session:

1. **MUST/SHOULD/MAY usage audit.** F-04 added the conformance preamble. Existing prose still uses lowercase "must/should/may" and inconsistent capitalisation; an audit can normalise once the rules are in place. Specifically: "Validators can flag shallow skills…" (domain.depth), "MCP servers this skill requires…" (dependencies.mcp_servers), and the Conformance rules entries (which still use lowercase "must" in body text but capital "MUST" was reserved for the lead sentence).

2. **British English consistency.** The doc mixes "behaviour" / "honour" / "initialisation" (UK) with "behavior" / "favor" (US). Pick one register and align. The bulk of the doc reads UK-leaning; recommend committing to UK and auditing.

3. **Em-dash policy.** Heavy em-dash usage throughout — including in this Pass 2 summary. If the project's voice prefers different punctuation for parenthetical asides, this is the time to swap.

4. **Anchor links.** The forward reference added in F-10 uses a GitHub-style slug (`#when-to-use-it--and-when-not-to`). If the doc is published outside GitHub, the slug rules differ; add a Pass 3 task to verify anchors against the actual rendering target.

5. **Typos and minor grammar.** Not surveyed in Pass 1 or Pass 2.

---

## Validator divergence — single open item

The spec's `Versioning and forward compatibility` subsection (F-05) declares **MUST reject** for unrecognised `covenant_version` major versions. The current v1.0 validator implements **warn** behaviour. This is a deliberate forward-looking gap and is explicitly flagged in the F-05 commit message. It does not break any existing fixture and it does not block this pass; it is a v1.1 backlog item.

---

## Commit list (Pass 2)

| Commit  | Finding | Files                          |
|---------|---------|--------------------------------|
| `91fc673` | F-04 | docs/COVENANT.md               |
| `b97931d` | F-03 | docs/COVENANT.md, ROADMAP.md   |
| `0ad5b89` | F-06 | docs/COVENANT.md               |
| `9a27226` | F-13 | docs/COVENANT.md               |
| `07be9e6` | F-05 | docs/COVENANT.md               |
| `4254f4f` | F-07 | docs/COVENANT.md               |
| `b911957` | F-12 | docs/COVENANT.md               |
| `bd7d576` | F-11 | docs/COVENANT.md               |
| `8dc98c1` | F-02 | docs/COVENANT.md               |
| `e358df3` | F-09 | docs/COVENANT.md               |
| `3949a5c` | F-10 | docs/COVENANT.md               |
| `5032079` | F-01 | docs/COVENANT.md               |

Each commit message follows `docs(spec): F-XX brief description (per Pass 1 review)` per the brief.
