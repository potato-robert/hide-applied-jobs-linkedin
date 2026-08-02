---
name: commit
description: >-
  Create git commits using Conventional Commits, splitting unrelated changes into
  separate commits. Use when the user asks to commit, save work to git, create
  commits, or mentions conventional commits.
---

# Commit (Conventional Commits)

Create focused, conventional commits. Split unrelated changes across multiple commits.

## Prerequisites

1. **Only commit when the user explicitly asks.** If unclear, ask first.
2. **Run `npm test` before the first commit** and after any fix-up. Do not commit on failure.
3. Follow git safety rules: never update git config, never skip hooks, never force-push main, never amend pushed commits unless the user explicitly requests it.

## Workflow

### 1. Inspect changes (run in parallel)

```bash
git status
git diff
git diff --staged
git log -5 --oneline
```

### 2. Group changes into logical commits

Split when changes span **different types or concerns**. Keep together when they are one atomic unit.

| Split into separate commits | Keep in one commit |
|----------------------------|-------------------|
| Feature + CI config | Feature + its unit tests |
| Refactor + unrelated bug fix | Manifest fix + build output it requires |
| Dependency bump + app logic | Lib extraction + tests for that lib |
| Docs + code behavior change | Options UI + matching logic it depends on |

**Suggested commit order** (dependencies first):

1. `refactor` / `chore` — shared plumbing, extractions, config scaffolding
2. `feat` / `fix` — behavior changes
3. `test` — tests that stand alone (only if not already paired with the feature)
4. `ci` / `build` — workflows, tooling
5. `docs` — readme and comments only

Each commit should leave the repo in a sensible state. Prefer pairs like `feat` + `test` over orphan features.

### 3. Stage and commit one group at a time

For each group:

```bash
git add <paths-for-this-group-only>
git commit -m "<type>(<scope>): <subject>" -m "<body>"
```

On Windows PowerShell, use `-m` twice or pipe a here-string:

```powershell
git commit -m "feat(matching): add keyword highlight mode" -m "Support highlight color from options page."
```

### 4. Verify

```bash
git status
git log -3 --oneline
```

Report commit SHAs and summaries to the user.

## Conventional Commits format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New user-facing behavior |
| `fix` | Bug fix |
| `docs` | README, comments, privacy policy |
| `test` | Tests only (no production change) |
| `refactor` | Code change with no behavior change |
| `ci` | GitHub Actions, hooks, Dependabot |
| `build` | Parcel, bundler, npm scripts |
| `chore` | Misc maintenance (deps, `.nvmrc`) |
| `perf` | Performance improvement |

### Scope (this project)

Use short, lowercase scopes: `matching`, `options`, `badge`, `manifest`, `ci`, `deps`, `extension`.

Omit scope when it does not help: `docs: add development section to readme`.

### Subject rules

- Imperative mood: "add", "fix", "remove" — not "added" or "adds"
- No trailing period
- ≤ 72 characters
- Describe **why** in the body when the subject alone is insufficient

### Breaking changes

Add `!` after type/scope and a `BREAKING CHANGE:` footer:

```
feat(options)!: rename storage keys

BREAKING CHANGE: existing settings are reset; users must reconfigure.
```

## Examples (this repo)

**Single commit** — feature with tests:

```
test(matching): add unit tests for job card detection

Cover legacy BEM, job-card-ref, and UUID LinkedIn layouts.
```

**Multiple commits** — CI infrastructure batch:

```
1. refactor(matching): extract job-matching logic to source/lib
2. test(matching): add vitest suite for matching engine
3. ci: add consolidated test workflow and dependabot
4. build: add husky pre-commit hook running npm test
5. docs: document development workflow in readme
```

**Do not** combine into one commit:

```
ci: add tests, refactor content.js, and update readme   ❌
```

## Checklist

- [ ] User explicitly requested a commit
- [ ] `npm test` passes
- [ ] Changes grouped logically; unrelated work split
- [ ] Each message follows Conventional Commits
- [ ] No secrets staged (`.env`, credentials)
- [ ] `git status` clean (or only intentional unstaged files reported)

## References

- Pre-commit test gate: [.cursor/rules/testing.mdc](../../rules/testing.mdc)
- Conventional Commits: https://www.conventionalcommits.org/
