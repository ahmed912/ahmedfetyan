# How to
## New chat start
- Read CLAUDE.md, then hub/INDEX.md, then only the hub file for the topic.
- Open app/HANDOFF.md bottom section only if you need the latest publish state.
- Check app/EDIT_QUEUE.md before accepting any new edit.
## Save this
- Add a dated line to the right hub file. Decisions go in hub/decisions.md with the reason.
- New edit requests go in app/EDIT_QUEUE.md, not straight to code.
- Never write secrets or keys into the repo.
## Wrap up
- Write a short dated entry at the bottom of app/HANDOFF.md: what was published, version, rollback line, data touched or not.
- Run tests, publish if they pass, verify md5, lock the upload function, delete the secret.
- Commit and push to branch claude/cloud-environment-setup-llsle2.
- Suggest /compact at about 50 percent context and at each milestone.
