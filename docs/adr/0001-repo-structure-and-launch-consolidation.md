# ADR 0001: Repository structure and launch consolidation

- Status: Accepted
- Date: 2026-05-21
- Context: open-source launch readiness for `covenant-md`

## Context

The `covenant-md` working folder currently holds three things that are not in a single
version-controlled tree:

1. The outer `covenant-md` git repository tracks 16 files only: the canonical spec
   (`docs/COVENANT.md`), the editorial pass summaries, planning docs (`PROGRESS.md`,
   `ROADMAP.md`, `CHANGELOG.md`), `CLAUDE.md`, and `test-skill/`.
2. `covenant-framework/` is a **separate, self-contained git repository** with its own
   `.git`, its own `main` branch, and full commit history through the v1.0 build
   (validator, test runner, skill runner, generator, CLI, plus the diff, lint, and graph
   modules). The outer repo treats it as an untracked directory. It is not a submodule.
3. `docs/assets/` (the launch visual and its generator), `docs/marketing/` (LinkedIn
   drafts), `docs/handover-docs/` (internal session handovers), and `.claude/` are all
   untracked in the outer repo.

For a public launch, the framework, the launch visual, and the spec need to ship as one
coherent repository that contributors can clone, star, and build in one step.

## Decision

### 1. One monorepo, with the framework imported with history preserved

`covenant-framework/` is brought under the outer repository's version control as a real
tracked subtree, using `git subtree add` so its commit history is grafted into the
monorepo rather than discarded. After import, `git log -- covenant-framework/` continues
to show the full build history.

The directory keeps the name `covenant-framework/`. A `packages/` layout is deliberately
not introduced: there is one implementation, and a single-package `packages/` tree adds
nesting without benefit. The layout that holds multiple language implementations is
introduced when the second implementation (PORT-01, the Python port) actually lands, as a
separate `git mv` change that preserves history within the unified repo.

### 2. Submodule rejected

Git submodules suit vendoring a dependency you do not control. For a first-party project
expecting external contributors they impose clone-time and CI friction and a recurring
class of stale-pointer pull requests. Not used.

### 3. Two-repo split deferred, not rejected on principle

A spec repo plus separate implementation repos (the CommonMark and JSON Schema pattern) is
correct once a spec has multiple independent implementations. With one implementation and a
solo maintainer at launch, splitting fractures the launch narrative, halves the star
signal, and duplicates README and CI for no present gain. The monorepo is laid out so a
future per-language split via `git filter-repo` stays cheap.

### 4. Sensitive internal docs never enter the tree

`docs/handover-docs/` has never been committed and is gitignored so it never does. It
carries internal strategic context that must not exist in a repository that is about to be
made public, because git history is permanent and recoverable from forks and the reflog.
`docs/marketing/` is treated the same way until a post is actually published. Only
`docs/assets/` is committed, since the binding visual is a public launch asset.

### 5. Editorial branch merged first

`chore/covenant-editorial-pass-1` is a clean fast-forward over `main` (merge-base equals
`main`'s tip; 19 docs-only commits across 8 tracked files). It is merged as a discrete
step before the framework import, so the structural import lands as its own reviewable
commit rather than entangling the editorial history.

## Consequences

- The public repository is a single monorepo: spec, reference implementation, examples, and
  the launch visual, with the framework's history intact.
- The reference implementation stays at `covenant-framework/`; npm publication (PUB-01) maps
  to that directory via `repository.directory` in `package.json`, consistent with how the
  sibling LOGIC.md monorepo references its packages.
- Internal strategic and handover material stays out of public history by construction, with
  no later history rewriting required.
- Untracked build artefacts in the framework (`node_modules/`, `coverage/`, `test-input.json`)
  are not imported (they were never tracked); dependencies are restored with `npm ci` after
  the import.
- A future multi-language layout is a clean follow-up, not a forced rework.

## Execution

Performed by a backed-up migration script run on the maintainer's machine, because the
Cowork sandbox mount blocks file deletion and cannot clear the stale `.git/index.lock` or
complete a commit. Sequence: safety backup, remove stale lock, fast-forward merge the
editorial branch, import the framework with history using core git plumbing
(`git merge -s ours --allow-unrelated-histories` to graft the history, then
`git read-tree --prefix` to lay the tree under `covenant-framework/`; no `git-subtree`
dependency), update `.gitignore`, commit the launch asset, restore dependencies, run the
test and fixture suites.
