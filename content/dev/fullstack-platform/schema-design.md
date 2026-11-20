---
id: schema-design
project: fullstack-platform
title: "Design the schema: users, posts, tags"
summary: >-
  Write down the queries Inkwell will run, then design the posts, tags and join tables to serve them, with the right constraints and indexes, and ship it as a migration.
time: 3-4 hours
doneWhen:
  - Your README lists at least four queries the app needs, written before the tables
  - "`posts`, `tags` and `post_tags` exist in your local database, created by a migration file in the repo"
  - Inserting two posts with the same slug fails with a unique-constraint error
  - "`status` is an enum of draft, published and archived, not a boolean"
  - With a few thousand seeded posts, `EXPLAIN ANALYZE` on the feed query shows an index scan
docs:
  - label: "Drizzle: Schema declaration"
    url: https://orm.drizzle.team/docs/sql-schema-declaration
  - label: "Drizzle: Indexes and constraints"
    url: https://orm.drizzle.team/docs/indexes-constraints
  - label: "PostgreSQL: Enumerated types"
    url: https://www.postgresql.org/docs/current/datatype-enum.html
  - label: "PostgreSQL: Using EXPLAIN"
    url: https://www.postgresql.org/docs/current/using-explain.html
---

## What you're building

The tables that hold everything Inkwell knows: who wrote what, in what state, with which tags. Nothing new appears on screen yet. What you'll have is a schema file, a migration that creates it, a seed script that fills it with a few thousand fake posts, and proof that the queries the homepage will run are fast.

You'll design it backwards from the queries. That's the whole trick of this milestone.

## Why it matters

The schema outlives the code. You can rewrite a page in an afternoon, but changing a table that holds real users' data means migrations, backfills and care. Interviewers ask about data modelling in almost every backend round. Saying "I listed the queries first, then designed tables and indexes to serve them" shows you think like someone who has had to make an app fast, not someone who drew boxes and hoped.

## Before you start

- **Primary and foreign keys.** A primary key uniquely identifies a row. A foreign key (`author_id references users(id)`) makes the database refuse a post whose author doesn't exist. The database enforces these even when your code has a bug.
- **Many-to-many with a join table.** A post has many tags and a tag has many posts. You can't store that in either table, so a third table, `post_tags`, holds one row per (post, tag) pair.
- **Enum.** A column type with a fixed list of allowed values. `status post_status` can only be `draft`, `published` or `archived`. Postgres rejects anything else.
- **Index.** A sorted lookup structure that lets Postgres find rows without reading the whole table, like a book's index. A *composite* index on `(status, published_at)` serves queries that filter on the first column and sort by the second. Indexes speed up reads and slightly slow down writes.
- **`EXPLAIN ANALYZE`.** Put it before a query in `psql` and Postgres runs the query and tells you how it found the rows. `Seq Scan` means it read every row. `Index Scan` means it used an index.

## Build it step by step

### Step 1: Write the queries first

Before any table, write in plain English every read the app will do, then mark what each one filters on and sorts by. Put this list in your README.

```text
1. Feed: latest 10 published posts, newest first           filter status, sort published_at
2. Tag page: latest 10 published posts with tag X          join post_tags, same filter and sort
3. Post page: post by slug, only if published OR mine      lookup slug, check status/author
4. Dashboard: all my posts, most recently edited first     filter author_id, sort updated_at
5. Tags of one post (to show chips under the title)        lookup post_tags by post_id
```

Look at what falls out: posts need `author_id`, `slug`, `status`, `published_at` and `updated_at`, and three different access paths need indexes.

Check it: every column you're about to create is used by at least one query, or by the page that shows a post.

### Step 2: Sketch the tables

Turn the queries into tables. A sketch, not the final file:

```sql
posts (id uuid pk, author_id uuid -> users.id, title text, slug text unique,
       content text, excerpt text, cover_image_url text,
       status post_status default 'draft', published_at timestamptz null,
       created_at timestamptz, updated_at timestamptz)
tags (id uuid pk, name text, slug text unique)
post_tags (post_id -> posts.id on delete cascade,
           tag_id  -> tags.id  on delete cascade,
           primary key (post_id, tag_id))
```

