---
id: cf-71a
title: Way Too Long Words
pattern: Read words, abbreviate by length
timeBox: 15
summary: Shorten every word longer than 10 letters to its first letter, the count of letters in between, and its last letter.
hints:
  - "For each word, the only decision is: is it longer than 10 characters? Short words are printed unchanged."
  - "For a long word you need three things: its first character, its last character, and how many characters sit between them. How does that middle count relate to the word's length?"
  - "The middle count is length − 2. Print word[0], then that number, then word[length − 1], all glued together. Read n first, then loop n times."
insight: The abbreviation is just first letter + (length − 2) + last letter. The real lesson is reading a count followed by that many words, and building the output line by line.
time: O(total length of all words)
space: O(1) extra per word
related: [lc-412, lc-125, cf-282a]
---

## The problem in plain English

This is a **Codeforces** problem: read from standard input, print to standard output.

The first line has a number `n` (1 ≤ `n` ≤ 100). Then come `n` lines, each with one word of lowercase letters, 1 to 100 letters long.

A word is "too long" if it has **more than 10** letters. Replace each too-long word with its first letter, the number of letters between the first and last, and its last letter. Print every word (shortened or not) on its own line, in the input order.

Example: `localization` has 12 letters. Between `l` and `n` there are 10, so it becomes `l10n`. `word` has 4 letters, so it's printed as `word`.

## Building the intuition

Split the problem into two small jobs.

**Job 1: one word.** If `len(word) <= 10`, print it as is. Otherwise you need the first character, `word[0]`, and the last, `word[len − 1]`. How many are in between? All of them minus those two: `len − 2`. For `internationalization` (20 letters) that's `i` + `18` + `n` = `i18n`.

**Job 2: many words.** The first line tells you how many words follow. Read that count, then repeat job 1 that many times.

That's the whole program. The care is in the details: "more than 10" means 11 or more, and the middle count is a **number** you turn into text.

## The optimal approach

1. Read `n`.
2. Repeat `n` times:
   - read a word;
   - if its length is more than 10, output `word[0] + (length − 2) + word[length − 1]`;
   - otherwise output the word unchanged.
3. Print each result on its own line.

### Reading the input

The input is a number, then `n` words. The easiest way in every language is to read **tokens** (pieces separated by spaces or newlines):

```python
data = sys.stdin.read().split()   # ["4", "word", "localization", ...]
n = int(data[0])
words = data[1:n + 1]
```

```cpp
int n;
cin >> n;
string word;
cin >> word;                      // reads one word; call it in a loop
```

```java
BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
int n = Integer.parseInt(in.readLine().trim());
String word = in.readLine().trim(); // one line = one word here
```

```javascript
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean);
const n = Number(data[0]);        // data[1] .. data[n] are the words
```

`trim()` and `split()` throw away stray spaces and the `\r` that Windows line endings leave behind.

{{code}}

## Dry run

| word | length | > 10? | Output |
|---|---|---|---|
| `word` | 4 | No | `word` |
| `localization` | 12 | Yes | `l` + `10` + `n` = `l10n` |
| `internationalization` | 20 | Yes | `i` + `18` + `n` = `i18n` |

## Complexity

- **Time: O(total length).** We read each character once. At most 100 words of 100 letters.
- **Space: O(1) extra per word.** We only look at the current word.

## Edge cases and traps

- **Exactly 10 letters.** Not too long. `abcdefghij` stays as it is. Use `> 10`, not `>= 10`.
- **11 letters.** The shortest word that changes: `abcdefghijk` → `a9k`.
- **Length − 1 instead of − 2.** The middle count leaves out both ends.
- **Adding a char to a number in C++ or Java.** `word[0] + (len − 2)` adds character codes and prints a number. Convert the count with `to_string` / `String.valueOf`, or print the parts one after another.

## Say it in the interview

> "I read n, then n words. For each word longer than 10 characters I print its first character, then the length minus 2, then its last character. Shorter words go out unchanged. It's linear in the total input size."

## Follow-ups interviewers ask

- **"What if the threshold were a parameter k?"** Replace 10 with `k`. Nothing else changes.
- **"How would you expand `i18n` back?"** You can't uniquely. Many words share the same abbreviation, so you'd need a dictionary to check candidates against.
