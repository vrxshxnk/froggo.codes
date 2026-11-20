---
id: contact-form
project: portfolio-site
title: Wire a contact form with client-side validation
summary: >-
  Let visitors message you from the page. HTML validation attributes do most of the checking; a little JavaScript adds friendly error messages and sends the form to Formspree without a page reload.
time: 2-3 hours
doneWhen:
  - Submitting a real message from your live or local page delivers an email to your inbox
  - Submitting with an empty field or a badly formed email shows a clear message next to that field, and nothing is sent
  - After a successful send, the page shows a thank-you message without reloading and the form clears
  - With JavaScript turned off in DevTools, the form still validates and still sends
  - The send button can't be double-clicked into two submissions
  - A screen reader announces the error and success messages
docs:
  - label: "MDN: Client-side form validation"
    url: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
  - label: "MDN: ValidityState"
    url: https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  - label: "MDN: FormData"
    url: https://developer.mozilla.org/en-US/docs/Web/API/FormData
  - label: "MDN: Using the Fetch API"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - label: "Formspree help"
    url: https://help.formspree.io/
---

## What you're building

The Contact section works. A visitor types their name, email and a message and presses Send. If they left something out or mistyped their email, a short, specific message appears under that field ("Please enter an email like name@example.com") and focus moves to it. If everything's fine, the button changes to "Sending...", and a moment later the form is replaced by "Thanks, I'll reply within a couple of days." Their message is in your inbox. The page never reloaded.

There's no server of your own. A **form service** receives the submission and emails it to you. This guide uses Formspree. Web3Forms works the same way if you prefer it; only the endpoint and field names differ.

## Why it matters

Forms are where users give you data, and where most accessibility and validation bugs live. Using built-in browser validation first and JavaScript only to improve it is called **progressive enhancement**: the page works at a basic level for everyone, and gets better where JavaScript runs. You'll also make your first network request with `fetch` and handle the three outcomes every request has: success, a failure response, and no response at all.

## Before you start

- **How a form submits.** A `form` with `action` (a URL) and `method="post"` sends every field that has a `name` to that URL when submitted, then loads whatever page comes back. This works with no JavaScript at all.
- **Constraint validation.** Attributes that make the browser check fields before submitting: `required` (must not be empty), `type="email"` (must look like an email), `minlength` and `maxlength`. If a check fails, the browser blocks the submit and shows its own bubble.
- **The validity object.** Every input has an `input.validity` object with flags like `valueMissing`, `typeMismatch` and `tooShort`. `form.checkValidity()` returns `true` only if every field passes. You read these flags to write your own messages instead of the browser's.
- **`fetch` and `FormData`.** `fetch` makes an HTTP request from JavaScript and returns a promise. `new FormData(form)` collects every named field into a body `fetch` can send.
- **Live regions.** An element with `aria-live="polite"` makes screen readers announce text when it changes. That's how a blind user hears "Message sent" without the page reloading.

## Build it step by step

### Step 1: Create the form endpoint

Sign up at Formspree, create a new form, and copy its endpoint URL, which looks like `https://formspree.io/f/abcdwxyz`. Set it as your form's `action` and add `method="post"`. The endpoint is meant to be public, so it's fine in your HTML and on GitHub.

Follow any email-confirmation step the Formspree dashboard asks for, and check its current plan limits there.

Check it: with no JavaScript yet, fill in the form and submit. You should land on a Formspree confirmation page, and the message should arrive in your email.

### Step 2: Add the validation attributes

Your fields from the skeleton milestone already have labels and names. Now add the rules:

| Field | `name` | Attributes |
| --- | --- | --- |
| Name | `name` | `required`, `autocomplete="name"`, `maxlength="100"` |
| Email | `email` | `type="email"`, `required`, `autocomplete="email"` |
| Message | `message` | `required`, `minlength="10"`, `maxlength="2000"` |

