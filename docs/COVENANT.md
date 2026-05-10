# COVENANT.md

**The design contract layer for AI agent skills.**

A portable, framework-agnostic file format for declaring *how a skill is designed* (its domain, public interface, dependencies, typed contracts, and proof-of-correctness fixtures) before a single line of implementation is written.

---

## The Problem

Skills today are informal.

A `SKILL.md` tells an agent *how* to use a skill. It describes steps, tools, and instructions. But it makes no binding commitments. It cannot be validated. It does not declare what it depends on. It does not define what a correct output looks like. And it expresses nothing about whether the skill is well-designed or merely functional.

This produces three compounding failure modes that both talks at the conference independently identified:

**1. Skills degrade over time.**
Every time an agent touches a skill's internals without a declared interface boundary, the internal complexity leaks outward. What began as a tidy folder becomes a shallow tangle of interdependent files. The agent has to explore everything to understand anything. This is John Ousterhout's shallow module problem, applied to skills.

**2. Skills cannot be tested.**
Without declared input/output contracts, there is no surface against which to write a fixture. You cannot run a regression. You cannot know whether a change to a skill broke anything downstream. There is no equivalent of a type error, no failing test, no quality gate.

**3. Skills cannot be composed reliably.**
A skill that declares no dependencies will silently fail in an environment that lacks them. A skill that declares no interface cannot be safely called by another skill or a LOGIC.md step. The ecosystem grows but the connections between its parts remain implicit, fragile, and undiscoverable.

`COVENANT.md` fills this gap.

---

## What It Is

COVENANT.md is a markdown file with YAML frontmatter that sits *alongside* `SKILL.md` inside a skill folder, declaring the design contract between the skill and everything that uses it.

```
my-skill/
├── COVENANT.md        ← the design contract (this spec)
├── SKILL.md           ← the procedural instructions (existing)
├── scripts/
│   └── generate.py
└── lang/
    └── domain.md      ← ubiquitous language (optional, can be inline)
```

The YAML contains the machine-parseable contract. The markdown body below the frontmatter contains the human-readable design rationale: the *why* behind the interface decisions. Both are required. The YAML enforces; the prose explains.

Two fields are required: `covenant_version` and `name`. Everything else is optional but purposeful: each section answers one of five questions a well-designed skill must be able to answer.

