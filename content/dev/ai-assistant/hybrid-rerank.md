---
id: hybrid-rerank
project: ai-assistant
title: Improve retrieval with hybrid search and re-ranking
summary: >-
  Vector search misses exact terms like signal names, error codes and people's names. Add Postgres full-text search, merge the two result lists with reciprocal rank fusion, and keep the change only if recall@5 on your eval set goes up.
time: 3-4 hours
doneWhen:
  - You have recall@5 for vector-only, keyword-only and hybrid search, from the same eval run, in one table
  - An exact-term question that vector search missed now retrieves the right page
  - Typing punctuation or a stray quote into the search never causes a SQL error
  - Your default retrieval is whichever method scored best, and the README says why
  - If you tried a re-ranker, you know what it did to recall@5 and to latency
docs:
  - label: "PostgreSQL: Full text search"
    url: https://www.postgresql.org/docs/current/textsearch.html
  - label: "PostgreSQL: Controlling text search (ranking, queries)"
    url: https://www.postgresql.org/docs/current/textsearch-controls.html
  - label: "PostgreSQL: Generated columns"
    url: https://www.postgresql.org/docs/current/ddl-generated-columns.html
  - label: "pgvector README (hybrid search section)"
    url: https://github.com/pgvector/pgvector
  - label: "Sentence Transformers: Retrieve and re-rank"
    url: https://www.sbert.net/examples/applications/retrieve_rerank/README.html
---

## What you're building

A retrieval step that is measurably better than the one you have. Ask "What does `SIGCHLD` mean?" and the chunk that defines `SIGCHLD` comes first, even though an embedding model sees it as just another signal-ish word. Under the hood, every question runs two searches over the user's chunks, one by meaning and one by exact words, and merges the results into one top 5.

The real output of this milestone is a small table: recall@5 for vector search, keyword search and hybrid search, side by side. If hybrid doesn't win on your data, you keep the simpler one, and the table says why.

## Why it matters

Hybrid search is standard in production search and RAG systems, because meaning-based and word-based search fail in different ways. Embedding models blur rare exact tokens (codes, names, version numbers), while keyword search misses paraphrases. The deeper skill is experimental discipline: change one thing, measure it on a fixed set, and keep it only if the number moves. That habit is what interviewers on AI and search teams probe for.

## Before you start

- **Full-text search.** Postgres can split text into normalised words (lexemes) and index them. A `tsvector` is a document's list of lexemes with positions. A `tsquery` is a search expression. `@@` tests whether they match, and `ts_rank` scores how well. The `english` configuration stems words, so "scheduling" and "scheduled" match, and it drops common words like "the".
- **GIN index.** An index type suited to "which rows contain this word?" lookups. It's what makes full-text search fast on a tsvector column.
- **Reciprocal rank fusion (RRF).** A way to merge ranked lists whose scores can't be compared (a cosine distance and a `ts_rank` mean different things). Ignore the scores and use only positions: each chunk gets `1 / (k + rank)` from each list it appears in, summed. With k around 60, the value used in the paper that introduced RRF, a chunk ranked well by both searches beats one ranked first by only one.
- **Re-ranking.** A second, slower pass over a shortlist. A re-ranker model (often a cross-encoder) reads the question and each candidate together, and scores how well the candidate answers it. That's more accurate than comparing two separate embeddings, but too slow to run over every chunk, so you apply it only to the top 20 or so.
- **Recall@k, again.** The fraction of answerable questions where the right page appears in the top k. With 20 answerable questions, one question is 5 points, so always look at which questions flipped, not just the total.

## Build it step by step

### Step 1: Re-measure the baseline

Run `npm run retrieve-evals` again with vector search, and save the result as `evals/runs/<date>-vector.json`. Don't reuse the old number: anything that changed since would make the comparison unfair. Tag each miss with its question `type`. Exact-term questions probably miss most.

Check it: you have today's vector-only recall@5, and a list of missed question ids.

### Step 2: Add a full-text column and index

In a new migration, add a generated `tsvector` column to `chunks`, built from the heading and content with `to_tsvector('english', ...)`, and a GIN index on it. A generated column keeps itself up to date whenever a chunk is inserted, so ingestion code doesn't change.

One decision: `english` stemming helps prose but can mangle code-like terms. If your documents are full of identifiers (`malloc`, `O_NONBLOCK`), compare against the `simple` configuration, which lowercases but doesn't stem.

