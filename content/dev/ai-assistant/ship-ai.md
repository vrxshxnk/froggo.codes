---
id: ship-ai
project: ai-assistant
title: "Ship it with numbers: deploy, cache, write it up"
summary: >-
  Choose the cheapest model that passes your evals, deploy with the key in the host's secrets, cache repeated questions, and write a README whose eval table, cost per 100 questions and latency numbers make Pondr stand out from a thousand chatbot demos.
time: 4-5 hours
doneWhen:
  - Your README has a model comparison table, and the shipped model is the cheapest one that met the bar you set beforehand
  - The deployed app answers an eval question with working citations, and the key appears nowhere in git or the client bundle
  - Asking the same question twice returns the second answer from cache, and uploading a new file invalidates it
  - You've run the holdout questions once and reported their scores next to the main set
  - The README has an architecture diagram, the before-and-after eval table, cost per 100 questions and p95 latency
docs:
  - label: "Vercel: Environment variables"
    url: https://vercel.com/docs/environment-variables
  - label: "Next.js: Environment variables"
    url: https://nextjs.org/docs/app/guides/environment-variables
  - label: "Neon: The pgvector extension"
    url: https://neon.com/docs/extensions/pgvector
  - label: "Supabase: pgvector"
    url: https://supabase.com/docs/guides/database/extensions/pgvector
  - label: "OpenAI: Prompt caching"
    url: https://platform.openai.com/docs/guides/prompt-caching
  - label: "Anthropic: Prompt caching"
    url: https://docs.claude.com/en/docs/build-with-claude/prompt-caching
---

## What you're building

A public URL where a recruiter can sign in, upload a PDF and ask questions, and a README whose centrepiece is one table: how recall@5, refusals, answer quality, latency and cost changed with each improvement, and which model you chose and why.

Along the way you add an answer cache, and you pick your production model on evidence: the cheapest one that passes your evals.

## Why it matters

Plenty of people have built a chatbot over PDFs. Few can show measured quality, cost per question, and the decisions those numbers drove. That table turns "I built a RAG app" into an engineering story an interviewer can dig into, and choosing models on evidence and caching for cost are real tradeoffs AI teams make.

## Before you start

- **The quality bar.** Before comparing models, write down what "passes" means: for example, all 5 unanswerable questions refused, citation accuracy at least 0.8, and a judge score no more than 0.1 below your current model. Deciding afterwards lets you rationalise whatever you wanted to pick.
- **Answer cache.** Storing a finished answer under a key that includes everything that could change it, so a repeat question skips the model.
- **Provider prompt caching.** Some providers reuse work on a recently seen prompt prefix, cutting cost and latency, so stable parts (system prompt, tools) should come first. Details differ, so check your provider's docs.
- **Holdout set.** The 5 questions you set aside in the [first milestone](/development/ai-assistant/evals-first) and never tuned against. One run gives an honest estimate on unseen questions.

## Build it step by step

### Step 1: Pick the model with your eval suite

Choose two to four candidate chat models from your provider's models page, including at least one smaller, cheaper one (and a local Ollama model, if you're on the free path). Run `npm run eval` once per model by changing `CHAT_MODEL`, and copy the results into a table:

```text
model        judge  refusals  citation acc  p95 s  cost/100 q  passes bar?
candidate A  1.70     5/5        0.85        3.1     $__         yes
candidate B  1.62     5/5        0.80        1.9     $__         yes
candidate C  1.30     3/5        0.70        1.2     $__         no
```

Ship the cheapest one that passes. Recall@5 should be identical across rows, since retrieval doesn't use the chat model. Small jobs like query rewriting may pass with an even smaller model.

Check it: the table is in your README, with the bar written above it.

### Step 2: Deploy with secrets in the host

Create a separate production Postgres with pgvector (Neon and Supabase support it; check their current free tiers) and run your migrations on it. Import the repo into Vercel and put every key from `.env.local`, plus the Auth.js secrets, in the project's environment variable settings: never in a committed file, never with `NEXT_PUBLIC_`.

Two traps. Serverless functions have no lasting disk, so PDFs must go to object storage. They also have a maximum run time, so check it against your biggest ingest, and ingest in batches of pages if needed.

