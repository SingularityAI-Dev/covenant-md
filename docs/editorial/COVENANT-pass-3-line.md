# COVENANT.md — Editorial Pass 3: Line Edit Summary

**Subject:** `docs/COVENANT.md`
**Pass:** 3 of 3 (line / copy editing — sentence-level work, no structural changes)
**Branch:** `chore/covenant-editorial-pass-1`
**Pass 1 input:** [`docs/editorial/COVENANT-pass-1-structural.md`](./COVENANT-pass-1-structural.md) (untouched)
**Pass 2 input:** [`docs/editorial/COVENANT-pass-2-developmental.md`](./COVENANT-pass-2-developmental.md) (untouched)

---

## Summary

Two commits landed (em-dash sweep + MUST/SHOULD/MAY audit). Three of the five categories called out in the brief turned out to be no-ops, documented below.

Counts:
- **87 em-dashes removed** (single commit)
- **17 MUST/SHOULD/MAY normalisations** (single commit)
- **0 British English corrections** (doc was already consistent UK)
- **0 broken anchors** (the only internal anchor was repaired as part of the em-dash sweep, in the same commit, so no separate commit was needed)
- **0 typos** (none found)
- **1 item flagged for author decision** (semantic gap, not a typo)

All 56 framework tests still pass. No structural changes; no contract changes; no validator changes.

---

## Per-category execution

### Em-dash sweep — 87 removed (commit `090cce4`)

Project convention is zero em-dashes. The doc had 87, distributed across these patterns:

| Pattern | Count (approx) | Replacement |
|---------|---------------:|-------------|
| Bold field lead-ins (`**\`field\`** —`) | ~30 | colon (`:`) |
| Spec subsection headings (`### \`field\` — Question?`) | 6 | colon |
| H2 heading (`When to Use It — and When Not To`) | 1 | dropped (`When to Use It and When Not To`); anchor link on line 48 updated in the same commit |
| List item field definitions (`- \`field\` — desc`) | ~17 | colon |
| YAML inline comments (`# required —`) | 3 | colon |
| Apposition pairs (`X — phrase — Y`) | 5 pairs | parentheses |
| Single mid-sentence em-dashes | ~20 | colon, semicolon, comma, or period as the sense required |
| Body of YAML example string (line 250) | 1 pair | parentheses |

Mechanical patterns (the first four rows) were applied via regex; remaining em-dashes were handled with explicit per-instance replacements.

Verification: `grep -c "—" docs/COVENANT.md` returns 0.

### MUST/SHOULD/MAY audit — 17 normalisations (commit `65e505c`)

The brief's flagged ambiguities ("expected", "validators should", sentence-start "Must"/"Required") were normalised against the F-04 conformance preamble. Changes were limited to clear normative claims; descriptive prose using ordinary "must"/"should"/"may" was left as-is per the preamble's lowercase-is-ordinary-English rule.

Single largest contributor: the **Conformance rules** section (10 changes). Lead sentence already says "Any tool that calls itself a COVENANT.md validator MUST enforce every rule below"; the body's lowercase "must" / "may not" claims were promoted to MUST / MUST NOT to match. Includes "Forward references are not permitted" → "Forward references MUST NOT appear" and "Fixtures may not pass undeclared fields" → "Fixtures MUST NOT pass undeclared fields".

