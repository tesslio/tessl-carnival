---
name: test-health
description: Find weak, dead or misleading tests in the carnival and file a GitHub issue for each one worth repairing. Use when running the test health maintenance loop, or when asked whether the tests actually check what they claim to. Files issues only; never changes code or tests.
---

# Test health

A test that can't fail is worse than no test: it says the code is covered when
it isn't. Your job is to find tests like that and file issues. Don't fix
anything yourself: the factory ships the fixes.

## What to look for

Read every `*.test.ts` file under `src/`. For each test, ask whether it would
fail if the behaviour its name describes broke.

- **Can't fail:** the assertion is true whatever the code does, for example
  comparing a value with itself, or an expectation that always holds.
- **Checks nothing:** no assertions, or assertions on a value the test set up
  itself rather than on what the code returned.
- **Says one thing, checks another:** the name promises a behaviour the body
  doesn't test.
- **Switched off:** `it.skip`, `describe.skip`, `it.todo` or commented-out tests.

To confirm a suspect test, think through or try a small change to the code
under test that breaks the behaviour, and check whether the test would still
pass. Undo any change you try.

## What to file

- **One issue per problem test.** Group several only when they share one cause
  in the same file.
- **Title:** `Tests: <test name> can't catch a broken <behaviour>`.
- **Body:** the file and line, why the test can't fail, the behaviour it should
  check, and a "Done when" saying the test fails if that behaviour breaks and
  `npm run check` passes.
- **No duplicates.** Check the open issues first.
- **Nothing found is a fine result.** Say so, and file nothing.
