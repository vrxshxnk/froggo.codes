---
id: search-service
project: capstone
title: Search across users and posts
summary: >-
  Search posts with Postgres full-text search on a GIN index, and search people by name with trigram matching. Rank post results by text match, recency and engagement, and write down exactly why Elasticsearch wasn't needed yet.
time: 5-7 hours
doneWhen:
  - Searching "sunset beach" returns ready posts containing both words, with the best match near the top
  - Typing "anu" in the people search finds "anushka" and "Anupam" within a few keystrokes
  - "`EXPLAIN ANALYZE` on both searches shows the GIN indexes in use, not a sequential scan"
  - A new post is searchable as soon as it's ready, with no manual reindex step
  - Input like `"unclosed quote` or `a & | b` never causes a 500
  - Your design doc has a "Why not Elasticsearch" paragraph that names the point at which you would add it
docs:
  - label: "PostgreSQL: Controlling text search (parsing and ranking)"
    url: https://www.postgresql.org/docs/current/textsearch-controls.html
  - label: "PostgreSQL: Preferred index types for text search"
    url: https://www.postgresql.org/docs/current/textsearch-indexes.html
  - label: "PostgreSQL: pg_trgm"
    url: https://www.postgresql.org/docs/current/pgtrgm.html
  - label: "PostgreSQL: Generated columns"
    url: https://www.postgresql.org/docs/current/ddl-generated-columns.html
---

## What you're building

A search box with two tabs, People and Posts. People search works on partial names, so "anu" finds Anushka. Post search understands words, matches all your terms, and ranks a fresh, well-liked match above a stale one that barely matches. A post is searchable the moment it turns `ready`.

There's no new service: everything runs in your Postgres, on two indexes.

## Why it matters

The skill is scoping restraint. A search cluster is a second database to run, sync and pay for, and at Ripple's scale Postgres full-text search covers the need. Choosing it, and writing down where you *would* switch, shows senior judgement. "Why didn't you use X?" is a common interview question, and a measured boundary beats a list of technologies. [Inkwell's search](/development/fullstack-platform/pagination-search) was the simple version. Here you add ranking and a second kind of matching.

## Before you start

- **tsvector and tsquery.** `to_tsvector('simple', body)` turns text into normalised words (lexemes) with positions. A `tsquery` is a search expression, and `@@` tests a match.
- **Text search configuration.** `'english'` stems words ("running" → "run") and drops stop words. `'simple'` only lowercases. Mixed Hindi-English posts ("kal ka match was insane") can get mangled by English stemming, so pick deliberately and write down why.
- **`websearch_to_tsquery`.** It turns raw user input into a tsquery using familiar rules (quotes for phrases, `-` to exclude) and never throws a syntax error. `to_tsquery` does throw on input like `hello world`, so never pass user input to it.
- **GIN index.** An inverted index from each lexeme to the rows containing it. Fast `@@`, slower updates, fine for a read-heavy app.
- **Trigrams.** `pg_trgm` splits text into three-letter chunks, so "anu" matches "anushka", and small typos still match. A GIN trigram index turns `ILIKE '%anu%'` into an index scan.

## Build it step by step

### Step 1: Add a searchable column to posts

Add a stored generated column on `posts`: a `tsvector` built from the body with your chosen configuration. Postgres keeps it up to date on every insert and update, which is the built-in way to do what a trigger would do. Then create a GIN index on it, limited to ready, top-level posts if most of your searches filter that way.

```sql
-- the shape, not the migration
search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(body, ''))) STORED
```

If you later want the author's display name searchable alongside the post, a generated column can't read another table. That's when you'd switch to a trigger, or to a worker job that updates the column after a profile edit.

Check it: insert a post and select its `search_vector`. You see the lexemes with positions.

### Step 2: Write the post search query and read its plan

`GET /search/posts?q=&cursor=` validates `q` (trim it, cap its length, reject empty strings), builds the query with `websearch_to_tsquery`, and filters with `@@`. Before adding any ranking, look at the plan.

```sql
EXPLAIN ANALYZE SELECT id FROM posts
WHERE status = 'ready' AND search_vector @@ websearch_to_tsquery('simple', 'sunset beach');
```

Check it: the plan shows a `Bitmap Index Scan` on your GIN index. If you see `Seq Scan`, check that the configuration in the query matches the one in the column, because `'simple'` and `'english'` vectors don't match each other's indexes.

