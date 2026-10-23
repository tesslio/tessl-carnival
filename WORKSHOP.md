# Workshop: build your own software factory with context

This is your guide for the 90-minute session. The room comes together three
times: the kick-off, a checkpoint and show and tell. The rest you do at your own
pace, with your coding agent and this guide. Stuck? Raise your hand: a
facilitator will come over.

A **software factory** is a set of automations on a repository. When something
happens, such as a label on an issue, a review on a pull request or a time on
the clock, an agent does one job in a cloud environment and opens or updates a
pull request. Code review checks it, and sends it back to the agent until it's
ready to merge.

| Time | Block                                                 | What happens                                                                      |
| ---- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| 0:00 | Kick-off (10 min)                                     | What we're building and the path. Then go.                                        |
| 0:10 | [Core path](#the-core-path-about-40-minutes) (40 min) | Carnival running, factory set up, first issue shipped, change live on Pages.      |
| 0:50 | [Checkpoint](#checkpoint) (10 min)                    | Progress, live links on screen, what people learned, help for anyone still going. |
| 1:00 | [Tracks](#tracks-pick-one-about-20-minutes) (20 min)  | Pick one optional track.                                                          |
| 1:20 | [Show and tell](#show-and-tell) (10 min)              | Share carnivals, talk about what the factory caught.                              |

The core path is the only part everyone needs to finish. Its finish line is
**your change, live at your own GitHub Pages link**. Everything after that is
optional, so you can keep going if you're quick, and still leave with a working
factory if you're not.

## How to use this guide

Open your coding agent in your clone of the carnival and paste
**Read WORKSHOP.md and take me through the core path, one step at a time**.
Your agent does the work, and stops at each **Done when** to check it with you.
In testing, Claude Code and Codex worked well. In Cursor, pick a model rather
than Auto, because Auto was slow in testing.

## For the agent

If you're a coding agent taking someone through this guide:

- Work through one step at a time, in order. Never skip a step, even if it looks
  done already: check it instead.
- Pass `--repo OWNER/REPO`, the person's fork, to every `gh` command that
  works on issues or pull requests. If they cloned with `gh`, its default is
  `tesslio/tessl-carnival`, so without `--repo` an issue or pull request lands
  there instead of on their fork.
- At each **Done when**, run the check yourself where you can, and tell the
  person what you found. For example, `gh pr view --repo OWNER/REPO` for a pull
  request,
  `gh api repos/OWNER/REPO/pages --jq .html_url` for their Pages link, and
  `tessl whoami` for their Tessl login. When a check needs the person, such as
  playing a game or looking at the Tessl app, ask them and wait.
- Ask before you merge anything.
- During factory setup, each question is a real choice. Say what the default in
  this guide is and what it means, then let the person choose.
- Once the factory is live, changes go through issues. Write the issue, with a
  **Done when**, file it on the fork, and add the `tessl` label: the factory
  writes the code and opens the pull request, and answer reviews and fix checks
  fixes what code review flags. Don't write the change yourself or open the
  pull request: answer reviews only works on the factory's own pull requests.
  The exceptions are setup the factory can't do from the cloud, such as a cloud
  environment, a GitHub App install or a repository secret.
- The `tessl` label has to come from the person's own GitHub account. They add
  it in the browser, or you add it with
  `gh issue edit <number> --repo OWNER/REPO --add-label tessl` while `gh` is
  logged in as them.
  A label added by an app or a bot doesn't start the factory.
- When the core path is done, tell the person, then offer the tracks.

## Before you start

- A GitHub account, signed in.
- A coding agent that works, such as Claude Code, Codex or Cursor.
- Node 22.13 or later, and git.
- The Tessl CLI. Install it from [tessl.io](https://tessl.io), then run:

  ```bash
  tessl cli update
  tessl login
  ```

- The [GitHub CLI](https://cli.github.com) (`gh`), logged in with
  `gh auth login`. It lets your agent set up your fork for you.

Then get ready:

1. **Fork this repository and clone your fork.** Your fork is public: anyone can
   see its code, issues and pull requests, so never put secrets in it.
2. **Check you're ready.** Open your coding agent in the clone and ask it to
   **Check I'm ready for the workshop**. It follows
   [`skills/check-workshop-ready`](skills/check-workshop-ready/SKILL.md): it
   checks git, Node, `gh`, `tessl` and your fork, and gives you a short list of
   anything to fix. It changes nothing without asking.
3. **Set up your fork.** If the check says your fork isn't set up, say yes when
   it offers, or ask your agent to **Set up my fork**. It turns on Issues,
   Actions and GitHub Pages, deploys your carnival and gives you its link. It
   also locks your fork down, so only you can open issues, comment and open pull
   requests. See [Set up your fork](README.md#set-up-your-fork) to do it by hand.

## The core path (about 40 minutes)

Three steps. You're done when your change is live at your Pages link.

### 1. Get the carnival running

**Learn:** the carnival is a midway with one game, the water cannon, plus a
shared base every game uses. [`AGENTS.md`](AGENTS.md) explains how it fits
together and the house rules every game follows. Your Pages link is the main
way to play: every merge to `main` redeploys it, so it's where your factory's
work shows up.

**Do:**

1. Open your Pages link. **Set up my fork** prints it, and it looks like
   `https://<your-username>.github.io/tessl-carnival/`.
2. Walk to the water cannon booth and press **E** to play. Walk with WASD or the
   arrow keys, or click where you want to go.
3. Skim `AGENTS.md` and the starter issues under **Issues → New issue**, and
   note one thing you'd change.

**If your Pages link isn't working yet,** run the carnival on your laptop
instead, then open http://localhost:5173:

```bash
npm ci
npm run dev
```

**If your laptop can't run it,** open your fork in GitHub Codespaces: **Code →
Codespaces → Create codespace on main**, then run `npm run dev` in its terminal.

**Done when:** the water cannon is playable.

### 2. Set up your factory

**Learn:** setup links your repository to Tessl, creates a cloud environment
for each automation, adds a `tessl` label, and connects two GitHub apps to your
fork. It takes about 15 minutes, most of it the choices below and installing the
two apps in your browser:

- **Tessl GitHub App:** how your factory works on your repository. It picks up
  labeled issues, pushes branches and opens pull requests. You install it during
  setup.
- **Tessl Review:** the separate app for code review. When you say yes to code
  review, your agent sends you to the page that installs it. It's separate so
  the factory never reviews its own work, and it shows as **Tessl Reviewer** on
  your pull requests.

**Do:** in your clone of the carnival:

1. Set up Tessl in the repository, then install the factory setup skill:

   ```bash
   tessl init
   tessl install tessl-labs/factory-setup
   ```

   `tessl init` is the same first step you'd take in any repository of your own.
   Restart your coding agent afterwards, so it sees the new skill.

2. Open your coding agent in the repository and type: **Help me set up a factory**.
3. Make the choices it asks about. It asks one at a time, and each one shapes
   how your factory works. The defaults below are what we recommend for the
   workshop. Choose differently if you like, and ask your agent what changes if
   you do.

   | It asks                                | Default                     | What you're choosing                                                                                                                                                                     |
   | -------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | Go ahead?                              | Yes                         | Nothing changes in your repository or in Tessl until you agree.                                                                                                                          |
   | Update the Tessl CLI?                  | Yes, if it asks             | Setup needs a recent CLI. Run `tessl cli update` when it asks.                                                                                                                           |
   | Managed or vendored plugins?           | Managed                     | Managed keeps the plugins Tessl installs out of git, like `node_modules`: every clone and cloud run installs them from `tessl.json`. Vendored commits them, often thousands of lines.    |
   | Commit the setup files on a branch?    | Yes                         | They become your setup pull request, so the change reaches `main` the same way all other work does.                                                                                      |
   | Which organization and workspace?      | Your own                    | Where your factory lives in Tessl, and whose credits its runs use.                                                                                                                       |
   | Give the Tessl GitHub App your fork    | Yes, in your browser        | The app agents act through. It needs write access to comment, push branches and open pull requests.                                                                                      |
   | Which automations?                     | All three, with code review | **Ship tickets** turns a labeled issue into a pull request. **Answer reviews and fix checks** fixes what review flags. **Follow ticket changes** stops work when you take an issue back. |
   | Give Tessl Review your fork            | Yes, in your browser        | The second app, which runs code review. It's separate so the factory never reviews its own work.                                                                                         |
   | How often should code review run?      | Every push                  | Review checks each fix the factory pushes, not just the first version. Each review uses credits.                                                                                         |
   | File a first ticket?                   | No                          | That's the next step, where you choose it yourself.                                                                                                                                      |
   | Push and merge the setup pull request? | Yes                         | Your automations are already on in Tessl. Merging puts `tessl.json` on `main`, which links your repository to them.                                                                      |

4. Wait for **Your factory is live**, then open the link it gives you to see
   your automations.

If you're not sure you're logged in, run `tessl whoami`, and `tessl login` if it
fails.

**Done when:** your agent says your factory is live.

### 3. Ship your first issue

**Learn:** an issue becomes a pull request with nobody writing code. After you
add the label, the factory waits about 90 seconds before starting, so quick
edits to the issue don't start several runs.

**Do:**

1. Open **Issues → New issue** and pick one of the two **Hello world**
   issues. Each is a small change, so you see the whole flow quickly:
   - **Put your name on the carnival:** your name on the entrance sign and the
     browser tab.
   - **Paint the sky at sunset:** two colors.
2. Add the `tessl` label yourself, in the browser or with
   `gh issue edit <number> --repo <your-username>/tessl-carnival --add-label tessl`.
   It has to come from your own
   GitHub account: a label added by an app or a bot doesn't start the factory.
3. Watch what happens:
   - **About 90 seconds of nothing.** The factory is waiting.
   - **A run on the Loops page** in the Tessl app. You can follow the agent's
     work there.
   - **A pull request, linked to your issue.** Label to pull request usually
     takes 2 to 3 minutes. Code review leaves its findings on it, and the agent
     answers them.

   If nothing has started after 5 minutes, see
   [If something goes wrong](#if-something-goes-wrong).

4. Merge the pull request. Pages redeploys in about a minute: you can watch the
   **Deploy to GitHub Pages** run in your fork's **Actions** tab.
5. Open your Pages link and find your change.

**Done when:** your change is live at your Pages link. Then post that link in
**[Show your carnival](https://github.com/tesslio/tessl-carnival/discussions/13)**,
so the room can see your progress.

**If your factory isn't live by about 0:40,** pair with your neighbor and watch
their run, or switch to Codespaces, so you see a pull request land before the
checkpoint.

How issues drive the factory after today, from replying to the agent to taking
an issue back: see [Work with the factory](README.md#work-with-the-factory).

## Checkpoint

At about 0:50 the room pauses for 10 minutes to share progress, put live links
on screen and help anyone still on the core path.

## Tracks (pick one, about 20 minutes)

| Track                                     | What you'll do                                    |
| ----------------------------------------- | ------------------------------------------------- |
| [A](#a-teach-review-your-rules)           | Teach code review the carnival's house rules      |
| [B](#b-add-a-maintenance-loop)            | Add a loop that finds problems and files them     |
| [C](#c-grow-your-carnival)                | Label several issues and watch them run at once   |
| [D](#d-set-up-a-factory-on-your-own-repo) | Take the factory home to a repository of your own |

Finished a track and want more? Try the
[advanced stretch](#advanced-stretch-a-just-in-time-board) at the end.

### A: Teach review your rules

**Learn:** an agent that has to guess your rules reviews badly. Code review
ships with default lenses: instructions that tell it what to look for on every
pull request. Copy them into your repository and they become yours to change.

**Do:**

1. Ask your agent to file the issue below on your fork and add the `tessl`
   label. The factory writes the lenses, not your agent.

   <details>
   <summary>The issue: Teach code review the carnival's house rules</summary>

   ```md
   ### What should change?

   Teach Tessl Code Review the carnival's house rules, and give the repository
   its own copy of the default review lenses so we can tune them.

   1. **Copy the four default lenses** from `tessl/code-review@0.5.0` into
      `review-lenses/<lens-name>/SKILL.md`, unchanged:
      `review-correctness-and-data-integrity`, `review-security-and-privacy`,
      `review-scale-and-resilience` and `review-maintainability-and-code-quality`.
      To get them, run `tessl install tessl/code-review@0.5.0` in a new empty
      directory outside the repository, with a `tessl.json` of
      `{"name": "tmp", "dependencies": {}}`, and copy each
      `.tessl/plugins/tessl/code-review/skills/<lens-name>/SKILL.md`.
   2. **Add a house rules lens** at
      `review-lenses/review-carnival-house-rules/SKILL.md`, in the same shape as
      the defaults: frontmatter `name` and `description`, then Scope, Method,
      Threshold and Reporting. It checks house rules 1 to 3 in `AGENTS.md`:
      every game registers on the midway, reports scores through `recordScore`
      from `src/carnival`, and draws with `theme` and `canvasFont`. It should:
      - Not report code outside `src/games/`: `src/carnival/` defines the theme
        and scores, and `src/midway/palette.ts` has its own scenery colors.
      - Not report values derived from the theme, test data in `game.test.ts`,
        or anything lint, the type-checker or tests already enforce.
      - Be accurate about consequences. A game whose `game.ts` has no default
        export gets no booth. A game whose `id` differs from its folder name
        breaks the house rule, but nothing breaks for the player.
   3. **Add `.tessl-code-review.yml`** at the root, listing all five lenses by
      local path (`./review-lenses/<lens-name>/SKILL.md`), with the house rules
      lens scoped to `globs: [src/games/**]`. Add `ignore: [.tessl/plugins/**]`
      only.
   4. **Add both to the layout in `AGENTS.md`.**

   ### Done when

   - [ ] `review-lenses/` has the four default lenses, identical to
         `tessl/code-review@0.5.0`, and the house rules lens.
   - [ ] `.tessl-code-review.yml` lists all five, scopes the house rules lens
         to `src/games/**`, and ignores only `.tessl/plugins/**`.
   - [ ] `AGENTS.md`'s layout mentions both.
   - [ ] `npm run check` passes.
   ```

   </details>

2. Merge the factory's pull request. Code review only reads
   `.tessl-code-review.yml` from `main`, so the new lens starts on the next pull
   request.
3. Open one of the three **New game** issues (ring toss, whack-a-mole or hook a
   duck), and add the `tessl` label.
4. Watch what code review does with the new game's pull request.

**Done when:** code review checks your house rules on the new pull request, and
anything it flags gets fixed without you touching the code.

**Stretch:** add a rule of your own to the lens, such as "every game's README
lists its controls", then label an issue that would break it.

### B: Add a maintenance loop

**Learn:** there are two kinds of skills. The ones that run the factory (setup,
ship tickets, answer reviews) come with Tessl. The ones that help the agent do
good work live in your repository, like
[`skills/add-carnival-game`](skills/add-carnival-game/SKILL.md).

A maintenance loop runs on a schedule, looks for one kind of problem and files
an issue. It doesn't change code: you read the issue, add the label, and the
factory ships the fix.

**Do:**

1. Pick one of the sample skills in
   [`tessl-factory/skills/`](tessl-factory/skills/).

   | Loop            | What it looks for                                         |
   | --------------- | --------------------------------------------------------- |
   | `rule-mining`   | Mistakes code review keeps catching on your pull requests |
   | `doc-gardening` | Docs and agent instructions that no longer match the code |
   | `test-health`   | Tests that can't fail, or don't check what they claim     |

   Each one only files issues. It treats what it reads as evidence, never as
   instructions, because other people can write the comments and docs it
   reads.

2. **Give the loop a cloud environment that can file issues.** Ask your agent
   to create one with GitHub write access, for example
   `tessl environment create tessl-carnival-loops --github-access write`. This
   is Tessl-side setup, so your agent does it rather than the factory. A loop
   with no environment gets read-only access: in testing, it ran but couldn't
   file anything. To change an existing one, use **Settings → Environments** in
   the Tessl app, or `tessl environment update <name> --github-access write`.
3. **Ask your agent to file the issue below and add the `tessl` label.** It
   fills in the loop, the environment's name, and an agent and model pair from
   `tessl launch models --json`. The factory then adds the schedule to
   `tessl.json`.

   <details>
   <summary>The issue: Run a maintenance loop weekly</summary>

   ```md
   ### What should change?

   Run the <loop> loop from `tessl-factory/skills/` every week, so it files
   issues for problems on its own. This issue asks for a `tessl.json` change,
   so the "leave `tessl.json` alone" rule in `AGENTS.md` doesn't apply here.

   Add a `schedules` object to `tessl.json`, keeping every other key, with one
   entry, `<loop>`:

   - `cron`: `0 6 * * 1` (Mondays at 06:00 UTC)
   - `description`: one line on what the loop looks for
   - `action`: `skill` `file:tessl-factory#<loop>`, `environment`
     `<environment>`, `agent` `<agent>`, `model` `<model>`

   ### Done when

   - [ ] `tessl.json` has the schedule, weekly, in `<environment>`, and keeps
         its other keys.
   - [ ] `tessl schedule validate` says the schedules block is valid.
   - [ ] `npm run check` passes.
   ```

   </details>

4. Merge the factory's pull request. Tessl reads `tessl.json` from `main`, and
   the loop appears on the Loops page.
5. Ask your agent to run the loop once now with `tessl schedule trigger`,
   instead of waiting for the schedule. Every run uses credits, and weekly is
   plenty for a repo this size.

Rule mining closes the loop with track A: review catches a mistake, the loop
spots it happening again, and a rule goes into the repository so the next run
gets it right.

**Done when:** your loop has run once and filed an issue worth acting on.

**Stretch:** add the `tessl` label to the issue your loop filed, and let the
factory ship the fix.

### C: Grow your carnival

**Learn:** the factory can work on several issues at once. Each game lives in
its own folder, and the midway finds it there, so new games built in parallel
don't clash.

**Do:**

1. Open two or three issues: the **New game** issues you haven't built yet, or
   **Your own idea** to write up the change you noted earlier.
2. Add the `tessl` label to all of them at once.
3. Watch the runs side by side on the Loops page in the Tessl app.
4. Merge each pull request when it's ready. If two of them do clash, such as two
   of your own ideas touching the same file, merge one first. Then comment on
   the other pull request asking the factory to merge `main` and resolve the
   conflict. It takes a few minutes.

**Done when:** two or more of those changes are live at your Pages link.

**Stretch:** play your new games, then write up the first thing you'd change
in one of them as **Your own idea**, and label it.

### D: Set up a factory on your own repo

**Learn:** the setup you just ran works on any repository, not just the
carnival.

**Do:** in a repository of your own, run the same setup:

```bash
tessl init
tessl install tessl-labs/factory-setup
```

Restart your coding agent, then type **Help me set up a factory**. Start with
ship tickets and one small issue.

**Done when:** your factory is live on your own repository, and one small issue
has become a pull request.

**Stretch:** write down one of your team's conventions as a skill, in the same
shape as `skills/add-carnival-game`, and run
`tessl review run <path-to-the-skill-folder>` to see its score.

### Advanced stretch: a just-in-time board

This one is for people who finish early and want a challenge. Don't expect to
finish it in the session.

**Learn:** labeling issues one by one doesn't scale. A just-in-time board is a
pull system: you rank work in a **Ready** column on a GitHub Project, and a
small queue starts the factory on the next card only when there's a free slot
in **In progress**. A full **In review** column holds work back, so pull
requests can't pile up faster than you review them.

**Do:** follow [`docs/jit-board-queue.md`](docs/jit-board-queue.md). In short:

1. **Your agent sets up what the factory can't:** the board and its columns,
   and a `PROJECT_TOKEN` secret, a token of your own. The queue must add the
   `tessl` label as you: a label from `github-actions[bot]` doesn't start the
   factory.
2. **The factory builds the queue:** ask your agent to file an issue asking for
   the workflow and script in that doc, and label it.
3. **Try it:** move two or three issues into **Ready**, run the workflow, and
   watch cards move to **In progress** and then **In review** by themselves.

**Done when:** a card you moved into **Ready** reaches **In review** with
nobody adding a label.

## Show and tell

Post your carnival in
**[Show your carnival](https://github.com/tesslio/tessl-carnival/discussions/13)**:
your link, what your factory built, one thing it got right and one it got
wrong. Then tell the room: what did code review catch, and what did the agent
fix without you?

## Keep building after the session

Your carnival stays live at your Pages link, so keep adding to it during
DevCon. Come and find us at the Tessl booth to go further, for example to set
up a loop on your own repository.

## Credits

Every run uses credits: shipping an issue, a code review, a loop run. Setup
costs very little. Running out of credits can look the same as a run that
never started: you add the label, and nothing happens.

Check your balance with `tessl org usage`, or ask your agent to run it. If
you're running low or have run out during the session, raise your hand: a
facilitator can top you up. After the session, the free plan comes with 1,000
credits a month.

## Switch off what you don't need

Scheduled loops keep running, and using credits, until you remove them, so
switch them off before you leave. To switch an automation off, remove it from
`tessl.json` on your default branch and merge that change, or ask your agent to
**Switch off my scheduled loops**.

If you want to keep building your carnival, you can leave the label-to-pull
request automation on: it only runs when you add the label. To switch
everything off, ask your agent: **Switch off all my factory automations**.

## Words you'll hear

- **Automation** (or loop): one rule on your repository. When its trigger
  happens, an agent does one job. The Tessl app calls these **loops**.
- **Trigger:** what starts an automation: a label, a review or a schedule.
- **Ship tickets:** the automation that turns a labeled issue into a pull
  request.
- **Answer reviews and fix checks:** the automation that picks up review
  comments and failing checks on a factory pull request, and fixes them. The
  Tessl app shows it as **Shepherd**.
- **Environment** (or cloud environment): the setup a loop run gets, including
  how much GitHub access it has. It runs Ubuntu with Node 24, and
  `.tessl/cloud-launch-setup.sh` runs `npm ci` before each run.
- **Tessl GitHub App:** the app that lets your factory work on your repository.
- **Tessl Review:** the separate app that runs code review, so the factory never
  reviews its own work. It shows as **Tessl Reviewer** in the Tessl app and on
  your pull requests.
- **`tessl.json`:** the file in your repository that lists your automations.

## If something goes wrong

| Problem                                                       | Try                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci` fails or Node is too old                             | Check `node --version` is 22.13 or later. If it isn't, install Node 24: `nvm install` reads the repo's `.nvmrc`.                                                                                                                                                |
| No **Issues** tab, or no starter issues                       | Ask your agent to **Set up my fork**, or turn Issues on by hand: [Set up your fork](README.md#set-up-your-fork).                                                                                                                                                |
| Pull requests show no checks                                  | Ask your agent to **Set up my fork**, or enable workflows in your fork's **Actions** tab.                                                                                                                                                                       |
| `tessl` commands say you're not logged in                     | Run `tessl login`, then `tessl whoami` to check.                                                                                                                                                                                                                |
| Your agent doesn't see a skill you just installed             | Restart your coding agent after `tessl install`.                                                                                                                                                                                                                |
| Code review's findings on a pull request aren't getting fixed | Answer reviews only works on pull requests the factory opened, on `tessl/` branches. If your agent opened it, close it, file the change as an issue instead, and add the `tessl` label.                                                                         |
| Your agent is very slow                                       | In Cursor, pick a model rather than Auto.                                                                                                                                                                                                                       |
| Code review flagged the setup pull request                    | That's expected. Read what it says, then merge the setup pull request anyway.                                                                                                                                                                                   |
| A labeled issue hasn't started after 5 minutes                | Check the issue has the `tessl` label, that the Tessl GitHub App is installed on your fork, and that you have credits left.                                                                                                                                     |
| A labeled issue never started, and an app added the label     | The factory only starts on a label from your own GitHub account. Remove the label, then add it again yourself, in the browser or with `gh` logged in as you.                                                                                                    |
| Nothing starts, and everything looks set up                   | You may be out of credits. Run `tessl org usage` to check, and raise your hand: a facilitator can top you up. See [Credits](#credits).                                                                                                                          |
| A loop ran but filed no issues                                | It probably has no environment, so its GitHub access is read-only. Pick an environment with **GitHub access** set to **Write**, then run it again: see [track B](#b-add-a-maintenance-loop).                                                                    |
| Your carnival link shows a 404                                | Turn on Pages: ask your agent to **Set up my fork**, then wait a minute for the deploy.                                                                                                                                                                         |
| Your laptop can't run the carnival                            | Play at your Pages link. To work on it, open your fork in GitHub Codespaces: **Code → Codespaces → Create codespace on main**, then run `npm run dev`. If **Set up my fork** hits a permissions error there, run `gh auth login` first.                         |
| Someone else opened an issue or commented on your fork        | Ask your agent to **Set up my fork** again. It locks your fork down for six months, the longest GitHub allows, and rerunning it renews the lock.                                                                                                                |
| You want to start over                                        | On your fork's GitHub page, select **Sync fork → Discard commits**, then in your clone run `git fetch origin` and `git reset --hard origin/main`. This removes your changes and your factory setup, so run [Set up your factory](#2-set-up-your-factory) again. |

## Learn more

- [Tessl docs](https://docs.tessl.io)
- [Setting up agentic code review](https://docs.tessl.io/tutorials/setting-up-agentic-code-review)
