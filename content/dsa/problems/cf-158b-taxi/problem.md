---
id: cf-158b
title: Taxi
pattern: Greedy pairing by counts
timeBox: 20
summary: Groups of 1 to 4 children must each ride together in taxis that seat 4; find the fewest taxis.
hints:
  - "Group sizes are only 1, 2, 3 or 4. Forget the order of the input: what are the only things worth knowing?"
  - "Count how many groups of each size there are. Handle the biggest groups first, because they have the fewest possible partners. Who can share a taxi with a 3?"
  - "4s ride alone. Each 3 takes a taxi and gives its free seat to a 1 if any are left. Pair 2s with 2s. A leftover 2 takes up to two 1s. The remaining 1s go four per taxi (round up)."
insight: Sizes are tiny, so only the counts matter. Fill taxis biggest-first with the only partners that fit (3 with 1, 2 with 2, a spare 2 with two 1s), and an exchange argument shows no other pairing can do better.
time: O(n)
space: O(1)
related: [lc-1, lc-621, cf-1520d]
---

## The problem in plain English

There are `n` groups of children (`1 ≤ n ≤ 10⁵`). Group `i` has `s_i` children, where `s_i` is 1, 2, 3 or 4. Every taxi holds **at most 4** passengers. A group can't be split: all its children ride in the same taxi. One taxi can carry several groups. Print the minimum number of taxis.

Input: `n` on the first line, then the `n` group sizes. Output: one number.

Example: groups `1 2 4 3 3` → `4` taxis: `{4}`, `{3, 1}`, `{3}`, `{2}`.

## Start with brute force

Try every way of assigning groups to taxis and keep the smallest valid one. That's a version of **bin packing**, and the number of assignments grows exponentially. Even a cleverer search over counts of each size would have about `(n/4)⁴` states. Hopeless for `n = 10⁵`.

## Building the intuition

First, notice what doesn't matter: the order of the groups. All you need is **how many groups of each size** there are. Call them `c1, c2, c3, c4`.

Now handle the hardest groups first. The bigger a group, the fewer partners it can have.

- **A 4** fills a taxi alone. `c4` taxis, no choice.
- **A 3** needs its own taxi, since two 3s would be 6. Its taxi has exactly one free seat, and only a 1 fits there. So `c3` taxis, and each one soaks up a 1 if there are any left.
- **A 2** fits perfectly with another 2. So `c2 / 2` taxis, rounded down.
- **One leftover 2** (if `c2` is odd) gets a taxi with two free seats, which two 1s can use.
- **The remaining 1s** go four to a taxi: `ceil(ones / 4)`.

Why is "give the 3's spare seat to a 1" always safe? Here is the **exchange argument**, the standard way to defend a greedy choice. Take any optimal plan where some 3 rides with an empty seat while a 1 rides somewhere else. Move that 1 into the 3's taxi. The 1's old taxi loses a passenger. It's still valid, and maybe it's empty now. The number of taxis didn't go up. So there's always an optimal plan that does what our greedy does, and the same trick works for every step.

You can also sanity-check the answer against two lower bounds: you need at least `c4 + c3` taxis (no two of those groups can share), and at least `ceil(total children / 4)`.

The pairing is the same "complement" thinking as *Two Sum*: each group's ideal partner is the one that brings the taxi to exactly 4.

## The optimal approach

1. Count `c[1..4]`.
2. `taxis = c4`.
3. `taxis += c3`; `ones = max(0, c1 − c3)`.
4. `taxis += c2 / 2` (integer division).
5. If `c2` is odd: `taxis += 1`, `ones = max(0, ones − 2)`.
6. `taxis += ceil(ones / 4)`, written as `(ones + 3) / 4` with integers.

The subtle detail is the **`max(0, …)`** in steps 3 and 5. When there are more 3s than 1s, `c1 − c3` goes negative, and a negative count of ones would quietly *subtract* taxis in step 6.

{{code}}

## Dry run

Groups `2 3 4 4 2 1 3 1`: `c1 = 2, c2 = 2, c3 = 2, c4 = 2`.

| Step | What happens | taxis | ones left |
|---|---|---|---|
| 4s | two taxis, one per 4 | 2 | 2 |
| 3s | two taxis, each takes a 1 | 4 | 0 |
| 2s in pairs | `2 / 2 = 1` taxi | 5 | 0 |
| leftover 2? | `c2` is even, no | 5 | 0 |
| remaining 1s | `ceil(0 / 4) = 0` | **5** | 0 |

Check: 20 children need at least `ceil(20 / 4) = 5` taxis, so 5 is optimal.

For the first example, `1 2 4 3 3`: `c1 = 1, c2 = 1, c3 = 2, c4 = 1`. Taxis: 1 (the 4), then +2 (the 3s, one of which takes the only 1), then 0 pairs of 2s, then +1 for the leftover 2. Total **4**.

## Complexity

- **Time: O(n).** One pass to count. The rest is constant work.
- **Space: O(1).** Five counters.

## Edge cases and traps

- **More 3s than 1s.** `3 3 1` → 2. Clamp `ones` at 0.
- **Ceiling division.** Five 1s need 2 taxis, not 1. `(ones + 3) / 4`, or `Math.ceil` in JavaScript.
- **The lonely 2.** `2 2 2` → 2 taxis: one for a pair, one for the leftover. Forgetting the odd case gives 1.
- **Only ever pairing two groups.** A "sort, then match biggest with smallest" two-pointer fills each taxi with at most two groups. `1 1 1 1` needs just 1 taxi, not 2.
- **Slow input.** 10⁵ numbers: use `sys.stdin` in Python and a fast reader in Java.

## Say it in the interview

> "Group sizes are only 1 to 4, so I just count each size. I fill taxis biggest-first, because big groups have the fewest possible partners. 4s ride alone. Each 3 needs its own taxi, and its one spare seat goes to a 1. 2s pair up. A leftover 2 takes up to two 1s, and the remaining 1s go four per taxi, rounded up. Each step is safe by an exchange argument: if an optimal plan left a seat empty that one of our ones could take, moving that 1 in never adds a taxi. It's O(n) to count and O(1) after that."

## Follow-ups interviewers ask

- **"What if groups could split up?"** Then it's just `ceil(total / 4)`.
- **"What if group sizes and capacity were arbitrary?"** That's general bin packing. There's no known fast exact algorithm, and simple greedy rules like "first fit, biggest first" are only approximately optimal. This problem is easy only because sizes 1–4 leave almost no choices.
- **"How would you test a greedy like this?"** Write a slow, obviously-correct search for small inputs: try every way to fill one taxi from the counts, recurse on what's left, take the minimum. Compare it with the greedy on thousands of random small cases. If a greedy is wrong, this finds a counterexample within seconds.