**On the free path**, a hosted app can't reach the Ollama running on your laptop. Your options are a hosted provider's free tier if one is offered (check its current terms), a small prepaid budget protected by the daily caps you built, or a recorded demo of the local app with clear instructions to run it.

Check it: sign in on the deployed URL, upload an eval PDF, ask an eval question, and click a citation. Then search the deployed site's JavaScript in DevTools for your key: nothing.

### Step 3: Cache repeated questions

Add a `corpus_version` number to each user, increased whenever they upload or delete a document. Build the cache key by hashing (with SHA-256) the user id, the normalised question (trimmed, lower-cased, whitespace collapsed), the corpus version, the prompt version, the model and the retrieval method. Store the answer and its sources in an `answer_cache` table with a created time.

On a hit, send the cached sources and answer at once, and log `cache_hit = true`. Only cache standalone questions: a chat's first message, or a follow-up's rewritten form. Cache question embeddings by the same text too. Finally, check whether your provider's prompt caching applies to your prompt order automatically.

Check it: ask a question twice. The second time, the answer appears instantly and the log shows a cache hit. Upload a file and ask again: it's a miss.

### Step 4: Run the holdout once

Add your 5 holdout questions to the eval runner behind a flag, run them once with the final configuration, and put the scores next to the main set's in the README. If it's far below the main set, say so: some tuning fitted the main questions, and that's worth discussing.

Check it: two columns in your results, main and holdout.

### Step 5: Write the README around the numbers

Structure it so a reviewer gets the story in two minutes:

1. One sentence on what Pondr does, a GIF (ask, answer, click a citation, refusal), and the live link.
2. The architecture diagram, and one paragraph following a question through it.
3. **The eval table:** one row per milestone that changed quality (vector baseline, hybrid, prompt v2, re-ranker tried, final model), with recall@5, refusals, citation accuracy, judge score and judge agreement with your hand grades.
4. Cost per 100 questions and p50/p95 latency, with and without the cache, and the date you checked prices.
5. Safety: the injection attacks you tried, what happened before and after, rate limits and budgets.
6. How to run it for free locally: Docker Postgres, Ollama, ingest, `npm run eval`.
7. Known limits: no OCR, a small eval set, an English-only search configuration.

Check it: a friend can explain from the README alone why you chose hybrid search and that model.

### Step 6: Smoke-test production and set alerts

Run the rate-limit loop and a budget test against the deployed app, not just locally. Confirm the confirmation card still guards `save_summary`. Set a spending alert or limit in your provider's console if it offers one, and check that request logs are being written in production.

Check it: production returns 429s under the loop, and request logs appear.

## Common mistakes

- **Choosing the model first and the bar afterwards.** Symptom: the table always justifies the model you already liked. Fix: write the bar down before running any comparison.
- **A cache key that misses an input.** Symptom: after uploading new notes, Pondr keeps giving the old answer. Fix: include the corpus version, prompt version, model and retrieval method in the key.
- **Writing uploads to the server's disk in production.** Symptom: citations 404 after a redeploy, or uploads fail. Fix: object storage for files, Postgres for everything else.
- **A README of adjectives.** Symptom: "fast, accurate, secure" with nothing to back it. Fix: every claim gets a number from your eval runs or logs.
- **Hiding a bad holdout score.** Symptom: an interviewer asks how you know it generalises, and you have no answer. Fix: report it, and explain what it taught you.

## Say it in the interview

"I picked the production model by running my eval suite on several candidates against a bar I wrote down first. The cheapest one that refused every unanswerable question and kept citation accuracy above 0.8 cost about X% of the largest per 100 questions, for a judge score 0.08 lower. Answers are cached under a key that includes the user's corpus version and the prompt and model versions, so new uploads invalidate it automatically. The tradeoff I'd revisit with real users is the exact-match cache: a semantic cache would hit more often, but it risks returning an answer to a slightly different question."

## Stretch goals

- Add a thumbs up or down on each answer, stored with the request log, and turn the thumbs-down answers into new eval questions.
- Show a per-user usage page: questions today, tokens used and budget left.
