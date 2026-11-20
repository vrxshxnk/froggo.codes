---
id: prompts-structured
project: ai-assistant
title: System prompts and structured output
summary: >-
  Move your prompts into versioned files, and learn to get data back from a model reliably: ask for JSON that matches a schema, validate it with Zod, and retry once with the error when it doesn't fit.
time: 3-4 hours
doneWhen:
  - Every prompt lives in a file under prompts/, and no route contains a prompt longer than one line
  - Each request's log line includes the prompt name and version it used
  - Pasting a page of notes into the flashcard form returns cards that pass your Zod schema
  - A test that feeds your validator broken JSON shows exactly one retry, then a clean error
  - There's no regex anywhere that pulls data out of model text
docs:
  - label: "Zod: JSON Schema"
    url: https://zod.dev/json-schema
  - label: "OpenAI: Structured outputs"
    url: https://platform.openai.com/docs/guides/structured-outputs
  - label: "Gemini API: Structured output"
    url: https://ai.google.dev/gemini-api/docs/structured-output
  - label: "Anthropic: Structured outputs"
    url: https://docs.claude.com/en/docs/build-with-claude/structured-outputs
  - label: "Ollama: Structured outputs"
    url: https://docs.ollama.com/capabilities/structured-outputs
---

## What you're building

Two things. First, your chat's system prompt moves out of the route and into a file, `prompts/chat.v1.md`, and every request logs which prompt version it used. Second, a small "Make flashcards" form: paste a page of notes, choose how many cards, and get back a neat set of question-and-answer cards. Behind it, the model returns JSON, your server checks it against a schema, and if the JSON is wrong it asks the model once more with the exact error.

Later, the flashcard maker becomes one of Pondr's [tools](/development/ai-assistant/tool-calling). Building it on pasted text first lets you get structured output right on its own.

## Why it matters

Prompts are code. They change behaviour as much as any function, so they need versions, review and a history, and you need to know which version produced a bad answer. Structured output is how LLMs become useful inside software rather than only in chat boxes: any time a model's answer feeds into your code (a quiz, a title, a tool call), it has to arrive in a shape you can trust. Validating it at the boundary is the same discipline as validating a form on the server.

## Before you start

- **System prompt.** The `system` message sets the model's job, rules and output format for the whole conversation. A good one is short and specific: who it's talking to, what it must do, what it must never do, and what the output looks like.
- **Prompt versioning.** Treat each prompt like a migration: when you change its meaning, create a new version (`chat.v2.md`) rather than editing the old one in place. Then the eval results you collect later can be tied to an exact prompt.
- **JSON Schema.** A standard way to describe the shape of JSON: which fields exist, their types, which are required. Most providers can take a JSON Schema and constrain the model to output JSON that fits it. Each provider calls this something slightly different (structured outputs, response schema, `format`), so check its docs.
- **Zod.** A TypeScript library where you describe a shape once and get both a runtime validator and a TypeScript type. `schema.safeParse(data)` returns either the typed data or a list of exactly what's wrong. Zod 4 can also turn a schema into JSON Schema with `z.toJSONSchema()`, so you write the shape once. In Python, Pydantic does the same job.
- **Why not regex.** Model output varies in wording, order and punctuation. A regex that works for ten replies breaks on the eleventh. A schema either passes or says why not.

## Build it step by step

### Step 1: Move prompts into files

Create a `prompts/` folder. Each file holds one prompt, with a name and version in its filename or in a small header, and `{{placeholders}}` for values filled in at request time. Write a loader in `lib/prompts.ts` that reads a prompt by name and version, fills the placeholders, and throws if any placeholder is left unfilled.

Cache prompts after the first read. Make the loader return the version too, and add `prompt=chat.v1` to the log line you wrote for time to first token.

Check it: change a word in `chat.v1.md`, restart, and the chat behaves accordingly, with no route file touched.

### Step 2: Write a system prompt with a clear structure

Use the same few parts in every prompt, in this order:

```text
ROLE      You are Pondr, a study assistant for a university student.
TASK      What to do with the input below.
RULES     3-6 short rules. Be concise. Use the student's terms.
          If you are unsure, say so.
FORMAT    Exactly what the output looks like.
INPUT     {{placeholders}} go last, clearly marked.
```

Keep it under about 300 words. Long prompts are harder to debug, and every word costs tokens on every request. Each rule should be something you could check in an answer.

