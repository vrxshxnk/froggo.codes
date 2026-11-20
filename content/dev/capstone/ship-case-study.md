---
id: ship-case-study
project: capstone
title: "Ship it: demo video + architecture case study"
summary: >-
  Record a 3-minute demo, update the design doc with what actually happened, and publish a README and case study with the architecture diagram and load-test numbers. The writeup gets you the interview, and the build gets you through it.
time: 6-8 hours
doneWhen:
  - A demo video of 3 minutes or less is linked at the top of the README, and it shows a photo going from processing to ready and one request ID traced across api and worker
  - The design doc's "what actually happened" section compares at least five planned decisions with the real outcome
  - The README has the diagram, the fan-out decision, the invalidation table, the scaling results table and a one-command local setup
  - A friend can clone the repo and get the stack running from the README alone, without asking you anything
  - The case study is published at a public URL, and the repo is public with a clean commit history
docs:
  - label: "GitHub Docs: About READMEs"
    url: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
  - label: "GitHub Docs: Creating diagrams"
    url: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams
  - label: "Docker Docs: Control startup order in Compose"
    url: https://docs.docker.com/compose/how-tos/startup-order/
---

## What you're building

Three artifacts that work together. A **demo video** of 3 minutes or less that proves the system is real. A **case study**, a blog-style article on your own site, dev.to, Hashnode or LinkedIn, that walks from requirements to architecture to bottleneck to numbers. And a **README** that lets a reviewer understand the project in two minutes and run it in ten. The design doc you started with gets its final section: what actually happened.

No new features. If something is half-built, either finish it or remove it and say so in the doc.

## Why it matters

A hiring manager or interviewer won't clone your repo. They will read a page and maybe watch a short video. The case study does their job for them: it shows, before you've met, that you can explain a system you built and defend its decisions with numbers. Three questions sit behind every technical screen. Is it real? Did you design it? Did you check it? The video answers the first, the diagram and doc the second, the load-test table the third. When the interview comes, the build is what lets you answer follow-up questions from memory instead of from theory.

## Before you start

- **Case study vs README.** The README is for someone at the repo: what it is, how to run it, where things are. The case study is for someone deciding whether to talk to you: the problem, the decisions, the evidence. They share the diagram and the numbers but not the tone.
- **"What actually happened".** A section comparing plan with reality: decision, what you expected, what you measured, what you'd change. It's the most honest part of the doc, and interviewers find it the most interesting.
- **Demo script.** Write the 3 minutes down before you record: what's on screen, what you say, roughly how many seconds each part takes. Unscripted demos run to 8 minutes and bury the good part.
- **One-command setup.** Docker Compose for the infrastructure, plus a seed script and one `pnpm dev` (or `pnpm start` after a build). Health checks and `depends_on` conditions keep the apps from starting before Postgres is ready.

## Build it step by step

### Step 1: Finish the design doc

Fill in "what actually happened". For each major decision, give one row: fan-out strategy and threshold, timeline length, cache TTLs and invalidation, notification consistency, idempotency storage, rate-limit failure mode, search scope, and the first bottleneck. For each, say what you planned, what you measured, and whether you'd change it. Fix the earlier sections where they're now wrong, but keep the original guesses visible in this table. The difference between plan and outcome is the point.

Check it: at least one row says "I was wrong about this", and explains why.

### Step 2: Make it runnable by a stranger

Clone the repo into a fresh folder, as if you were someone else, and follow your own README. Fix every snag. Make sure `.env.example` lists every variable with a fake value. Docker Compose should start Postgres and both Redis instances with health checks. The seed script should print what it created. Explain how to create the bucket and its CORS rule, or provide a local S3-compatible option. Remove dead code, commented-out experiments and debug routes.

Check it: a friend follows the README on their machine and gets a feed with seeded posts, without messaging you.

### Step 3: Write the README

Order it for a reviewer in a hurry:

