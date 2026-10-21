---
name: set-up-your-fork
description: Turn on the GitHub features a fork of the carnival needs (Issues, Actions and GitHub Pages) using the GitHub CLI, then deploy the carnival and share its link. Use when someone asks to set up their fork, turn on issues or Pages, get a shareable link to their carnival, or when the Issues tab, CI checks or the Pages deploy are missing on a fork.
---

# Set up your fork

GitHub switches a few features off when someone forks a repository. The
workshop needs three of them. You turn them on with the person's own GitHub
login, so they need to own the fork.

- **Issues**, so they can file the starter issues and label them.
- **Actions**, so CI runs on pull requests and the carnival deploys.
- **GitHub Pages**, so they can play and share their carnival online.

Tell the person what you're about to change before you change it.

## 1. Check you can do it

1. Run `gh auth status`. If `gh` isn't installed or isn't logged in, stop and
   give the person the manual steps at the end of this skill. Don't log in for
   them: `gh auth login` is interactive.
2. Find the repository from the `origin` remote:
   `git remote get-url origin`. Call it `OWNER/REPO` below.
3. Run `gh repo view OWNER/REPO --json isFork,viewerPermission`. Carry on only
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

## 3. Deploy and share

1. Start a deploy: `gh workflow run pages.yml --repo OWNER/REPO --ref main`.
2. Wait for it: find the run with
   `gh run list --workflow pages.yml --repo OWNER/REPO --limit 1` and follow it
   with `gh run watch <run id> --repo OWNER/REPO`. It takes about a minute.
3. Get the link: `gh api repos/OWNER/REPO/pages --jq .html_url`.

## 4. Tell the person

Say which features are on, which need a click from them, and give them the link
to their carnival. Remind them that every merge to `main` redeploys it, so new
games show up there once they merge.

## Manual steps

If you can't use `gh`, give the person these steps for their fork on GitHub:

1. **Issues:** Settings, General, Features: check **Issues**.
2. **Actions:** open the **Actions** tab and enable workflows.
3. **Pages:** Settings, Pages: set **Source** to **GitHub Actions**, then
   re-run the **Deploy to GitHub Pages** workflow from the Actions tab.

Their carnival is then at `https://<their-username>.github.io/<repo>/`.
