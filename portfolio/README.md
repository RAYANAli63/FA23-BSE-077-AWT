# Rayan Ali Shah — Portfolio

A premium, dark-glassmorphism portfolio built as a dependency-free static site
(HTML + CSS + vanilla JS). No build step, no `npm install` — deploys to Vercel
as-is.

## Deploy to Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Import this folder (drag-and-drop the unzipped folder, or push it to a
   GitHub repo first and import that repo).
3. Framework preset: **Other**. No build command needed.
4. Deploy. Done.

Or via CLI:
```bash
npm i -g vercel
cd portfolio
vercel
```

## Things to finish on your end

These need your own accounts/files — I can't create them for you:

1. **Resume PDF** — add your resume at `assets/Rayan-Ali-Shah-Resume.pdf`.
   The "Download Resume" buttons already point there.

2. **Contact form (EmailJS)** — the form is fully built (validation, loading
   state, success/error states) but needs your EmailJS keys to actually send
   mail to rayanshah701@gmail.com:
   - Create a free account at https://emailjs.com
   - Add an Email Service + Template (map `from_name`, `from_email`,
     `subject`, `message` fields)
   - Open `script.js`, find `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`,
     `EMAILJS_PUBLIC_KEY` near the bottom, and paste your real values.
   - Until you do this, the form still validates and gives the visitor a
     clear message rather than silently failing.

3. **Domain** — meta tags currently point at `https://rayanalishah.dev/` as a
   placeholder canonical URL. Update it in `index.html` (Open Graph, Twitter
   card, canonical link, structured data) and in `sitemap.xml` /
   `robots.txt` once you have your real domain (or your `*.vercel.app` URL).

4. **Certificates section** — hidden by default since no certificate files
   were provided. Add entries to the `CERTIFICATES` array near the bottom of
   `script.js` (title, issuer, date, fileUrl) and drop the files in `assets/`
   — the section un-hides automatically once the array isn't empty.

## What's already live and working

- **Projects section**: live-fetches your public repos straight from the
  GitHub REST API (`api.github.com/users/RAYANAli63/repos`) — no backend
  needed, no fake data. Includes search, category filters, and a
  GitHub stats dashboard (avatar, followers, following, top languages).
- **Featured projects**: Doctor Hub, Chop Prime Steakhouse, VoteSecure, Money
  Committee Manager, Twitter/X Clone, AdFlow Pro — real projects with real
  descriptions.
- **WhatsApp floating button**: opens `wa.me/923336296196` with your
  pre-filled message, always visible.
- Loading screen, scroll-progress bar, back-to-top, custom cursor, magnetic
  buttons, scroll reveals, mobile nav, custom 404 page, SEO meta tags +
  structured data, `robots.txt` + `sitemap.xml`.
- Fully responsive: mobile, tablet, desktop.

## File structure

```
portfolio/
├── index.html        # all sections/markup
├── style.css          # design system + responsive layout
├── script.js           # data (skills/projects/services/timeline), GitHub API, form logic
├── 404.html
├── robots.txt
├── sitemap.xml
├── vercel.json
└── assets/
    ├── profile_hero.jpg      # enhanced hero photo
    ├── profile_square.jpg    # cropped photo for About section
    └── favicon.svg
```

## Editing content

Everything text-based (skills, featured projects, services, timeline,
certificates) lives in named arrays at the top of `script.js` — edit those
arrays and the page re-renders automatically, no HTML editing needed.
