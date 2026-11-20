---
id: tool-calling
project: ai-assistant
title: "Tool calling: let the assistant take actions"
summary: >-
  Give the model three tools with tight schemas (search my notes, make flashcards, save a summary). Your code runs each tool the model asks for and sends the result back, in a loop capped at 5 steps, and validates every argument as untrusted input.
time: 4-5 hours
doneWhen:
  - '"Make 5 flashcards on deadlocks" produces 5 cards in the chat, built from your notes'
  - Your server log shows each step of the loop, with the tool name, its validated arguments and the time it took
  - A fake model that always calls a tool is stopped after 5 steps with a clear message
  - A tool call with invalid arguments (count of 500, unknown tool name) returns an error to the model instead of crashing
  - No tool reads the user id from its arguments; every tool gets it from the session
docs:
  - label: "OpenAI: Function calling"
    url: https://platform.openai.com/docs/guides/function-calling
  - label: "Anthropic: Tool use overview"
    url: https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview
  - label: "Gemini API: Function calling"
    url: https://ai.google.dev/gemini-api/docs/function-calling
  - label: "Ollama: Tool calling"
    url: https://docs.ollama.com/capabilities/tool-calling
  - label: "Zod: JSON Schema"
    url: https://zod.dev/json-schema
---

## What you're building

Pondr can now do things, not just answer. Type "make 5 flashcards on deadlocks" and a small status line says "Searching your notes...", then "Making flashcards...", and five cards appear in the chat, each citing the page it came from. Say "save a summary of what we just discussed" and a summary appears on your Summaries page.

Behind this is an agent loop: the model decides which tool to use, your code runs it, the result goes back to the model, and the loop repeats until the model answers, or until it hits a hard limit of 5 steps.

## Why it matters

Tool calling is how LLMs connect to real systems: databases, calendars, code runners, internal APIs. Every "AI agent" product is this loop plus good tools. The engineering is in the parts the demos skip: tight schemas, validating arguments, scoping every action to the signed-in user, and a hard stop so a confused model can't loop forever on your bill. Treating the model's tool calls as untrusted input is exactly what security-minded interviewers want to hear.

## Before you start

- **Tool calling (also called function calling).** You send the model a list of tools, each with a name, a description and a JSON Schema for its arguments. Instead of replying with text, the model may reply with a request: "call `make_flashcards` with `{ topic: 'deadlocks', count: 5 }`". The model never runs anything itself. Your code decides whether and how to run it.
- **Tool results.** After running a tool, you append the result to the message list as a special tool-result message, linked to the request by its call id, and call the model again. Each provider shapes these messages differently, so follow its tool-use docs.
- **The agent loop.** Call the model, run any tools it asked for, send back the results, and repeat until it replies with plain text. Each round trip is a step, and each step costs a full model call, input tokens included.
- **Untrusted arguments.** The model writes tool arguments by predicting text. They can be malformed, out of range, or shaped by text an attacker planted in a document. Treat them exactly like a request body from a stranger: validate everything, and take identity from the session.

## Build it step by step

### Step 1: Design three tools and their schemas

Write each tool's arguments as a Zod schema with tight limits, and turn it into JSON Schema with `z.toJSONSchema()`:

```text
search_notes     { query: string (max 200 chars), k?: int 1-8 }
                 read-only. Returns chunks as new numbered sources.
make_flashcards  { topic: string (max 100), count: int 1-20 }
                 searches the topic, then runs your flashcards prompt
save_summary     { title: string (max 100), content: string (max 4000) }
                 writes a row to a summaries table for this user
```

Write the descriptions carefully, because the model chooses tools by reading them. Say when to use each tool, and when not to: "Use only when the user asks for flashcards. Don't use for normal questions." Keep the automatic retrieval from the [RAG milestone](/development/ai-assistant/rag-citations) for every question. `search_notes` is for extra searches, such as the second half of a comparison.

Check it: show only the tool names and descriptions to a friend, and ask which tool they'd pick for five requests. If they hesitate, the model will too.

### Step 2: Build a tool registry

Create `lib/tools.ts` with one entry per tool: its name, description, Zod schema, JSON Schema and a `run(args, ctx)` function. `ctx` holds the session's user id, the abort signal and the current sources list. No schema has a `userId` argument.

