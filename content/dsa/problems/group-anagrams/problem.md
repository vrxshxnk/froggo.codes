---
id: lc-49
title: Group Anagrams
pattern: Hash map with a computed key
timeBox: 20
summary: Put the given words into groups, where every word in a group is an anagram of the others.
hints:
  - "Two words belong in the same group exactly when they're anagrams. Can you turn each word into a 'signature' that's identical for all its anagrams?"
  - "Sorting the letters of a word gives a signature: 'eat', 'tea' and 'ate' all become 'aet'."
  - "Use a hash map from signature → list of words. Each word goes into the list for its signature. The answer is all the lists."
insight: Give every word a key that all of its anagrams share — its sorted letters, or its 26 letter counts — and let a hash map collect words by key.
time: O(n · k log k)
space: O(n · k)
related: [lc-242, lc-347, lc-1]
---

## The problem in plain English

You get a list of words, `strs`. Group the words that are anagrams of each other, and return the groups in any order.

`["eat", "tea", "tan", "ate", "nat", "bat"]` → `[["eat","tea","ate"], ["tan","nat"], ["bat"]]`

## Start with brute force

For each word, compare it against the first word of every existing group using the *Valid Anagram* check, and add it to the first group that matches. With `n` words of length `k`, that's up to `n²` comparisons of O(k) each — O(n² · k). Too slow for 10,000 words.

## Building the intuition

The brute force keeps asking "does this word belong with that word?" Instead, ask **"what label would every anagram of this word share?"**

If we can compute a label (a **key**) that is identical for all anagrams and different for everything else, a hash map does the grouping for free: `key → list of words`.

Two good keys:

1. **Sorted letters.** `"eat" → "aet"`, `"tea" → "aet"`, `"tan" → "ant"`. Costs O(k log k) per word.
2. **Letter counts.** A tuple of 26 counts, like `(1,0,0,0,1,…,1,…)`. Costs O(k) per word.

Sorting is simpler to write and explain, so it's what most people use in interviews. Mention counting as the optimisation.

## The optimal approach

1. Create a hash map `groups` from key → list of words.
2. For each word, compute `key = sorted letters of word`.
3. Append the word to `groups[key]` (create the list if it's new).
4. Return all the lists in the map.

{{code}}

## Dry run

`["eat", "tea", "tan", "ate", "nat", "bat"]`

| word | key | `groups` after |
|---|---|---|
| eat | aet | aet: [eat] |
| tea | aet | aet: [eat, tea] |
| tan | ant | aet: [eat, tea], ant: [tan] |
| ate | aet | aet: [eat, tea, ate], ant: [tan] |
| nat | ant | …, ant: [tan, nat] |
| bat | abt | …, abt: [bat] |

Result: the three lists.

## Complexity

With `n` words of maximum length `k`:

- **Time: O(n · k log k)** using sorted keys — we sort every word once. With counting keys it's **O(n · k)**.
- **Space: O(n · k)** — the map stores every word once, plus its key.

## Edge cases and traps

- **Empty string `""`.** Its key is `""`, so all empty strings form one group. That's correct.
- **Single word.** One group containing it.
- **Using a list as a key.** In Python, lists aren't hashable — convert to a string or a tuple. In Java, use a `String`, not a `char[]` (arrays compare by reference).
- **Counting keys without separators.** If you build a string from counts like `"1" + "11"`, different counts can collide (`1,11` vs `11,1`). Put a separator between counts.

## Say it in the interview

> "Anagrams share the same sorted letters, so I use that as a key. I walk the words once, sort each word to get its key, and append the word to a hash map entry for that key. The map's values are the groups. That's O(n · k log k). If words are long, I can use a 26-count signature instead of sorting to get O(n · k)."

## Follow-ups interviewers ask

- **"Can you avoid sorting?"** Use the 26-count signature as the key.
- **"What if the input is a stream of words?"** The same map works incrementally — each word is placed in O(k log k).
- **"Return only groups with more than one word?"** Filter the map's values at the end.
