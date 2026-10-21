---
name: rule-mining
description: Read recent code review on this repository's pull requests, find the mistakes reviewers keep catching, and file a GitHub issue proposing a rule so agents get it right next time. Use when running the rule mining maintenance loop, or when asked what the agent keeps getting wrong in review. Files issues only; never changes code or docs.
---

# Rule mining

When review catches the same mistake twice, the agent didn't know a rule. Write
the rule down and the next run gets it right first time. Your job is to spot
those repeats and propose the rule as an issue. Don't add the rule yourself:
the factory ships it once someone agrees.

## What to read

Look at this repository's 15 most recent pull requests, open or closed, using
the GitHub CLI (`gh pr list --state all`) or whatever GitHub access you have.
For each one, read:

- the review comments and their replies, from people and from review bots;
- the commits pushed after a review, which show what was fixed.

Skip findings that were refuted or declined in their replies.

## What counts as a repeat

The same kind of mistake caught on **two or more different pull requests**,
for example a game that reads local storage directly, or a colour that skips
the theme. One-off bugs don't count. Neither does anything `AGENTS.md` or a
skill already states clearly, unless agents keep breaking it anyway: then the
rule needs to be clearer or more prominent, and that's worth filing too.

## What to file

- **One issue per rule.**
- **Title:** `Rule: <the rule in a few words>`.
- **Body:** the rule in one or two plain sentences; links to the pull requests
  and review comments where it was caught; and where it should live, usually
  `AGENTS.md`, a skill under `skills/`, or the repository's code review lenses.
  End with a "Done when" saying the rule is written down there.
- **No duplicates.** Check the open issues first.
- **Nothing found is a fine result.** Early in a repository's life there may be
  too few reviews to show a pattern. Say so, and file nothing.
