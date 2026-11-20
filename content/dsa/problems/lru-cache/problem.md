---
id: lc-146
title: LRU Cache
pattern: Hash map plus doubly linked list
timeBox: 25
summary: Design a fixed-size key-value store that, when full, throws out the entry that was used least recently, with get and put both in O(1).
hints:
  - "You need two things in O(1): find a key's value, and know which key was used longest ago. No single structure does both. Which structure does each job?"
  - "A hash map finds keys in O(1). For recency, keep the entries in a list ordered from most to least recently used. Using a key means moving its entry to the front, and evicting means removing from the back."
  - "Make the list doubly linked, with dummy head and tail nodes, and let the map store key → list node. Then you can unhook any node in O(1) (you can reach its prev and next) and move it to the front. Store the key inside each node, so when you evict the back node you know which map entry to delete."
insight: "A hash map gives O(1) lookup; a doubly linked list ordered by recency gives O(1) move-to-front and remove-from-back. The map stores key → node so you can jump straight to a node and unhook it. Sentinel head and tail nodes remove every edge case."
time: O(1) per get and put
space: O(capacity)
related: [lc-1, lc-155, lc-138]
---

## The problem in plain English

Build a class `LRUCache`. LRU stands for **least recently used**.

- `LRUCache(capacity)` makes an empty cache that holds at most `capacity` key-value pairs.
- `get(key)` returns the value for `key`, or `-1` if it's not there. A successful `get` counts as **using** the key.
- `put(key, value)` inserts the pair, or updates the value if the key exists. That also counts as using the key. If inserting a new key would make the cache too big, first **evict** (remove) the key that was used longest ago.

Both `get` and `put` must run in **O(1)** average time. Capacity is up to 3,000, and there are up to 200,000 calls.

Example with capacity 2: `put(1,1)`, `put(2,2)`, `get(1)` → `1`. Now key 2 is the least recently used, so `put(3,3)` evicts it, and `get(2)` → `-1`.

## Start with brute force

Keep a list of `(key, value)` pairs, ordered from least to most recently used.

- `get`: scan the list for the key. If found, move it to the end and return its value.
- `put`: scan for the key. If found, update it and move it to the end. Otherwise, if full, remove the first pair; then append the new one.

It's correct, but every call scans the list (O(capacity)) and moving or removing from the front of an array shifts every element. With capacity 3,000 and 200,000 calls, that's around 600 million steps. The problem asks for O(1).

## Building the intuition

Write down what each operation needs:

| Need | Good at it |
|---|---|
| Find a key's value fast | hash map: O(1) |
| Know which key is the oldest | a list kept in recency order: look at the end |
| Move a key to "most recent" | a linked list: unhook and reinsert in O(1), *if you're already standing on the node* |

No single structure does all three. So **use two, and connect them**. Keep the entries in a linked list ordered from most recent (front) to least recent (back). Keep a hash map from key to that key's **list node**. The map takes you to the node in O(1); the list lets you move it in O(1).

Why **doubly** linked? To unhook a node, you need to change its previous node's `next`. In a singly linked list, finding the previous node means walking from the head. That's O(n). If every node also stores `prev`, you can reach both neighbours directly.

Why store the **key** inside the node? When you evict the back node, you also have to delete it from the map. The map is keyed by key, so the node has to tell you its key.

The last piece is from earlier in this stage: dummy nodes. Put a fake `head` before the front and a fake `tail` after the back. These **sentinels** are never removed, so every real node always has a real `prev` and `next`. There's no "is the list empty?" or "is this the first node?" check anywhere.

## The optimal approach

Two helpers do all the pointer work:

- `remove(node)`: `node.prev.next = node.next` and `node.next.prev = node.prev`.
- `add_front(node)`: link `node` between `head` and `head.next` (four pointer updates).

Then:

1. **`get(key)`**: if `key` isn't in the map, return `-1`. Otherwise `remove(node)`, `add_front(node)`, return `node.val`.
2. **`put(key, value)`**:
   - If `key` exists: update `node.val`, then `remove` and `add_front` it. Done.
   - Otherwise, if the map is full: the LRU node is `tail.prev`. `remove` it and delete its key from the map.
   - Create a new node, put it in the map, and `add_front` it.

The subtle detail is **updating an existing key never evicts**. The size doesn't change, so check "key exists?" *before* "is it full?". Get that order wrong and `put` on a full cache evicts a key it didn't need to.

{{code}}

## Dry run

Capacity 2. The list is written front (most recent) to back (least recent), without the sentinels.

| Call | Returns | What happened | List after |
|---|---|---|---|
| `put(1, 1)` | – | new key | `1` |
| `put(2, 2)` | – | new key | `2, 1` |
| `get(1)` | `1` | found, moved to front | `1, 2` |
| `put(3, 3)` | – | full: evict back (`2`), add `3` | `3, 1` |
| `get(2)` | `-1` | not in map | `3, 1` |
| `put(4, 4)` | – | full: evict back (`1`), add `4` | `4, 3` |
| `get(1)` | `-1` | not in map | `4, 3` |
| `get(3)` | `3` | found, moved to front | `3, 4` |
| `get(4)` | `4` | found, moved to front | `4, 3` |

Look at `put(3, 3)`. Key 1 was inserted *before* key 2, but `get(1)` touched it later, so key 2 is the one evicted. Recency of **use**, not insertion order.

## Complexity

- **Time: O(1) per call.** A map lookup is O(1) on average, and `remove` and `add_front` each change a fixed number of pointers.
- **Space: O(capacity).** The map and the list each hold at most `capacity` entries, plus two sentinels.

## Edge cases and traps

- **Updating a key in a full cache.** Must not evict anything. Check whether the key exists first.
- **Forgetting that `get` is a use.** A hit must move the node to the front, or the wrong key gets evicted later.
- **Not storing the key in the node.** Then eviction can't find the map entry to delete, and the map grows past capacity.
- **Evicting from the wrong end.** New and used nodes go to the front, so the LRU node is `tail.prev`. Pick one convention and comment it.
- **Capacity 1.** Every new key evicts the only one. The sentinels make this work with no special case.
- **`add_front` in the wrong order.** Set the new node's own `prev` and `next` first, then update `head.next.prev` *before* overwriting `head.next`. Draw the four arrows on paper.

## Say it in the interview

> "I need O(1) lookup and O(1) 'which key is oldest', so I'll combine a hash map with a doubly linked list. The list keeps entries in recency order, most recent at the front. The map stores key to node, so I can jump to any node and unhook it in O(1); that's why it's doubly linked. Get and put both move the node to the front. When the cache is full, I evict the node before the tail sentinel and delete its key from the map, which is why each node stores its key. Sentinel head and tail nodes mean no null checks. Every operation is O(1)."

## Follow-ups interviewers ask

- **"Can you use a built-in?"** Python's `OrderedDict` (with `move_to_end` and `popitem(last=False)`) and Java's `LinkedHashMap` (with access order and `removeEldestEntry`) are exactly a hash map plus a doubly linked list. Mention them, but expect to be asked to build it by hand.
- **"Make it thread-safe."** The simplest answer is one lock around `get` and `put`, since both change the list. Finer-grained designs split the cache into several independently locked parts.
- **"What about LFU (least frequently used)?"** That's *LFU Cache*. Keep a count per key and one doubly linked list per count, plus the current minimum count, so eviction is still O(1).
