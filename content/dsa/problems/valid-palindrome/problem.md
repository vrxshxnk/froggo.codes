---
id: lc-125
title: Valid Palindrome
pattern: Two pointers from both ends
timeBox: 15
summary: Decide whether a sentence reads the same forwards and backwards once you ignore case and everything that isn't a letter or digit.
hints:
  - "A palindrome's first character must match its last, its second must match its second-to-last, and so on. What do you need to compare, and in what order?"
  - "You don't have to build a cleaned-up copy of the string. Two indices, one at each end, can do the comparing in place."
  - "Put left at 0 and right at the end. Move each one inwards past anything that isn't a letter or digit, compare the two characters in lowercase, and stop early on the first mismatch."
insight: Compare the outermost valid characters and walk inwards. Skipping punctuation as you go means you never need a cleaned copy, so the extra space is O(1).
time: O(n)
space: O(1)
related: [lc-9, lc-167, lc-5]
---

## The problem in plain English

You get a string `s`. Pretend you first lowercase every letter and throw away every character that isn't a letter or a digit (spaces, commas, colons, quotes, underscores). Is what's left a **palindrome**, meaning it reads the same from both directions? Return `true` or `false`.

Constraints that matter: `s` can be up to 2·10⁵ characters of printable ASCII. A string with no letters or digits at all counts as an empty string, and an empty string is a palindrome.

Example: `"A man, a plan, a canal: Panama"` becomes `"amanaplanacanalpanama"`, which is a palindrome, so the answer is `true`. `"race a car"` becomes `"raceacar"`, which is not.

## Start with brute force

The direct way: build the cleaned string (lowercase, letters and digits only), reverse it, and compare.

```python
clean = [c.lower() for c in s if c.isalnum()]
return clean == clean[::-1]
```

This is correct and already O(n) time. Its only cost is **O(n) extra memory**: you store a cleaned copy and then a reversed copy. Interviewers often accept it as a first answer and then ask, "can you do it without the extra copies?" That's the real question.

## Building the intuition

What does "reads the same backwards" actually say? Write out a palindrome and draw lines between matching characters:

```text
r a c e c a r
| | | ^ | | |
first matches last, second matches second-to-last, ...
```

So checking a palindrome is just **comparing pairs from the outside in**. The reversed copy was only a roundabout way to line those pairs up.

You can line them up yourself with two indices: `left` starting at the front and `right` at the back. Compare, then move both one step inwards. When they meet, every pair has been checked.

Now add the messy part, the characters you're supposed to ignore. You don't need to delete them. When `left` is sitting on a comma, just step it forward. When `right` is on a space, step it back. Each pointer skips the junk on its own side before you compare.

That's the core of the **opposite-end pointers** family you'll use all through this stage. Each comparison settles both ends for good, so the search space shrinks from both sides.

## The optimal approach

1. Set `left = 0` and `right = len(s) - 1`.
2. While `left < right`:
   - move `left` forward while it's on a non-alphanumeric character (and still `left < right`);
   - move `right` backward the same way;
   - if `s[left]` and `s[right]` differ after lowercasing, return `false`;
   - otherwise move both inwards: `left += 1`, `right -= 1`.
3. If the loop ends, every pair matched. Return `true`.

**The subtle detail:** the inner skipping loops also check `left < right`. Without it, a string like `".,"` or `"   "` lets `left` run off the end of the string looking for a letter that isn't there. With the guard, the pointers just meet and the answer is `true`, which is correct: an empty cleaned string is a palindrome.

{{code}}

## Dry run

`s = "race a car"`. The indices are `r0 a1 c2 e3 _4 a5 _6 c7 a8 r9`, where `_` stands for a space.

| left | right | After skipping | Compare | Result |
|---|---|---|---|---|
| 0 | 9 | 0, 9 | `r` vs `r` | match, move in |
| 1 | 8 | 1, 8 | `a` vs `a` | match, move in |
| 2 | 7 | 2, 7 | `c` vs `c` | match, move in |
| 3 | 6 | right skips the space at 6, so 3, 5 | `e` vs `a` | **mismatch** → `false` |

Three pairs matched, and the fourth didn't. We never built a cleaned copy.

## Complexity

- **Time: O(n).** `left` only moves right and `right` only moves left, and they stop when they meet. Together they take at most n steps, skips included.
- **Space: O(1).** Two integers. No copies of the string.

## Edge cases and traps

- **Digits count.** `"0P"` is `false`: `0` and `p` are both kept and they differ. Use `isalnum`, not `isalpha`.
- **Only punctuation or spaces.** `" "` or `".,"` is `true`. Keep the `left < right` guard inside the skipping loops.
- **Case.** Compare `lower(s[left])` with `lower(s[right])`. `'A'` and `'a'` must match.
- **Underscores and quotes are junk.** `"ab_a"` is `true`, because `_` is neither a letter nor a digit.
- **C++ `isalnum` on `char`.** Cast to `unsigned char` first. Passing a negative `char` to `isalnum` is undefined behaviour.

## Say it in the interview

> "A palindrome means the first character matches the last, the second matches the second-to-last, and so on. So I'll use two pointers, one at each end. Each pointer skips anything that isn't a letter or digit, then I compare the two characters in lowercase and return false on the first mismatch. If the pointers meet, it's a palindrome. That's O(n) time and O(1) space, because I never build a cleaned copy of the string."

## Follow-ups interviewers ask

- **"What if you may delete at most one character?"** That's Valid Palindrome II. On the first mismatch, try skipping either the left character or the right one, and check whether the rest is a palindrome. Still O(n).
- **"Find the longest palindromic substring instead."** You need a different idea, expanding outwards from every centre. You'll meet it as *Longest Palindromic Substring* in the Dynamic Programming stage.
- **"What about Unicode?"** Then "letter" and "lowercase" depend on the language. You'd use the language's Unicode-aware character functions, and possibly normalise accents first.
