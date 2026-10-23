# Just-in-time board queue

An advanced stretch for the workshop: see
[Advanced stretch](../WORKSHOP.md#advanced-stretch-a-just-in-time-board) in
`WORKSHOP.md`. Your agent sets up the board and the token, and your factory
builds the workflow and script below from an issue that points at this file.
This design was tested on a fork, and includes what that test changed.

A pull system for agent work on a GitHub Project board. Work enters **Ready** in priority order, but an agent only starts a ticket when there's a free slot in **In progress**. Finished work moves to **In review** only while there's room there too. A full review column holds work back instead of letting it pile up.

The examples assume the agent is Tessl, started by a `tessl` label, working on `tessl/issue-<n>` branches. Any agent that starts on a label and names its branch after the issue number works the same way. Change the constants to match.

## 1. Board shape

| Column          | Role                                                                      | Who moves cards                    |
| --------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| **Backlog**     | Parking space, not yet refined                                            | You                                |
| **Ready**       | The queue: refined and ordered, first in first out by when Status was set | You                                |
| **In progress** | An agent is working on it. Limit **3**                                    | Script, pulling from Ready         |
| **In review**   | A PR is open. Limit **3**                                                 | Script, when the PR exists         |
| **Done**        | Issue closed                                                              | GitHub's built-in project workflow |

There's also a single-select **Agent** field (option `Tessl`). The script sets it, so you can see what's being handled by an agent.

## 2. What each run does

It's idempotent, so running it more than once is harmless.

1. **Read the board.** Load every item with its Status and when that Status was set, and sort each column oldest first.
2. **Push finished work forward.** For each In progress card whose `tessl/issue-<n>` PR is open: if In review is under its limit, move the card to In review. Otherwise leave it, still holding its In progress slot. That hold is the back-pressure.
3. **Pull new work.** While In progress is under its limit, take the oldest Ready card:
   - add the `tessl` label, which starts the agent;
   - set Status to In progress;
   - set Agent to Tessl.

Step 2 always runs before step 3, so a slot freed by review is filled in the same run.

The limits count every card in the column, including ones you dragged there yourself. Overriding by hand (adding the label and dragging the card) can go over the limit, and that's accepted.

## 3. What starts a run

| Trigger                                                                                      | Why                                                                                                                       |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `issues: closed`                                                                             | A merged PR frees a review slot, so pull the next card                                                                    |
| `pull_request_target: opened` (only `tessl/issue-` branches from the same repo, never forks) | The agent finished, so move its card to In review                                                                         |
| An outside schedule calling `workflow_dispatch` every 30 min                                 | Picks up cards you moved into Ready by hand. **User-owned boards send no events**, so this is the only way to notice them |
| `workflow_dispatch` by hand                                                                  | Manual runs, with a `dry_run` input that defaults to `true`                                                               |

**Don't rely on GitHub's `schedule:`.** It's best effort. GitHub's docs say scheduled runs can be delayed or dropped under load, and a dropped slot leaves no trace. In practice, most slots can go missing for hours at a time. Use an outside scheduler instead.

**Outside scheduler (any HTTP cron service, for example cron-job.org, which is free):**

- URL: `https://api.github.com/repos/<owner>/<repo>/actions/workflows/board-queue.yml/dispatches`
- Method: `POST`
- Headers:
  - `Authorization: Bearer <token>`
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
  - `Content-Type: application/json`
- Body: `{"ref":"main","inputs":{"dry_run":"false"}}`. Without `dry_run` set to `false`, every run only logs what it would do and changes nothing.
- Schedule: crontab `13,43 6-22 * * *`, timezone UTC. That's every 30 minutes from 06:13 to 22:43, off the busy :00 and :30. Adjust the hours to your working day.
- A successful call returns `204`. Turn on failure notifications.
- Token: a fine-grained token scoped to the one repo, with **Actions: Read and write** only. Note its expiry date somewhere.

**Cost:** each run is billed as 1 Actions minute on private repos. Every 30 minutes from 06:00 to 23:00 UTC is about 1,050 minutes a month, within the 2,000 included in the Free plan. Public repos aren't billed. Don't also add a `schedule:` trigger, or you'll pay for both whenever it fires.

## 4. Branch and PR naming

| Part         | Format                                                                                  | Example                            | Set by                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| **Branch**   | `tessl/issue-<n>`                                                                       | `tessl/issue-42`                   | The agent. Tessl's factory agent uses this pattern by default; confirm or configure yours |
| **PR title** | Conventional-commit style (`feat:`, `fix:`, `chore:`, `docs:`) with **no issue number** | `fix: handle empty search results` | The agent's instructions                                                                  |
| **PR body**  | Has `Closes #<n>`                                                                       | `Closes #42`                       | The agent's instructions                                                                  |

The branch is the only place the issue number has to appear. That one string ties the issue, the board card and the PR together, so the title doesn't need the number. GitHub already shows the linked issue, and squash merges then produce clean commit subjects like `fix: handle empty search results (#57)`, without a second number.

How each piece uses it:

1. **Moving a card to In review:** for In progress card `#n`, the script asks GitHub for an open PR with head `<owner>:tessl/issue-<n>`. It matches on the branch, never the title. The PR must come from the same repo, not a fork.
2. **The PR-opened trigger:** the workflow only runs for `pull_request_target` when `head.ref` starts with `tessl/issue-` and the head repo is this repo.
3. **Follow-up agents** (answering reviews, fixing CI) should match on the same prefix, and ideally the label too.
4. **Closing the issue:** `Closes #<n>` closes the issue when the PR merges. That fires `issues: closed`, the board moves the card to Done and frees a review slot, and the queue pulls more work in.

Instruction to give the agent:

> Title pull requests in conventional-commit style matching this repo's history (`docs: …`, `feat: …`, `fix: …`, `chore: …`), with no issue number in the title. Link the issue only with `Closes #<n>` in the body.

Keep the prefix identical in three places: the branch the agent creates, `BRANCH_PREFIX` in the script, and the `startsWith(…)` check in the workflow. If any of them differ, cards never move to In review. Nothing errors; they just stay put.

Branches you create yourself are ignored by the queue. Use any name you like, as long as it doesn't start with the prefix.

## 5. Safety rails

- **Pin the board by number _and_ check its title.** Stop before any change if the title doesn't match.
- **Check out the default branch inside the job.** That stops a PR from changing the code that runs with the project token, which matters under `pull_request_target`.
- **Use a `concurrency` group with `cancel-in-progress: false`**, so overlapping runs queue instead of racing.
- **Only touch this repo's issues.** Skip draft cards and cards from other repos, and log a warning with a count for cards it can't read.
- **Default the manual trigger to a dry run**, and log what each run would change.
- **Missing Status options means logging and stopping, not failing.**

## 6. Setup

1. **Board:** create a GitHub Project with a **Status** field holding the options Backlog, Ready, In progress, In review and Done. Add a single-select field **Agent** with an option **Tessl**. Turn on the project's built-in workflow that sets Status to Done when an issue closes.
2. **Secret:** save a classic personal access token with the `project` and `public_repo` scopes as the repo secret `PROJECT_TOKEN`, for example with `gh secret set PROJECT_TOKEN`. If the repo is private, use `repo` instead of `public_repo`. The token is yours, so labels the queue adds count as yours and start the factory. Note its expiry date: the queue quietly stops when it expires.
3. **Files:** add the workflow and script below. Edit the constants at the top of the script and the branch prefix in the workflow's `if:`. The script runs in Node, so add a block to `eslint.config.js` that gives `scripts/**` Node's globals, or `npm run check` fails on `process`.
4. **Agent:** make sure the agent starts when the label is added and names its branch `<BRANCH_PREFIX><issue-number>`.
5. **Test:** run the workflow by hand with `dry_run` ticked and check the log. Then run it for real, and then set up the outside schedule.

### Workflow: `.github/workflows/board-queue.yml`

```yaml
name: Board queue

on:
  issues:
    types: [closed]
  pull_request_target:
    types: [opened]
  workflow_dispatch:
    inputs:
      dry_run:
        description: Log what would change without changing anything
        type: boolean
        default: true

concurrency:
  group: board-queue
  cancel-in-progress: false

permissions:
  contents: read
  issues: write
  pull-requests: read

jobs:
  queue:
    # pull_request_target: only agent branches from this repo, never forks.
    # Keep the prefix in sync with BRANCH_PREFIX in the script.
    if: >-
      github.event_name != 'pull_request_target' ||
      (startsWith(github.event.pull_request.head.ref, 'tessl/issue-') &&
      github.event.pull_request.head.repo.full_name == github.repository)
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      # Always run the script from the default branch, so a PR can't change
      # the code that runs with PROJECT_TOKEN.
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.repository.default_branch }}
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
      - run: node scripts/board-queue.mjs
        env:
          PROJECT_TOKEN: ${{ secrets.PROJECT_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DRY_RUN: ${{ inputs.dry_run == true }}
```

### Script: `scripts/board-queue.mjs`

No dependencies; it uses Node's built-in `fetch`.

```js
#!/usr/bin/env node

// JIT board queue. Each run:
//   1. moves In progress cards that have an open <BRANCH_PREFIX><n> PR to In review,
//      while In review has fewer than REVIEW_LIMIT cards (oldest first);
//   2. fills free In progress slots from Ready (first in, first out), adding LABEL,
//      which starts the agent.

// --- Configure ---
const WIP_LIMIT = 3;
const REVIEW_LIMIT = 3;
const PROJECT_OWNER_TYPE = 'user'; // "user" or "organization"
const PROJECT_OWNER = 'your-login';
const PROJECT_NUMBER = 1; // from the board URL: .../projects/<number>
const PROJECT_TITLE = 'Your Board'; // must match exactly, or the run stops
const LABEL = 'tessl';
const BRANCH_PREFIX = 'tessl/issue-'; // keep in sync with the workflow's `if:`
const STATUS_FIELD = 'Status';
const STATUS = { ready: 'Ready', inProgress: 'In progress', inReview: 'In review' };
const AGENT_FIELD = 'Agent';
const AGENT_OPTION = 'Tessl';
// -----------------

const { PROJECT_TOKEN, GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;
const DRY_RUN = process.env.DRY_RUN === 'true';

async function request(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${url}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function graphql(query, variables = {}) {
  const body = await request('https://api.github.com/graphql', PROJECT_TOKEN, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}

const rest = (path, options) => request(`https://api.github.com${path}`, GITHUB_TOKEN, options);

const sameName = (a, b) => a?.toLowerCase() === b.toLowerCase();

async function findProject() {
  const data = await graphql(
    `
            query ($login: String!, $number: Int!) {
                owner: ${PROJECT_OWNER_TYPE}(login: $login) {
                    projectV2(number: $number) {
                        id
                        title
                        fields(first: 50) {
                            nodes {
                                ... on ProjectV2SingleSelectField {
                                    id
                                    name
                                    options {
                                        id
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
    { login: PROJECT_OWNER, number: PROJECT_NUMBER },
  );
  return data.owner?.projectV2;
}

async function loadItems(projectId) {
  const items = [];
  let cursor = null;
  do {
    const data = await graphql(
      `
        query ($id: ID!, $cursor: String, $status: String!) {
          node(id: $id) {
            ... on ProjectV2 {
              items(first: 100, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  content {
                    __typename
                    ... on Issue {
                      number
                      state
                      repository {
                        nameWithOwner
                      }
                    }
                  }
                  status: fieldValueByName(name: $status) {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      updatedAt
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { id: projectId, cursor, status: STATUS_FIELD },
    );
    const page = data.node.items;
    items.push(...page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);
  return items;
}

async function main() {
  if (!PROJECT_TOKEN) {
    console.log('PROJECT_TOKEN is not set; nothing to do.');
    return;
  }

  // Fail before any write if the pinned number doesn't point at the expected board.
  const project = await findProject();
  if (!project) throw new Error(`Project ${PROJECT_NUMBER} for ${PROJECT_OWNER} not found.`);
  if (project.title !== PROJECT_TITLE) {
    throw new Error(
      `Project ${PROJECT_NUMBER} is titled "${project.title}", expected "${PROJECT_TITLE}". Nothing was changed.`,
    );
  }

  const field = (name) => project.fields.nodes.find((f) => sameName(f.name, name));
  const option = (f, name) => f?.options.find((o) => sameName(o.name, name));
  const statusField = field(STATUS_FIELD);
  const agentField = field(AGENT_FIELD);
  const status = {
    ready: option(statusField, STATUS.ready),
    inProgress: option(statusField, STATUS.inProgress),
    inReview: option(statusField, STATUS.inReview),
  };
  const agent = option(agentField, AGENT_OPTION);
  if (!statusField || !status.ready || !status.inProgress || !status.inReview) {
    console.log(
      `${STATUS_FIELD} field or its Ready / In progress / In review options are missing; nothing to do.`,
    );
    return;
  }
  if (!agent)
    console.log(
      `Warning: no ${AGENT_FIELD} field with a ${AGENT_OPTION} option; it will not be set.`,
    );

  const setField = (item, fieldId, optionId) =>
    graphql(
      `
        mutation ($project: ID!, $item: ID!, $field: ID!, $option: String!) {
          updateProjectV2ItemFieldValue(
            input: {
              projectId: $project
              itemId: $item
              fieldId: $field
              value: { singleSelectOptionId: $option }
            }
          ) {
            projectV2Item {
              id
            }
          }
        }
      `,
      { project: project.id, item: item.id, field: fieldId, option: optionId },
    );

  const items = await loadItems(project.id);
  const inColumn = (opt) =>
    items
      .filter((i) => i.status?.name === opt.name)
      .sort((a, b) => a.status.updatedAt.localeCompare(b.status.updatedAt));
  const isOurIssue = (i) => i.content?.repository?.nameWithOwner === GITHUB_REPOSITORY;
  // Without access to the issue's repo, GitHub returns no content (or no repository) for the card.
  // Draft issues and other repos' issues are skipped on purpose and not counted here.
  const isUnreadable = (i) =>
    !i.content || (i.content.__typename === 'Issue' && !i.content.repository);

  const inProgress = inColumn(status.inProgress);
  let inProgressCount = inProgress.length;
  let inReviewCount = inColumn(status.inReview).length;
  console.log(
    `In progress: ${inProgressCount}/${WIP_LIMIT}, In review: ${inReviewCount}/${REVIEW_LIMIT}`,
  );
  const unreadable = [...inProgress, ...inColumn(status.ready)].filter(isUnreadable).length;
  if (unreadable > 0) {
    console.log(
      `Warning: ${unreadable} card(s) in Ready/In progress skipped: can't read their issue. If the repo is private, PROJECT_TOKEN needs the \`repo\` scope as well as \`project\`.`,
    );
  }
  if (DRY_RUN) console.log('Dry run: no changes will be made.');

  // 1. In progress -> In review, while In review has room.
  const [owner] = GITHUB_REPOSITORY.split('/');
  for (const item of inProgress.filter(isOurIssue)) {
    if (inReviewCount >= REVIEW_LIMIT) break;
    const n = item.content.number;
    const head = encodeURIComponent(`${owner}:${BRANCH_PREFIX}${n}`);
    const pulls = await rest(`/repos/${GITHUB_REPOSITORY}/pulls?state=open&head=${head}`);
    if (pulls.length === 0) continue;
    console.log(`#${n}: open PR ${pulls[0].html_url}, moving to In review`);
    if (!DRY_RUN) await setField(item, statusField.id, status.inReview.id);
    inReviewCount++;
    inProgressCount--;
  }

  // 2. Ready -> In progress, while In progress has room. Closed issues are skipped.
  const isOpen = (i) => i.content.state === 'OPEN';
  for (const item of inColumn(status.ready).filter(isOurIssue).filter(isOpen)) {
    if (inProgressCount >= WIP_LIMIT) break;
    const n = item.content.number;
    console.log(`#${n}: pulling from Ready into In progress`);
    if (!DRY_RUN) {
      // Read the issue again right before labeling, in case it closed during this run.
      const issue = await rest(`/repos/${GITHUB_REPOSITORY}/issues/${n}`);
      if (issue.state !== 'open') {
        console.log(`#${n}: closed since this run started; skipping`);
        continue;
      }
      // The label has to come from a person's account to start the factory, so it's
      // added with PROJECT_TOKEN, not GITHUB_TOKEN (which acts as github-actions[bot]).
      await request(
        `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${n}/labels`,
        PROJECT_TOKEN,
        {
          method: 'POST',
          body: JSON.stringify({ labels: [LABEL] }),
        },
      );
      await setField(item, statusField.id, status.inProgress.id);
      if (agent) await setField(item, agentField.id, agent.id);
    }
    inProgressCount++;
  }

  console.log(
    `Done. In progress: ${inProgressCount}/${WIP_LIMIT}, In review: ${inReviewCount}/${REVIEW_LIMIT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## 7. Gotchas

- **The label is added with `PROJECT_TOKEN`, not `GITHUB_TOKEN`.** A label added with `GITHUB_TOKEN` comes from `github-actions[bot]`. The Tessl factory only starts on a label from a person's account, so those cards would move to In progress and nothing would happen. In testing, this was the first thing that needed changing.
- **Project fields:** `fields(first: 50)` reads every field, because GitHub allows at most 50 fields on a project.
- **Org-owned boards:** set `PROJECT_OWNER_TYPE` to `"organization"`. Org boards can send `projects_v2_item` webhooks, but this design doesn't need them.
- **Renaming the board** stops every run until `PROJECT_TITLE` is updated. That's deliberate.
- **Overnight:** outside the scheduler's hours, only events start runs. Cards moved into Ready late wait until the first slot the next morning, unless you run the workflow by hand.

## 8. Trade-offs chosen deliberately

- First in, first out by when a card entered Ready, not by its position in the column. That makes it easy to reason about, but to reprioritize you have to move cards out of Ready and back.
- A PR existing counts as "done enough" for In review. Draft PRs and CI status aren't checked.
- It's built for one operator at low throughput, with no handling for edge cases.
