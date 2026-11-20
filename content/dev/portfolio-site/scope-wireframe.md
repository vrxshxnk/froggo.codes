---
id: scope-wireframe
project: portfolio-site
title: Define the scope and sketch a wireframe
summary: >-
  Decide exactly what goes on your portfolio and where it sits, on paper, before you write any code. Four sections, real words, one sketch for a phone and one for a laptop.
time: 1-2 hours
doneWhen:
  - You have a wireframe for a phone width and a laptop width, saved as a photo or an Excalidraw file
  - Your plan lists exactly four sections (hero, projects, about, contact) and a line of things you are not building
  - Your hero headline and one-line pitch are written out as real sentences, not placeholder text
  - You have picked the 2-4 projects that will get cards, and know the live and source link for each (or have marked one as coming soon)
  - You've written down one accent colour and the font approach you'll use
docs:
  - label: "Excalidraw"
    url: https://excalidraw.com/
  - label: "web.dev: Learn Responsive Design"
    url: https://web.dev/learn/design
  - label: "MDN: What will your website look like?"
    url: https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/What_will_your_website_look_like
---

## What you're building

By the end of this milestone you have a plan, not a website. It's two rough sketches of one page: what it looks like on a phone (one column) and on a laptop (projects side by side). Each sketch shows the four sections, the order they come in and roughly what's inside each. Next to it is a short text file with the real words: your headline, your pitch, the names of your projects and a few lines about you.

A **wireframe** is a deliberately ugly drawing of a page made of boxes and labels. It shows *where things go*, not what colour they are. Grey boxes, a scribbled "photo here", lines for text. It should take minutes, not hours.

## Why it matters

Every working team decides what to build before building it. Designers hand engineers a mockup. Product managers write a scope document that lists what's in and, just as important, what's out. Learning to write down "four sections, nothing else" and stick to it is the skill that gets projects shipped. The common failure on a first portfolio isn't bad code. It's tweaking the hero's padding for an evening, hating it, starting over, and never deploying. The editor is where you carry out decisions, not where you make them.

## Before you start

- **Scope.** The list of what the project includes. Writing it down means that when you're tempted to add a blog or a skills chart with animated bars, you can check the list and say no. The roadmap fixes yours at four sections: hero, projects, about, contact.
- **Wireframe.** A low-detail sketch of layout. Paper and pen is perfect. [Excalidraw](https://excalidraw.com/) is a free whiteboard in the browser with a hand-drawn style that stops you fussing over details.
- **Content first.** Layout depends on content. A headline of four words and one of twenty need different space. Write the real words before you draw boxes for them, or your boxes will be wrong.
- **Mobile and desktop views.** Most people will open your link on a phone, often from a LinkedIn message. You sketch the phone layout first because it's the simplest: everything stacks in one column. The laptop sketch only changes what needs more room.

## Build it step by step

### Step 1: Write the scope in five lines

Create a plain text file called `notes.md` in your project folder. Nothing links to it, so visitors never see it. Write the four sections, one line each, saying what each one does for a visitor:

```text
hero      who I am, what I do, two buttons: See my work, Contact me
projects  2-4 cards: image, title, one line, live link, source link
about     3-5 sentences + what I'm learning now + resume link (optional)
contact   name, email, message, send. Plus email/GitHub/LinkedIn links
NOT DOING: blog, skills progress bars, testimonials, extra pages
```

The "not doing" line matters as much as the others. Check it: read it to a friend. If they ask "what about a skills section?", the answer is already written down.

### Step 2: Write the real content

Fill in the words now, in the same file. A headline ("Hi, I'm Asha. I build fast, accessible web apps"), a one-line pitch, and an About paragraph of three to five sentences. Keep the About about what you build and what you're learning, not your school marks.

For projects, pick two to four. Coursework counts if it's real and you can explain it. For each one, write the title, one sentence on what it does, and the live and source links. If you have only one project so far, that's fine: add a card for the next project on this roadmap marked "In progress" and replace it when it's done.

Check it: read your headline out loud. If it's longer than about twelve words, cut it.

### Step 3: Sketch the phone layout

Draw a tall, narrow rectangle. Stack the sections top to bottom: a header bar with your name and a menu or a few links, the hero, the project cards one under another, About, contact form, footer. Inside each card, draw the image box, the title line, the description line and two small link boxes. Label everything.

Decide one thing for the header now: on a phone, do the nav links fit on one line under your name, or do you need a menu? With four short links ("Work", "About", "Contact") they usually fit. Fitting them saves you building a hamburger menu, so prefer that.

Check it: someone who has never seen your plan should be able to point at each box and say what goes in it.

### Step 4: Sketch the laptop layout

Draw a wide rectangle. The only real change is the projects section: cards side by side in a grid, two or three across. The hero can sit beside a photo, or stay centred. Content should not stretch the full width of a big monitor. Draw a central column, roughly the width of a book page for text, a bit wider for the grid.

This is your one breakpoint: the width where the page switches from the phone sketch to the laptop sketch. You'll build it in [the responsive layout milestone](/development/portfolio-site/responsive-layout).

Check it: compare the two sketches. Everything on one should appear on the other. Only arrangement changes, not content.

### Step 5: Choose a colour and a font, then stop

Pick one accent colour for buttons and links, plus a near-black and a near-white. That's the whole palette. For type, use the system font stack (the font the visitor's device already has), which costs no download. You'll turn these into CSS variables later, which makes dark mode simple.

Check it: write the three colours and the font choice at the bottom of your notes. If you've spent more than fifteen minutes here, you've spent too long.

### Step 6: Save the wireframe with the project

Photograph the paper or export the Excalidraw drawing as a PNG. Keep it with the project: it goes in your README later, next to a screenshot of the finished site. The before-and-after is a good thing to show an interviewer.

## Common mistakes

- **Designing in the editor.** Symptom: hours pass, you have a hero section and nothing else, and you've restyled it three times. Fix: close the editor and finish both sketches first. Every layout question should already have an answer.
- **Lorem ipsum everywhere.** Symptom: the layout looks great until real text goes in, then the headline wraps to four lines and the cards are uneven. Fix: write the real words in step 2, before sketching.
- **Scope creep.** Symptom: your sketch has a skills chart, a timeline, testimonials and a blog, and the deploy keeps slipping. Fix: four sections. Anything else goes on a "later" list.
- **Sketching desktop only.** Symptom: in the layout milestone you discover the nav doesn't fit on a phone and the hero photo pushes your name off the screen. Fix: sketch the phone first, since that's how most visitors will see it.
- **Too many projects.** Symptom: eight cards, half of them tutorial clones. Fix: two to four projects you can talk about for five minutes each beat eight you can't.

## Say it in the interview

"Before writing code I scoped the site to four sections and sketched it at phone and laptop widths. I wrote the real copy first, because layout depends on content. The tradeoff was leaving out things like a blog and a skills section. I'd rather ship four sections that are fast and accessible than eight that are half done, and the structure makes it easy to add a section later."

## Stretch goals

- Do a five-second test: show your phone sketch to a friend for five seconds, hide it, and ask what the page is about. If they can't say, sharpen the hero.
- Sketch the dark theme too, so you know the accent colour works on a dark background before you build it.
