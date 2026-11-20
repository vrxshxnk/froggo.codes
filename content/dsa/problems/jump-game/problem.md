---
id: lc-55
title: Jump Game
pattern: Greedy farthest reach
timeBox: 25
summary: Each square says how far you may jump from it; decide whether you can get from the first index to the last.
hints:
  - "If you can reach index 5, can you also reach index 3? Think about what the set of reachable squares looks like."
  - "The reachable squares are always one solid block starting at 0. So you only need to track one number: the right edge of that block."
  - "Walk left to right keeping reach, the farthest index you can get to. If i ever goes past reach, you're stuck: return false. Otherwise update reach = max(reach, i + nums[i]). If reach covers the last index, return true."
insight: The squares you can reach always form one unbroken block from index 0, so you only need its right edge. Sweep once, pushing the edge out with i + nums[i]; if you ever walk past it, there's a gap you can't cross.
time: O(n)
space: O(1)
related: [lc-53, lc-70, lc-198]
---

## The problem in plain English

You start on index 0 of an array `nums`. From index `i` you can jump forward by **any** distance from 1 up to `nums[i]` (and `nums[i]` may be 0, meaning you can't move from there). Return `true` if you can reach the last index, `false` otherwise.

`n` is up to 10⁴ and each jump value is between 0 and 10⁵.

Examples:

- `[2, 3, 1, 1, 4]` → `true`. Jump 1 step to index 1, then 3 steps to index 4.
- `[3, 2, 1, 0, 4]` → `false`. Every path lands on index 3, whose value is 0, and nothing can jump over it.

## Start with brute force

Work out, for each index, whether it's reachable. Mark index 0 reachable. Then for each reachable `i`, mark every index from `i + 1` to `i + nums[i]` reachable. Return whether the last index got marked.

It's correct, but every reachable index may mark up to `n` others: O(n²). With `n = 10⁴` that's 10⁸ steps, slow but borderline. A recursive "try every jump" version without memoisation is exponential.

## Building the intuition

Look at what the marking actually produces. Say index 0 has value 3. It marks 1, 2, 3. Not "1 and 3", but **everything up to 3**, because you can jump any distance up to the limit.

Now say index 2 has value 4. It marks 3, 4, 5, 6. Again a solid run, and it joins onto the block you already had.

So the reachable squares are always **one solid block** `[0, reach]`. No holes, ever. A jump from inside the block reaches every square between itself and its landing point.

That means the whole array of marks collapses into a single number, `reach`: the right edge of the block. Walk left to right:

- If `i ≤ reach`, square `i` is reachable, and it might push the edge out to `i + nums[i]`.
- If `i > reach`, there's a gap. Every square before `i` has been considered, none can carry you to `i`, and so nothing beyond `i` can be reached either. Answer `false`.

Is this greedy? Sort of. We never commit to a path, so there is nothing to regret. We just keep the best frontier anyone could reach. That's the cleanest kind of greedy: one where the "choice" is simply "keep the max".

## The optimal approach

1. `reach = 0`.
2. For each index `i`:
   - if `i > reach`, return `false`;
   - `reach = max(reach, i + nums[i])`;
   - if `reach ≥ n − 1`, return `true`.
3. After the loop, return `true`. In practice the early return always fires first: by the last index, `reach` is at least `n − 1`.

The subtle detail is **checking `i > reach` before using `nums[i]`**. A square past the frontier might hold a huge number, and if you update `reach` from it, you're pretending you stood on a square you can't reach.

{{code}}

## Dry run

`nums = [3, 2, 1, 0, 4]`, `n = 5`, last index 4.

| i | nums[i] | i > reach? | i + nums[i] | reach after |
|---|---|---|---|---|
| 0 | 3 | 0 > 0? no | 3 | 3 |
| 1 | 2 | 1 > 3? no | 3 | 3 |
| 2 | 1 | 2 > 3? no | 3 | 3 |
| 3 | 0 | 3 > 3? no | 3 | 3 |
| 4 | 4 | **4 > 3? yes** | — | return **false** |

Every square tops out at index 3, and the zero there is a wall.

For `[2, 3, 1, 1, 4]`: at `i = 0`, reach becomes 2; at `i = 1`, reach becomes `1 + 3 = 4 ≥ 4`, so return `true` after two steps.

## Complexity

- **Time: O(n).** One pass with constant work per index.
- **Space: O(1).** Just `reach`.

## Edge cases and traps

- **One element.** `[0]` → `true`. You're already on the last index. The code returns `true` at `i = 0` because `reach = 0 ≥ 0`.
- **A zero that you can jump over.** `[2, 0, 0]` → `true`. Zeros only matter if the frontier stops on them.
- **A zero at the start.** `[0, 1]` → `false`. At `i = 1`, `1 > reach = 0`.
- **Updating reach from an unreachable square.** Check `i > reach` first, always.
- **Thinking you must land exactly on `nums[i]` steps.** You may jump *up to* `nums[i]`. That "up to" is what makes the reachable set solid.

## Say it in the interview

> "If I can reach some index, I can reach every index before it, because jumps can be any length up to the limit. So the reachable squares are always a prefix, and I only need its right edge. I sweep left to right with reach. If i goes past reach, there's a gap I can't cross, so it's false. Otherwise I extend reach to i plus nums[i], and once it covers the last index it's true. One pass, O(n) time, O(1) space."

## Follow-ups interviewers ask

- **"Return the minimum number of jumps (Jump Game II)."** Think of it as BFS in levels: everything reachable with one jump is a level, and the farthest point from that level ends the next one. Count the levels, still O(n).
- **"Can you do it backwards?"** Yes. Keep `goal = n − 1`; scan from right to left, and whenever `i + nums[i] ≥ goal`, set `goal = i`. The answer is `goal == 0`.
- **"What if you can jump backwards too, by exactly nums[i] either way (Jump Game III)?"** Then the reachable set isn't a prefix any more. Run a BFS or DFS over indices with a visited set.
