# Subject Branch Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish clearly named APUSH, APWH, and AP Art History development branches without modifying existing product content.

**Architecture:** Preserve all commit objects and create only the missing APUSH branch reference at the verified APUSH boundary. Document the canonical branch ownership and merge order on the current APWH branch, leaving `main` and both Art History refs untouched.

**Tech Stack:** Git, GitHub branches, Markdown documentation.

---

### Task 1: Document the canonical subject branches

**Files:**
- Create: `BRANCHES.md`

- [ ] Add the four canonical branches, course ownership, branch status, safe merge order, and the rule that new subject work starts from the latest integrated `main`.
- [ ] State that `feature/ap-art-history-u1` is already contained by `feature/ap-art-history-map` and must not be merged separately.
- [ ] Verify `git diff --check` and commit only the documentation.

### Task 2: Restore and publish the APUSH branch reference

**Files:**
- No file changes.

- [ ] Verify commit `448cf70` is an ancestor of the APWH branch and is the reviewed APUSH-only boundary.
- [ ] Create local branch `feature/apush-all-periods-timeline-dock` at exactly `448cf70` without checking it out.
- [ ] Push the branch with upstream tracking.
- [ ] Verify the APUSH remote ref equals `448cf70`, the APWH ref remains `5988410`, and the Art History ref remains `b9b93b1`.

### Task 3: Publish the branch guide

**Files:**
- Modify: none after Task 1.

- [ ] Push the APWH branch documentation commit.
- [ ] Verify `main` still equals `427c0fb` and the worktree is clean.
