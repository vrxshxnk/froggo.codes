---
id: evals-first
project: ai-assistant
title: Pick the use case and write the eval set first
summary: >-
  Before you write any code, pick one real set of documents and write 25 questions with their answers and source pages, including 5 the documents can't answer. Every later change to Pondr gets measured against this file.
time: 2-3 hours
doneWhen:
  - You have one folder of real documents (PDF or Markdown) that you'll use for the whole project
  - Your eval file has 25 rows, each with a question, an expected answer, the file and the page
  - At least 5 rows are marked unanswerable, and you've checked the documents really don't cover them
  - At least 3 questions depend on an exact term (a name, a code, a formula) rather than a general idea
  - The file is committed to git, and no code for the app exists yet
docs:
  - label: "OpenAI: Evaluation best practices"
    url: https://platform.openai.com/docs/guides/evaluation-best-practices
  - label: "Anthropic: Define success criteria and build evaluations"
    url: https://docs.claude.com/en/docs/test-and-evaluate/develop-tests
  - label: "MDN: JSON"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
---

## What you're building

At the end of this milestone you have no app at all. You have a folder of documents and one file, `evals/questions.json` (or a spreadsheet exported to CSV), with 25 questions about those documents. Each row says what the right answer is and which file and page it comes from. Five of the questions are things the documents don't cover, and the right answer to those is "I don't know."

This file is the definition of "working." From now on, whenever you change a prompt, the chunk size, the search method or the model, you'll run these 25 questions and compare the score with the last run.

## Why it matters

LLM apps fail quietly. A bad answer looks just as confident as a good one, so you can't tell by trying three questions in the chat box whether a change helped. Teams that build with LLMs seriously write evaluations (evals) before they tune anything, the same way good engineers write a failing test before the fix. Walking into an interview with "I measured it on a fixed set of questions" puts you ahead of most candidates, who can only say "it seemed better."

## Before you start

- **Eval set.** A fixed list of inputs with known good outputs, used to score a system. It's like a test suite, except the scores are percentages, not pass or fail, because model output varies.
- **Retrieval vs generation.** Pondr will do two separate things: find the right paragraphs (retrieval), then write an answer from them (generation). Your eval set needs the source page for every question so that you can score retrieval on its own. If the right page never reaches the model, no prompt can save the answer.
- **Answerable vs unanswerable.** An assistant that always answers is dangerous for studying: it will invent a plausible answer for a topic you never covered in class. The unanswerable questions test whether Pondr admits it doesn't know.
- **Overfitting.** If you tune your system against the same 25 questions for weeks, it can get good at those questions and no better at anything else. Keep a few extra questions aside, and don't look at them until the end.

## Build it step by step

### Step 1: Choose one real document set

Pick documents you actually care about and know well enough to judge answers: your operating systems notes for this semester, two or three chapters of a textbook as PDFs, or a framework's docs saved as Markdown. Aim for 50 to 300 pages in total. Fewer pages makes retrieval too easy to be interesting. More pages makes it slow to write good questions.

Avoid scanned PDFs. Open each file and try to select text with your cursor. If you can't select it, it's an image and Pondr won't be able to read it (OCR is out of scope).

Put the files in a `docs/` folder. Check the licence before you commit someone else's PDF to a public repo. If it's not yours to share, list the files in the README and add the folder to `.gitignore`.

Check it: you can name, from memory, roughly what each file covers.

### Step 2: Decide the row format

Use one JSON array, or one spreadsheet with these columns. Either works. JSON is easier to read from a script later.

```json
{
  "id": "q07",
  "question": "What are the four necessary conditions for deadlock?",
  "answer": "Mutual exclusion, hold and wait, no preemption, circular wait.",
  "sources": [{ "file": "os-unit3.pdf", "page": 41 }],
  "answerable": true,
  "type": "fact"
}
```

`sources` is a list because some answers come from two pages. Page numbers are the PDF viewer's page numbers (page 1 is the first page of the file), not the numbers printed in the corner of the page. They differ more often than you'd think, and your citations later will use the viewer's numbering.

Check it: open one file at the page you wrote. The answer is there.

### Step 3: Write 20 answerable questions with a spread of types

Write questions the way a student would really ask them, not copied phrases from the text. Mix these types and record each one in `type`:

- **fact**: one clear answer on one page ("What is Belady's anomaly?")
- **exact-term**: depends on a specific name, code or symbol ("What does the `SIGCHLD` signal mean?"). Search by meaning often misses these, and you'll fix that in the [hybrid search milestone](/development/ai-assistant/hybrid-rerank).
- **explain**: needs a paragraph, not a phrase ("Why does paging cause internal fragmentation?")
- **multi-page**: the answer sits across two pages or two files ("Compare FCFS and round robin scheduling")

Aim for roughly 8 fact, 4 exact-term, 5 explain and 3 multi-page questions. Write the expected answer in your own short words, with only the points a correct answer must contain. Keep it short, because later a script (and an LLM judge) will compare answers against it.

Check it: for each question, find the page again without searching. If you can't, the question or the page is wrong.

### Step 4: Write 5 unanswerable questions, carefully

These are the hardest to write well. A good unanswerable question sits next to the documents' topic but isn't covered by them: if your notes cover process scheduling but not Linux's CFS scheduler, ask "How does the Linux CFS scheduler pick the next task?" A question about cricket is too easy: any model refuses it.

Set `answerable: false`, leave `sources` empty, and set `answer` to something like "Not covered in the notes." Then search every file for the key terms (Ctrl+F in the PDF viewer) to confirm they really aren't there.

Check it: a classmate reading only your documents would also say "the notes don't say."

### Step 5: Set aside a holdout and commit

Write 5 more questions of mixed types and put them in a separate file, `evals/holdout.json`. You won't run these until the [shipping milestone](/development/ai-assistant/ship-ai). They're your honest check that your improvements weren't fitted to the main 25.

Add a short `evals/README.md` saying what the document set is, how you chose the questions, and how many of each type there are. Commit everything before you start the next milestone.

Check it: `git log` shows the eval set committed before any application code.

## Common mistakes

- **Copying sentences from the document as questions.** Symptom: retrieval scores near-perfect from day one, then real users get poor answers. Fix: rephrase questions the way you'd ask a friend, using different words from the text.
- **Wrong page numbers.** Symptom: later, retrieval "misses" questions that it actually got right. Fix: use the PDF viewer's page number, and spot-check five rows after you finish.
- **Unanswerable questions that are too far from the topic.** Symptom: a 100% refusal score that tells you nothing. Fix: make them close cousins of what the documents do cover.
- **Long, essay-style expected answers.** Symptom: you can't tell whether a model answer is right without rereading the page. Fix: list only the points a correct answer must include.
- **Changing the eval set every time a score drops.** Symptom: scores go up but the app doesn't feel better. Fix: only fix rows that are genuinely wrong, and note each change in the eval README.

## Say it in the interview

"Before writing code, I wrote 25 questions over my OS notes, each with the expected answer and the page it comes from, and 5 the notes can't answer. Storing the page let me score retrieval separately from the final answer, which is how I later found that most wrong answers came from search, not from the prompt. The tradeoff is that 25 questions is small, so a one-question change is 4 points of noise. I kept a separate holdout set to check I wasn't overfitting."

## Stretch goals

- Ask a classmate to write 10 questions without seeing yours, and use them as a second holdout.
- Add a `difficulty` field so you can report scores separately for easy and hard questions.
