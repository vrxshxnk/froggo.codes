---
id: llm-streaming
project: ai-assistant
title: Call an LLM from your server and stream the reply
summary: >-
  Build a chat endpoint that keeps your API key on the server, streams the model's reply to the browser token by token, and has a Stop button that really cancels the request upstream.
time: 3-4 hours
doneWhen:
  - Searching your built JavaScript in the browser's DevTools (Sources tab) finds no API key
  - The first words of a reply appear in under a second (after the model has warmed up, if it's local)
  - Pressing Stop halts the text at once, and your server log shows the upstream request was aborted
  - Sending a malformed body to the endpoint with curl returns a 400, not a crash
  - Switching providers (or to Ollama) means changing environment variables, not route code
docs:
  - label: "Next.js: Route handlers"
    url: https://nextjs.org/docs/app/api-reference/file-conventions/route
  - label: "MDN: Using server-sent events"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
  - label: "MDN: AbortController"
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  - label: "OpenAI: Streaming responses"
    url: https://platform.openai.com/docs/guides/streaming-responses
  - label: "Anthropic: Streaming messages"
    url: https://docs.claude.com/en/docs/build-with-claude/streaming
  - label: "Ollama: OpenAI compatibility"
    url: https://docs.ollama.com/openai
---

## What you're building

A plain chat page with a text box, a Send button and a Stop button. You type a question, and the reply starts appearing within a second, a few words at a time. Press Stop halfway and the text stops, and so does the model on the provider's side, so you stop paying for tokens nobody will read.

There's no retrieval yet. This milestone is about the pipe: browser to your server, server to the provider, and tokens flowing back.

## Why it matters

The API key must never reach the browser, where anyone can copy it from DevTools. Your endpoint in the middle is also where every later feature lives: auth, rate limits, retrieval, logging. Streaming matters because users judge speed by when the first word appears, so "time to first token" is the latency number AI teams watch.

## Before you start

- **Tokens.** Models read tokens, chunks of text that are often a word or part of one. In English, a token is very roughly 4 characters. Providers bill per token, separately for input (your prompt) and output (the reply). Check your provider's docs for current pricing.
- **Context window.** The most tokens a model can handle in one request, prompt and reply together. Each model's limit is in its provider's docs.
- **Messages and roles.** A chat request is a list of messages, each with a role: `system` (your instructions), `user` (what the person typed) or `assistant` (the model's earlier replies). The model has no memory between requests, so you resend the history every time.
- **Temperature.** A setting, usually from 0 to 1 or 2, that controls randomness. Keep it low for answering from notes: low values give focused, repeatable answers.
- **Streaming.** The provider sends tokens as they're generated, and your server forwards them over one long HTTP response. **Server-sent events (SSE)** is a simple text format for this: each message is a `data: ...` line followed by a blank line.
- **Aborting.** An `AbortController` gives you a `signal` to pass to `fetch` and most SDKs. Calling `abort()` cancels the request. Next.js gives each route handler a `request.signal` that aborts when the browser disconnects.

## Build it step by step

### Step 1: Scaffold the app and keep the key on the server

Create the app with `npx create-next-app@latest pondr` and pick TypeScript and the App Router. Put your settings in `.env.local`, which is git-ignored by default:

```bash
LLM_PROVIDER=openai        # openai | anthropic | gemini | ollama
LLM_API_KEY=sk-fake-replace-me
LLM_BASE_URL=              # for Ollama: http://localhost:11434/v1
CHAT_MODEL=                # pick one from your provider's models page
```

Never prefix these with `NEXT_PUBLIC_`: that tells Next.js to copy the value into the browser bundle. Model names live here too, so changing one needs no code change.

**Free path:** install Ollama, `ollama pull` a small chat model from its library, and point `LLM_BASE_URL` at it. Ollama speaks the OpenAI API format, so the OpenAI SDK works against it.

Check it: `git status` doesn't list `.env.local`.

### Step 2: Write one thin wrapper around the provider

Install your provider's official SDK and create `lib/llm.ts`, exporting one function that hides every provider detail:

```typescript
streamChat(opts: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  maxOutputTokens: number;
  signal: AbortSignal;
}): AsyncIterable<{ text?: string; usage?: { input: number; output: number } }>
```

Inside, call the SDK with streaming on, yield each text delta as it arrives, and yield the reported token usage at the end. Each SDK names these events differently, so read its streaming page. Always set a maximum output token count: it's your first cost control.

Check it: a script printing each piece from `streamChat` shows text arriving in bursts.

### Step 3: Build the route handler

Create `app/api/chat/route.ts` with a `POST` handler. In order, it should:

1. Validate the JSON body with Zod: at most 20 messages, each with a known role and content under, say, 4,000 characters. Return 400 if it fails.
2. Require a signed-in user, reusing the Auth.js setup from [Inkwell](/development/fullstack-platform/auth-oauth). Rate limits later need a trusted user id.
3. Prepend your system message on the server. The browser sends only `user` and `assistant` messages.
4. Return a `Response` whose body is a `ReadableStream`, and enqueue each delta from `streamChat` as an SSE event.

```text
data: {"type":"token","text":"Dead"}

data: {"type":"token","text":"lock happens when"}

data: {"type":"done","usage":{"input":212,"output":96}}
```

Set `Content-Type: text/event-stream` and `Cache-Control: no-cache, no-transform`. Put JSON inside each `data:` line, so a newline in the model's text can't break your framing. If the provider throws, send an `error` event with a friendly message and close the stream, rather than forwarding the raw error.

If you're using FastAPI instead, the equivalent is an `async def` endpoint that returns a `StreamingResponse` over an async generator.

Check it: with your session cookie, this prints events one by one. Without `-N`, curl buffers and streaming looks broken.

```bash
curl -N -X POST localhost:3000/api/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Hi"}]}'
```

### Step 4: Read the stream in the browser

The browser's `EventSource` only does GET, and you need to POST a message list, so use `fetch` and read `response.body` yourself: get a reader, decode bytes with `TextDecoder`, buffer the text, split on blank lines, and parse each `data:` line. A network chunk can end mid-event, so keep the leftover in the buffer for the next read.

Append each token to the message on screen, and keep the conversation in React state so the next request can send the history.

Check it: ask for "a 300-word explanation of paging". Words should appear steadily, not all at the end.

### Step 5: Make Stop really stop

Create an `AbortController` for each send, pass its `signal` to `fetch`, and call `abort()` on Stop. That closes the connection, but the provider keeps generating (and billing) unless your server passes the abort along. Pass `request.signal` into `streamChat` and on into the SDK call. When it fires, stop the loop and log `chat aborted by client` with the tokens streamed so far.

Check it: press Stop two seconds into a long answer. The text freezes and your terminal prints the abort line.

### Step 6: Measure time to first token

In the route, log the time from the request arriving to the first delta, and the total time. This is your baseline before retrieval adds work in front of the model. With Ollama, the first request after a pause is slow while the model loads into memory, so send a warm-up request first.

Check it: your log shows something like `ttft=640ms total=4.2s output_tokens=310`.

## Common mistakes

- **Using `NEXT_PUBLIC_` for the key, or calling the provider from a client component.** Symptom: it works, and the key is visible in DevTools. Fix: provider calls only in server code, and rotate any key that ever reached the browser.
- **Awaiting the full completion before responding.** Symptom: the reply appears all at once after several seconds. Fix: return the streaming `Response` immediately and push tokens into it.
- **Parsing each network chunk instead of each event.** Symptom: occasional JSON parse errors and missing words. Fix: buffer, and only parse complete events ending in a blank line.
- **Aborting only in the browser.** Symptom: Stop works on screen, but usage in your provider's dashboard keeps climbing. Fix: pass `request.signal` into the SDK call.
- **Trusting the client's message list.** Symptom: someone sends their own `system` message, or a 2 MB history. Fix: validate roles and sizes, and add the system message on the server.

## Say it in the interview

"The browser never talks to the provider. It POSTs to my route handler, which checks the session, validates the body, adds the system prompt and streams tokens back as server-sent events. Stop aborts the fetch, and the route passes `request.signal` to the SDK, so the provider stops generating and we stop paying. I chose SSE over WebSockets because data flows one way per request, over plain HTTP. All provider code sits behind one `streamChat` function, so moving from Ollama to a hosted model was an environment change."

## Stretch goals

- Show the token count and time to first token under each reply.
- Generate a chat title from the first message in the background, without delaying the stream.
