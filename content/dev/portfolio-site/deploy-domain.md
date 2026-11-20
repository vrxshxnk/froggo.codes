---
id: deploy-domain
project: portfolio-site
title: Deploy to a real URL
summary: >-
  Put your code on GitHub, connect the repo to Netlify, and from then on every git push updates the live site. If you have your own domain, point it at Netlify and learn how DNS works while the stakes are low.
time: 1-2 hours, plus up to a day of waiting if you set up a custom domain
doneWhen:
  - Your site loads over HTTPS at a public URL on your phone's mobile data, not just your Wi-Fi
  - Your code is in a public GitHub repo with a README that links to the live site
  - You changed one word, pushed, and saw the live site update without touching Netlify
  - If you use a custom domain, both yourname.dev and www.yourname.dev load the site with a padlock
  - The live URL is on your resume and in the website field of your GitHub profile
docs:
  - label: "GitHub Docs: Set up Git"
    url: https://docs.github.com/en/get-started/getting-started-with-git/set-up-git
  - label: "Netlify Docs"
    url: https://docs.netlify.com/
  - label: "MDN: What is a domain name?"
    url: https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name
  - label: "MDN: DNS"
    url: https://developer.mozilla.org/en-US/docs/Glossary/DNS
---

## What you're building

Your portfolio, live over HTTPS (the padlock in the address bar) at a free address like `asha-rao.netlify.app` or your own domain like `asharao.dev`. The source sits in a public GitHub repo whose README links to the live site.

And deploying stops being a task: you commit, push, and a minute later the live site has the change. That's called **continuous deployment**.

## Why it matters

A project that only runs on your laptop doesn't exist to a recruiter. A live URL proves you can ship, and deploying from Git on every push is how teams release software: nobody uploads files by hand. A custom domain teaches you DNS, which every web developer meets eventually. Learning it on a portfolio, where an hour of downtime costs nothing, is the cheapest way.

## Before you start

- **Git and GitHub.** Git is a tool on your laptop that records snapshots of your code, called commits. GitHub is a website that stores a copy of your Git repository online. `git push` sends your new commits to GitHub.
- **Static hosting.** Your site is just files: HTML, CSS, JS and images. A static host stores them and sends them to browsers. Netlify serves them from a CDN (content delivery network): copies on servers around the world, so the site is fast everywhere.
- **Domain names and DNS.** Computers on the internet find each other by IP address, a number like `203.0.113.7`. A domain name is a human-friendly label for that. **DNS** (the Domain Name System) is the internet's phone book: when a browser asks for `asharao.dev`, DNS answers with where that site lives. You buy a domain from a **registrar**, and edit its **DNS records** in the registrar's dashboard.
- **DNS record types.** An **A record** points a name at an IPv4 address. A **CNAME record** points a name at another name, for example `www.asharao.dev` at `asha-rao.netlify.app`. Every record has a **TTL** (time to live), which tells other computers how long they can cache the answer before asking again.
- **Propagation.** Computers that cached the old answer keep using it until its TTL runs out, so a change can work for you and not a friend for a while. It isn't broken; it's waiting.

## Build it step by step

### Step 1: Put the project in Git

If you haven't already, install Git and set your name and email (the GitHub setup guide in the docs below covers this). In your project folder, add a `.gitignore` with junk files like `.DS_Store` and `Thumbs.db`, then make the first commit:

```bash
git init
git add .
git commit -m "Portfolio: first version"
git branch -M main
```

Check it: `git log` shows your commit, and `git status` says the working tree is clean.

### Step 2: Push it to GitHub

On GitHub, create a new public repository with no README (you already have files). Copy the commands GitHub shows under "push an existing repository", which add the remote and push. They look like this:

```bash
git remote add origin https://github.com/<your-username>/portfolio.git
git push -u origin main
```

GitHub no longer accepts your account password for `git push` over HTTPS. Sign in through the browser window Git opens, or set up a personal access token or SSH key following GitHub's docs.

