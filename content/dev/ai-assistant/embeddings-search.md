---
id: embeddings-search
project: ai-assistant
title: Embed the chunks and search with pgvector
summary: >-
  Turn every chunk into an embedding once, at ingest time, store it next to the text in Postgres, and find the 5 chunks closest in meaning to a question. Then check those results against your eval set before any LLM sees them.
time: 3-4 hours
doneWhen:
  - Every chunk row has an embedding, and the embedding model's name is stored with it
  - Your retrieve script prints the top 5 chunks (file, page, distance) for any question you type
  - A search signed in as one user never returns another user's chunks
  - You've run all 20 answerable eval questions through the script and written down your first recall@5
  - Changing the embedding model without re-embedding is impossible, or at least fails loudly
docs:
  - label: "pgvector README"
    url: https://github.com/pgvector/pgvector
  - label: "pgvector-node (JavaScript client helpers)"
    url: https://github.com/pgvector/pgvector-node
  - label: "OpenAI: Embeddings"
    url: https://platform.openai.com/docs/guides/embeddings
  - label: "Gemini API: Embeddings"
    url: https://ai.google.dev/gemini-api/docs/embeddings
  - label: "Ollama: Embeddings"
    url: https://docs.ollama.com/capabilities/embeddings
---

## What you're building

A search that works by meaning. Type "when do processes get stuck waiting on each other forever?" and get back the chunk about deadlocks from page 41, even though it never uses the words "stuck" or "forever". For now it's a script, `npm run retrieve -- "your question"`, that prints the top 5 chunks with file, page and distance. Then you run it over every answerable eval question.

This is the first number on your eval scoreboard. Every later retrieval change is measured against it.

## Why it matters

Embedding search sits behind modern search, recommendations and RAG. Doing it in pgvector shows you can add it to an existing database rather than bolting on new infrastructure. The bigger lesson is checking retrieval separately: an engineer who can say "the right chunk wasn't in the top 5" fixes a wrong answer in an hour, while others rewrite prompts for a week.

## Before you start

- **Embeddings.** An embedding model turns text into a vector, a list of often several hundred to a few thousand numbers, so that texts with similar meaning point in similar directions. "Circular wait" lands near "processes blocking each other" and far from "photosynthesis". Only the distances between vectors mean anything.
- **Cosine similarity.** A measure of how closely two vectors point in the same direction, from -1 to 1, where 1 means the same direction. Cosine distance is 1 minus the similarity, so smaller means closer. pgvector's `<=>` operator returns cosine distance.
- **Dimensions.** One model's vectors all have the same length, given in its docs. Vectors from different models can't be compared, even at the same length.
- **pgvector.** A Postgres extension that adds a `vector(n)` column type, distance operators, and indexes for finding nearest neighbours quickly.
- **Recall@5.** For the questions that have an answer, the fraction where at least one of the top 5 chunks contains the right page. If 14 of your 20 answerable questions hit, recall@5 is 0.70. It tells you whether the answer was even available to the model.

## Build it step by step

### Step 1: Pick an embedding model and add `embed()` to your wrapper

Add `embed(texts: string[]): Promise<number[][]>` to `lib/llm.ts`, with `EMBED_MODEL` and `EMBED_DIM` in your `.env.local`. OpenAI and Gemini have embedding endpoints. Anthropic doesn't make its own embedding model, and its docs point you to a partner. Ollama serves open embedding models locally for free: search the Ollama library for "embedding" and `ollama pull` one. Mixing providers (Ollama embeddings, hosted chat) works fine. Note the model's dimension and maximum input length.

Check it: in a script, embed "deadlock", "circular wait" and "photosynthesis". Compute the cosine similarity of each pair yourself (dot product divided by the product of the lengths). The first pair should score clearly higher than the others.

### Step 2: Add the vector column

