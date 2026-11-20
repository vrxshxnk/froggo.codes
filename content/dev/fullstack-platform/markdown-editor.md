---
id: markdown-editor
project: fullstack-platform
title: Add a markdown editor with live preview
summary: >-
  Build a split-screen editor, with markdown on the left and a sanitised preview on the right, that autosaves drafts to your API a couple of seconds after the writer stops typing.
time: 4-5 hours
doneWhen:
  - Typing in the textarea updates the preview, and GitHub-style tables and task lists render
  - "A post containing `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` and a `javascript:` link triggers no alert in the preview, and DevTools shows no event-handler attributes"
  - Two seconds after you stop typing, the status shows "Saved", and a refresh shows your latest text
  - Fast typing sends one save per pause, not one per keystroke, which you can confirm in the Network tab
  - Closing the tab with unsaved changes shows the browser's "Leave site?" warning
docs:
  - label: "react-markdown (GitHub)"
    url: https://github.com/remarkjs/react-markdown
  - label: "rehype-sanitize (GitHub)"
    url: https://github.com/rehypejs/rehype-sanitize
  - label: "OWASP: Cross Site Scripting Prevention Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
  - label: "React: useDeferredValue"
    url: https://react.dev/reference/react/useDeferredValue
  - label: "MDN: beforeunload event"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
---

## What you're building

The writer's screen, at `/dashboard/posts/<id>/edit`. A title field across the top, a plain textarea of markdown on the left and the rendered post on the right, updating as they type. A small status line says "Saving...", then "Saved". Close the laptop mid-sentence, open the post tomorrow, and every word is there.

The preview and the public post page use the same renderer, so what the writer sees is exactly what readers get. That renderer has a sanitiser at the end. Whatever anyone types, no script ever runs.

## Why it matters

Any feature that turns user input into HTML is a cross-site scripting (XSS) risk. In *stored* XSS, the attacker's script is saved in your database and runs in every reader's browser, acting as them. Markdown allows raw HTML by design, so a careless pipeline ships this bug by default. Being able to say exactly where your sanitisation step is, and how you tested it, is a real security skill. Autosave, meanwhile, is a lesson in respecting users: losing someone's writing is the fastest way to lose them.

## Before you start

- **The rendering pipeline.** react-markdown parses markdown into a syntax tree, turns that into an HTML tree, and renders it as React elements. Plugins hook into each stage: `remarkPlugins` work on the markdown tree (remark-gfm adds tables and task lists), and `rehypePlugins` work on the HTML tree (rehype-sanitize removes anything dangerous).
- **Sanitising.** A sanitiser walks the HTML tree and keeps only an allowlist of tags and attributes. Everything else is removed: `script`, `onerror` and other event handlers, `javascript:` URLs. rehype-sanitize's default allowlist follows what GitHub permits in READMEs. An allowlist is safer than a blocklist, because new attack tricks don't appear in a list you wrote years ago.
- **Debouncing.** Waiting until events stop for a set time before acting. Here: start a 2-second timer on every keystroke and cancel the previous one. The save runs only when the writer pauses.
- **Controlled inputs and `useDeferredValue`.** The textarea's value lives in React state. Re-rendering a long post's preview on every keystroke can make typing lag. [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue) lets the preview fall slightly behind while the textarea stays instant.

## Build it step by step

### Step 1: Load the post into an editor page

Create `app/dashboard/posts/[id]/edit/page.tsx` as a server component. It calls `requireUserId()`, then `getOwnPost(id, userId)` from your data layer, and calls `notFound()` if nothing comes back. That way the editor gets the same ownership check as the API. Pass the post to an `Editor` client component (`"use client"`) that holds `title` and `content` in state.

Add a "New post" button on the dashboard that calls `POST /api/posts` and then navigates to the new post's edit page.

Check it: open the edit URL of a seeded post that belongs to another user. You get a 404 page.

### Step 2: Build one shared Markdown component

Create `src/components/Markdown.tsx` that renders react-markdown with `remarkPlugins={[remarkGfm]}` and `rehypePlugins={[rehypeSanitize]}`. Use it in two places: the editor's preview pane, and later the public post page. One component means one pipeline to secure and to test.

