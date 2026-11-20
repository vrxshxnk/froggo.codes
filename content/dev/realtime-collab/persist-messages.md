---
id: persist-messages
project: realtime-collab
title: Persist messages and load history on join
summary: >-
  Save every message to Postgres before anyone sees it, send the last 50 when a user joins a channel, and load older history as they scroll up, using cursor pagination on message ids.
time: 4-5 hours
doneWhen:
  - Sending a message inserts a row before message:new is broadcast, and you can prove the order with a deliberate delay
  - Refreshing the page shows the same messages in the same order
  - Joining a channel returns at most 50 messages, oldest first
  - Scrolling to the top loads the previous 50 without the view jumping, and stops when there is no more history
  - Message order comes from the database id, never from client time
docs:
  - label: "PostgreSQL: Identity columns (CREATE TABLE)"
    url: https://www.postgresql.org/docs/current/sql-createtable.html
  - label: "PostgreSQL: Multicolumn indexes"
    url: https://www.postgresql.org/docs/current/indexes-multicolumn.html
  - label: "PostgreSQL: LIMIT and OFFSET"
    url: https://www.postgresql.org/docs/current/queries-limit.html
  - label: "MDN: Intersection Observer API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  - label: "socket.io: Emitting events (and acknowledgements)"
    url: https://socket.io/docs/v4/emitting-events/
---

## What you're building

Real messages. Type in #general, press Enter, and everyone in the channel sees it. Refresh and it's still there. Open a channel and you see the latest 50 messages. Scroll to the top and the previous 50 slide in above, with the message you were reading staying exactly where it was.

For now the message only appears on your screen once the server confirms it. Making it appear instantly is the [optimistic UI milestone](/development/realtime-collab/optimistic-ui).

## Why it matters

This milestone is about one ordering decision: write to the database first, broadcast second. If you broadcast first and the server crashes before the insert, people saw a message that exists nowhere. If you write first and crash before the broadcast, the message is safe, and the catch-up logic you'll build later delivers it. Choosing the order whose failure you can recover from is a core distributed-systems instinct, and being able to explain it shows an interviewer you think past the happy path.

## Before you start

- **Identity columns.** `id bigint GENERATED ALWAYS AS IDENTITY` makes Postgres assign increasing integer ids on insert. They give every message a position you can sort and paginate by, which timestamps can't do reliably, because two messages can share a millisecond.
- **Cursor pagination.** Instead of "page 3" (`OFFSET 100`), you ask for "the 50 messages before id 1042." New messages arriving while you scroll can't shift the pages, which is exactly the problem offset pagination has in a live chat. You used the same idea in Inkwell.
- **Composite index.** An index on `(channel_id, id)` lets Postgres jump straight to one channel's messages in id order, so "the 50 before X in channel Y" stays fast with millions of rows.
- **Connection pool.** The `pg` package's `Pool` keeps a few database connections open and lends them out per query. Create one pool when the server starts, never one per message. See the [node-postgres docs](https://node-postgres.com/).

## Build it step by step

### Step 1: Create the messages table

Add two tables. `messages` holds the chat, and `channel_members` holds per-user, per-channel state, which you'll need for read receipts in the next milestone.

```sql
messages (
  id          bigint identity primary key,
  channel_id  references channels,
  author_id   references users,
  temp_id     uuid,          -- the client's tempId, for de-duplication later
  body        text not null,
  sent_at     timestamptz default now()
)
-- index: (channel_id, id)
-- unique: (author_id, temp_id)
```

That's a sketch, not a migration: write the real one with your migration tool. The unique constraint on `(author_id, temp_id)` looks unnecessary now. In the optimistic UI milestone, it's what stops a retried send from creating a duplicate.

Check it: in `psql`, insert two rows by hand and select them back. The second id is larger than the first.

### Step 2: Handle message:send, writing first