Write a new migration. Enable the extension, then add the column with your model's dimension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE chunks ADD COLUMN embedding vector(768);   -- your model's dimension
ALTER TABLE chunks ADD COLUMN embedding_model text;
```

If you use Neon or Supabase, both support pgvector. Check their docs for how to enable it.

Check it: `\d chunks` in psql shows `embedding | vector(768)`, or whatever dimension you chose.

### Step 3: Embed at ingest time, in batches

Extend your ingestion so that, after chunking, it embeds the chunks and stores each vector with its row, inside the same transaction. Embed the heading plus the content ("Deadlocks: A deadlock occurs when..."), because the heading adds context that the paragraph alone may lack.

Send chunks in batches, not one request each. Check your provider's docs for batch size and rate limits, and retry with a growing delay on a 429. Store `embedding_model` on every row. Then write a backfill script for the documents from the [last milestone](/development/ai-assistant/ingest-chunk).

Check it: `SELECT count(*) FROM chunks WHERE embedding IS NULL;` returns 0.

### Step 4: Write the search function

Create `searchChunks(userId, question, k = 5)` in `lib/retrieval.ts`. It embeds the question with the same model, then runs one query that filters to this user's chunks, sorts by distance and takes the top k. The heart of it is one clause:

```sql
WHERE user_id = $1 ORDER BY embedding <=> $2 LIMIT 5
```

Pass the vector as a parameter, never pasted into the SQL string. pgvector-node has helpers that convert an array to the format Postgres expects. Return each chunk's id, document filename, pages, heading, content and distance. Before searching, check that the configured `EMBED_MODEL` matches the `embedding_model` stored on the chunks, and throw a clear error if not.

Check it: sign in as a second test user with no documents. The same search returns nothing.

### Step 5: Print retrieval for every eval question

Write `npm run retrieve-evals`. For each answerable question in `evals/questions.json`, it runs `searchChunks` and marks a hit if any of the top 5 chunks has the right file and a page range that includes an expected page. Print each question, hit or miss, and the five results with their pages and distances. At the end, print recall@5. Save the full output to `evals/runs/<date>-vector-baseline.json`.

Then read each miss and write down why: an answer split across chunks, a term spelled differently, an exact-term question? This list is your next to-do.

Check it: you have a recall@5 number and a one-line reason for every miss.

### Step 6: Decide whether you need an index

With a few thousand chunks, an exact search over every vector is quick. Measure first: run `EXPLAIN ANALYZE` on your query and note the time.

pgvector's HNSW index makes search approximate: much faster on large tables, at the cost of sometimes missing a true nearest neighbour. Combined with a `WHERE user_id = ...` filter, an approximate index can also return fewer than 5 rows. The pgvector README explains this and the settings that help. If you add one, it's a single statement using `hnsw` and `vector_cosine_ops`. Rerun your eval script afterwards.

Check it: you can say, with numbers, whether the index changed latency and whether it changed recall@5.

## Common mistakes

- **Embedding the question with a different model from the chunks.** Symptom: results look random, with every distance close to the same value. Fix: one `EMBED_MODEL` setting, stored per row, checked at search time.
- **Forgetting the user filter.** Symptom: a user's answer cites a file they never uploaded. Fix: `WHERE user_id = $1` in every retrieval query, with the user id taken from the session, never from the request body.
- **Using the wrong operator.** Symptom: rankings look backwards or odd. Fix: `<=>` is cosine distance, so smaller is better. `<->` is Euclidean distance and `<#>` is negative inner product. Pick one and match your index's operator class to it.
- **One request per chunk.** Symptom: ingesting a textbook takes minutes and hits rate limits. Fix: batch the embedding calls.
- **Skipping the retrieval check and going straight to answers.** Symptom: you tune the prompt for hours while the right chunk was never retrieved. Fix: look at the top 5 for every eval question first.

## Say it in the interview

"Every chunk is embedded once at ingest and stored in a pgvector column next to its text, so search is a single SQL query filtered by user and ordered by cosine distance. Before connecting the model, I ran all 20 answerable eval questions through retrieval alone and got a recall@5 baseline. Reading the misses showed most were exact terms like signal names, which is why I added full-text search next. I chose to keep vectors in Postgres rather than a separate vector database. At this scale it's fast enough, and it means one system to back up and one place to enforce per-user access."

## Stretch goals

- Try chunk sizes of 300 and 800 tokens, re-ingest, and compare recall@5 against 500.
- Compare top-1 distances for answerable and unanswerable questions: could a distance cut-off catch some early?