```text
1. One-line pitch + demo video link + screenshot
2. Architecture diagram + a paragraph walking a photo post end to end
3. Key decisions (fan-out, caching, queues, idempotency, search), 2-3 lines each,
   each linking to the design-doc section
4. Results: the scaling table and the four-panel dashboard screenshot
5. Running it locally: prerequisites, commands, seed, test accounts
6. Repo layout (apps/, packages/, docs/, loadtest/, infra/)
7. What I'd do next
```

Keep the diagram as Mermaid in the Markdown, or as an SVG exported from Excalidraw and committed. Don't use a screenshot of a whiteboard.

Check it: someone who reads only the first screen of the README can say what Ripple is and what makes it interesting.

### Step 4: Record the demo video

Script it in four parts, about 45 seconds each:

```text
0:00  the product: sign in, scroll the feed, like a post, bell shows the group
0:45  the async path: post a photo, it shows processing, then ready;
      paste the request ID into the log search, show api + worker lines
1:30  the architecture: diagram on screen, one sentence per box
2:15  the numbers: pile-on run in Grafana, the three-mode table, one decision
3:00  end
```

Record at 1080p with a clear microphone, and zoom in on text. Rehearse twice, then record in one or two takes. You don't need editing beyond trimming. Upload it unlisted on YouTube or similar, and link it at the top of the README.

Check it: watch it once at normal speed with the sound off. The captions or on-screen text alone should still make sense.

### Step 5: Write and publish the case study

Write the case study as a story about decisions, not a feature list. A shape that works: the problem and the scale you assumed, then the architecture in one diagram, then the two or three hardest decisions with their tradeoffs (fan-out, cache invalidation, retries), then the load test with what broke first and how you found it, then what you'd do differently. Use your real numbers throughout, and link to the code for each decision. Aim for something a reader finishes in under ten minutes.

Publish it at a public URL and share it: a LinkedIn post with the diagram and one number, and a link from your portfolio. Tag nothing you can't defend in an interview.

Check it: every claim in the case study that has a number links to where that number came from (the report, a screenshot or a run).

### Step 6: Prepare your two-minute walkthrough

Interviewers will say "walk me through a project". Practise a two-minute version out loud: the problem, the architecture, the hardest tradeoff, the number you're proudest of, and what you'd change. Then list the five follow-up questions you most fear, such as "what if Redis dies?", "why not Kafka?", "how would this handle 100x?", and write a two-sentence answer to each in your design doc's last section.

Check it: you can give the walkthrough without notes in under two and a half minutes.

## Common mistakes

- **A README that's only setup steps.** Symptom: reviewers see `pnpm install` first and leave without seeing a single decision. Fix: pitch, video, diagram and results go above the setup.
- **A 10-minute demo.** Symptom: nobody reaches the part with the request ID or the load test. Fix: script it to 3 minutes and lead with the product, then the async path.
- **Numbers without context.** Symptom: "p95 of 120 ms" means nothing without the rate, data size and machine. Fix: always state the scenario and setup next to the number.
- **Hiding what went wrong.** Symptom: the case study reads like marketing, and an interviewer probes until the gaps show. Fix: the plan-vs-actual table, with at least one honest miss.
- **Secrets in the public repo.** Symptom: a real bucket key or database URL in the commit history. Fix: check the history before making it public, and rotate any key that was ever committed. Deleting the file doesn't remove it from history.

## Say it in the interview

"Ripple is a social platform I designed on paper first and then built, measured and wrote up. The design doc predicted a 1,000-follower fan-out threshold. Under a k6 pile-on with 500 concurrent readers, the hybrid held feed p95 at X ms where pure push was Y ms, so the threshold stayed. I was wrong about the first bottleneck: I expected the feed query, and it was Z. The case study covers the tradeoffs I'd defend, like a 30-second-stale first feed page in exchange for not doubling fan-out writes, and the ones I'd revisit at 100x."

## Stretch goals

- Deploy the stack on a small VPS with the same Docker Compose file and a domain, and link a live, read-only demo account from the README.
- Give a 10-minute talk on the project at your college's coding club or a local meetup, and link the slides from the case study.
