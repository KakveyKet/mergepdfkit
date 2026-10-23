# PDFEasy — usability + AdSense readiness update

**Upgrade path:** Copy files in this ZIP into the root of your existing PDFEasy (Blue + Inter) project, replacing matching files. The ZIP preserves folder paths.

Run `npm install` (if not already installed), `npm test`, then `npm run dev`. No new package dependencies.

**Production:** Configure your real domain and email in `.env`, create your own AdSense publisher account if age eligible (or have a parent/guardian own the account), and read `ADSENSE-LAUNCH-CHECKLIST.md`.

The account ID adds a verification META tag by default. It DOES NOT show ads. Do not enable advertising before site approval and consent requirements are met.

Tests passed (6/6) in this environment. Full Nuxt build could not be completed because npm registry DNS was unavailable.
