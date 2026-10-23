# PDFEasy — UX, SEO and AdSense launch checklist

This is a **site-readiness preparation checklist**, not a guarantee of AdSense acceptance. Google reviews live sites individually.

## 1. Important before publication

1. Use a domain you control and deploy through HTTPS. Publish actual content, not under-construction pages.
2. Set `NUXT_PUBLIC_SITE_URL` and `NUXT_PUBLIC_CONTACT_EMAIL` to real values. Confirm the contact mailbox works.
3. Check About, Privacy Policy and Terms for your actual operation. The bundled copy is a starting point, not legal advice.
4. Check the website on desktop, Android and iPhone. Test valid PDFs, incorrect extensions, encrypted PDFs, and an unsupported/oversized PDF.
5. Keep all main pages linked and accessible: Home, Merge PDF, PDF Guides, About, Contact, Privacy and Terms.
6. Don't copy content from other websites. Edit and expand the guides with firsthand testing, examples, screenshots, and useful information.
7. Test title tags, indexing, `robots.txt`, sitemap and canonical URLs on the live website.
8. Prefer honest, clear labels. Ads must **never** resemble an upload button, merge button, download button, or navigation link.
9. AdSense publishers must be at least 18. A parent/guardian must be the account owner if the website developer is younger.

## 2. Before requesting site review

**Current Google AdSense site verification supports a meta tag.** This project can output the `google-adsense-account` meta tag if you set:

```env
NUXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
NUXT_PUBLIC_ENABLE_LIVE_ADS=false
```

Replace the example with your **actual** ID supplied by your own AdSense account. Do not invent or share account passwords. During site review, the site must be public and the meta tag must appear in the generated page HTML. Google also offers other verification methods: follow the latest steps in your account.

The above verification method **does not insert an ad script** or serve ads. No visible ad units are included in the project.

If a site is under review or rejected, use the AdSense dashboard for exact issue descriptions. Do not claim that Google has approved a site until the dashboard says `Ready`.

## 3. Only after approval — advertising

- Verify the site has a `Ready` status in AdSense.
- Review the current official privacy requirements and use a Google-certified CMP where applicable (for example, certain EEA/UK/Switzerland traffic).
- Confirm that your privacy page reflects Google advertising and any analytics you actually use.
- Review Auto ads formats and exclusions in the AdSense dashboard. **Keep automatic overlays and ads away from the PDF workspace and download controls**; if you can't reliably control placements, use manually placed ad units in clearly separated content sections.
- Set `NUXT_PUBLIC_ENABLE_LIVE_ADS=true` **only after** compliance and placement checks. This will load Google's AdSense script, and ads may be shown according to your account settings. An approval result or consent mechanism is not detected automatically by this starter.
- Add `/ads.txt` with the exact authorized seller line copied from your AdSense account if prompted; don't guess the publisher ID. Check https://yourdomain.com/ads.txt after deployment.
- Never click your own ads, ask people to click them, or buy traffic that fabricates ad views/clicks.

## 4. What the project already includes

- Clean blue/white Inter design and accessible touch-size controls
- Browser-side PDF merging without source document uploads
- Clear select / reorder / merge steps, file feedback and redownload option
- Core routes (Home, Merge PDF, PDF Guides, 5 articles, About, Contact, Privacy, Terms)
- Search engine titles, descriptions, prerendering, canonical URLs and sitemap generation
- Optional AdSense **meta-tag-only** verification
- Explicit live ads setting defaulting to OFF

## 5. What the owner must still provide

- Real domain, real contact, functioning legal/disclosure info and ongoing content maintenance
- Actual AdSense account, website review, any appropriate age-eligible publisher arrangement
- Required privacy/consent functionality (not included), and safe ad placement settings
- Real-world UX, accessibility, legal, and content review before launch

## Official Google references

- Site content/UX: https://support.google.com/adsense/answer/7299563
- Site verification (including meta tag): https://support.google.com/adsense/answer/12169212
- AdSense eligibility: https://support.google.com/adsense/answer/9724
- Policies and deceptive ads: https://support.google.com/adsense/answer/48182
- Cookie/privacy notices: https://support.google.com/adsense/answer/1348695
- Supported publisher languages: https://support.google.com/adsense/answer/9727
