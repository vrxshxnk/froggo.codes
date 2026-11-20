---
id: semantic-skeleton
project: portfolio-site
title: Build the semantic HTML skeleton
summary: >-
  Write the whole page in HTML with no CSS at all, using elements that say what each part is. When it reads well as plain text, the browser, screen readers and Google all understand it too.
time: 2-3 hours
doneWhen:
  - With no stylesheet linked, the page reads top to bottom in a sensible order with all your real content
  - The page has exactly one header, one main, one footer and one h1, with a section per block inside main
  - Headings go h1 then h2 then h3 with no levels skipped, and every section starts with a heading
  - The W3C validator reports no errors for your index.html
  - Pressing Tab from the top first reaches a "Skip to content" link, then every link in a sensible order
docs:
  - label: "MDN: Semantics in HTML"
    url: https://developer.mozilla.org/en-US/docs/Glossary/Semantics
  - label: "web.dev: Learn HTML, semantic HTML"
    url: https://web.dev/learn/html/semantic-html
  - label: "MDN: HTML elements reference"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
  - label: "MDN: Heading elements"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements
---

## What you're building

One file, `index.html`, holding every word of your site in the right structure. Open it in a browser and it looks like a document from 1995: black serif text, blue links, a bulleted nav. That's the goal. The headline is big because it's an `h1`, not because you styled it. The projects are a list of headings with images under them. The contact form is plain boxes with labels. A person can read the whole page top to bottom and understand it.

You're not writing a single line of CSS in this milestone. Leave `styles/main.css` empty, or don't link it yet.

## Why it matters

**Semantic HTML** means choosing elements by what the content *is*, not how it should look. A `nav` is navigation, a `button` is a button, an `h2` is the title of a section. Browsers, search engines and screen readers (software that reads a page aloud for blind users) all use these elements to understand the page. A screen reader user can jump straight to `main` or list every `h2`. A page built from `div`s with classes like `big-title` gives them nothing. The right element costs nothing to write, and reviewers notice it.

## Before you start

- **Elements and tags.** An element is a piece of the page, written with an opening tag, content and a closing tag. Some, like `img` and `input`, have no closing tag. Attributes such as `href` or `alt` sit inside the opening tag and add information.
- **Landmarks.** A few elements mark the big regions of a page: `header` (the top bar with your name and nav), `nav` (a block of navigation links), `main` (the unique content, once per page) and `footer`. Assistive technology lists these so users can jump between them.
- **`section` and `article`.** A `section` is a themed block of the page with its own heading, like your Projects block. An `article` is something that would make sense on its own if you lifted it out, like one project card. A `div` is a box with no meaning, fine for grouping things purely to style them.
- **Heading levels.** `h1` to `h6` form an outline, like chapters and sub-chapters. Use one `h1` (your name or headline), an `h2` per section, an `h3` per project card. Pick levels by structure, never by font size; CSS will fix the size.
- **The `head`.** The invisible part of the page: character set, tab title, viewport setting, and later your CSS link.

## Build it step by step

### Step 1: Create the folder and the empty page

Make the project folder with the layout you'll keep for the whole project:

```text
portfolio/
├── index.html
├── styles/main.css     (empty for now)
├── scripts/main.js     (empty for now)
└── assets/             (images, favicon)
```

In `index.html`, write the document shell: the doctype, an `html` element with `lang="en"`, a `head` and a `body`. In the `head` put `meta charset="utf-8"`, the viewport meta tag and a `title` like "Asha Rao, web developer". The viewport tag tells phones not to pretend they're a desktop screen, and it's the single line that makes responsive design possible:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Serve the folder with `python3 -m http.server 8000` (on Windows, `py -m http.server 8000`) and open `http://localhost:8000`. Check it: the browser tab shows your title.

### Step 2: Lay down the landmarks

Inside `body`, add the four big regions in order: `header`, `main`, `footer`, with a `nav` inside the header. Inside `main`, add four `section`s: hero, projects, about, contact. Give each section an `id` (`projects`, `about`, `contact`) so nav links like `href="#projects"` can jump to it.

