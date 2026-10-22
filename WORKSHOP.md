# Workshop: build your own software factory with context

This is your guide for the session, module by module. Each module has one idea,
your coding agent does the work, and a **Done when** tells you you're ready to
move on. Stuck? Raise your hand: a facilitator will come over.

A **software factory** is a set of automations on a repository. When something
happens, such as a label on an issue, a review on a pull request or a time on
the clock, an agent does one job in a cloud environment and opens or updates a
pull request. Code review checks it, and sends it back to the agent until it's
ready to merge.

| Module                                 | What you'll do                                 |
| -------------------------------------- | ---------------------------------------------- |
| [00](#00-get-the-carnival-running)     | Get the carnival running and play it           |
| [01](#01-set-up-your-factory)          | Set up a factory on your fork                  |
| [02](#02-your-first-run)               | Label an issue and watch it become a PR        |
| [03](#03-teach-the-factory-your-rules) | Teach code review the carnival's house rules   |
| [04](#04-add-a-maintenance-loop)       | Add a loop that finds problems and files them  |
| [05](#05-take-it-home)                 | Set it up on your own repo, or keep going here |

## Before you start

- A GitHub account, signed in.
- A coding agent that works, such as Claude Code, Cursor or Codex.
- Node 24 or later (or Node 22 from 22.13, or Node 20 from 20.19), and git.
- The Tessl CLI. Install it from [tessl.io](https://tessl.io), then run:

  ```bash
  tessl cli update
  tessl login
  ```

- The [GitHub CLI](https://cli.github.com) (`gh`), logged in with
  `gh auth login`. It lets your agent set up your fork for you.
- **Head start:** fork this repository and clone your fork. Then open your
  coding agent in the clone and ask it to **Set up my fork**: it turns on Issues,
  Actions and GitHub Pages, and gives you a link to share your carnival. See
  [Set up your fork](README.md#set-up-your-fork) to do it by hand.

## Words you'll hear

- **Automation** (or loop): one rule on your repository. When its trigger
  happens, an agent does one job.
- **Trigger:** what starts an automation: a label, a review or a schedule.
- **Cloud environment:** the machine the agent works on. It runs Ubuntu with
  Node and no admin rights, so `.tessl/cloud-launch-setup.sh` only runs
  `npm ci`.
- **Answer reviews and fix checks:** the automation that picks up review
  comments and failing checks on a factory pull request, and fixes them.
- **`tessl.json`:** the file in your repository that lists your automations.

## 00 Get the carnival running

**Learn:** the carnival is a midway with one game, the water cannon, plus a
shared base every game uses. [`AGENTS.md`](AGENTS.md) explains how it fits
together and the house rules every game follows.

**Do:**

```bash
npm ci
npm run dev
```

Open http://localhost:5173, walk to the water cannon booth and press **E** to
play. Then skim `AGENTS.md` and the starter issues under **Issues → New issue**,
and note one thing you'd change.

**Done when:** the water cannon is playable on your laptop.

## 01 Set up your factory

**Learn:** setup links your repository to Tessl, creates a cloud environment,
adds your automations to `tessl.json`, adds a `tessl` label, and connects the
GitHub apps that let agents work on your fork.

**Do:** in your clone of the carnival:

1. Set up Tessl in the repository, then install the factory setup skill:

   ```bash
   tessl init
   tessl install tessl-labs/factory-setup
   ```

   `tessl init` is the same first step you'd take in any repository of your own.

2. Open your coding agent in the repository and type: **Help me set up a factory**.
3. Answer its questions; it asks one at a time. Say yes to going ahead, and yes
   to all three automations: ship tickets, answer reviews and fix checks, and
   code review. If it offers to file a first ticket, say no: that's module 02.
4. Install the GitHub apps from the links it gives you, on your fork.
5. Merge the setup pull request when it asks.
6. Wait for **Your factory is live**, then open the link it gives you to see
   your automations.

If you're not sure you're logged in, run `tessl whoami`, and `tessl login` if it
fails.

**Done when:** your agent says your factory is live and you can see your
automations.

## 02 Your first run

**Learn:** a ticket becomes a pull request with nobody writing code. After you
add the label, the factory waits about 90 seconds before starting, so quick
edits to the issue don't start several runs.

**Do:**

1. Open **Issues → New issue** and pick one of the three **Hello world**
   issues. Each is a one- or two-line change, so you see the whole flow
   quickly:
   - **Put your name on the carnival:** your name on the entrance sign and the
     browser tab.
   - **Paint the sky at sunset:** two colours.
   - **Welcome visitors to the midway:** one line of text.
2. Add the `tessl` label.
3. Watch the run. Label to pull request usually takes 2 to 3 minutes. If
   nothing has started after 5, raise your hand.
4. Once your first pull request is open, try something bigger: **Show the top
   five scores on the midway**, **Press Escape to go back to the midway**, or
   **Your own idea**, to write up the change you noted in module 00.

**Done when:** a pull request opens, linked to your issue, and you can see the
change when you run the carnival from that branch.

How issues drive the factory after today, from replying to the agent to taking
an issue back: see [Work with the factory](README.md#work-with-the-factory).

## 03 Teach the factory your rules

**Learn:** an agent that has to guess your rules reviews badly. Code review
ships with default lenses: instructions that tell it what to look for on every
pull request. Copy them into your repository and they become yours to change.

**Do:**

1. Ask your agent:

   > Copy Tessl Code Review's default lenses into this repository, then add a
   > lens for the carnival's house rules in AGENTS.md: every game registers on
   > the midway, reports scores through the shared scores module, and draws
   > with the carnival's theme. Open a pull request.

2. Merge that pull request.
3. Open a **New game** issue, such as ring toss, and add the `tessl` label.
4. Watch what code review does with the new game's pull request.

**Done when:** code review checks your house rules on the new pull request, and
anything it flags gets fixed without you touching the code.

## 04 Add a maintenance loop

**Learn:** there are two kinds of skills. The ones that run the factory (setup,
ship tickets, answer reviews) come with Tessl. The ones that help the agent do
good work live in your repository, like
[`skills/add-carnival-game`](skills/add-carnival-game/SKILL.md).

A maintenance loop runs on a schedule, looks for one kind of problem and files
an issue. It doesn't change code: you read the issue, add the label, and the
factory ships the fix.

**Do:** pick one of the sample skills in
[`tessl-factory/skills/`](tessl-factory/skills/), then ask your agent to add a
scheduled automation that uses it, running **weekly**, and to run it once now
instead of waiting for the schedule. Every run uses credits, and a weekly
schedule is plenty for a repo this size.

| Loop          | What it looks for                                         | Skill                                         |
| ------------- | --------------------------------------------------------- | --------------------------------------------- |
| Rule mining   | Mistakes code review keeps catching on your pull requests | `tessl-factory/skills/rule-mining/SKILL.md`   |
| Doc gardening | Docs and agent instructions that no longer match the code | `tessl-factory/skills/doc-gardening/SKILL.md` |
| Test health   | Tests that can't fail, or don't check what they claim     | `tessl-factory/skills/test-health/SKILL.md`   |

Rule mining closes the loop with module 03: review catches a mistake, the loop
spots it happening again, and a rule goes into the repository so the next run
gets it right.

**Done when:** your loop has run once and filed an issue worth acting on.

## 05 Take it home

Pick one:

- **Your own repository:** run the same setup there: `tessl init`,
  `tessl install tessl-labs/factory-setup`, then **Help me set up a factory**.
  Start with ship tickets and one small issue.
- **Keep going on the carnival:** add a second loop from module 04, or label a
  bigger issue, such as **New game: high striker** or the water cannon's
  countdown timer.

**Share it:** post your carnival's link, what your factory built, and one thing
it got right and one it got wrong in **[Show your carnival](https://github.com/tesslio/tessl-carnival/discussions/13)**.

**Fast finishers:** write down one of your team's conventions as a skill, in
the same shape as `skills/add-carnival-game`, and run
`tessl review run <path-to-the-skill-folder>` to see its score.

## Switch it off before you leave

Automations keep running, and scheduled ones keep using credits, until you
remove them. To switch one off, remove it from `tessl.json` on your default
branch and merge that change. Ask your agent: **Switch off all my factory
automations**.

## If something goes wrong

| Problem                                     | Try                                                                                                                                                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci` fails or Node is too old           | Check `node --version` is 24 or later, 22.13 or later on Node 22, or 20.19 or later on Node 20. The repo's `.nvmrc` has the version CI uses.                                                                                |
| No **Issues** tab, or no starter issues     | Ask your agent to **Set up my fork**, or turn Issues on by hand: [Set up your fork](README.md#set-up-your-fork).                                                                                                            |
| Pull requests show no checks                | Ask your agent to **Set up my fork**, or enable workflows in your fork's **Actions** tab.                                                                                                                                   |
| `tessl` commands say you're not logged in   | Run `tessl login`, then `tessl whoami` to check.                                                                                                                                                                            |
| A labelled issue hasn't started after 5 min | Check the issue has the `tessl` label and that the GitHub apps are installed on your fork.                                                                                                                                  |
| Your carnival link shows a 404              | Turn on Pages: ask your agent to **Set up my fork**, then wait a minute for the deploy.                                                                                                                                     |
| Your laptop can't run the carnival          | Open your fork in GitHub Codespaces: **Code → Codespaces → Create codespace on main**, then run `npm run dev`. If **Set up my fork** hits a permissions error there, run `gh auth login` first.                             |
| You want to start over                      | On your fork's GitHub page, select **Sync fork → Discard commits**, then in your clone run `git fetch origin` and `git reset --hard origin/main`. This removes your changes and your factory setup, so run module 01 again. |

## Learn more

- [Tessl docs](https://docs.tessl.io)
- [Setting up agentic code review](https://docs.tessl.io/tutorials/setting-up-agentic-code-review)
