# Tessl Carnival

[![AI DevCon NYC, 2 to 4 November 2026](https://img.shields.io/badge/AI%20DevCon%20NYC-2--4%20Nov%202026-e63946)](https://tessl.io/devcon?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival)
[![Play the carnival](https://img.shields.io/badge/Play-the%20carnival-ffcc33)](https://tesslio.github.io/tessl-carnival/)
[![Built with Tessl](https://img.shields.io/badge/Built%20with-Tessl-1b1035)](https://tessl.io/?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival)
[![Join the Tessl Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord&logoColor=white)](https://discord.com/invite/jbb2vHnHZQ?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival)
[![MIT license](https://img.shields.io/badge/license-MIT-b9a9d9)](LICENSE)

![The Tessl Carnival midway: striped tents, a ferris wheel, a carousel and game booths along a path](docs/midway.jpg)

**[Play the carnival](https://tesslio.github.io/tessl-carnival/)** in your browser, and see what other people's
factories built in **[Show your carnival](https://github.com/tesslio/tessl-carnival/discussions/13)**.

Your coding agent writes code fast. Turning issues into pull requests, reviewing
them and keeping the repo healthy still waits on you. This repo is where you
build a software factory to take that work on, one skill at a time.

A **software factory** is a set of loops on your repository. Each loop is a
skill that runs on its own: when something happens, such as a label on an issue
or a time on the clock, an agent does one job the way the skill describes, and
code review checks the result before you merge.

## The workshop

Tessl Carnival is the starter repo for **Build your own software factory with
context**, a 90-minute hands-on workshop at
**[AI Native DevCon NYC](https://tessl.io/devcon?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival)**, November 2 to 4, 2026 at Industry City,
Brooklyn. Everyone in the room builds on this same repo, so you can compare
notes with the person next to you.

The room comes together three times: a 10-minute kick-off, a checkpoint and
show and tell. The rest you do at your own pace, with your coding agent and
[`WORKSHOP.md`](WORKSHOP.md) as your guide.

- **The core path (about 40 minutes).** Get the carnival running, set up a
  factory on your fork, and ship your first issue without writing code: label
  it, and an agent opens the pull request. You're done when your change is live
  at your own GitHub Pages link. It's the only part everyone needs to finish.
- **Tracks (pick one, about 20 minutes).** Teach code review the carnival's
  house rules, add a maintenance loop that files issues on a schedule, grow
  your carnival with several issues at once, or set up a factory on a repo of
  your own.

Open your coding agent in your clone and paste **Read WORKSHOP.md and take me
through the core path, one step at a time**. Before the session, ask it to
**Check I'm ready for the workshop**: it follows
[`skills/check-workshop-ready`](skills/check-workshop-ready/SKILL.md) and tells
you anything to fix.

**Bring:** a laptop with git, Node 22.13 or later, a coding agent (Claude Code,
Codex, Cursor or similar), a GitHub account, the
[GitHub CLI](https://cli.github.com) logged in with `gh auth login`, and the [Tessl CLI](https://tessl.io/?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival).

**Facilitators:** [Hamza Oza](https://www.linkedin.com/in/hamzaoza/),
[James Moss](https://www.linkedin.com/in/jimbomoss/) and
[Joe Holdcroft](https://www.linkedin.com/in/joeholdcroft/), from Tessl. Raise
your hand at any point and one of us will come over.

**After the session,** your carnival stays live at your Pages link, so keep
building it during DevCon, and come and find us at the Tessl booth to go
further.

**Not in the room?** AI DevCon is where developers and teams building software
factories compare notes. Get a [free virtual ticket](https://luma.com/aidevcon-nyc2026?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival), or watch the
[talks from AI DevCon London](https://www.youtube.com/watch?v=KpfnldJO3Iw&list=PLISstAySqk7KtlYPFps1ZnK9xNIMSVkDD), with speakers from Anthropic, Google
DeepMind, Meta, Netlify, Thoughtworks and Docker.

## The carnival

The carnival is a small browser game. It ships with one game, the **water
cannon**, and a midway you walk around: a sunny fairground with tents, rides and
a booth for every game. Empty booths say "coming soon" until a game fills them.

You grow your carnival by adding games through your factory. Each game lives in
its own folder, and the only shared file it touches is the game list in
`src/games/index.ts`. Several games can be built at once with little to clash
over, and everyone ends the session with a different carnival.

## Get your own carnival

1. **Fork** this repository on GitHub, and clone your fork.
2. **Set it up.** Open your coding agent in the clone and ask it to
   **Set up my fork**. It turns on what the carnival needs, locks your fork
   down, deploys the carnival, and prints your Pages link.
3. **Play** at your Pages link,
   `https://<your-username>.github.io/tessl-carnival/`. Walk up to the water
   cannon booth and press **E**. Walk with WASD or the arrow keys, or click
   where you want to go.

Every merge to `main` redeploys your carnival, so your factory's work shows up
at the same link.

**Run it on your laptop instead.** You need git and Node 22.13 or later. In
your clone:

```bash
npm ci
npm run dev
```

Then open http://localhost:5173.

**Can't run it on your laptop?** Open your fork in GitHub Codespaces instead:
on your fork's page, select **Code → Codespaces → Create codespace on main**. It
sets up Node and the GitHub CLI and installs everything, all in your browser.
Run `npm run dev` in its terminal and the carnival opens in a new tab.

### Your fork is public

Anyone can see your fork's code, issues and pull requests, and its `tessl.json`
once you set up a factory. **Set up my fork** locks it down, so only you can open
issues, comment and open pull requests. Never put secrets in the repository: no
API keys, tokens or `.env` files.

## Set up your fork

GitHub switches a few things off when you fork a repository: Issues, Actions
and GitHub Pages. The quickest way to turn them on is to ask your coding agent,
in your clone:

> Set up my fork

It follows [`skills/set-up-your-fork`](skills/set-up-your-fork/SKILL.md): it
uses the [GitHub CLI](https://cli.github.com) (`gh`) with your own login to turn
on Issues, Actions and Pages, deploys the carnival, and gives you a link to
share. Every merge to `main` redeploys it.

It also locks your fork down:

- Only you and your collaborators can open issues, comment and open pull
  requests. The lock lasts six months, the longest GitHub allows, and asking
  for **Set up my fork** again renews it.
- Pull requests from anyone else need your approval before Actions run on them.

To do it by hand instead:

1. **Issues.** Go to **Settings → General → Features** and check **Issues**.
   Issues don't copy across with a fork, but the starter issues do as templates:
   open **Issues → New issue** and pick one, or use **Your own idea** to write up
   a change of your own.
2. **Actions.** Open the **Actions** tab and enable workflows. CI runs
   `npm run check` and the build on every pull request.
3. **Pages.** Go to **Settings → Pages**, set **Source** to **GitHub Actions**,
   then re-run the **Deploy to GitHub Pages** workflow or merge anything to
   `main`. Your carnival will be at
   `https://<your-username>.github.io/tessl-carnival/`.
4. **Interactions.** Go to **Settings → Moderation options → Interaction
   limits**, and limit interactions to repository collaborators for six months.
5. **Outside pull requests.** Go to **Settings → Actions → General**, and
   require approval for all external contributors before their pull requests
   run workflows.

This repo doesn't include a `tessl.json`. To set up a factory, run `tessl init`
in your clone first, the same as you would in any repository of your own.

## Work with the factory

Once your factory is set up, GitHub issues are how you hand it work:

- **Ship an issue:** add the `tessl` label to an open issue. About 90 seconds
  later an agent starts on it, works on a `tessl/` branch, and opens a pull
  request.
- **Answer its questions:** if the agent asks something on the issue, reply
  there and it carries on.
- **Take it back:** remove the `tessl` label. Closing the issue also closes its
  pull request.
- **Who can start it:** only the person who set up the factory. To let someone
  else, ask your agent to add their GitHub account to the factory's triggers.

On the agent's pull request, code review leaves its findings, and the agent
answers them and fixes any failing checks until it's ready for you to merge.

**Before you leave the session,** switch off your scheduled loops, because they
keep using credits. You can leave the label-to-pull request automation on to
keep building your carnival: it only runs when you add the label. To switch
everything off, ask your agent: **Switch off all my factory automations**. See
[Switch off what you don't need](WORKSHOP.md#switch-off-what-you-dont-need).

## Share your carnival

Everyone starts from the same water cannon and ends up somewhere different.
Show people where yours went:

- **Post it in [Show your carnival](https://github.com/tesslio/tessl-carnival/discussions/13)** as soon as you finish the core
  path, so the room can see how everyone's doing: your carnival's link, what
  your factory built, and one thing it got right and one it got wrong.
- **Share it on [X](https://x.com/intent/post?text=I%20built%20a%20software%20factory%20on%20a%20browser%20carnival%20at%20AI%20DevCon%20NYC%20with%20%40tessl_io&url=https%3A%2F%2Fgithub.com%2Ftesslio%2Ftessl-carnival)
  or [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Ftesslio%2Ftessl-carnival):**
  add your carnival's link and tag Tessl, so we can see what you built.
- **Star this repo** if it helped, so other people find it.

## Commands

| Command          | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `npm run dev`    | Run the carnival locally                                  |
| `npm run format` | Format the repo with Prettier, skipping `.prettierignore` |
| `npm run check`  | Lint, check formatting, type-check and test everything    |
| `npm run build`  | Build the site into `dist/`                               |
| `npm run test`   | Run the tests once                                        |

## How it's built

TypeScript, Vite and plain HTML canvas, with Vitest for the game logic. No UI
framework and no native dependencies, so `npm ci` is the whole setup.

- `index.html` and `src/main.ts`: the page and the router.
- `src/midway/`: the walkable midway. Every registered game gets a booth along
  the avenue.
- `src/carnival/`: the shared base every game uses: the game registry, scores,
  prizes and theme.
- `src/games/<game-id>/`: one folder per game. The water cannon is the pattern
  to copy.
- `skills/`: skills that help an agent work on the carnival, such as adding a
  new game.
- `tessl-factory/skills/`: sample skills for maintenance loops that look for
  problems and file issues.

[`AGENTS.md`](AGENTS.md) is where your agent starts: how the carnival fits
together, the house rules every game follows, and how to work on an issue.

## About Tessl

A software factory runs on context. Agents do good work when they know how your
team builds software: your standards, your workflows, what good looks like.
Tessl is where you write that down and put it to work, from skills, to loops, to
factory.

- **Skills.** Capture how your team works in plain files that live in your repo,
  versioned and reviewed like code. Find more in the Tessl Registry, and score
  your own before your agents rely on them.
- **Loops.** Deploy a skill to run on its own, on a label, a pull request or a
  schedule: ship issues as pull requests, review code against your standards,
  keep docs and tests healthy. Improve the skill, and every run of the loop gets
  the change.
- **Factory.** Compose skills and loops into your whole delivery process. When
  review keeps catching the same mistake, a loop can write the rule down, so the
  next pull request gets it right.

You don't need to build it all at once. Start with one skill on one repo, run it
by hand until your team trusts it, then turn it into a loop. Everything Tessl
sets up stays in your repo, and it works with the coding agents you already
use, including Claude Code, Cursor and Codex.

**[Start free](https://tessl.io/?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival)** with 1,000 credits a month, no credit card required.

- **Learn:** [docs](https://docs.tessl.io/?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival),
  [Tessl Registry](https://tessl.io/registry?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival),
  [blog](https://tessl.io/blog?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival) and
  [podcast](https://tessl.io/podcast?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival).
- **Talk to us:** [Discord](https://discord.com/invite/jbb2vHnHZQ?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival), or come to the next
  [AI DevCon](https://tessl.io/devcon?utm_source=github&utm_medium=readme&utm_campaign=tessl-carnival).
- **Follow along:** [LinkedIn](https://linkedin.com/company/tesslio/),
  [X](https://x.com/tessl_io) and [YouTube](https://www.youtube.com/@tessl-ai).

## License

MIT, so you can fork the carnival, change it and take it home. See
[`LICENSE`](LICENSE).
