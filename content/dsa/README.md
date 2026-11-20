# DSA walkthroughs — how to write one

Every problem on the DSA roadmap gets a walkthrough page at `/dsa/<slug>`, and every
stage gets a pattern primer at `/dsa/patterns/<module-id>`. The bar: **a student who
reads our page needs no other sheet, video or editorial.** `problems/two-sum/` and
`patterns/arrays-hashing.md` are the reference examples — match their voice and depth.

## Folder layout

```
content/dsa/
  patterns/<module-id>.md          one primer per roadmap stage
  problems/<slug>/
    problem.md                     frontmatter + explanation
    solution.py  solution.cpp  solution.java  solution.js
    tests.json                     test cases (see "Tests")
    check.mjs                      optional: only when many answers are valid
```

**Slug:** the problem title in kebab-case (`two-sum-ii-input-array-is-sorted`, `3sum`).
Codeforces problems: `cf-<id>-<title>` (`cf-279b-books`).

## problem.md

### Frontmatter

```yaml
---
id: lc-167                 # must match the item id in src/data/roadmaps.js
title: Two Sum II - Input Array Is Sorted
pattern: Two pointers from both ends     # 2–6 words
timeBox: 20                # minutes to try before reading: Easy 15, Medium 25, Hard 40
summary: One sentence, plain English, what the problem asks.
hints:                     # exactly 3, each stronger than the last; the third nearly gives the approach, never code
  - "..."
  - "..."
  - "..."
insight: One or two sentences — the single idea that cracks it.
time: O(n)
space: O(1)
related: [lc-1, lc-15]     # 2–4 roadmap item ids (any stage) that use the same idea
---
```

Quote any YAML string that contains `:`, `#`, starts with a symbol, or contains quotes
(use double quotes and escape inner `"` as `\"`).

### Body sections (all `##`, in this order)

1. `## The problem in plain English` — **in our own words, never copied from LeetCode.**
   Inputs, output, constraints that matter, then one worked example.
2. `## Start with brute force` — the obvious approach, why it's correct, why it's too slow
   (give a concrete number: "n = 10⁵ means 10¹⁰ steps").
   Skip only when there's genuinely one sensible approach (some Basics problems).
3. `## Building the intuition` — how a student would *discover* the trick themselves.
   This is the most important section. Lead them to the idea; don't just state it.
4. `## The optimal approach` — numbered steps, then the one subtle detail explained.
5. `{{code}}` — on its own line, exactly once. The page renders the 4-language tabs here.
6. `## Dry run` — a table walking one example step by step. Include it for anything where
   the mechanics aren't obvious (pointers, windows, stacks, DP tables, recursion). Skip it
   for trivial problems.
7. `## Complexity` — time and space, each with the *reason*.
8. `## Edge cases and traps` — the bugs students actually write. Bullets, bold lead-ins.
9. `## Say it in the interview` — a blockquote, ~30 seconds spoken, first person.
10. `## Follow-ups interviewers ask` — 1–3 bullets, each with a short answer.

`###` subheadings are fine inside a section. Only `##` shows up in the page's table of contents.

### Voice

- Talk to one student. Short sentences. Plain words. Explain every term the first time.
- Concrete over abstract: numbers, tiny examples, "at i = 3 the window is [2, 5]".
- Refer to other problems by **title** and stages by **name** ("the Binary Search stage").
  Never write day numbers in the body — they're computed and can change.
- No claims you can't back up ("asked at Google 40 times", "a third of interviews").
- Length: 600–1000 words for most problems, 300–500 for Basics, up to ~1300 for Hards.
- Fenced code inside markdown: only `python`, `cpp`, `java`, `javascript` or `text`.
- No HTML, no images. Use tables and inline code.

## Solutions

All four languages implement **the same algorithm**, with the same variable names where the
language allows, and comments that explain *why* (not *what*). A student should be able to
read the Python and then the C++ and see the same idea.

- **LeetCode problems:** exactly LeetCode's class and method signature, so students can paste
  it straight in.
  - **C++:** no `#include` or `using namespace std;` — the test harness adds them, LeetCode
    does too.
  - **Java:** no imports — the harness adds `java.util.*`, `java.util.function.*` and
    `java.util.stream.*`.
  - **Python:** must run on Python 3.9: no `match`, no `int | None`; use `Optional[int]`.
    Typing names (`List`, `Optional`) need no import, matching LeetCode. Import everything
    else at the top of the file (`from collections import deque`, `import heapq`).
  - **JavaScript:** LeetCode style, `var name = function (...) { ... };`. Design problems use
    `class Name { ... }`.
  - **Never define `ListNode`, `TreeNode` or `Node`.** The harness defines them exactly as
    LeetCode does. JavaScript's LeetCode name for 133/138's node is `_Node`; use `new _Node(...)`.
- **Codeforces problems:** complete stdin/stdout programs.
  - **C++:** `#include <bits/stdc++.h>`, plus fast I/O.
  - **Java:** `public class Main`, with a fast reader (`BufferedReader` + `StreamTokenizer`, or
    `DataInputStream`).
  - **Python:** read with `sys.stdin`.
  - **JavaScript:** read with `require("fs").readFileSync(0, "utf8")`.
- Use `long` / `long long` wherever a sum or product can pass 2³¹.

## Tests

`tests.json` drives `node scripts/test-dsa-solutions.mjs <slug>`, which runs all four
languages. The full format and every supported type are documented at the top of
`scripts/test-dsa-solutions.mjs`.

- Include 6–12 cases:
  - LeetCode's own examples;
  - edge cases (empty, single element, all equal, negatives, `INT_MIN`/`INT_MAX`, duplicates);
  - a few random medium-size cases.
- **Compute expected outputs independently.** Use a brute force you write separately, or work
  them out by hand. Never run the solution under test to produce them. A wrong solution must
  be able to fail.
- Keep function-mode inputs under ~2,000 elements (they're compiled into C++/Java source).
  Codeforces stdio tests can be large; include one near the max constraints, to prove the
  complexity.
- Pick the right `compare`:
  - `unordered`: any order of a flat list;
  - `unordered-outer`: any order of rows, but each row exactly as given (permutations, cells);
  - `unordered-groups`: any order at both levels (subsets, combination sums, anagram groups);
  - `float`;
  - `u32`.
- If valid answers can't be enumerated (any valid topological order, say), ship `check.mjs`:
  `export default function check(input, actual, expected) { return boolean }`.

## Primers (`patterns/<module-id>.md`)

```yaml
---
module: two-pointers-window      # the roadmap module id
title: Two Pointers & Sliding Window
readTime: 8                      # minutes
summary: One or two sentences — what this stage teaches and why it matters.
---
```

Sections (`##`):
- **Why this stage matters:** what slow idea it replaces.
- **The core idea:** an everyday analogy first, then the precise version.
- **The templates:** one to four reusable code shapes in Python, each with when to use it.
- **How to recognise this pattern:** the signals in a problem statement.
- **The mistakes everyone makes**
- **Your path through this stage:** a table with columns Problem / What it teaches, listing
  every problem by title in roadmap order.

Aim for 900–1500 words.

## Checklist before you're done

```bash
node scripts/test-dsa-solutions.mjs <your slugs>    # every language ✓
node scripts/check-dsa-content.mjs                  # frontmatter, sections, ids, links
```
