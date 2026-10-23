# PDFEasy — free browser-based PDF merge tool

A **Nuxt 4 + Vue 3 + Tailwind CSS 4** website. Merging uses **pdf-lib** in the visitor's browser. There is **no document upload endpoint** and **no database or backend requirement** for the MVP.

## Requirements

- Node.js **20.19+** (Node 22 LTS is a good choice)
- npm
- An internet connection for `npm install` (the starter ZIP does not contain `node_modules`)

## Quick start (Windows PowerShell)

```powershell
cd pdfeasy-starter
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available commands

```bash
npm run dev       # local development
npm run test      # tests using Node's built-in test runner
npm run build     # build Nuxt server output
npm run generate  # create static website in .output/public
npm run preview   # preview built output
```

## IMPORTANT: configure your domain and real email before launch

Copy `.env.example` into `.env`, then replace **both** placeholder values with your real information. Nuxt reads `.env` for local development; for a production static build the environment variables also need to be present at build time. One way:

### PowerShell

```powershell
$env:NUXT_PUBLIC_SITE_URL="https://your-real-domain.com"
$env:NUXT_PUBLIC_CONTACT_EMAIL="support@your-real-domain.com"
npm run generate
```

### Linux

```bash
export NUXT_PUBLIC_SITE_URL="https://your-real-domain.com"
export NUXT_PUBLIC_CONTACT_EMAIL="support@your-real-domain.com"
npm run generate
```

A build without the URL intentionally omits `sitemap.xml`, and a build without the email intentionally displays a **visible owner warning** on the contact/privacy pages. Do not publish those placeholders. Generated site pages include canonical links when the site URL is set.

## Deploy static website to Ubuntu + Nginx

With a real domain set, run `npm run generate`, then upload the **contents** of `.output/public` to `/var/www/pdfeasy` on your server. See `deploy/nginx-static.conf.example` for a basic Nginx configuration. Configure HTTPS for your domain before public release. This site works as static files; **PM2 and MongoDB are not required**.

## PDF merge behavior

- Select at least 2 PDFs and at most 20.
- Per-file limit: **30 MB**. Total input: **100 MB**.
- Files are validated and loaded locally in the browser; the input is **never sent to an API**.
- Reorder by drag/drop or arrow buttons, remove documents, choose a download filename and merge/download.
- The result includes a **Download PDF again** action if the browser blocks the first attempt.
- Encrypted/password-protected documents are rejected.
- Some advanced PDF features (notably digital signatures and interactive forms) may not survive merging. Users should verify important output.
- Heavy documents can still exceed a particular device's memory despite the input limits.

## SEO and launch content

- Static prerendered English pages for discoverability.
- Unique title/meta descriptions and conditional production canonical links.
- Generates `robots.txt` and `sitemap.xml` based on `NUXT_PUBLIC_SITE_URL`.
- Pages: `/`, `/merge-pdf`, guide index and 5 educational guides, About, Contact, Privacy and Terms.
- Text of legal/privacy pages must be reviewed for your actual operations and jurisdiction. **Last updated dates** should be changed when necessary.

## AdSense: optional meta tag verification, ads off by default

This version supports AdSense's site ownership verification using the official **meta tag**. After an authorized publisher receives their own account ID, set `NUXT_PUBLIC_ADSENSE_CLIENT_ID` to that ID and `NUXT_PUBLIC_ENABLE_LIVE_ADS=false`. With those values, Nuxt includes the `google-adsense-account` meta tag in the `<head>`, without loading any ad script.

**Do not activate advertisements before the site is approved and privacy/consent requirements have been met.** Before applying, make sure the public website is complete, works on phones, has substantial original content and real contact information, and follows Google Publisher Policies. These pages help establish a foundation but **do not guarantee approval**.

After approval **and appropriate consent configuration**, `NUXT_PUBLIC_ENABLE_LIVE_ADS=true` can load the script for approved ad serving. Configure your ad placement and `ads.txt` using instructions from your own AdSense account. This starter has no consent platform and does not automatically know whether your site is approved; don't enable the script without completing that work. Read `ADSENSE-LAUNCH-CHECKLIST.md` before going live. Keep ads clearly separated from file-selection and download controls. Update your Privacy Policy and implement any required consent mechanism **before** enabling ad or analytics scripts. Google AdSense has a **minimum publisher age of 18**; someone under 18 needs a parent or guardian to apply with their own account.

Official documentation:
- Nuxt: https://nuxt.com/docs/4.x
- Tailwind Nuxt setup: https://tailwindcss.com/docs/installation/framework-guides/nuxt
- pdf-lib: https://pdf-lib.js.org/
- AdSense policies: https://support.google.com/adsense/answer/48182
- AdSense language rules: https://support.google.com/adsense/answer/9727

## Architecture decisions

Keeping processing local avoids server-upload security and storage requirements and makes it cheaper to deploy. Node.js is used to **develop and prerender** this Nuxt website; Express/MongoDB can be added later only if needed for unrelated features (for example, a CMS or a user feedback API). Do not add file-upload endpoints merely to implement merging.

## Pre-launch checklist

- [ ] Replace domain and contact email placeholders.
- [ ] Confirm all pages and mobile UI work on a live HTTPS domain.
- [ ] Test several PDF variations, including invalid/encrypted and moderately large files.
- [ ] Review original articles, privacy information, and terms for accuracy.
- [ ] Run `npm run test` and `npm run generate` locally.
- [ ] Check `sitemap.xml`, `robots.txt`, canonical URLs and Search Console.
- [ ] Add support response handling and maintain updated dependencies.
- [ ] Only apply for AdSense when the site meets its current policies.