Keep the sanitiser in the list even though react-markdown shows raw HTML as plain text by default. Sooner or later someone adds `rehype-raw` to allow embeds. When that happens, the order is a security rule: `rehype-raw` first, `rehype-sanitize` after it, because the sanitiser can only clean what has already been parsed.

Check it: type a heading, a list, a table and a `- [ ] task`. All four render in the preview.

### Step 3: Attack your own renderer

Paste this into a post and look at the preview:

```text
<script>alert('xss')</script>
<img src="x" onerror="alert('img')">
[click me](javascript:alert('link'))
<a href="https://example.com" onclick="alert('click')">a link</a>
```

No alert should appear, and the `click me` link should go nowhere. Open DevTools and inspect the rendered elements. There should be no `onerror` or `onclick` attributes and no `javascript:` hrefs. Save these lines as a test fixture. In the [drafts milestone](/development/fullstack-platform/drafts-publish) you'll build the public post page with the same component, and you'll run this check again there.

Never pass the output of a markdown library to `dangerouslySetInnerHTML` without a sanitiser in front. If you see that prop anywhere in your codebase, find the sanitiser it relies on.

Check it: all four lines are harmless in the preview.

### Step 4: Autosave with a debounce

In the editor, watch `title` and `content`. On each change, clear the previous timer and start a new one for about 2 seconds. When it fires, send `PATCH /api/posts/<id>` with only the fields that changed. Track a small status for the UI:

```text
state: "idle" | "dirty" | "saving" | "saved" | "error"
on edit:          state = dirty, restart the 2 s timer
timer fires:      if a save is in flight, remember to save again when it finishes
                  else state = saving, send PATCH with the latest values
PATCH ok:         state = saved (unless edited meanwhile -> dirty)
PATCH fails:      state = error, retry after a few seconds
```

Allow only one save in flight at a time. If two requests overlap, an older one can arrive last and overwrite newer text, because the server applies them in arrival order.

Check it: type a long sentence quickly while watching the Network tab. You should see one `PATCH` after you stop, not dozens. Refresh: the text is there.

### Step 5: Handle failure and leaving

Stop your dev database and keep typing. The status should say something like "Couldn't save, retrying" rather than lying with "Saved". Restart it, and the next retry succeeds.

Then protect the exit. While the state is `dirty` or `saving`, listen for `beforeunload` and call `event.preventDefault()`. The browser shows its own generic "Leave site?" dialog. You can't customise its text.

Check it: type, then close the tab within 2 seconds. The browser warns you.

### Step 6: Keep typing smooth on long posts

Paste a 5,000-word post. If typing lags, render the preview from `useDeferredValue(content)` instead of `content`. Keep the textarea a plain controlled input: fancy editor libraries are out of scope.

Check it: typing in the long post feels instant, and the preview catches up a moment later.

## Common mistakes

- **Rendering markdown to HTML and injecting it raw.** Symptom: the `<img onerror>` test fires an alert. Fix: sanitise the HTML tree before rendering, with rehype-sanitize last in the list.
- **Putting `rehype-sanitize` before `rehype-raw`.** Symptom: sanitising seems on, but raw HTML still gets through. Fix: raw first, sanitise after.
- **Saving on every keystroke.** Symptom: hundreds of requests per minute in the Network tab, and a sluggish editor. Fix: debounce, and send only what changed.
- **Overlapping saves.** Symptom: occasionally, after a refresh, the last few words are missing. Fix: one request in flight at a time, and save again after it finishes if there were more edits.
- **Showing "Saved" before the server confirms.** Symptom: the writer trusts the badge, closes the tab, and loses work. Fix: set "Saved" only on a successful response.

## Say it in the interview

"Markdown allows raw HTML, so the editor was the biggest XSS risk in the app. I render through one shared component with rehype-sanitize at the end of the pipeline, and I keep a fixture of attack strings that I test the preview and the published page against. Autosave is debounced to two seconds, with only one request in flight, because overlapping saves can land out of order and lose text. The tradeoff is that a crash can lose up to two seconds of typing, which I judged acceptable for fewer, cleaner writes."

## Stretch goals

- Add a Content Security Policy header that blocks inline scripts, as a second layer behind the sanitiser.
- Keep an unsent draft in `localStorage` while offline, and offer to restore it on the next load.
