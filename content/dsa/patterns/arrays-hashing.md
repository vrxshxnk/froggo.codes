---
module: arrays-hashing
title: Arrays & Hashing
readTime: 8
summary: Hash maps and sets turn "search the whole array" into a single O(1) lookup. Learn the four questions they answer, and most problems in this stage stop being puzzles and start being patterns.
---

## Why this stage comes first

Almost every array problem starts with the same slow idea: *for each element, scan the rest of the array*. That's two nested loops, O(n²).

This stage teaches the most important speed-up in interviews: **remember what you've already seen, so you never scan twice.** The tools are the hash set and the hash map. Once you see them clearly, problems like *Two Sum* go from "how?" to "obviously".

## Hash sets and hash maps in one minute

Think of a **hash set** as a guest list at a door. Asking "is Priya on the list?" takes the same time whether the list has 10 names or 10 million, because the bouncer doesn't read the list top to bottom — they jump straight to where "Priya" would be.

A **hash map** is the same guest list, but each name has a note next to it: a seat number, a count, an index.

| Operation | Array / list | Hash set / map |
|---|---|---|
| "Is x in here?" | O(n) — scan | **O(1)** average |
| Insert x | O(1) at the end | **O(1)** average |
| Get the value stored for x | O(n) — scan | **O(1)** average |
| Keep things in order | ✓ | ✗ (no order guarantee) |

**The price:** extra memory, O(n) in the worst case. Trading memory for time is the whole game in this stage.

| Language | Hash set | Hash map |
|---|---|---|
| Python | `set()` | `dict`, `defaultdict`, `Counter` |
| C++ | `unordered_set` | `unordered_map` |
| Java | `HashSet` | `HashMap` |
| JavaScript | `Set` | `Map` |

## The four questions

Almost every problem here boils down to one of four questions about the elements you've already passed.

### 1. "Have I seen x before?" → hash set

*Contains Duplicate*, *Longest Consecutive Sequence*, *Valid Sudoku*.

```python
seen = set()
for x in nums:
    if x in seen:
        ...          # x is a repeat
    seen.add(x)
```

### 2. "Where did I see x?" → hash map of value → index

*Two Sum*. For each element, compute the exact partner you need and look it up.

```python
index_of = {}
for i, x in enumerate(nums):
    if target - x in index_of:
        return [index_of[target - x], i]
    index_of[x] = i  # store AFTER checking, so x can't pair with itself
```

### 3. "How many times have I seen x?" → hash map of value → count

*Valid Anagram*, *Top K Frequent Elements*, *Subarray Sum Equals K*, *Same Differences*.

```python
count = {}
for x in nums:
    count[x] = count.get(x, 0) + 1
```

If the values are tiny and known in advance (like 26 lowercase letters), use a plain array instead of a map: `count[ord(c) - ord('a')] += 1`.

### 4. "Which group does x belong to?" → hash map of key → list

*Group Anagrams*. Design a **key** that is identical for everything in the same group, then bucket by it.

```python
groups = defaultdict(list)
for word in words:
    groups["".join(sorted(word))].append(word)
```

## Prefix sums: the other half of this stage

A **prefix sum** array stores the running total: `prefix[i] = nums[0] + … + nums[i]`. Its superpower is that **any subarray sum is a subtraction**:

```
sum of nums[l..r] = prefix[r] − prefix[l − 1]
```

Combine that with question 3 and you get *Subarray Sum Equals K*: "how many earlier prefixes equal `prefix − k`?" *Product of Array Except Self* uses the same idea with products from both ends.

## How to recognise this pattern

Reach for a hash map or set when you see:

- "find a **pair** / two elements such that…"
- "any **duplicates**", "**unique**", "first repeated"
- "**anagram**", "same letters", "frequency", "most common"
- "**group** the items that…"
- "number of **subarrays** with sum…" (prefix sum + map)
- an O(n²) brute force where the inner loop is just **searching** for something

## The mistakes everyone makes

1. **Inserting before checking.** In pair problems, look up first, then insert — otherwise an element pairs with itself.
2. **Using a set when you need counts.** If the same value can matter more than once, you need a map.
3. **Unhashable keys.** Python lists and Java arrays can't be used directly as keys. Use a string or tuple (Python) or a `String` (Java).
4. **Forgetting the seed.** Prefix-sum counting needs `{0: 1}` for subarrays that start at index 0.
5. **Overflow.** Counting pairs can exceed 2³¹ − 1. Use 64-bit integers.

## Your path through this stage

| Problem | What it teaches |
|---|---|
| Two Sum | Question 2: look up the exact partner |
| Contains Duplicate | Question 1: the hash set |
| Valid Anagram | Question 3 with a fixed 26-slot array |
| Group Anagrams | Question 4: design a canonical key |
| Top K Frequent Elements | Counting, then bucket sort to skip sorting |
| Product of Array Except Self | Prefix and suffix products |
| Subarray Sum Equals K | Prefix sums + question 3 — the stage's boss |
| Valid Sudoku | Many sets at once, 2-D → box index |
| Longest Consecutive Sequence | A set plus "only start at the start" |
| Same Differences (Codeforces) | Rearranging an equation into a key |

Try each problem for its time box before opening the walkthrough. If you're stuck, take one hint at a time — the struggle is where the pattern sticks.