```text
body
├── a.skip-link  -> #main
├── header
│   ├── your name (a link to the top)
│   └── nav > ul > li > a  (Work, About, Contact)
├── main#main
│   ├── section#hero      h1, pitch, two links
│   ├── section#projects  h2, then one article per project
│   ├── section#about     h2, paragraphs
│   └── section#contact   h2, form
└── footer  (email, GitHub, LinkedIn, copyright)
```

Check it: click each nav link. The page should jump to that section.

### Step 3: Fill in real headings and content

Copy in your text from the wireframe notes. The hero gets the page's only `h1`. Each section gets an `h2`. Each project is an `article` with an `h3` title, an `img`, a `p` and two links. Use `p` for paragraphs, `ul` for lists of things, and `a` for anything that takes you somewhere.

The hero's two calls to action ("See my work", "Contact me") go to places on the page, so they're links, not buttons. Buttons are for actions that happen on this page, like switching the theme.

Check it: scroll the unstyled page. The only large, bold text should be your headings.

### Step 4: Give every image real alternative text

Every `img` needs an `alt` attribute: the text a screen reader reads, and what shows if the image fails. Describe what the image shows that matters: "DevBoard with three columns of task cards". Don't write "image of" or repeat the caption. A purely decorative image gets `alt=""` so screen readers skip it.

Add `width` and `height` attributes with the image's real pixel size now. You'll need them for Lighthouse later, and they cost nothing to add while you're here.

Check it: rename one image file so it fails to load. The alt text should appear in its place and still make sense.

### Step 5: Mark up the contact form properly

Build the form with three fields: name, email and message. Every input needs a `label` tied to it with `for` matching the input's `id`, so clicking the label focuses the field and a screen reader announces it. Use `type="email"` for the email field and a `textarea` for the message. Give every field a `name` attribute, because that's what gets sent. End with a `button type="submit"`.

Leave out the `action` and validation attributes for now. That's [the contact form milestone](/development/portfolio-site/contact-form).

Check it: click each label. The cursor should jump into its field.

### Step 6: Add the skip link and validate

The first element in `body` should be a link to `#main` that says "Skip to content". Keyboard users press Tab once and can skip the whole nav. Later you'll hide it until it's focused.

Then paste your file into the [W3C Markup Validation Service](https://validator.w3.org/#validate_by_input) and fix every error. Typical ones: an unclosed tag, a duplicate `id`, an `img` with no `alt`.

Check it: validator shows no errors. Then click the address bar and press Tab repeatedly: the skip link first, then each link in reading order.

## Common mistakes

- **Choosing headings by size.** Symptom: an `h4` for the hero pitch because it "looked right", and the outline goes h1, h4, h2. Fix: pick the level from structure, and leave size to CSS.
- **`div` with a click handler instead of a `button`.** Symptom: it works with a mouse, but Tab skips it and Enter does nothing. Fix: use `button`. It's focusable and keyboard-operable for free.
- **Inputs without labels.** Symptom: placeholder text is the only hint, it disappears when you type, and Lighthouse later flags "Form elements do not have associated labels". Fix: a real `label` with `for` on every field.
- **More than one `h1` or `main`.** Symptom: the validator warns, and screen reader users get confused about which is the real page title. Fix: one of each.
- **Styling "just a little".** Symptom: you start adjusting margins and the skeleton never gets finished. Fix: no CSS file linked until every word is in place.

## Say it in the interview

"I built the page as plain semantic HTML first, with no CSS, and only styled it once it read properly as a document. Each section has a heading, project cards are `article`s, and the form uses real labels. That meant accessibility came almost for free, and Lighthouse's accessibility audit had little to flag. The tradeoff is time up front: it's slower to start than grabbing a template, but I never had to retrofit structure later."

## Stretch goals

- Open the Accessibility pane in Chrome DevTools and inspect the accessibility tree. Check that each landmark and heading appears with the name you expect.
- Try a real screen reader, VoiceOver on a Mac (Cmd+F5) or NVDA on Windows, and jump between headings.