Not every skill needs a covenant; see [When to Use It and When Not To](#when-to-use-it-and-when-not-to) for the cases where the format helps and the cases where it doesn't.

---

## When to Use It and When Not To

**Use COVENANT.md when:**
- The skill will be depended upon by other skills, LOGIC.md steps, or enterprise workflows.
- The skill is in a shared library and will be used by agents you do not control.
- The skill is complex enough that its interface needs protecting from implementation churn.
- You are practising TDD: write the fixtures before writing SKILL.md.
- The skill has stability: `stable` declared and therefore carries a breaking-change commitment.

**You probably do not need COVENANT.md when:**
- The skill is a personal one-shot automation with a single consumer you control entirely.
- You are prototyping and the interface is not yet stable.
- The skill is a thin wrapper around a single script with no composability requirements.
- The skill is marked `experimental` and its users accept that the interface may change.

The test: *does something outside this skill folder depend on how this skill behaves?* If yes, COVENANT.md.

---

## The Two-Party Model

A covenant, by definition, is a binding agreement between two parties with mutual obligations. In COVENANT.md, those parties are **the skill** and **the consumer**: an agent, a LOGIC.md step, or another skill.

The skill commits to honour what it has declared: deliver the declared outputs given the declared inputs, expose only the operations in `interface.surface`, depend only on what `dependencies` lists, and disclose every observable side effect. The consumer commits to call only declared operations, supply every `required: true` input, and treat anything outside the interface as private. The fields in the rest of this spec are how those commitments are written down; this section is the framing that explains why those particular fields exist.

This mutual obligation is what has been missing. Skills today are informal relationships. COVENANT.md makes them formal.

---

## Ecosystem Placement

```
┌─────────────────────────────────────────────────────────┐
│  CLAUDE.md / AGENTS.md                                  │
│  Identity, project context, behavioural rules           │
├─────────────────────────────────────────────────────────┤
│  LOGIC.md                                               │
│  Step DAGs, reasoning strategy, quality gates,          │
│  multi-agent contracts, fallback policies               │
├──────────────────────────┬──────────────────────────────┤
│  COVENANT.md  ◄── HERE   │  (per skill)                 │
│  Design contract: domain,│                              │
│  interface, dependencies,│                              │
│  typed contracts, TDD    │                              │
│  fixtures                │                              │
├──────────────────────────┴──────────────────────────────┤
│  SKILL.md                                               │
│  Procedural knowledge: instructions, scripts, tools     │
├─────────────────────────────────────────────────────────┤
│  MCP Servers                                            │
│  Connectivity to the outside world                      │
└─────────────────────────────────────────────────────────┘
```

LOGIC.md operates at the *task* level (how a multi-step reasoning pipeline is structured). COVENANT.md operates at the *skill* level (how a single skill is designed). They are complementary, not competing: a LOGIC.md step that invokes a skill can assert against that skill's declared contracts rather than guessing at its behaviour. The subsections below describe each peer relationship in turn.

### COVENANT.md + LOGIC.md

A LOGIC.md step that invokes a skill can declare its contract assertions directly against the skill's COVENANT.md:

```yaml
# In a LOGIC.md step
steps:
  - name: generate_report
    skill: pdf-generation
    covenant: ./skills/pdf-generation/COVENANT.md
    inputs:
      content: "{{ outputs.compiled_content }}"
      output_path: "/reports/{{ run_id }}.pdf"
    contracts:
      outputs:
        render_result:
          page_count: "> 0"
    quality_gates:
      post_output:
        - check: "outputs.render_result.file_path !== null"
          action: retry
```

When a LOGIC.md step references a COVENANT.md, the runtime can validate inputs against the skill's declared contracts before invocation, rather than discovering type mismatches at runtime. This is the LOGIC.md integration that makes the two specs composable.

### COVENANT.md + SKILL.md

SKILL.md remains the procedural document: the instructions the agent reads to understand *how* to operate the skill. COVENANT.md is the design document: the contract the author made with every future consumer.

The relationship is not hierarchical. They are peers with different audiences:
- **SKILL.md** is written for the agent that will *use* the skill.
- **COVENANT.md** is written for the agent (or human) that will *depend on* the skill.

### COVENANT.md + CLAUDE.md / AGENTS.md

CLAUDE.md and AGENTS.md establish identity and project context at the agent level. COVENANT.md establishes design contract at the skill level. There is no overlap. An agent with a CLAUDE.md that says "prefer deep modules" should find that preference reflected in every skill's `domain.depth` declaration.

---

## Specification

### Conformance terms

This document uses normative keywords in the RFC 2119 sense. When **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** appear in capitals, they carry their normative meaning:

- **MUST** / **MUST NOT**: an absolute requirement. Implementations that violate a MUST clause are not conformant.
- **SHOULD** / **SHOULD NOT**: a strong recommendation. Implementations may deviate, but only with a documented reason; conformance tools SHOULD warn rather than fail.
- **MAY**: a permitted option. Conformant implementations may choose either path; consumers MUST NOT depend on which is chosen.

Lowercase forms ("must", "should", "may") carry ordinary English meaning and impose no conformance obligation. The rest of this section uses both registers, so context (and the casing) disambiguates.

### File structure

A COVENANT.md file is a markdown document with a YAML frontmatter block. The frontmatter MUST be enclosed by `---` delimiters at the start of the file:

```
---
covenant_version: "1.0"
name: my-skill
# ... rest of YAML ...
---

<markdown body here>
```

Validators MUST extract the YAML between the leading `---` and the next `---` line and parse it against this specification. Anything before the opening `---` is a conformance error.

The markdown body below the frontmatter is **freeform**. Validators MUST NOT impose required headings, sections, or content on the body. The body is for the human reader: design rationale, worked examples, anything that helps a future maintainer or consumer reason about the skill.

**Legacy fixture blocks.** Earlier drafts of this spec stored fixtures as fenced code blocks tagged ` ```covenant-fixture ` inside the markdown body, with one JSON object per block. Conformant validators SHOULD continue to accept these blocks for backward compatibility, merging them into the fixture set alongside `quality.fixtures`. New skills SHOULD prefer the modern `quality.fixtures` field in the YAML; the legacy form is supported but no longer recommended.

### Root fields

```yaml
covenant_version: "1.0"          # required: spec version this file conforms to
name: docx-generation             # required: machine-readable, kebab-case
version: "1.2.0"                  # semver: follows semantic versioning rules
stability: stable                 # stable | experimental | deprecated
```

**`covenant_version`**: declares which version of the COVENANT.md spec this file is written against. Validators use this to apply the correct schema. Currently `"1.0"`.

**`name`**: the canonical identifier for this skill. Must be kebab-case, globally unique within a skill library. Used by dependency declarations in other COVENANT.md files.

**`version`**: the skill's own version, following semantic versioning. A breaking change (removing an interface operation, changing a contract field type) requires a major version bump. The `interface.breaking_changes` field declares what constitutes a breaking change for this specific skill.

**`stability`**: `stable` skills have a committed interface. `experimental` skills may change without a major version bump. `deprecated` skills are maintained for compatibility but should not be depended upon for new work.

---

### Minimum viable covenant

The smallest valid COVENANT.md declares only the two required fields. Everything below is optional but purposeful. A working skeleton with a single operation and a single fixture looks like this:

```yaml
---
covenant_version: "1.0"
name: hello-world

interface:
  surface:
    - name: greet
      accepts: [recipient]
      returns: [message]

contracts:
  inputs:
    recipient:
      type: string
      required: true
  outputs:
    message:
      type: string

quality:
  fixtures:
    - id: greets-by-name
      operation: greet
      input:
        recipient: "world"
      expect:
        message: "Hello, world"
---
```

This is a complete, validator-conformant covenant. Each subsection below explains what to add (and why) once the skill outgrows the skeleton.

---

### `domain`: Who are you?

```yaml
domain:
  purpose: >
    Create, read, and edit professional-quality .docx files from
    structured content objects, handling all Office XML complexity
    internally.
  depth: deep
  ubiquitous_language:
    inline:
      content_object: >
        A structured data object containing the document's semantic
        content (headings, body text, tables, lists) with no
        formatting opinions. The skill applies formatting.
      output_path: >
        An absolute file system path ending in .docx where the
        generated file will be written.
      validation_result: >
        An object returned by the skill's internal validator,
        containing at minimum a boolean `valid` field and an array
        of `errors` if validation fails.
    file: null  # set to "./lang/domain.md" to use a separate file
```

**`domain.purpose`**: one to three sentences. The only thing this skill exists to do. If you cannot state it in three sentences, the skill is probably doing too much. This is the contract's opening declaration: the skill is committing to this scope and nothing outside it.

**`domain.depth`**: borrowed directly from John Ousterhout's *A Philosophy of Software Design*. Declare `deep` if this skill hides significant complexity behind a minimal interface. Declare `shallow` if the interface closely mirrors the implementation. Validators can flag shallow skills as candidates for refactoring. The declaration itself creates accountability: the author must honestly evaluate their own design.

The depth declaration carries one quantitative heuristic: a `deep` skill SHOULD expose three or fewer operations in `interface.surface`. A `deep` skill with six operations is almost certainly shallow. Validators SHOULD warn when this heuristic is exceeded; they MUST NOT fail, since the heuristic is advisory and edge cases exist.

**`domain.ubiquitous_language`**: a curated glossary of terms specific to this skill's domain, derived from Domain-Driven Design's *ubiquitous language* concept. These terms must appear consistently in the skill's instructions, scripts, variable names, and in every conversation the agent has about this skill. Language divergence is a design smell. Two sub-options:

- `inline`: define terms directly in the YAML. Best for skills with fewer than ten domain terms.
- `file`: path to a separate `domain.md` file. Best for complex domains where the language file is maintained independently and shared across multiple skills.

---

### `interface`: What do you expose?

```yaml
interface:
  entry_point: SKILL.md
  surface:
    - name: create
      description: >
        Generate a new .docx file from a content object and write
        it to the specified output path.
      accepts:
        - content
        - output_path
      returns:
        - file_path
        - validation_result
    - name: read
      description: >
        Parse an existing .docx file and return its content as a
        structured content object.
      accepts:
        - input_path
      returns:
        - content
    - name: edit
      description: >
        Apply a set of structured edits to an existing .docx file
        in place. Returns the updated file path.
      accepts:
        - input_path
        - edits
      returns:
        - file_path
        - validation_result
  breaking_changes:
    - removing an operation from surface
    - renaming an operation in surface
    - changing the type of a contracts.inputs or contracts.outputs field
    - removing a field from contracts.outputs
```

**`interface.entry_point`**: the file the agent reads first when loading this skill. Almost always `SKILL.md`, but declared explicitly so validators and skill loaders know where to start. The value MUST be a path relative to the directory containing COVENANT.md, and SHOULD point to a file that exists at validation time. Validators MAY warn when the referenced file is missing; they MUST NOT fail validation on its absence, since a covenant can legitimately be authored before SKILL.md (the TDD path).

**`interface.surface`**: the *only* public operations this skill exposes. This is the most important section in the entire file. Everything not listed here is implementation: private, subject to change, not callable directly by consumers.

Each operation declares:
- `name`: the verb. Operations should be named with clear action verbs.
- `description`: what the operation does in one to two sentences.
- `accepts`: which contract input fields this operation uses. References field names from `contracts.inputs`.
- `returns`: which contract output fields this operation produces. References field names from `contracts.outputs`.

A skill with a well-designed interface keeps the surface small. Fewer than two operations is a sign the skill may be too narrow to justify its own folder. The upper bound is governed by `domain.depth`: a `deep` skill should stay at three or fewer operations (see §domain.depth); a `shallow` skill has no fixed ceiling but is itself a candidate for refactoring.

**`interface.breaking_changes`**: an explicit declaration of what constitutes a semver-breaking change for this skill. Validators and CI tools use this list to determine whether a change to the skill requires a major version bump. Consumers use it to understand their upgrade risk.

---

### `dependencies`: What do you need?

```yaml
dependencies:
  skills:
    - name: file-system
      version: ">=1.0.0"
      covenant: ./shared/file-system/COVENANT.md
  mcp_servers:
    - name: google-drive
      url: https://drivemcp.googleapis.com/mcp/v1
      required: false
      fallback: local file system only
  packages:
    - name: docx
      version: "^9.0.0"
      ecosystem: npm
    - name: python-docx
      version: ">=1.1.0"
      ecosystem: pip
  environment:
    - name: NODE_VERSION
      constraint: ">=18"
    - name: DOCX_OUTPUT_DIR
      required: false
      description: >
        Override the default output directory. Falls back to the
        path specified in output_path if not set.
```

**`dependencies.skills`**: other skills this skill depends on. Each entry must reference the depended-upon skill's `name` as declared in its own COVENANT.md. The optional `covenant` field provides a path or URL to that skill's COVENANT.md for validation. When present, a validator can resolve the dependency graph and detect cycles before runtime.

**`dependencies.mcp_servers`**: MCP servers this skill requires connectivity to. Mark `required: false` for optional integrations and always provide a `fallback` description: what happens when the server is unavailable. A skill that fails silently when an optional dependency is absent has violated its covenant.

**`dependencies.packages`**: specific versioned packages from a named ecosystem. Validators can check these against the agent's runtime environment before the skill is invoked. `ecosystem` accepts `npm`, `pip`, `gem`, `cargo`, or `go`.

**`dependencies.environment`**: environment variables or runtime constraints. Required variables must be present for the skill to function. Optional variables must declare their fallback behaviour explicitly.

---

### `runner`: How are operations executed?

```yaml
runner:
  strategy: process               # simulator (default) | process
  command: ["python3", "scripts/runner.py"]
```

`runner` declares the execution strategy a fixture runner uses to invoke this skill's surface operations. It is optional; when omitted, the default `simulator` strategy is assumed.

**`runner.strategy: simulator`** (default): the fixture runner uses a contract-aware simulator. It validates inputs against `contracts.inputs`, synthesises outputs from each operation's `returns` list combined with `contracts.outputs[<field>].schema` defaults, and maintains a write/read path-map so roundtrip fixtures work without a real implementation. This is the mode that lets fixtures be written and run before SKILL.md exists: the TDD path.

**`runner.strategy: process`**: the fixture runner spawns an external script declared by `runner.command` and exchanges JSON over stdin and stdout. The protocol is:

1. The runner sends one JSON object per invocation on stdin: `{ "operation": "<name>", "input": { ... } }`.
2. The script writes one JSON object per invocation on stdout: `{ "success": true, "output": { ... } }` on success, or `{ "success": false, "error": "<message>" }` on failure.
3. One request, one response. The script SHOULD exit cleanly when stdin closes.

`runner.command` MUST be an array of strings: the executable followed by its arguments. Relative paths in `command` resolve against the directory containing COVENANT.md.

The two strategies are not mutually exclusive in spirit: a skill MAY ship with `simulator` during early development to drive its fixtures, then switch to `process` once SKILL.md and the implementation exist. Switching strategy is not a breaking change unless `interface.breaking_changes` says it is.

---

### `contracts`: What do you promise?

```yaml
contracts:
  inputs:
    content:
      type: object
      required: true
      description: >
        A structured content object. Must contain at minimum a
        `title` string field. All other fields are optional and
        will be rendered if present.
      schema:
        title:
          type: string
          required: true
        sections:
          type: array
          required: false
    output_path:
      type: string
      required: true
      description: Absolute path ending in .docx for file creation operations.
    input_path:
      type: string
      required: false
      description: Absolute path to an existing .docx for read and edit operations.
    edits:
      type: array
      required: false
      description: >
        Array of structured edit operations. Each edit is an object
        with `target` (section title or paragraph index) and
        `replacement` (new content object).

  outputs:
    file_path:
      type: string
      description: Absolute path to the created or edited .docx file.
    content:
      type: object
      description: >
        Parsed content object extracted from a .docx file. Same
        schema as the `content` input field.
    validation_result:
      type: object
      description: >
        Result of internal validation. Always contains `valid`
        (boolean). Contains `errors` (array of strings) when
        valid is false.
      schema:
        valid:
          type: boolean
          required: true
        errors:
          type: array
          required: false

  side_effects:
    - Writes a file to output_path when operation is `create` or `edit`.
    - Does not modify any file not referenced in the accepted inputs.

  invariants:
    - outputs.validation_result.valid is always a boolean, never null.
    - A failed operation never partially writes to output_path.
    - The content schema returned by `read` is always compatible with the content schema accepted by `create`.
```

**`contracts.inputs`**: every field that can be passed into any surface operation. Each field declares:
- `type`: one of `string`, `number`, `boolean`, `object`, `array`, or a union type `"string | null"`.
- `required`: whether the consumer must always provide this field.
- `description`: what this field means in the domain's ubiquitous language. References to terms defined in `domain.ubiquitous_language` are expected here.
- `schema`: optional nested schema for `object` and `array` types.

**`contracts.outputs`**: every field that any surface operation can return. Same structure as inputs. The union of outputs across all operations is declared here; individual operations declare which subset they return via `interface.surface[n].returns`.

**`contracts.side_effects`**: an explicit list of every observable effect this skill has on the world beyond returning output values. Files written. State mutated. External services called. If the side effect list is long, the skill is probably doing too much. If a side effect is absent from this list, it is a bug in the covenant, not just in the skill.

**`contracts.invariants`**: assertions that must hold true for every invocation of every operation, regardless of input. These are the unconditional promises. A validator can run these as assertions against fixtures. An agent can use them as assumptions when reasoning about the skill's behaviour.

---

### `quality`: How do you prove it?

```yaml
quality:
  fixtures:
    - id: create-minimal
      description: Creates a valid .docx from the minimum required content.
      operation: create
      input:
        content:
          title: "Test Document"
        output_path: "/tmp/covenant-test.docx"
      expect:
        file_path: "/tmp/covenant-test.docx"
        validation_result:
          valid: true
      tags: [happy-path, minimal]

    - id: create-full-content
      description: >
        Creates a .docx with all supported content types and validates
        that no sections are dropped.
      operation: create
      input:
        content:
          title: "Full Content Test"
          sections:
            - heading: "Introduction"
              body: "This is the introduction body."
            - heading: "Conclusion"
              body: "This is the conclusion body."
        output_path: "/tmp/covenant-full.docx"
      expect:
        file_path: "/tmp/covenant-full.docx"
        validation_result:
          valid: true
      tags: [happy-path, full]

    - id: read-roundtrip
      description: >
        Content written by `create` and then read by `read` must
        be structurally identical to the original content object.
      operation: read
      depends_on: create-full-content  # runs after, uses its output
      input:
        input_path: "/tmp/covenant-full.docx"
      expect:
        content:
          title: "Full Content Test"
      tags: [roundtrip, invariant]

    - id: missing-title
      description: Fails gracefully when the required title field is absent.
      operation: create
      input:
        content: {}
        output_path: "/tmp/covenant-fail.docx"
      expect_failure: true
      expect_failure_reason: "content.title is required"
      tags: [edge-case, failure]

    - id: invalid-output-path
      description: >
        Fails gracefully when output_path does not end in .docx,
        without writing any partial file.
      operation: create
      input:
        content:
          title: "Test"
        output_path: "/tmp/covenant-test.pdf"
      expect_failure: true
      tags: [edge-case, failure]

  gates:
    - id: output-always-valid
      description: >
        Every successful create or edit operation must return
        a validation_result with valid: true.
      check: "outputs.validation_result.valid === true"
      action: retry
      max_retries: 2
      on_exhaustion: fail

    - id: no-partial-write
      description: >
        On failure, output_path must not exist or must be unchanged.
      check: "!failure || file_unchanged(inputs.output_path)"
      action: fail
```

**`quality.fixtures`**: the TDD layer. Fixtures are written before implementation. Each fixture is a named, runnable test case that proves a specific aspect of the covenant.

Each fixture declares:
- `id`: unique identifier, kebab-case. Referenced by `depends_on` in other fixtures.
- `description`: what this fixture proves, not just what it does.
- `operation`: which surface operation this fixture exercises.
- `input`: the exact input to pass. Must satisfy the declared contracts.
- `expect`: the expected output. Partial matching: only declared fields are checked.
- `expect_failure`: set `true` for fixtures that prove graceful failure handling. A skill that throws an unhandled exception on bad input has violated its covenant.
- `expect_failure_reason`: a string that should appear in the failure message. Prevents accepting the wrong kind of failure.
- `depends_on`: another fixture's `id`. Fixtures with dependencies run after their dependency and may reference that fixture's outputs.
- `tags`: arbitrary labels for filtering. Recommended tags: `happy-path`, `edge-case`, `failure`, `roundtrip`, `invariant`, `minimal`, `full`.

The minimum viable fixture set for any skill with a `create`-style operation:
1. One happy-path fixture with minimal required inputs.
2. One happy-path fixture with all optional inputs populated.
3. One failure fixture for each required input field being absent.
4. One roundtrip fixture if the skill has both a write and read operation.

**`quality.gates`**: quality assertions that apply across all fixture runs, not just individual inputs and outputs. These enforce the invariants at test-time. A gate with `action: retry` will re-run the operation up to `max_retries` times before proceeding. A gate with `action: fail` fails the entire fixture run immediately. `on_exhaustion` defines what happens when retries are exhausted.

---

### Versioning and forward compatibility

The `covenant_version` field declares which version of this specification a file conforms to. The spec itself is versioned: covenants written today will outlive the version of the validator that first read them, so the rules for handling unknown versions matter as much as the rules for the current one.

**Spec versioning.** This document is `covenant_version: "1.0"`. Future versions follow semantic versioning at the spec level:
- A **minor** bump (`1.0` → `1.1`) MAY add new optional fields under existing sections, or introduce new optional top-level sections. It MUST NOT change the meaning of existing fields or remove anything required.
- A **major** bump (`1.0` → `2.0`) MAY remove fields, change types, or restructure sections. Covenants written against an earlier major version are not guaranteed to validate.

**Validator behaviour.** Conformant validators MUST take one of three actions when reading a `covenant_version`:
1. **Recognised major, recognised or older minor**: validate against the validator's own ruleset. SHOULD warn if the file's minor version is newer than the validator's, since the file may use fields the validator does not know about.
2. **Recognised major, newer minor**: validate against the validator's ruleset; ignore unknown fields under known sections (they are forward-compatible additions). SHOULD warn that the validator is older than the file.
3. **Unrecognised major version, or anything else**: MUST reject the file with a clear error. Validating an unknown major against an old ruleset produces silent false negatives.

**Unknown fields.** Within a recognised major version, validators MUST ignore unknown fields under known top-level sections rather than rejecting them, so a v1.1 covenant remains readable to a v1.0 validator. This is the mechanism that makes forward compatibility possible.

---

### Conformance rules

The preceding subsections describe the format. This subsection lists what a conformant validator MUST check. Any tool that calls itself a COVENANT.md validator MUST enforce every rule below; tools MAY enforce additional checks beyond these.

**Required fields:** `covenant_version` and `name` must be present and non-empty.

**Name format:** `name` must be kebab-case (`[a-z0-9-]+`). No spaces, no underscores, no uppercase.

**Version format:** If `version` is present, it must be valid semver.

**Stability values:** `stability` must be one of `stable`, `experimental`, or `deprecated`.

**Interface surface operations:** Every `accepts` field reference must correspond to a key in `contracts.inputs`. Every `returns` field reference must correspond to a key in `contracts.outputs`. Forward references are not permitted.

**Fixture operations:** Every `fixture.operation` must correspond to a `name` in `interface.surface`.

**Fixture input conformance:** Every `fixture.input` field must be a key declared in `contracts.inputs`. Fixtures may not pass undeclared fields.

**Dependency cycle detection:** When `dependencies.skills` entries include `covenant` paths, validators must resolve the dependency graph and reject circular dependencies.

**Depth declaration:** Validators SHOULD warn when `domain.depth: deep` and `interface.surface` has more than three operations (see §domain.depth). Validators MUST NOT fail on this rule; it is a heuristic.

**Invariant syntax:** `contracts.invariants` entries are natural language. They are not validated for syntax. They are validated for presence: at least one invariant is expected for any skill with `stability: stable`.

---

## Complete Worked Example

The following is a complete, valid COVENANT.md for a hypothetical `pdf-generation` skill. The markdown body below the frontmatter is mandatory: it is where the author explains the design decisions that the YAML cannot express.

```yaml
---
covenant_version: "1.0"
name: pdf-generation
version: "2.0.1"
stability: stable

domain:
  purpose: >
    Generate PDF files from structured content objects using a
    headless renderer, exposing a minimal interface that hides
    all rendering complexity.
  depth: deep
  ubiquitous_language:
    inline:
      content_object: >
        A framework-agnostic representation of a document's
        semantic content. Contains no styling opinions. The skill
        owns styling.
      render_result: >
        The object returned after every render operation, containing
        a file_path string and a page_count integer. Never null.

interface:
  entry_point: SKILL.md
  surface:
    - name: render
      description: >
        Render a content object to a PDF file at the specified path.
      accepts:
        - content
        - output_path
        - options
      returns:
        - render_result
  breaking_changes:
    - removing or renaming the `render` operation
    - removing `file_path` or `page_count` from render_result schema
    - making `content.title` no longer required

dependencies:
  packages:
    - name: puppeteer
      version: "^22.0.0"
      ecosystem: npm
  environment:
    - name: CHROME_PATH
      required: false
      description: Override bundled Chromium. Falls back to bundled binary.

contracts:
  inputs:
    content:
      type: object
      required: true
      description: A content object as defined in domain.ubiquitous_language.
      schema:
        title:
          type: string
          required: true
    output_path:
      type: string
      required: true
      description: Absolute path ending in .pdf.
    options:
      type: object
      required: false
      description: Optional render overrides (page size, margins, orientation).

  outputs:
    render_result:
      type: object
      description: Always returned. Contains file_path and page_count.
      schema:
        file_path:
          type: string
          required: true
        page_count:
          type: number
          required: true

  side_effects:
    - Writes a PDF to output_path.
    - Launches a headless browser process for the duration of the render.

  invariants:
    - render_result is always an object, never null.
    - render_result.page_count is always a positive integer.
    - On failure, no file is written to output_path.

quality:
  fixtures:
    - id: render-minimal
      description: Renders a single-page PDF from minimal content.
      operation: render
      input:
        content:
          title: "Minimal PDF"
        output_path: "/tmp/minimal.pdf"
      expect:
        render_result:
          page_count: 1
      tags: [happy-path, minimal]

    - id: render-missing-title
      description: Fails gracefully when required content.title is absent.
      operation: render
      input:
        content: {}
        output_path: "/tmp/fail.pdf"
      expect_failure: true
      expect_failure_reason: "content.title is required"
      tags: [edge-case, failure]

  gates:
    - id: result-never-null
      check: "outputs.render_result !== null"
      action: fail
---

## Design rationale

### Why a single `render` operation?

Early versions of this skill exposed separate `create`, `preview`, and `export` operations. In practice, every consumer called them in sequence, and splitting the interface created unnecessary coupling between the caller and the skill's internal rendering pipeline. Collapsing to a single `render` operation hides the pipeline entirely.

### Why `content_object` owns no styling?

Styling is a rendering concern, not a content concern. Allowing the caller to pass styling overrides via `content` would couple the caller to the renderer's internal model and make the interface effectively an undeclared dependency on implementation details. Styling overrides belong in `options`.
```

---

*Built alongside [LOGIC.md](https://github.com/SingularityAI-Dev/logic-md) · Durban, South Africa · MIT licensed*
