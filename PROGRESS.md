# Progress

> Last updated: 2026-05-14

## Current Status

**v1.0 framework shipped; spec under editorial revision.** Three-pass editorial sweep of `docs/COVENANT.md` complete on branch `chore/covenant-editorial-pass-1` (15 commits ahead of `main`, awaiting review/merge). Framework code untouched; all 56 Jest tests still pass.

## Recently Completed

- **COVENANT.md Pass 3 (line)**, 87 em-dashes removed; 17 MUST/SHOULD/MAY normalisations against the new RFC-2119 preamble; British English already consistent; sole internal anchor verified
- **COVENANT.md Pass 2 (developmental)**, 11 of 13 Pass 1 findings executed as atomic commits: in-spec Roadmap deleted and reconciled into root `ROADMAP.md`; `runner:` block documented (closes v1.0 spec/impl drift); new subsections for Conformance terms, File structure, Minimum viable covenant, Versioning and forward compatibility, Conformance rules; Two-Party Model condensed; ecosystem-placement sections merged
- **COVENANT.md Pass 1 (structural)**, 13-finding review committed at `docs/editorial/COVENANT-pass-1-structural.md`

## In Progress

- Editorial branch `chore/covenant-editorial-pass-1` ready for review and merge to `main`

## Up Next

- Merge the editorial branch
- Scope v1.1 via `/gsd:new-milestone`; backlog now includes **VALIDATOR-VERSIONING** (bring `validator.js` `covenant_version` handling into line with the new spec §Versioning, which says MUST reject unrecognised majors; v1.0 currently only warns) alongside SPEC-01, DOC-01, PUB-01, MCP-01, PORT-01

## Blocked

- (None)