Field-level normalisations (7 changes):
- `name`: sentence-start "Must be kebab-case" rephrased to mid-sentence "It MUST be kebab-case and globally unique…" so the normative keyword reads in standard RFC-2119 position.
- `stability`: "should not be depended upon" → "SHOULD NOT be depended upon"
- `interface.surface` operation naming: "Operations should be named" → "Operations SHOULD be named"
- depth heuristic upper bound (within `interface.surface` description): "should stay at three or fewer" → "SHOULD stay at three or fewer"
- `dependencies.skills`: "Each entry must reference" → "MUST reference"
- `dependencies.packages`: "Validators can check these" → "Validators MAY check these" (RFC 2119 form of "can")
- `contracts.inputs.description` field guidance: "are expected here" → "SHOULD appear here" (one of the brief's flagged ambiguities; "expected" is not RFC 2119)
- `quality.fixtures.input`: sentence-start "Must satisfy" rephrased to "It MUST satisfy"
- `quality.fixtures` invariants line: "is expected" → "SHOULD appear"

Left as ordinary English (descriptive, not validator-enforced; preamble explicitly permits lowercase here):
- "the author must honestly evaluate their own design" — meta-advice about authoring discipline
- "These terms must appear consistently in the skill's instructions, scripts, variable names…" — meta-advice about ubiquitous-language hygiene; no validator checks this
- "whether the consumer must always provide this field" — defining the meaning of `required`, not asserting a rule
- "assertions that must hold true" — defining what an invariant *is*
- "should find that preference reflected" (Ecosystem Placement) — rhetorical
- "may change" / "users accept that the interface may change" (deprecated and experimental skills) — descriptive prediction

**No flag-for-author-decision items** in this category. Every change either codified an already-enforced rule or made an existing recommendation explicit; none of them invented a new conformance claim or removed one.

### British English consistency — no changes

The doc was already consistent UK English: `behaviour`, `behavioural`, `honour`, `recognised`, `practising`, `synthesises`, `formalise`, `initialised`, `optimise` and so on. Greps for the common US-form targets (`behavior`, `organization`, `center`, `recognize`, `optimize`, `analyze`, `defense`, `color`, `favor`, `fulfill`, `labeled`) returned no matches. The only false positive was "MIT licensed" in the footer — `licensed` is the verb form and is identical in both registers; only the noun `licence` (UK) / `license` (US) differs.

No commit needed. Verification recorded here.

### Anchor link verification — no changes

The doc has exactly one internal anchor link (line 48: `[When to Use It and When Not To](#when-to-use-it-and-when-not-to)`), pointing at the H2 heading on line 52. After the em-dash sweep removed the em-dash from the heading, the heading is `## When to Use It and When Not To`, which slugs to `when-to-use-it-and-when-not-to` under GitHub-flavoured Markdown — exactly the anchor used. The link resolves.

Both the heading and the anchor link were updated in the **same commit** as the em-dash sweep so no broken-link state existed between commits. That intentional bundling is why no separate "anchor repair" commit appears in the log.

No other internal links exist in the doc. External links (the LOGIC.md GitHub URL in the footer) were not part of Pass 3 scope.

### Typo / grammatical sweep — no changes

Pattern checks performed:
- Common typos (`teh`, `recieve`, `seperate`, `accomodate`, `alot`, `acheive`, `concious`, `thier`, `occurence`, `untill`, etc.) — no matches.
- Repeated words (`the the`, `is is`, `to to`, etc.) — no matches.
- Trailing whitespace — none.
- Curly quotes (`’`, `”`) — none; doc uses straight quotes throughout.
- Double-space outside code blocks — none.
- Punctuation: no run-on `..` or `....` outside YAML examples.

The doc reads cleanly at the sentence level.

---

## Flagged for author decision (1 item)

**Line 15:** *"This produces three compounding failure modes that both talks at the conference independently identified:"*

The reference to "both talks at the conference" is opaque without prior context. The conference is not named, and no prior paragraph identifies which two talks the author is referring to. This is most likely a leftover from an earlier draft that named the talks.

This is a semantic gap, not a typo or grammatical error, so per the brief's principle ("If wording … genuinely changes meaning, flag it … Do not guess at semantic intent") it was not edited. Three reasonable resolutions for the author:

1. Name the conference and talks (e.g., *"…that two talks at <conference> independently identified — <talk A> and <talk B>"*).
2. Drop the conference reference entirely (e.g., *"This produces three compounding failure modes that the COVENANT.md design responds to:"*).
3. Move the reference to the footer / acknowledgements as a separate sentence ("COVENANT.md was prompted by two talks at <conference>, by <speaker A> and <speaker B>…").

Each preserves the failure-modes list while resolving the dangling reference differently. Recommended path: option 2 if the talks are not specifically being credited; option 1 if they should be.

---

## Carry-over for any future Pass

Nothing carried over. Pass 3 is complete given the brief's scope.

If a quick-reference field index is added in v1.1 (Pass 1 finding F-08, deferred), the table itself will benefit from the same MUST/SHOULD/MAY discipline established here. No other line-level work is outstanding.

---

## Commit list (Pass 3)

| Commit  | Category | Files |
|---------|----------|-------|
| `090cce4` | em-dash sweep | docs/COVENANT.md |
| `65e505c` | MUST/SHOULD/MAY audit | docs/COVENANT.md |

Pass 1 review (`docs/editorial/COVENANT-pass-1-structural.md`) and Pass 2 summary (`docs/editorial/COVENANT-pass-2-developmental.md`) are unchanged.

The branch `chore/covenant-editorial-pass-1` now contains, end to end:
- 1 Pass 1 review commit
- 11 Pass 2 finding commits + 1 Pass 2 summary
- 2 Pass 3 sweep commits + this Pass 3 summary

Total: 16 commits ahead of `main`, all on the same branch. All 56 framework tests pass. No validator/framework code touched.