Check it: refresh the repo page on GitHub. Your files are there, with `index.html` at the top level, not inside another folder.

### Step 3: Connect the repo to Netlify

Sign up at Netlify with your GitHub account. Add a new site by importing an existing project from GitHub, and pick your portfolio repo. Since there's no build step, leave the build command empty, and make the publish directory the folder holding `index.html`, which is the repo root. Deploy.

Netlify gives you a random address. Rename the site in its settings, for example to `asha-rao.netlify.app`.

If you'd rather use Vercel, the steps are the same: import the GitHub repo, no build command, deploy.

Check it: open the URL on your phone using mobile data, not your Wi-Fi. If it loads there, it's on the public internet.

### Step 4: Prove continuous deployment works

Change one word in your hero, then commit and push. Open the Deploys list in Netlify: a new deploy starts by itself. When it finishes, refresh the live site.

From now on, every change goes through Git. If a deploy breaks something, Netlify's deploy list lets you republish an earlier one while you fix it.

Check it: the live site shows your changed word, and you didn't click anything in Netlify.

### Step 5: Point a custom domain (optional)

Buy a domain from any registrar; prices vary by registrar and ending (`.dev`, `.me`, `.in`), so compare. Students can check whether the GitHub Student Developer Pack currently includes a domain offer.

In Netlify's domain settings for your site, add your domain. Netlify then shows the exact DNS records to create. The common setup if you keep DNS at your registrar:

| Host | Type | Value |
| --- | --- | --- |
| `www` | CNAME | your Netlify address, e.g. `asha-rao.netlify.app` |
| `@` (the bare domain) | A, or ALIAS if offered | the value Netlify shows you |

Copy values from Netlify's page, since they're specific to your setup. The alternative is switching your domain's nameservers to Netlify's, which moves all your DNS to Netlify.

Check it: from a terminal, ask DNS what it currently returns (on Windows, use `nslookup` with the same name):

```bash
dig +short www.asharao.dev
```

Your Netlify address means DNS works. Nothing, or an old value, means wait and retry.

### Step 6: Get HTTPS and finish the links

Once DNS points at Netlify, it issues a free HTTPS certificate for your domain automatically. In Netlify's HTTPS settings, check the certificate is active. Make sure both `asharao.dev` and `www.asharao.dev` load, and that one redirects to the other.

Put the URL at the top of your README, on your GitHub profile, resume and LinkedIn. Run Lighthouse once more on the live URL.

Check it: open the domain in an Incognito window. The padlock shows, and clicking it says the connection is secure.

## Common mistakes

- **`index.html` is inside a subfolder.** Symptom: the deploy succeeds, but the live site shows "Page not found". Fix: move your files so `index.html` is at the repo root, or set the publish directory to that folder.
- **Wrong letter case in file paths.** Symptom: an image works on your laptop but is broken live. Windows and macOS treat `Hero.webp` and `hero.webp` as the same file; the server doesn't. Fix: use lowercase file names everywhere and match them exactly in your HTML.
- **Panicking during propagation.** Symptom: the domain works on your phone but not your laptop, or for you but not a friend, and you keep changing records. Fix: set the records once, check them with `dig`, and wait. Changing them again only adds more waiting.
- **Setting up only one of `www` and the bare domain.** Symptom: one works, the other errors. Fix: add both in Netlify and create both records.

## Say it in the interview

"The site deploys continuously: it's a GitHub repo connected to Netlify, so every push to main goes live in about a minute, and I can roll back from the deploy history. There's no build step because it's plain HTML, CSS and JavaScript. I set up the custom domain myself: a CNAME for `www` and the bare-domain record Netlify gave me, then waited out DNS propagation before HTTPS was issued. Using a managed host means I don't control the server, but for a static site that's the right trade: free HTTPS and a CDN with no maintenance."

## Stretch goals

- Add a `404.html` page at the root in your site's style. Netlify serves it for any missing path.
- Open a pull request with a small change and look at the deploy preview Netlify builds for it before you merge.
