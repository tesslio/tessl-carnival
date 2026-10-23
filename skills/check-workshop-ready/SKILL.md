---
name: check-workshop-ready
description: Check that a laptop and fork are ready for the Tessl Carnival workshop (git, Node, the GitHub CLI, the Tessl CLI and credits, and a fork with Issues, Actions, Pages and the interaction lock on), then report a short pass or fix list. Only checks, and changes nothing without asking. Use when someone asks to check they're ready for the workshop, or before they start the core path in WORKSHOP.md.
---

# Check I'm ready for the workshop

This skill only checks. Don't install anything, change any setting or log in
for the person. At the end, offer to fix what you can, and wait for a yes.

Run every check, even after one fails, unless it needs an earlier one: the fork
checks need `gh`, and the Pages link needs Pages on.

## 1. The laptop

1. **git:** `git --version`. Pass if it prints a version.
   Fix: install git from https://git-scm.com.
2. **Node:** `node --version`. Read `engines.node` in `package.json` and check
   the version matches it. When this skill was written it was
   `^22.13.0 || >=24`: Node 22.13 or later, skipping Node 23. Fix: install
   Node 24 (`nvm install` reads `.nvmrc`), or use GitHub Codespaces.
3. **GitHub CLI:** `gh auth status`. Pass if it's logged in to github.com.
   Fix: install it from https://cli.github.com, then run `gh auth login`.
4. **Tessl CLI:** `tessl whoami`. Pass if it shows a logged-in user.
   Fix: install it from https://tessl.io, then run `tessl cli update` and
   `tessl login`.
5. **Credits:** `tessl org usage`. Pass if it shows credits left, and give the
   balance. Fix: at the workshop, raise your hand, and a facilitator can top
   you up.

## 2. The fork

1. **Your own fork:** find the repository from `git remote get-url origin`, and
   call it `OWNER/REPO`. Then run
   `gh repo view OWNER/REPO --json isFork,parent,viewerPermission,hasIssuesEnabled`.
   Pass if `isFork` is true, `parent` is `tesslio/tessl-carnival` and
   `viewerPermission` is `ADMIN`. If `OWNER/REPO` is `tesslio/tessl-carnival`
   itself, the fix is to fork it on GitHub and clone the fork, or to run
   `gh repo fork --remote` here. Skip the rest of this section until it passes.
2. **Issues:** pass if `hasIssuesEnabled` is true.
3. **Actions:** `gh api repos/OWNER/REPO/actions/permissions --jq .enabled`, and
   `gh api repos/OWNER/REPO/actions/workflows --jq '.workflows[] | [.name, .state] | @tsv'`.
   Pass if Actions is enabled and every workflow is `active`.
4. **Pages:** `gh api repos/OWNER/REPO/pages --jq '[.build_type, .html_url] | @tsv'`.
   Pass if `build_type` is `workflow`. A 404 means Pages is off.
5. **Interaction lock:** `gh api repos/OWNER/REPO/interaction-limits`. Pass if
   `limit` is `collaborators_only`, and give the `expires_at` date. An empty
   response means there's no lock.
6. **Pages link:** `curl -sS -o /dev/null -w '%{http_code}' <html_url>`. Pass
   on 200. A 404 straight after setup can mean the first deploy is still
   running: check with `gh run list --workflow pages.yml --repo OWNER/REPO --limit 1`.

The fix for items 2 to 6 is the same: ask your agent to **Set up my fork**.

## 3. Report

Give one line per item: its name, pass or fix, and for a fix, the exact command
or prompt that fixes it. For example:

```txt
git           pass
Node          fix   v18.19.0 is too old: run nvm install, or use Codespaces
GitHub CLI    pass
Tessl CLI     fix   not logged in: run tessl login
Credits       pass  940 left
Your fork     pass  ada/tessl-carnival
Issues        fix   off: ask your agent to Set up my fork
Lock          pass  until 2027-04-22
```

Then:

- If any fork item needs a fix, offer to run **Set up my fork** now, and only
  run it if the person says yes.
- If everything passes, say they're ready, and that the next step is to paste
  **Read WORKSHOP.md and take me through the core path, one step at a time**.
