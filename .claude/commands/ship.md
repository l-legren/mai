Commit the current changes and open a pull request, following this repo's conventions in CLAUDE.md.

1. Run `git status`, `git diff`, and `git log` (a few recent commits) to see what's changed and match the existing message style.
2. Check the current branch name against the branch naming convention (`<type>/<TICKET-ID>-<summary>`, base `develop`). If the current branch is unrelated to this work or already has a merged/open PR for a different ticket, create a new branch off `origin/develop` instead of committing onto it.
3. Group the changes into logical, separate commits by concern (don't squash unrelated changes into one commit) — each message in Conventional Commits form: `<type>(<scope>): <summary>`, imperative, lowercase, no trailing period, ticket referenced in the body as `Refs <TICKET-ID>` (not the summary line). Never add a `Co-Authored-By: Claude` trailer.
4. Push the branch with `-u` and open the PR with `gh pr create`, base `develop`, using the Summary/Test plan body format, targeting the linked Linear ticket if one exists.
5. Never use `--no-verify`, never force-push, never skip hooks. If a hook fails, fix the underlying issue and recommit rather than bypassing it.
6. Report the PR URL when done.
