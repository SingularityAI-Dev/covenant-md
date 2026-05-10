# COVENANT.md — Editorial Pass 1: Structural Review

**Subject:** `docs/COVENANT.md` (706 lines, v1.0 shipped 2026-05-06)
**Pass:** 1 of 3 (structural — order, duplication, missing/redundant sections)
**Out of scope:** paragraph rewriting, line edits, typo fixes (Pass 2 + Pass 3)
**Reviewer:** editorial agent, read-only on the spec

---

## Summary

**13 findings.** The spec does its job at the macro level — a reader can finish it understanding what COVENANT.md is and how to write one — but it carries three classes of structural debt:

1. **Material duplication** between two ecosystem-placement sections that bracket the entire Specification.
2. **A stale Roadmap** listing capabilities the framework has already shipped (lint, diff, graph), which contradicts the v1.0 close-out recorded in `CLAUDE.md`.
3. **Spec-vs-implementation drift** — the framework supports a `runner:` block that the spec does not document.

The five findings to act on first, in order:

| # | Finding | Why first |
|---|---------|-----------|
| F-01 | Merge "Ecosystem Placement" + "Relationship to the Ecosystem" | Same content, two locations, bracketing the entire Specification — most visible structural defect. |
| F-03 | Rewrite or relocate the Roadmap | Currently lists shipped capabilities as future work; misleads any reader who trusts the spec as authoritative. |
| F-07 | Document the `runner:` block (or remove it from the framework) | Spec/impl drift on a behavior that affects how every consumer invokes a skill. |
| F-02 | Move "Validation Rules" adjacent to "Specification" | Validation rules are part of the spec proper; their current position after the Worked Example breaks the reading flow. |
| F-05 | Add forward-compatibility rules for `covenant_version` | A versioned spec without evolution rules cannot ship a v1.1 or v2.0 cleanly. |

Findings F-04, F-06, F-08, F-09, F-10, F-11, F-12, F-13 are recommended but lower-leverage; details below.

---

## Findings

### F-01 — Ecosystem placement is described twice

- **Sections:** "Ecosystem Placement" (lines 73–103) and "Relationship to the Ecosystem" (lines 590–630)
- **Observation:** Both sections explain how COVENANT.md relates to LOGIC.md, SKILL.md, and CLAUDE.md / AGENTS.md. The first uses an ASCII stack diagram and a two-line summary per peer; the second has prose subsections with the same conceptual content (and a LOGIC.md YAML example the first lacks). Together they form a 60-line bracket around the Specification, with the Spec itself as the filling.
- **Proposed action:** Merge into one section. Keep the early stack diagram (orientation for first-time readers) and pull the LOGIC.md YAML example forward into the same section. Delete the later "Relationship to the Ecosystem" header. If the LOGIC.md example feels too detailed for an early section, move it to the Worked Example or a new "Integration examples" subsection.
- **Rationale:** The current structure forces a re-read. A single canonical placement of "how this fits the ecosystem" is also where future peers (e.g. a future `RUNNER.md`) will be added.

---

### F-02 — "Validation Rules" is positioned outside the Specification

- **Sections:** "Specification" (105–456), "Validation Rules" (632–655)
- **Observation:** Validation Rules is structurally part of the spec — it tells implementers what their validator MUST enforce. But it sits two sections after the Worked Example, separated from the Specification by ~180 lines of example + ecosystem prose. A reader scanning for "what does a validator check?" has to scroll past the example to find it.
- **Proposed action:** Move "Validation Rules" to immediately after the `quality` subsection, as the closing subsection of "Specification" (renamed e.g. "Specification → Conformance rules"). Worked Example then follows the complete spec, which is the conventional ordering.
- **Rationale:** Reference specs read top-down: define the format, define conformance, then show an example. The current order interleaves them.

---

### F-03 — Roadmap claims shipped work as future