Check it: `SELECT to_tsvector('english', 'Scheduling the scheduler')` shows one stemmed lexeme with two positions, and `\d chunks` shows the new column and index.

### Step 3: Write the keyword search, and dodge the AND trap

Write `keywordSearch(userId, question, k = 20)`. It's the same shape as your vector search: filter by user, match with `@@`, order by `ts_rank` descending, limit k.

The trap: `plainto_tsquery` and `websearch_to_tsquery` join words with AND. A natural question like "what does the SIGCHLD signal mean" then needs every word to appear in one chunk, and often matches nothing. For retrieval you want OR, with ranking rewarding chunks that match more words. Build the query yourself:

```text
words = question split into letters, digits and underscores only
drop words shorter than 2 characters
tsquery string = words joined with " | "     e.g.  sigchld | signal | mean
pass it as a parameter to to_tsquery('english', $2)
```

Keeping only letters, digits and underscores means no user input can break `to_tsquery`'s syntax. If no words are left, skip the keyword search.

Check it: search for `"SIGCHLD"`, then for `it's a "quote` with stray punctuation. The first finds the chunk, and the second returns results or an empty list, never an error.

### Step 4: Merge with reciprocal rank fusion

Run both searches (in parallel, with `Promise.all`), take the top 20 from each, and merge:

```text
scores = empty map from chunk id to number
for each list in [vectorResults, keywordResults]:
    for rank, chunk in list (rank starts at 1):
        scores[chunk.id] += 1 / (60 + rank)
return chunks sorted by score, highest first, top 5
```

Put this in `lib/retrieval.ts` as `hybridSearch`, and make the method a setting (`RETRIEVAL=vector|keyword|hybrid`) so your eval script can run each.

Check it: hand-check one question. A chunk ranked 2nd by vectors and 3rd by keywords should beat one ranked 1st by vectors but absent from keywords.

### Step 5: Measure all three and decide

Run the eval script three times, once per method, and fill in this table in your README:

```text
method    recall@5   exact-term hits   p50 search ms
vector      0.__          _/4               __
keyword     0.__          _/4               __
hybrid      0.__          _/4               __
```

Then look at the flips. Which questions did hybrid fix, and did it break any that vectors got right? Keep hybrid as the default only if it scores higher. If two methods tie, keep the simpler one.

Check it: the table is filled in, and your `.env` default matches the winner.

### Step 6 (optional): Try a re-ranker on the top 20

Take the top 20 from hybrid search and re-score each (question, chunk) pair, then keep the top 5. You have three options: a hosted re-rank API from a provider that offers one, a cross-encoder running locally (easiest from Python with Sentence Transformers, so it can also be a small sidecar service), or your chat model scoring relevance 0-3 for all 20 chunks in one structured-output call. The last one reuses everything you've built, but adds a full model call before the first token.

Measure recall@5 and the added latency. A re-ranker that adds 600 ms for one extra hit may not be worth it. Write down your decision either way.

Check it: a fourth row in your table, with its latency.

## Common mistakes

- **Comparing against a stale baseline.** Symptom: hybrid "wins" because chunking also changed in between. Fix: re-run every method in the same session, on the same data.
- **AND-joined queries.** Symptom: keyword search returns nothing for most real questions, so hybrid equals vector. Fix: build an OR query from sanitised words.
- **Adding raw scores together.** Symptom: one search always dominates, because its scores are on a bigger scale. Fix: fuse by rank with RRF, not by score.
- **Concatenating user text into the query string.** Symptom: `syntax error in tsquery`, or worse, SQL injection. Fix: sanitise words, and always pass them as a query parameter.
- **Keeping a change because it feels better.** Symptom: added latency and code with no measured gain. Fix: the number decides, and a tie goes to the simpler method.

## Say it in the interview

"Reading my retrieval misses, I saw that vector search was losing exact terms like signal names. So I added Postgres full-text search on a generated tsvector column, ran both searches in parallel, and merged them with reciprocal rank fusion, because cosine distances and ts_rank scores aren't comparable but ranks are. On my eval set, recall@5 went from X to Y, with all the gain on exact-term questions. I also tried a re-ranker. It added Z ms for one more hit, so I left it off, and the README table shows why."

## Stretch goals

- Report recall@1 and recall@10 too, to see whether the right chunk is close to the top or just scraping in.
- Try weighting the two lists in RRF, and measure it.
