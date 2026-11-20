---
id: ai-assistant
name: Pondr
tagline: An AI study assistant that answers from your own notes, with citations
summary: >-
  Build a chat assistant over your own PDFs and notes that cites the exact file and page, says "I don't know" when the notes don't cover it, and calls tools. You'll measure every change with an eval set, and keep cost, latency and safety under control.
time: About 2 weeks, 40-50 hours
---

## What you're building

Pondr is a study assistant. You sign in, upload your notes or a textbook's PDFs, and ask questions. The answer streams in word by word, and every claim ends with a small citation like [2]. Click it and the PDF opens at the right page. Ask something your notes don't cover and Pondr says it doesn't know, instead of making something up. Ask for "10 flashcards on deadlocks" and it builds them from your notes. Ask it to "save a summary of chapter 3" and it asks you to confirm before it writes anything.

Behind the chat box: a server that talks to a large language model (LLM), a retrieval pipeline that finds the right paragraphs, tool calling, guardrails against prompt injection and runaway cost, and an eval script that turns "it seems better" into a number. It all runs free on your laptop with a local model.

## Features

- An eval set of 25 real questions, with answers and page numbers, written before any code
- A chat endpoint that streams the reply, with a Stop button that really cancels the request
- Versioned prompt files, and JSON output validated against a schema (flashcards, quizzes, titles)
- PDF and Markdown upload, extracted page by page and split into chunks that remember their file and page
- Embeddings stored in Postgres with pgvector, and a top-5 similarity search
- Answers grounded only in retrieved chunks, with clickable citations and honest refusals
- Hybrid search (vectors plus Postgres full-text search), merged with reciprocal rank fusion
- Tools the model can call: search notes, make flashcards, save a summary
- Defences against prompt injection, per-user rate limits and a daily token budget
- An automated eval script that scores retrieval and answers, plus logs of tokens, cost and latency per request
- A deployed app with caching, and a README full of measured numbers

## The stack

| Piece | Use | Why |
| --- | --- | --- |
| App and API | Next.js (App Router) with TypeScript | Route handlers give you a server in the same project as the UI, so the API key never reaches the browser. Python with FastAPI is the common alternative, and every milestone works the same in it. |
| LLM | Any provider's official SDK (OpenAI, Anthropic or Google Gemini), or Ollama | The concepts (messages, streaming, tool calls) are the same everywhere. Ollama runs open models locally for free. |
| Database | Postgres with the pgvector extension | One database holds users, documents, chunks, vectors, full-text indexes and logs. You don't need a separate vector database. |
| Running Postgres | Docker locally, or a free hosted Postgres that supports pgvector (Neon or Supabase) | Docker costs nothing and works offline. Check the host's current free tier before you rely on it. |
| Validation | Zod (Pydantic if you use Python) | Model output and tool arguments are untrusted input, and need a schema at the boundary. |
| Auth | Auth.js, reused from [Inkwell](/development/fullstack-platform/auth-oauth) | Rate limits, budgets and "only search my notes" all need a user id you trust. |
| Hosting | Vercel for the app, with the hosted Postgres | Secrets live in the host's environment settings, never in git. |

**The free path.** A student with no budget can build every milestone with Ollama for both chat and embeddings, and Postgres in Docker. Ollama also serves an OpenAI-compatible API, so the same code can switch to a hosted provider later by changing a base URL and a key. Model names and prices change often, so keep them in environment variables and check your provider's docs for current models and pricing.

## How it fits together

```text
 browser (chat UI)
     │  POST /api/chat  { question }      ◄── streamed tokens + citations
     ▼
 Next.js route handler
     │ 1. auth, rate limit, token budget
     │ 2. embed question ──► LLM provider (embeddings)
     │ 3. hybrid search  ──► Postgres + pgvector
     │        vector top 20 + full-text top 20 ─► RRF ─► top 5 chunks
     │ 4. build prompt: system file + numbered chunks + question
     │ 5. agent loop (max 5 steps) ──► LLM provider (chat, tools)
     │        tool call? validate args ─► run tool ─► send result back
     │ 6. stream answer, map [n] to file + page
     │ 7. log tokens, cost, latency
     ▼
 Postgres: users, documents, chunks(vector, tsvector), usage, logs
```

Follow one question. You type "What are the four conditions for deadlock?" The route handler checks your session, your request rate and today's token count. It turns the question into a vector, then runs two searches over your chunks only: one by meaning, one by exact words. It merges the two lists and keeps the best five. Those five chunks go into the prompt, each with a number, the file name and the page. The model streams back an answer that cites [1] and [3]. The server maps those numbers to "OS-notes.pdf, page 41", sends them to the browser as links, and writes one log row with the tokens, the cost and the time to first token.

## Out of scope

- **LangChain, LlamaIndex or another framework.** They hide the exact lessons this project teaches: what's in the prompt, how retrieval works, and how the agent loop stops.
- **Fine-tuning or training a model.** Retrieval solves "answer from my notes" far more cheaply.
- **OCR for scanned PDFs, images or handwriting.** Detect pages with no text and tell the user. OCR is a separate project.
- **A separate vector database.** pgvector handles a student's notes comfortably. A second database is one more thing to deploy and keep in sync.
- **Multi-agent systems and long-term memory.** One agent with three tools is already hard to make reliable.

## How to work through it

1. **Foundations** (eval set, streaming, prompts and structured output): about 10 hours. You end with a chat that streams, and a spreadsheet that defines "correct".
2. **Retrieval** (ingest and chunk, embeddings, RAG with citations, hybrid search): about 18 hours. This is the heart of the project. Check retrieval on its own before any model writes an answer.
3. **Agent and safety** (tool calling, guardrails): about 10 hours.
4. **Proof** (automated evals with cost and latency, shipping): about 10 hours.

The rule that decides how this goes: **no change counts until the eval number moves.** Write the eval set first, check retrieval before generation, and treat cost, latency and safety as requirements from the start. A demo that "looks smart" is easy. A table showing recall@5 going from, say, 0.64 to 0.84 is what interviewers remember.

## Show it off

Your README should include:

- An architecture diagram like the one above
- A table of eval scores (recall@5, answer score, refusal rate on unanswerable questions) before and after each improvement
- Cost per 100 questions and p50/p95 latency for the model you shipped, and for one you rejected
- What happened when you uploaded a prompt-injection PDF, and how you defended against it
- How to run it for free: Docker Postgres, Ollama, and the one command that runs the evals

In your demo, ask one question the notes answer (click the citation and land on the page), one they don't (watch it refuse), and one that triggers a tool with a confirmation.

Resume bullets to adapt (use your own measured numbers):

- "Built a RAG study assistant over PDFs with pgvector hybrid search and reciprocal rank fusion, raising recall@5 on a 25-question eval set from X to Y"
- "Cut cost per 100 questions from $X to $Y and p95 latency from X s to Y s by caching repeated questions and choosing the cheapest model that passed the eval suite"