Three decisions to make and write down. **Status is an enum, not `is_published`.** A boolean can't grow an "archived" state without a migration and a hunt through every `if`. **`published_at` is separate from `created_at`.** The feed sorts by when a post went live, not when the draft was started. **Slugs are unique and fixed once published,** because people will link to them. Decide your slug rule now: lowercase letters, digits and hyphens, at most 80 characters.

Check it: for each query in step 1, trace it through the sketch and confirm you never need more than one join.

### Step 3: Add the constraints the database should enforce

Your code will have bugs. Constraints are the last line of defence that catches them. Add `not null` wherever a missing value is a bug (`author_id`, `title`, `slug`, `status`). Add a check constraint that says a published post must have a `published_at`. Decide what happens to a user's posts if their user row is deleted (cascade or restrict) and write that choice down.

Check it: once migrated, try in `psql` to set a post to `published` with a null `published_at`. Postgres should refuse.

### Step 4: Add indexes for your queries

Map each query to an index:

- Feed: a composite index on `(status, published_at desc)`. Add `id` as a final column, because the pagination milestone will use `id` to break ties.
- Dashboard: `(author_id, updated_at desc)`.
- Tag page: the primary key `(post_id, tag_id)` helps "tags of a post" but not "posts with a tag". Add an index on `(tag_id, post_id)`.
- Post page: the unique constraint on `slug` already creates an index.

Declare all of these in your Drizzle schema next to the tables, using the index helpers from the [indexes docs](https://orm.drizzle.team/docs/indexes-constraints).

Check it: you can name, for each index, the query it exists for. An index with no query is just a slower write.

### Step 5: Generate and apply the migration

Write the tables in your Drizzle schema file, using `pgEnum` for status, then run `npm run db:generate`. Open the generated SQL file under your migrations folder and read every line. It's your schema in the database's own language, and you should be able to explain each statement. Then run `npm run db:migrate`.

Never edit a migration that has already been applied anywhere. If something's wrong, change the schema and generate a new migration.

Check it: `\d posts` in `psql` lists your columns, the enum type, the check constraint and the indexes.

### Step 6: Seed realistic data and test your indexes

With ten rows, Postgres will scan the whole table no matter what indexes exist, because that's faster at that size. So you can't judge your design yet. Write a seed script, for example `scripts/seed.ts` run with `npx tsx`, that creates a few users, 20 tags and around 5,000 posts with random statuses, dates and tags. Make it wipe and refill, so you can rerun it.

```sql
EXPLAIN ANALYZE
SELECT id, title, slug FROM posts
WHERE status = 'published' ORDER BY published_at DESC LIMIT 10;
```

Check it: the plan mentions your feed index and the execution time is a few milliseconds. Try the same with the tag query.

## Common mistakes

- **A boolean for status.** Symptom: the day you want "archived", you're writing a migration and changing every query. Fix: use an enum from the start.
- **No index on the foreign key you filter by.** Symptom: the dashboard and tag pages slow down as data grows, while the feed stays fast. Fix: Postgres doesn't index foreign keys automatically. Add the ones your queries use.
- **Checking slug uniqueness only in code.** Symptom: two posts published at the same moment get the same slug. Fix: the unique constraint is the real guard. Catch Postgres error code `23505` (unique violation) and retry with a suffix like `-2`.
- **Judging indexes on an empty table.** Symptom: `EXPLAIN` shows `Seq Scan` and you think your index is broken. Fix: seed thousands of rows, then run `ANALYZE posts` so the planner's statistics are current.
- **Editing an applied migration.** Symptom: your laptop and production disagree about the schema, and the migrator complains about a changed file. Fix: always add a new migration.

## Say it in the interview

"I wrote the five queries the app needed before I designed any table, so each index exists for a specific query. Status is an enum rather than a boolean, so adding 'archived' was free. The database enforces what it can, such as unique slugs, foreign keys, and a check that published posts have a publish date, so a bug in my code can't create bad data. The tradeoff is that each index costs a little on every write, which is right for a blog, where reads far outnumber writes."

## Stretch goals

- Add `reading_time_minutes` and decide whether to compute it on write or on read.
- Add a `post_revisions` table that keeps the last few saved versions of each post.
