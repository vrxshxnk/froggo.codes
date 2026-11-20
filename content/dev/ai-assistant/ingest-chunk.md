---
id: ingest-chunk
project: ai-assistant
title: "Ingest documents: extract, clean, and chunk"
summary: >-
  Upload a PDF or Markdown file, pull out its text page by page, clean it, and split it into chunks of about 500 tokens that each remember their file and page. This step decides how good every later answer can be.
time: 4-5 hours
doneWhen:
  - Uploading one of your eval PDFs creates one documents row and a set of chunks rows, each with a page number
  - Your chunk-printing script shows no chunk far over your token target, and no repeated page headers or footers
  - For 5 eval questions, the answer sits inside a single chunk whose page matches the page in your eval file
  - Uploading the same file twice doesn't duplicate its chunks
  - A scanned PDF (no selectable text) is marked failed with a clear message, not stored as empty chunks
docs:
  - label: "pgvector README (includes Docker images)"
    url: https://github.com/pgvector/pgvector
  - label: "unpdf (PDF text extraction for JavaScript)"
    url: https://github.com/unjs/unpdf
  - label: "MDN: SubtleCrypto.digest()"
    url: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  - label: "Docker: Get started"
    url: https://docs.docker.com/get-started/
---

## What you're building

An upload button on a "My notes" page. Pick `os-unit3.pdf`, and a few seconds later it shows as "Ready, 62 pages, 140 chunks". Behind that, your server has stored the original file, extracted the text of every page, removed the junk (page numbers, repeated headers, broken hyphenation), and split it into chunks of roughly 500 tokens. Each chunk is a row in Postgres that knows its file, its page and the heading it sits under.

Nothing searches these chunks yet. That's the [next milestone](/development/ai-assistant/embeddings-search). Search can only find what you stored, so clean data matters.

## Why it matters

Retrieval-augmented generation (RAG) is only as good as its chunks. If a chunk cuts a definition in half or mixes two topics, search returns the wrong text and the model writes a confident wrong answer. Bad chunking is the most common reason RAG answers are wrong. And this pipeline (extract, clean, split, store with metadata) is everyday work on AI and search teams.

## Before you start