`make_flashcards` reuses what you built: `hybridSearch` on the topic, then the validated flashcards call from the [prompts milestone](/development/ai-assistant/prompts-structured). Extend that prompt so that each card carries the number of the source it came from. `search_notes` appends its results to the sources list with the next free numbers (6, 7, 8...), so citations keep working across steps. Create the `summaries` table with `user_id`, `title`, `content` and `created_at`.

Check it: call each tool's `run` directly from a test with hand-written arguments, and confirm the result.

### Step 3: Write the loop with a hard cap

Add tools to your `lib/llm.ts` wrapper, so a step returns either text, or one or more tool calls. Then write the loop in the chat route:

```text
messages = [system, ...history, user turn with sources]
for step in 1..5:
    reply = model(messages, tools)              // streamed; forward text to the browser
    if reply has no tool calls: done
    messages += reply                           // the assistant turn with its calls
    for each call in reply.toolCalls:           // there may be several
        send SSE {type:"tool", name, status:"running"}
        result = runSafely(call)                // step 4
        messages += toolResult(call.id, result)
if the loop ended without an answer:
    send "I couldn't finish that in 5 steps. Try a narrower request."
```

The model may ask for several tools at once. Return every result with its own call id, or the next request may be rejected.

Check it: log every step as `step=2 tool=search_notes ms=140`. "Make 5 flashcards on deadlocks" should take two steps: one tool call, then the answer.

### Step 4: Validate every call before running it

`runSafely` is the security boundary:

```text
tool = registry[call.name]          -> unknown name: return {error: "unknown tool"}
args = JSON.parse(call.arguments)   -> fails: return {error: "arguments were not valid JSON"}
check = tool.schema.safeParse(args) -> fails: return {error: check.error message}
result = tool.run(check.data, ctx), with a timeout
return result, truncated to a size limit
```

Errors go back as tool results, not exceptions. The model can often fix a bad argument on the next step, which still counts towards the cap. Truncate large results (say 4,000 characters) so one tool can't flood your context window and your bill.

Check it: in a test, fake a model that calls `make_flashcards` with `count: 500`. The model receives the validation error, and nothing crashes.

### Step 5: Show tool activity and results in the UI

Handle the new `tool` SSE events. Show a status line ("Searching your notes...") while a tool runs. When `make_flashcards` returns cards, send them as their own event (`{ "type": "flashcards", "cards": [...] }`) and render them as proper cards, not as markdown text in the answer. Add a Summaries page that lists the current user's saved summaries.

Check it: request flashcards and watch the status line change, then the cards appear with working citations.

### Step 6: Test the loop's edges

Write tests with a fake model (a function returning scripted replies) to cover the cases a real model hits only occasionally: two tool calls in one reply, a tool that throws, a tool that times out, an abort from the Stop button in the middle of a step, and a model that calls a tool on every step forever. Every case should end with a clean message to the user and a log line.

Then rerun your eval questions: tools shouldn't make ordinary answers worse. If normal questions trigger `make_flashcards`, fix the descriptions.

Check it: the forever-calling fake stops after exactly 5 steps, and your eval answers are as good as before.

## Common mistakes

- **Trusting tool arguments.** Symptom: a tool runs with `count: 10000`, or with another user's id. Fix: Zod-validate every call, and take identity from the session only.
- **No step cap.** Symptom: one request makes dozens of model calls while the model retries a failing tool. Fix: a hard limit of about 5 steps, then a fixed message.
- **Dropping a tool result.** Symptom: the provider returns a 400 about a missing tool result after the model made two calls at once. Fix: return one result per call id, every time.
- **Vague tool descriptions.** Symptom: ordinary questions trigger flashcards, or the model never uses `search_notes`. Fix: say when to use and when not to use each tool, and recheck with your eval set.
- **Throwing on tool errors.** Symptom: one bad argument kills the whole chat response. Fix: turn errors into tool results the model can read and react to.

## Say it in the interview

"The model gets three tools with tight Zod schemas. When it asks for one, my code looks it up in a registry, validates the arguments, and runs it with the user id from the session, never from the arguments. The result goes back as a tool message, in a loop with a hard cap of 5 steps. Validation errors go back to the model as tool results so it can correct itself. The tradeoff is cost: every step resends the whole conversation, so I keep the cap low and log tokens per step."

## Stretch goals

- Add a `make_quiz` tool using the quiz schema, with a page that lets the student take the quiz.
- Log which tools each eval question triggered, and flag ordinary questions that called tools at all.