Add a hidden spam trap too, called a honeypot: an extra input that real people never see or fill in, but bots do. Formspree documents a field named `_gotcha` for this. Hide it with CSS and `tabindex="-1"`, plus `autocomplete="off"`.

Check it: try to submit with an empty name. The browser blocks it with its own message. Type "asha@" as the email: blocked again.

### Step 3: Take over the error messages with JavaScript

The browser's bubbles vary by browser and vanish quickly. In `main.js`, find the form and set `form.noValidate = true`. Doing this from JavaScript, rather than writing `novalidate` in the HTML, means visitors without JavaScript keep the browser's built-in checks.

Under each field, add an empty `p` with an `id` for its error, linked to the input with `aria-describedby` so screen readers read it with the label. Then, on `submit`:

```text
on submit:
    prevent the default submit
    for each field: clear its message
    if form.checkValidity() is false:
        for each invalid field:
            pick a message from field.validity (valueMissing, typeMismatch, tooShort)
            show it, set aria-invalid="true" on the field
        move focus to the first invalid field
        stop
    send the form (step 4)
```

Say how to fix it: "Your message needs at least 10 characters" beats "Invalid input".

Check it: submit an empty form. Every field shows its own message, and the cursor lands in the first one.

### Step 4: Send it with fetch

When the form is valid, send it without leaving the page. Formspree returns JSON instead of a redirect if you ask for it with an `Accept` header:

```javascript
const response = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
```

Before the request, disable the submit button and change its text to "Sending...". Then handle all three outcomes: `response.ok` is true (show the thank-you message and reset the form), `response.ok` is false (show "Something went wrong, please email me at ..." with your address as a link), or `fetch` itself throws because the visitor is offline (same fallback). Re-enable the button in every case except success.

Check it: send a real message and watch the Network panel. You should see a POST to your endpoint with status 200, and the email should arrive.

### Step 5: Announce the result

Put the status message in an element with `aria-live="polite"` that exists in the page from the start, empty. Live regions announce changes to their content, so an element you create and insert at the last moment is often not announced. Write "Sending...", then "Thanks, your message is on its way", into it.

Check it: in DevTools, set the network to Offline and submit. You should see your friendly failure message, with your email address as a fallback.

### Step 6: Clear errors as the user fixes them

Once a field has shown an error, listen for `input` events on it and re-check just that field, clearing the message as soon as it's valid. Don't show errors while someone is typing a field for the first time. Being told your email is invalid after one letter is annoying.

Check it: submit empty, then type a valid email. That field's message disappears as soon as the email is complete.

## Common mistakes

- **Writing `novalidate` in the HTML.** Symptom: with JavaScript off, empty forms get sent. Fix: set `form.noValidate = true` from your script, so only JavaScript users skip the native checks.
- **Fields with no `name` attribute.** Symptom: the email arrives, but the message body is empty. Fix: `FormData` and normal submits only include fields that have a `name`.
- **Forgetting the `Accept` header.** Symptom: the request is sent and the email arrives, but your code receives HTML, not JSON, and your success message never shows. Fix: send `Accept: application/json`.
- **Not disabling the button.** Symptom: an impatient double-click sends you the same message twice. Fix: disable it before `fetch`, re-enable on failure.
- **Trusting `type="email"` too much.** Symptom: "a@b" passes, because it's a valid address by the standard. Fix: that's fine. Client-side validation is for helping honest users, not for security. The form service is what filters spam.

## Say it in the interview

"The form works with no JavaScript at all: native `required`, `type="email"` and `minlength` checks, posting straight to Formspree. JavaScript then enhances it by turning off the native bubbles, showing specific messages from `input.validity`, and sending with `fetch` so the page doesn't reload. I handle success, an error response and a network failure, and announce the result in a live region for screen readers. The tradeoff of using a form service instead of my own API is depending on a third party, but it removed a whole server from a static site."

## Stretch goals

- Add a character counter under the message field that updates as you type and turns your accent colour near the limit.
- Save the unsent message to `sessionStorage` as the visitor types, so an accidental refresh doesn't lose it.
