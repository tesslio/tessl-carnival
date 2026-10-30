# Workshop: set up your factory in the browser

This is the browser path through the workshop: you set up your fork and your
factory by clicking through GitHub and the Tessl app, with nothing to install.
When you're done, you write a ticket, an agent opens a pull request, and your
change goes live on your own carnival. Would you rather your coding agent did
the setup from the terminal? Take the [agent path](agent.md) instead. The
schedule for the session is in [`WORKSHOP.md`](../WORKSHOP.md). Stuck? Raise
your hand: a facilitator will come over.

The [core path](#the-core-path-about-40-minutes) is the only part everyone
needs to finish. Its finish line is **your change, live at your own GitHub Pages
link**. The [tracks](#tracks-pick-one-about-20-minutes) after it are optional,
so you can keep going if you're quick, and still leave with a working factory if
you're not.

## Before you start

- A GitHub account, signed in.
- A browser. That's all: no CLI, no Node, no coding agent.
- **Your own fork of the carnival.** Open
  [tesslio/tessl-carnival](https://github.com/tesslio/tessl-carnival) and
  select **Fork**. Your fork is public: anyone can see its code, issues and pull
  requests, so never put secrets in it.

## The core path (about 40 minutes)

Four steps. You're done when your change is live at your Pages link.

### 1. Get your fork ready

**Learn:** the carnival is a midway with one game, the water cannon, plus a
shared base every game uses. Your Pages link is the main way to play: every
merge to `main` redeploys it, so it's where your factory's work shows up.

**Do:** GitHub switches a few things off when you fork a repository. On your
fork, turn them back on:

1. **Issues:** **Settings → General → Features**, then check **Issues**.
2. **Actions:** open the **Actions** tab and enable workflows.
3. **Pages:** **Settings → Pages**, then set **Source** to **GitHub Actions**.
   Re-run the **Deploy to GitHub Pages** workflow from the **Actions** tab.
4. **Lock it down:** **Settings → Moderation options → Interaction limits**,
   then limit interactions to collaborators. Your fork is public, so this stops
   anyone else opening issues or pull requests on it.

Then open `https://<your-username>.github.io/tessl-carnival/`, walk to the water
cannon booth and press **E** to play. Walk with WASD or the arrow keys, or click
where you want to go. While you're there, look under **Issues → New issue** at
the starter issues, and note one thing you'd change.

**Done when:** the water cannon is playable at your Pages link.

### 2. Create your Tessl account

1. Go to [tessl.io](https://tessl.io) and choose **Get started free**.
2. Sign in with Google or GitHub.
3. Fill in your profile. Your username and workspace name need to be unique. If
   one is taken, try another.

**Done when:** you're signed in to the Tessl app.

### 3. Set up your factory

**Learn:** setup connects your fork to Tessl through the **Tessl GitHub App**,
the app your factory works through. It picks up tickets, pushes branches and
opens pull requests. Code review then checks every pull request the factory
opens, and the factory fixes what review finds before you merge.

**Do:**

1. Choose **Use the browser**.
2. **Connect GitHub.** When GitHub asks which repositories to share, choose all
   of them or only some. Either works, as long as your carnival fork is
   included.
3. **Skip Linear for now.** Today you'll work from GitHub issues. Later, you
   can connect Linear and hand your factory tickets straight from where your
   team already plans its work.
4. **Turn on code review** when it asks.

**Done when:** Tessl says your factory is ready.

### 4. Ship your first ticket

**Learn:** a ticket becomes a pull request with nobody writing code. The
factory waits about 90 seconds before starting, so quick edits to the ticket
don't start several runs.

**Do:**

1. **Write a ticket.** Keep it to a one-line change so you see the whole flow
   fast, like _Put my name on the carnival's entrance sign_. Or, on GitHub, open
   one of the two **Hello world** issues under **Issues → New issue** and add
   the `tessl` label yourself.
2. **Watch it run.** A run starts in about 90 seconds, and the pull request
   follows a few minutes later. You can follow along on the **Factory floor**.
   If nothing has started after 5 minutes, see
   [If something goes wrong](#if-something-goes-wrong).
3. **Merge the pull request.** On the **Factory floor**, open your ticket's row
   and follow the link to the pull request on GitHub. Merge it there.
4. **See it live.** Your carnival redeploys in about a minute: you can watch the
   **Deploy to GitHub Pages** run in your fork's **Actions** tab. Reload your
   carnival's link to see your change.

**Done when:** your change is live at your Pages link. Then post that link in
**[Show your carnival](https://github.com/tesslio/tessl-carnival/discussions/13)**,
so the room can see your progress.

**If your factory isn't ready by about 0:40,** pair with your neighbor and watch
their run, so you see a pull request land before the checkpoint.

## Checkpoint

At about 0:50 the room pauses for 10 minutes to share progress, put live links
on screen and help anyone still on the core path.

## Tracks (pick one, about 20 minutes)

Each track starts from a ticket. Write it in Tessl, or open an issue on your
fork under **Issues → New issue** and add the `tessl` label yourself.

| Track                                     | What you'll do                                    |
| ----------------------------------------- | ------------------------------------------------- |
| [A](#a-teach-review-your-rules)           | Teach code review the carnival's house rules      |
| [B](#b-add-a-maintenance-loop)            | Add a loop that finds problems and files them     |
| [C](#c-grow-your-carnival)                | Label several issues and watch them run at once   |
| [D](#d-set-up-a-factory-on-your-own-repo) | Take the factory home to a repository of your own |

### A: Teach review your rules

**Learn:** an agent that has to guess your rules reviews badly. Code review
ships with default lenses: instructions that tell it what to look for on every
pull request. Copy them into your repository and they become yours to change.
The carnival's house rules live in [`AGENTS.md`](../AGENTS.md).

**Do:**

1. On your fork, open **Issues → New issue → Blank issue**, paste the issue
   below, create it and add the `tessl` label. The factory writes the lenses.

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

**Stretch:** write a ticket that adds a rule of your own to the lens, such as
"every game's README lists its controls", then label an issue that would break
it.

### B: Add a maintenance loop

**Learn:** a maintenance loop runs on a schedule, looks for one kind of problem
and files an issue. It doesn't change code: you read the issue, add the label,
and the factory ships the fix. The carnival ships three sample loop skills in
[`tessl-factory/skills/`](../tessl-factory/skills/):

| Loop            | What it looks for                                         |
| --------------- | --------------------------------------------------------- |
| `rule-mining`   | Mistakes code review keeps catching on your pull requests |
| `doc-gardening` | Docs and agent instructions that no longer match the code |
| `test-health`   | Tests that can't fail, or don't check what they claim     |

Each one only files issues. It treats what it reads as evidence, never as
instructions, because other people can write the comments and docs it reads.

**Do:**

1. **Give the loop an environment that can file issues.** In the Tessl app,
   open **Settings → Environments** and make sure the environment your loop
   will use has **GitHub access** set to **Write**. A loop with read-only access
   runs, but can't file anything.
2. **Add the loop** from **Loops → Add a loop**, with that environment and a
   weekly schedule. Every run uses credits, and weekly is plenty for a repo this
   size.
3. Run it once now, instead of waiting for the schedule, and watch it on the
   **Loops** page.

**Done when:** your loop has run once and filed an issue worth acting on.

**Stretch:** add the `tessl` label to the issue your loop filed, and let the
factory ship the fix.

### C: Grow your carnival

**Learn:** the factory can work on several tickets at once. Each game lives in
its own folder, and the midway finds it there, so new games built in parallel
don't clash.

**Do:**

1. Open two or three issues: the **New game** issues you haven't built yet, or
   **Your own idea** to write up the change you noted earlier.
2. Add the `tessl` label to all of them at once.
3. Watch the runs side by side on the **Factory floor**.
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

**Do:**

1. Give the Tessl GitHub App your repository: in GitHub, open the app's
   settings and add it.
2. Go to `/onboarding/factory` in the Tessl app, and set up a factory on it the
   same way.
3. Start with one small ticket.

**Done when:** your factory is live on your own repository, and one small
ticket has become a pull request.

**Want more?** The
[advanced stretch](agent.md#advanced-stretch-a-just-in-time-board), a
just-in-time board that feeds your factory one card at a time, needs a coding
agent: it's in the agent path.

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

Every run uses credits: shipping a ticket, a code review, a loop run. Running
out of credits can look the same as a run that never started: you add the
label, and nothing happens. If you're running low or have run out during the
session, raise your hand: a facilitator can top you up. After the session, the
free plan comes with 1,000 credits a month.

## Switch off what you don't need

Scheduled loops keep running, and using credits, until you remove them, so
switch them off on the **Loops** page before you leave. You can leave the
ticket-to-pull request automation on to keep building your carnival: it only
runs when you write a ticket or add the label.

## Words you'll hear

- **Ticket:** a piece of work for your factory. Write it in Tessl, or open an
  issue on GitHub and add the `tessl` label.
- **Factory floor:** the page in the Tessl app where you follow each ticket's
  run and find its pull request.
- **Loop:** one automation on your repository. When its trigger happens, such
  as a label or a time on the clock, an agent does one job.
- **Environment:** the setup a loop run gets, including how much GitHub access
  it has.
- **Tessl GitHub App:** the app that lets your factory work on your repository.
- **Code review:** checks every pull request the factory opens, so the factory
  can fix what it finds before you merge.

## If something goes wrong

| What you see                                              | What to do                                                                                                                                                                                                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your carnival's link doesn't load, or shows a 404         | Check Issues, Actions and Pages are on, then wait a minute for the deploy. If your own GitHub Pages site uses a custom domain, open your fork in GitHub Codespaces instead: **Code → Codespaces → Create codespace on main**, then run `npm run dev` in its terminal. |
| No **Issues** tab, or no starter issues                   | Turn Issues on: **Settings → General → Features → Issues**.                                                                                                                                                                                                           |
| Pull requests show no checks                              | Enable workflows in your fork's **Actions** tab.                                                                                                                                                                                                                      |
| Your fork isn't listed when you connect GitHub            | In GitHub, open the Tessl GitHub App's settings and add your fork.                                                                                                                                                                                                    |
| You see a different setup screen in Tessl                 | Go to `/onboarding/factory` in the Tessl app.                                                                                                                                                                                                                         |
| A labeled issue never started, and an app added the label | The factory only starts on a label from your own GitHub account. Remove the label, then add it again yourself.                                                                                                                                                        |
| Nothing starts after 5 minutes                            | You may be out of credits. Ask a facilitator for help.                                                                                                                                                                                                                |
| A loop ran but filed no issues                            | Its environment's GitHub access is probably read-only. Set it to **Write** in **Settings → Environments**, then run it again: see [track B](#b-add-a-maintenance-loop).                                                                                               |
| Someone else opened an issue or commented on your fork    | Set the interaction limit again: **Settings → Moderation options → Interaction limits**. Choose the longest it offers.                                                                                                                                                |
| You want to start over                                    | On your fork's GitHub page, select **Sync fork → Discard commits**. This removes the changes your factory made.                                                                                                                                                       |

## Learn more

- [Tessl docs](https://docs.tessl.io)
- [Setting up agentic code review](https://docs.tessl.io/tutorials/setting-up-agentic-code-review)