- **Text extraction.** A PDF stores positioned bits of text, not paragraphs. A library like `unpdf` (built on Mozilla's pdf.js), or `pypdf` in Python, turns each page into an imperfect string that you clean afterwards. Scanned PDFs hold only images and give no text.
- **Chunking.** Splitting a document into small passages. Even when a whole textbook fits in the context window, sending it all is slow and expensive, so search picks the few chunks that matter.
- **Chunk size.** Too small (a sentence) and a chunk lacks context. Too big (several pages) and it matches many questions weakly. About 500 tokens, a few paragraphs, is a good start, and your evals can test other sizes later.
- **Overlap.** Repeating the last sentence or two of one chunk at the start of the next, so that an idea split across a boundary still appears whole in at least one chunk. 10-15% of the chunk size is plenty.
- **Metadata.** The facts stored with each chunk: user, document, page, heading, position. The page number is what makes citations possible later, so it must survive every step.

## Build it step by step

### Step 1: Run Postgres with pgvector and create the tables

Start Postgres in Docker using the pgvector image, so you won't have to change databases next milestone. Pick the image tag for the Postgres version you want from the pgvector README:

```bash
docker run -d --name pondr-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pondr \
  -v pondr-data:/var/lib/postgresql/data pgvector/pgvector:pg17
```

The `-v` volume keeps your data across restarts. Use the `pg` package with plain SQL migration files in `db/migrations/`, applied in order. Retrieval is hand-tuned SQL, so an ORM adds little (Drizzle is fine if you prefer one). Two tables:

```sql
documents (id uuid PK, user_id, filename, storage_path, content_hash,
           page_count int, status text,   -- 'processing' | 'ready' | 'failed'
           error text, created_at)
chunks    (id uuid PK, document_id FK ON DELETE CASCADE, user_id,
           chunk_index int, page_start int, page_end int,
           heading text, content text, token_count int)
```

`user_id` sits on chunks too, so every search can filter on it directly. Index `chunks (user_id)` and `chunks (document_id)`.

Check it: `\d chunks` in psql shows your columns.

### Step 2: Accept uploads safely

Build `POST /api/documents`. Read the file with `await request.formData()`. Before doing anything else, check the size (reject over, say, 20 MB), check the real type by its first bytes (a PDF starts with `%PDF`) rather than trusting the filename, and require a signed-in user.

Hash the bytes with SHA-256. If this user already has a document with the same hash, return it instead of ingesting again. Save the original file (a local `uploads/` folder in development, object storage when you deploy, as in [Inkwell's image uploads](/development/fullstack-platform/image-upload)) so that citations can open it later. Insert the documents row with status `processing`.

Check it: upload a `.png` renamed to `.pdf`: you get a 400. Upload the same PDF twice: one row.

### Step 3: Extract text page by page

Use `unpdf` (or `pypdf`) to get one string per page, with page 1 as the file's first page. Never join the document into one string before chunking: that's how page numbers get lost. Markdown files have no pages, so treat each top-level section as a "page" and store its heading.

If most pages have under about 20 characters, the PDF is probably scanned. Set status `failed` with "This PDF looks scanned; Pondr can only read text PDFs" and stop.

Check it: log the page count and the first 200 characters of page 1. They should match the PDF viewer.

### Step 4: Clean each page

Write small, separately testable functions, each fixing one problem:

- **Repeated headers and footers:** a line that appears on more than half the pages ("Operating Systems, Unit 3") is noise. Remove it from every page.
- **Bare page numbers:** a line that is only a number.
- **Hyphenation:** `synchroni-\nzation` becomes `synchronization`.
- **Ligatures and odd characters:** `text.normalize("NFKC")` turns `ﬁ` back into `fi`, which matters for exact-term search later.
- **Whitespace:** collapse runs of spaces, and keep blank lines, since they mark paragraph breaks.

Check it: print the cleaned page 5 next to the PDF. It should read like the page, minus the header, footer and page number.

### Step 5: Split into chunks on headings and paragraphs

Split each page into blocks (paragraphs at blank lines), and spot headings with a simple rule: a short line (under about 80 characters) with no full stop at the end, followed by a paragraph. Then pack blocks into chunks:

```text
TARGET = 500 tokens, OVERLAP = 60 tokens
for each block, in page order:
    if block is a heading: close the current chunk; remember heading
    if block alone > TARGET: split it at sentence ends into smaller blocks
    if current + block > TARGET:
        close the current chunk
        start a new one with the last ~OVERLAP tokens of the old one
    add block to current; extend page_end to this block's page
close the last chunk
```

A chunk can cross a page break with its paragraph, hence `page_start` and `page_end`. To count tokens, use your provider's tokenizer if it has one, or estimate characters divided by 4.

Check it: a script, `npm run chunks -- os-unit3.pdf`, prints every chunk with its pages, heading and token count. Chunks should start and end at sentence boundaries.

### Step 6: Store the chunks and check them against your eval set

Insert all chunks for a document in one transaction, then set the document to `ready` with its page count. If anything throws, roll back and set `failed` with the error. A half-ingested document is worse than none.

Then, for 5 answerable eval questions, find the answer in your chunk printout. It should sit inside one chunk (or two neighbours) whose pages include the page in your eval row.

Check it: all 5 pass. If an answer is split between chunks or buried in a huge one, fix the chunker now. No embedding model can fix it later.

## Common mistakes

- **Joining all pages before chunking.** Symptom: every chunk says page 1, or citations point to the wrong page. Fix: extract per page, and carry the page number through every function.
- **Splitting on a fixed character count.** Symptom: chunks start mid-word, and definitions are cut in half. Fix: split on paragraphs and sentences, and only pack up to the token target.
- **Leaving headers and footers in.** Symptom: every chunk from that file looks alike to search. Fix: strip lines repeated across pages.
- **Ingesting with no transaction.** Symptom: a crash leaves half a book ingested, and answers quietly miss the rest. Fix: one transaction, and mark the document ready only afterwards.
- **Trusting the file extension.** Symptom: odd files crash the PDF library. Fix: check size and magic bytes before parsing.

## Say it in the interview

"Ingestion extracts text page by page, so every chunk keeps its file and page. That's what makes citations possible. I strip headers and footers found across pages, fix hyphenation and normalise Unicode, then pack paragraphs into roughly 500-token chunks with a small overlap, breaking at headings. Before embedding anything, I checked five eval questions by hand to see whether each answer landed inside one chunk. The tradeoff is that my heading detection is a heuristic, so on badly formatted PDFs it falls back to paragraph splitting."

## Stretch goals

- Show ingestion progress ("page 40 of 62") from a counter on the documents row.
- Add a delete button that removes the document, its stored file and, through the cascade, its chunks.