In the `message:send` handler, trim the body, reject an empty one through the ack (`{ ok: false, error: "invalid_payload" }`), and insert the row. Only when the insert resolves, build the `message:new` payload from the returned row (its `id`, `sent_at`, the author's display name, and the `tempId` echoed back) and send it to the whole room with `io.to(room).emit(...)`. Then call the ack with the new id.

```text
on message:send(payload, ack):
    validate payload            -> ack error and return if bad
    row = INSERT ... RETURNING  -> ack server_error and return if it throws
    io.to(room).emit(message:new, from row)
    ack({ ok: true, data: { id: row.id } })
```

Use `io.to`, not `socket.to`, so the sender's own tabs get the message too.

Check it: two windows, one message. Both show it, and the row is in `psql`.

### Step 3: Prove the ordering with a kill test

Add a dev-only environment variable, for example `DEV_DELAY_BROADCAST_MS=5000`, that waits between the insert and the broadcast. Send a message and press Ctrl+C on the server during the wait. Restart. The message is in the database, and once you refresh, the history load shows it. Nobody saw a message that was later lost.

Now imagine the order reversed: a broadcast followed by a crash before the insert. Both windows would show a message that's gone after a refresh. Write that sentence in your README.

Check it: the row exists in `psql` even though no window received `message:new`.

### Step 4: Send the last 50 on join

Extend the `channel:join` ack to include history. Query the newest 50 for the channel (`ORDER BY id DESC LIMIT 50`), then reverse them so the client gets them oldest first. Also return whether more exist. The easy way is to fetch 51 and check if you got 51.

On the client, store messages per channel in a reducer, keyed by id, plus an ordered list of ids. Keying by id means that if the same message arrives twice (from history and from a broadcast), you just overwrite it.

Check it: send 60 messages with a quick script or by pasting. Refresh: you see the last 50, in order, scrolled to the bottom.

### Step 5: Page older history over HTTP

Add `GET /api/channels/:id/messages?before=<id>&limit=50` to Express. It uses the same query with `AND id < $before`. Make it HTTP because it's a plain read: you can test it with `curl`, and the same endpoint will power catch-up after reconnects.

```bash
curl "http://localhost:3000/api/channels/1/messages?before=1042&limit=50"
```

Cap `limit` on the server (for example at 100), whatever the client asks for.

Check it: the `curl` response's last id is just below 1042, and asking with the smallest id you have returns an empty list with `hasMore: false`.

### Step 6: Load more on scroll-up without the jump

Put an invisible sentinel element at the top of the message list and watch it with an `IntersectionObserver`. When it becomes visible, and you're not already loading, and `hasMore` is true, fetch the page before your oldest id.

The trap: prepending 50 messages pushes everything down, so the user is suddenly looking at different text. Before you prepend, record the scroll container's `scrollHeight`. After React renders, set `scrollTop` to increase by the difference. Do this in a layout effect so it happens before the browser paints.

Check it: scroll up slowly through 200 messages. The page never jumps, no message appears twice, and the requests stop at the beginning of the channel.

## Common mistakes

- **Broadcasting before the insert resolves.** Symptom: a failed insert (try sending an empty body with no validation) still shows on every screen, then vanishes on refresh. Fix: await the insert, and broadcast from the returned row.
- **Sorting by `sent_at` or by client time.** Symptom: two messages in the same millisecond swap places on refresh, or a phone with the wrong clock posts "in the past." Fix: order by `id` everywhere, and use `sent_at` only for display.
- **Offset pagination.** Symptom: while new messages arrive, scrolling up shows duplicates or skips some. Fix: page with `id < before`.
- **The scroll jump.** Symptom: after older messages load, you're looking at the top of the new page and lose your place. Fix: keep `scrollHeight` before and after, and adjust `scrollTop` in a layout effect.
- **A new database connection per message.** Symptom: under load, `sorry, too many clients already` errors from Postgres. Fix: one shared `Pool`.

## Say it in the interview

"The server writes a message to Postgres before it broadcasts it. If it crashes between the two, the message is saved but not delivered, and the client's catch-up on reconnect fixes that. The reverse order could show people a message that never existed. History is cursor-paginated on the message id, with an index on channel and id, so pages don't shift as new messages arrive. The tradeoff is that you can't jump to page 7, which a chat never needs."

## Stretch goals

- Add `GET /api/channels/:id/messages?around=<id>` so a link can open a channel scrolled to one message.
- Render day separators ("Today", "Yesterday") from `sent_at` in the reader's time zone.