- **Section:** "Roadmap" (676–703)
- **Observation:** The Roadmap lists `covenant lint`, `covenant diff`, and `covenant graph` as future CLI capabilities. Per `CLAUDE.md` and `covenant-framework/src/cli.js`, all three have shipped in the v1.0 framework. The Roadmap also lists "Skill dependency graph" and "Cross-skill cycle detection" as future, but the validator already detects dependency cycles (validator.js) and the `graph` command emits dependency graphs.
- **Proposed action:** One of:
  1. **Rewrite** the Roadmap to mark shipped items as ✓ and list only true future work (Skill Marketplace, runtime LOGIC.md integration, deprecation propagation).
  2. **Relocate** the Roadmap out of the canonical spec entirely — into `ROADMAP.md`, release notes, or the framework's README. The spec should describe the format, not the project's delivery plan.
  - Option 2 is preferred. The canonical spec aging by accident (because shipped work isn't reflected) is a structural hazard.
- **Rationale:** Anything in the spec that drifts from reality erodes trust in the rest of the spec. A reader who notices `lint` is shipped will rationally distrust other claims.

---

### F-04 — No conformance terminology

- **Section:** None (gap)
- **Observation:** The spec uses "must", "should", "may", "expected", and "required" interchangeably and informally. Examples: "Two fields are required" (46), "Validators must enforce" (634), "Validators should warn, not error" (652), "must hold true for every invocation" (337). For a versioned reference spec, this is a gap.
- **Proposed action:** Add a short "Conformance terms" subsection at the start of "Specification" (or as a preamble before Root fields), defining MUST / SHOULD / MAY in the RFC-2119 sense, then audit usage in Pass 2. Even a 4-line preamble materially raises the rigor of the document.
- **Rationale:** Without conformance terms, two validator implementations can disagree on whether the depth heuristic is a hard rule or a warning, and both can claim to be correct. The spec already attempts this distinction inline ("warn, not error") but lacks the vocabulary to formalize it.

---

### F-05 — No forward-compatibility / version-handling rules

- **Section:** None (gap)
- **Observation:** The spec declares `covenant_version: "1.0"` and a `covenant_version` field, but never says what a v1.0 validator does when it encounters `covenant_version: "1.1"` (forward compat), `"2.0"` (major bump), or unknown top-level fields. The Validation Rules section only enforces that the field is present and non-empty.
- **Proposed action:** Add a short "Versioning and forward compatibility" subsection (under "Specification" or "Validation Rules") declaring:
  - Validators MUST reject `covenant_version` they do not recognize.
  - Future minor versions MAY add fields; validators MUST ignore unknown fields under known sections.
  - Major versions MAY remove or change fields; validators MUST reject unsupported majors.
  - Or whatever policy the project actually wants — the point is to declare one before v1.1 ships.
- **Rationale:** The first time a v1.1 covenant is fed to a v1.0 validator, behavior must be defined. Better to define it now than retrofit.

---

### F-06 — The YAML/markdown extraction contract is asserted but not specified

- **Sections:** "What It Is" (30–48), "Specification" (105+)
- **Observation:** The intro states "Both are required. The YAML enforces; the prose explains." But the spec never formally defines:
  - Where the YAML frontmatter begins and ends (presumably `---` delimiters, but never stated).
  - Whether the markdown body is parsed by validators or treated as opaque.
  - Whether the body has required structure (headers, sections) or is freeform.
  - How fenced ` ```covenant-fixture ``` ` blocks (mentioned indirectly via the legacy fixture format in the framework) interact with the modern `quality.fixtures` field.
- **Proposed action:** Add a "File structure" subsection at the head of "Specification" defining the frontmatter delimiters, the body's status (freeform; not validated for structure), and the legacy fixture-block format if the project intends to keep supporting it. The framework currently supports both formats (per `CLAUDE.md` and `test.js`); the spec should either bless or deprecate the legacy form.
- **Rationale:** Two implementations cannot agree on the format if the format is described only by example.

---

### F-07 — `runner:` block exists in implementation but not in spec

- **Section:** None (gap; framework feature undocumented)
- **Observation:** Per `CLAUDE.md`, the framework supports a top-level `runner: { strategy: process, command: [...] }` block that selects between the contract-driven simulator and an external process runner. The spec does not mention `runner` anywhere. This is spec/impl drift on a feature that affects every consumer's understanding of how a skill executes.
- **Proposed action:** One of:
  1. Add a `runner` subsection to "Specification" between `dependencies` and `contracts` (or as a peer to them), documenting `strategy: simulator | process`, the `command` field, and the JSON-over-stdio protocol for the process strategy.
  2. Remove the `runner` block from the framework if it's not intended to be part of the contract.
  - Option 1 is preferred — the feature already exists and is presumably useful.
- **Rationale:** A skill author reading the spec to write a COVENANT.md cannot discover the `runner` field. They will either omit it (defaulting to simulator, possibly silently incorrect for their skill) or hear about it through informal channels — both are signs the spec is incomplete.

---

### F-08 — No quick-reference / field index

- **Section:** None (gap)
- **Observation:** Field definitions are scattered across ~330 lines of the Specification section, intermixed with rationale. An author writing a COVENANT.md cannot quickly look up "is `domain.purpose` required?" or "what are the valid values for `dependencies.packages.ecosystem`?" without grepping or reading 5+ subsections.
- **Proposed action:** Add a flat reference table (or appendix) at the end of "Specification" listing every field as: `path` · `type` · `required?` · `enum/format` · `one-line description`. Could double as the source of truth for a future JSON schema export.
- **Rationale:** Reference specs are read in two modes: linear (first read) and lookup (every subsequent read). The current structure only serves the first.

---

### F-09 — "Two-Party Model" earns its keep but is over-long

- **Section:** "The Two-Party Model" (50–71)
- **Observation:** The section motivates the name "covenant" by listing what The Skill and The Consumer each "covenant to" — five obligations on each side. Conceptually strong, but the obligations are restatements of structural constraints already enforced elsewhere: "Expose only the operations listed in `interface.surface`" is the definition of `interface.surface`, "Provide all `required: true` inputs" is the definition of `required`, etc. The section earns its keep as motivation; it's the bullet lists that are duplicative.
- **Proposed action:** Condense to ~10 lines. Keep the framing ("a covenant, by definition, is a binding agreement…") and the two-party identification. Drop or compress the parallel bullet lists into a single sentence per party.
- **Rationale:** Pass 1 isn't a line edit, but the structural recommendation here is "shorter section". Pass 2 will execute the actual condensation.

---

### F-10 — "When to Use It" is positioned too late

- **Section:** "When to Use It — and When Not To" (657–674)
- **Observation:** This section helps a reader decide whether to adopt the format. It belongs early — ideally right after "What It Is" — so a reader who shouldn't use COVENANT.md can stop reading. Its current position, after the Validation Rules, means committed readers (who don't need this gate) are the ones who reach it.
- **Proposed action:** Move to immediately after "What It Is" (line 48), before "The Two-Party Model". Or, alternatively, leave it at the end but add a one-sentence forward reference in "What It Is" pointing to it.
- **Rationale:** Section ordering implicitly tells the reader who the audience is. Putting adoption guidance at the end signals "this is afterthought"; putting it early signals "we want you to make a real decision before investing further reading".