### Step 3: Rank by match, recency and engagement

Text relevance alone surfaces old posts that happen to repeat a word. Combine three signals into one score, and write the formula in your design doc:

```text
text    = ts_rank_cd(search_vector, query)          # how well it matches
fresh   = 1 / (1 + age_in_hours / 24)               # decays over days
popular = ln(1 + like_count)                        # diminishing returns
score   = text * (1 + popular) * fresh
order by score desc, id desc; limit 20
```

The exact weights are yours to tune. What matters is that you can explain each term. Ranking means scoring every matching row, so a very common word could be slow. Bound the candidates, for example by searching only the last 90 days, or by taking the top few hundred by text rank and re-scoring those.

Check it: search a common word from your seed data. A post from today with likes should beat a month-old post with none, even if the old one matches slightly better.

### Step 4: Paginate search results honestly

Scores aren't a stable sort key (freshness changes every second), so a keyset cursor drifts. For search, use offset pagination capped at five pages, then ask the user to refine the query. Note in your design doc that this differs from the feed's cursor on purpose.

Check it: page 6 returns a clear 400 message, and pages 1-5 don't overlap.

### Step 5: Add people search with trigrams

Enable the extension (`CREATE EXTENSION pg_trgm`) in a migration. Create a GIN index with `gin_trgm_ops` on the lowercased username and display name. `GET /search/users?q=` matches on either one, using `ILIKE` for substrings or the `%` operator for fuzzy matches (both can use the index), and orders by `similarity()`, so the closest name comes first. Trigram indexes need at least three characters to help, so start searching from the third keystroke. Exact username matches deserve a boost. People type a handle they already know.

Check it: the plan for "anu" uses the trigram index, and "anuskha" still finds "anushka".

### Step 6: Keep it fast from the client

Debounce the search box by about 250 ms and cancel stale requests with an `AbortController`, so fast typing doesn't fire a request per keystroke or show results out of order. Put both endpoints in the `read` rate-limit class.

Check it: type "sunset" quickly with the network tab open. One or two requests go out, and the results match the final text.

### Step 7: Write the "Why not Elasticsearch" paragraph

In the design doc, state the tradeoff plainly. Postgres search means no second datastore and no sync pipeline, and results are transactionally consistent with the posts table. You accept weaker relevance tuning, limited typo tolerance for posts, and search load sharing the same database as your writes. Then name your boundary in terms you could measure. For example: search queries start to show up in the top entries of `pg_stat_statements`, or you need features Postgres doesn't do well, such as faceted counts, per-language analysis or fuzzy matching on long text. Say what you'd try first: a read replica for search traffic, before a separate search engine.

Check it: a reader could tell, from your paragraph alone, what measurement would make you change your mind.

## Common mistakes

- **Passing raw input to `to_tsquery`.** Symptom: searching `hello world` or a stray `&` returns a 500 with a syntax error. Fix: use `websearch_to_tsquery` (or `plainto_tsquery`) for anything a user typed.
- **Mismatched configurations.** Symptom: slow searches with a sequential scan. Fix: query with the same configuration as the indexed column.
- **Using `LIKE '%...%'` for posts.** Symptom: search slows as posts grow. Fix: full-text search for content, trigrams only for short fields like names.
- **Ranking every match.** Symptom: one common word makes search the slowest endpoint in the load test. Fix: bound the candidate set by date or by a first-pass rank, then score.
- **Searching posts that aren't ready.** Symptom: results show processing placeholders and failed posts. Fix: filter `status = 'ready'`, and make the GIN index partial on the same condition.

## Say it in the interview

"Search runs in Postgres. Posts have a stored generated `tsvector` column with a GIN index, so a post is searchable the moment it's ready, with no sync job. People search uses `pg_trgm`, so partial names and small typos work. I rank by text match times a log of likes times a freshness decay, and I bound the candidate set so common words stay fast. I chose not to add Elasticsearch. The tradeoff is weaker relevance tuning, but it saves a whole second datastore and its sync pipeline at a scale where Postgres is comfortably fast. I wrote down the signal that would change that: search queries climbing the top of `pg_stat_statements`."

## Stretch goals

- Add hashtag search: extract `#tags` in the API into a `post_tags` table with a B-tree index, and show trending tags from the last 24 hours.
