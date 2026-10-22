---
name: set-up-your-fork
description: Turn on the GitHub features a fork of the carnival needs (Issues, Actions and GitHub Pages) using the GitHub CLI, lock the fork down so only its owner can open issues, comment and open pull requests, then deploy the carnival and share its link. Use when someone asks to set up their fork, turn on issues or Pages, lock down their fork, get a shareable link to their carnival, or when the Issues tab, CI checks or the Pages deploy are missing on a fork.
---

# Set up your fork

GitHub switches a few features off when someone forks a repository. The
workshop needs three of them. You turn them on with the person's own GitHub
login, so they need to own the fork.

- **Issues**, so they can file the starter issues and label them.
- **Actions**, so CI runs on pull requests and the carnival deploys.
- **GitHub Pages**, so they can play and share their carnival online. Their
  Pages link is the main way to play during the workshop.

The fork is public, so you also lock it down: only the person and their
collaborators can open issues, comment and open pull requests.

Tell the person what you're about to change before you change it.

This skill is safe to rerun. Every step sets a feature to a state, rather than
adding something new, so running it again only renews the lock and redeploys
the carnival.

## 1. Check you can do it

1. Run `gh auth status`. If `gh` isn't installed or isn't logged in, stop and
   give the person the manual steps at the end of this skill. Don't log in for
   them: `gh auth login` is interactive.
2. Find the repository from the `origin` remote:
   `git remote get-url origin`. Call it `OWNER/REPO` below.
3. If `OWNER/REPO` is `tesslio/tessl-carnival` (in any case), stop. That's the
   upstream repository, and it has to stay open so people can post in Show your
   carnival. Tell the person to fork it on GitHub and clone their fork, or to
   run `gh repo fork --remote` in this clone to fork it and point `origin` at
   their fork.
4. Run `gh repo view OWNER/REPO --json isFork,viewerPermission`. Carry on only
   if `isFork` is true and `viewerPermission` is `ADMIN`. Otherwise stop and say
   why: these steps change settings on the person's own fork, never on the
   repository they forked from.

## 2. Turn the features on

Run each step, and keep going if one fails: note it for the summary.

1. **Issues:** `gh repo edit OWNER/REPO --enable-issues`.
2. **Actions:** list the workflows with
   `gh api repos/OWNER/REPO/actions/workflows --jq '.workflows[] | [.id, .name, .state] | @tsv'`.
   Enable any whose state isn't `active` with `gh workflow enable <id> --repo OWNER/REPO`.
   If GitHub refuses, the person has to open the **Actions** tab once and
   select the button to enable workflows.
3. **Pages:** turn it on with GitHub Actions as the source:
   `gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow`.
   If that says Pages already exists, switch it to GitHub Actions instead:
   `gh api -X PUT repos/OWNER/REPO/pages -f build_type=workflow`.

## 3. Lock it down

Check again that `OWNER/REPO` isn't `tesslio/tessl-carnival` before either
call. Run both, and keep going if one fails: note it for the summary.

1. **Interactions:** limit issues, comments and pull requests to collaborators,
   for six months, the longest GitHub allows:

   ```bash
   gh api -X PUT repos/OWNER/REPO/interaction-limits -f limit=collaborators_only -f expiry=six_months
   ```

   The response has `expires_at`: note it for the summary. Running this again
   starts a fresh six months. If GitHub answers 409, a limit is already set on
   the person's whole account, so this repository can't have its own: say so.

   <!-- TODO: confirm the interaction lock doesn't stop the Tessl GitHub App or Tessl Review from commenting and opening pull requests on the fork. -->

2. **Actions on outside pull requests:** require approval before workflows run
   on pull requests from anyone outside the repository:

   ```bash
   gh api -X PUT repos/OWNER/REPO/actions/permissions/fork-pr-contributor-approval -f approval_policy=all_external_contributors
   ```

   Check it with
   `gh api repos/OWNER/REPO/actions/permissions/fork-pr-contributor-approval --jq .approval_policy`.
   If either call fails, carry on: say so in the summary, and give the person
   the manual step at the end of this skill.

## 4. Deploy

1. Start a deploy: `gh workflow run pages.yml --repo OWNER/REPO --ref main`.
2. Wait for it: find the run with
   `gh run list --workflow pages.yml --repo OWNER/REPO --limit 1` and follow it
   with `gh run watch <run id> --repo OWNER/REPO`. It takes about a minute.
3. Get the link: `gh api repos/OWNER/REPO/pages --jq .html_url`.

## 5. Tell the person

End with a short summary:

- **Your carnival:** the Pages link. It's the main way to play, and every merge
  to `main` redeploys it, so new games show up there once they merge.
- **Switched on:** Issues, Actions and Pages, and anything that needs a click
  from them.
- **Locked down:** only they and their collaborators can open issues, comment
  and open pull requests, until the `expires_at` date. The lock lasts six
  months, and rerunning **Set up my fork** renews it. Say whether outside pull
  requests need approval before Actions run, and anything that failed.
- **Your fork is public:** anyone can see its code, issues and pull requests, so
  secrets never go in it.

## Manual steps

If you can't use `gh`, give the person these steps for their fork on GitHub:

1. **Issues:** Settings, General, Features: check **Issues**.
2. **Actions:** open the **Actions** tab and enable workflows.
3. **Pages:** Settings, Pages: set **Source** to **GitHub Actions**, then
   re-run the **Deploy to GitHub Pages** workflow from the Actions tab.
4. **Interactions:** Settings, Moderation options, Interaction limits: limit to
   repository collaborators, for six months.
5. **Outside pull requests:** Settings, Actions, General: require approval for
   all external contributors before fork pull request workflows run.

Their carnival is then at `https://<their-username>.github.io/<repo>/`.