---

### F-11 — Depth and operation-count heuristics duplicated across sections

- **Sections:** `domain.depth` description (152–153), `interface.surface` description (213), Validation Rules (652)
- **Observation:** The "deep skill ⇒ ≤3 operations" heuristic appears three times. The "3–5 operations max" guidance appears at line 213. These are restatements of the same structural pressure, scattered.
- **Proposed action:** Define the heuristic once in `domain.depth`, reference it from `interface.surface`, and have Validation Rules say only "validators SHOULD warn when `domain.depth: deep` and `interface.surface` has more than 3 operations (see §domain.depth)".
- **Rationale:** Single source of truth. When the heuristic changes, it should change in one place.

---

### F-12 — `interface.entry_point` underspecified

- **Section:** `interface` (lines 203–204)
- **Observation:** `entry_point` is described in one sentence: "the file the agent reads first when loading this skill. Almost always `SKILL.md`." Unanswered: is the path relative to the COVENANT.md? Can it point outside the skill folder? What happens if it's missing? Can it be any markdown file or must it be `SKILL.md`-shaped?
- **Proposed action:** Expand to ~3 sentences in Pass 2 (line work), but flag here as a structural completeness gap. Suggested clarifications: "MUST be a path relative to the directory containing COVENANT.md. SHOULD point to a file that exists. Validators MAY warn when missing."
- **Rationale:** Small but real spec gap; consumers building skill loaders need this defined.

---

### F-13 — No "minimum viable covenant" example or on-ramp

- **Section:** None (gap; "Worked Example" is the only example and is comprehensive)
- **Observation:** The Worked Example (454–588) is a complete `pdf-generation` covenant — ~130 lines of YAML. A first-time author has no smaller starting point. The doc says only `covenant_version` and `name` are required, but never shows a 5-line covenant with just those two fields.
- **Proposed action:** Add a "Minimum viable covenant" example (5–10 lines) immediately before or after "Specification → Root fields". Just `covenant_version`, `name`, one `interface.surface` operation, one `quality.fixtures` entry. Pair it with a one-line note: "this is the smallest valid covenant; everything else is purposeful but optional".
- **Rationale:** Reference specs need both a complete example (for the full picture) and a minimal example (for the on-ramp). The spec currently has only the former.

---

## Findings explicitly NOT raised in this pass

These were considered and deferred to Pass 2 or Pass 3:

- Tone, voice, and pacing within sections.
- Sentence-level clarity in field descriptions.
- Whether "covenant" reads as the right metaphor (this is a Pass 2 / developmental question if it surfaces at all).
- Inconsistent capitalization of `COVENANT.md` vs `Covenant.md` (Pass 3, line edits).
- Typos and grammar.

---

## Suggested execution order if findings are accepted

If the project chooses to act on these, a sensible commit sequence:

1. **F-03** (Roadmap) — biggest credibility risk; cheapest fix.
2. **F-07** (`runner:` doc) — closes spec/impl drift.
3. **F-01 + F-02** (ecosystem merge + Validation Rules relocation) — single restructure pass.
4. **F-05 + F-06** (versioning rules + file structure) — additive subsections.
5. **F-04** (conformance terms) — enables Pass 2 audit of MUST/SHOULD usage.
6. **F-08, F-09, F-10, F-11, F-13** — polish and on-ramp improvements.
7. **F-12** — fold into Pass 2 line work.

Each is independent enough to land as its own commit; F-01+F-02 should land together since they touch overlapping section boundaries.