Check it: ask the same question at temperature 0 three times. The answers should be very similar. If they wander, your rules are too vague.

### Step 3: Define the output shapes once

Write Zod schemas in `lib/schemas.ts` for the data you need back. Start with these two:

```typescript
type Flashcards = { cards: { front: string; back: string }[] };   // 1-20 cards
type Quiz = {
  questions: {
    question: string;
    options: string[];        // exactly 4
    correctIndex: number;     // 0-3
    explanation: string;
  }[];
};
```

Put limits in the schema, not just types: a minimum and maximum number of cards, maximum string lengths, `correctIndex` between 0 and 3. A schema that accepts any array of any strings will pass junk.

Check it: in a quick script, `safeParse` a hand-written valid object (it passes) and one with `correctIndex: 7` (it fails, naming the field).

### Step 4: Ask for JSON that fits the schema

Add a second function to your `lib/llm.ts` wrapper: a non-streaming `completeJSON(messages, jsonSchema)`. Inside, use your provider's structured output feature, passing the schema from `z.toJSONSchema()`. If your provider or local model doesn't support schemas, use its plain JSON mode, and put the schema in the prompt.

Then build `POST /api/flashcards`. It takes `{ text, count }`, validates that too (text under, say, 8,000 characters, count from 1 to 20), fills `prompts/flashcards.v1.md` and calls `completeJSON`.

Check it: `curl` the endpoint with a paragraph about deadlocks and `"count": 5`. You get back JSON with five cards.

### Step 5: Validate, and retry once with the error

Constrained output fails less often, but it still fails sometimes: an extra field, a schema feature your provider ignores, or a cut-off reply when the output token limit is too small. Never assume. Wrap the call like this:

```text
reply = completeJSON(messages, schema)
result = safeParse(JSON.parse(reply))        // a parse error counts as a failure
if result failed:
    messages += assistant: reply
    messages += user: "Your JSON was invalid: <result.error>. Return corrected JSON only."
    reply = completeJSON(messages, schema)
    result = safeParse(JSON.parse(reply))
if still failed: log both replies, return 502 "Couldn't make flashcards, try again"
return result.data
```

One retry, not a loop. If the model fails twice with the error in front of it, a third try rarely helps, and each try costs tokens and seconds. Log every retry, because a rising retry rate tells you a prompt or model change broke something.

Check it: write a test that replaces `completeJSON` with a fake returning broken JSON, then valid JSON. Your code should call it exactly twice and return the valid cards.

### Step 6: Build the form and check the content too

Add a simple page with a text area, a number input and a button that shows the returned cards. Then try it on five different pages of your eval documents and read the cards. Schema-valid doesn't mean good: look for cards whose answer isn't in the pasted text, or near-duplicate cards. Tighten the prompt rules and make a `flashcards.v2.md` if needed.

Check it: in 5 runs, every card's answer can be found in the text you pasted.

## Common mistakes

- **Prompts as template strings scattered across routes.** Symptom: you can't say which prompt produced last week's bad answer. Fix: one folder, versioned files, version in every log line.
- **Trusting the type annotation instead of validating.** Symptom: `undefined` errors deep in the UI when the model skips a field. Fix: `safeParse` at the boundary, and only pass typed data inward.
- **Output token limit too low for JSON.** Symptom: random `Unexpected end of JSON input` errors on bigger requests. Fix: give structured calls enough output tokens for the largest valid reply, and cap the count in the schema.
- **Retrying without the error.** Symptom: the retry fails the same way. Fix: send the validation error back so the model knows what to fix.
- **Asking for JSON inside a streamed chat reply.** Symptom: half-parsed JSON flickers on screen. Fix: use a separate non-streamed call for structured data.

## Say it in the interview

"Prompts live in versioned files, and every request logs the prompt version, so eval results map to an exact prompt. Whenever the model's output feeds my code, I ask for JSON against a schema I define once in Zod and convert to JSON Schema, validate the reply with `safeParse`, and retry once with the validation error. The tradeoff is an extra call on failures, so I log the retry rate. It's a cheap signal that a prompt or model change broke something."

## Stretch goals

- Add a `title` schema and generate a 3-6 word chat title from the first message.
- Write a script that runs the flashcard prompt 20 times on the same text and reports the retry rate.
