# DHAMNA

A fictional coastal retreat, built with Next.js, TypeScript and Tailwind CSS. Photography is generated; no real property, rates or reservation service are represented.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:3000. For production, run `npm.cmd run build` followed by `npm.cmd start`.

## Experience

- Slow ambient hero camera motion and pointer depth, with a pause control and reduced-motion support.
- Responsive editorial gallery and native photograph dialogs.
- Three time-of-day scenes and an imagined-stay dialog carrying the selected mood.
- Downloadable inspiration itinerary and a clearly labeled generic Airbnb link.
- Locally bundled Cormorant Garamond and Manrope fonts; Next.js optimized generated images.

Browser verification is in `scripts/verify.mjs` and runs against a local server.

## CMS integration

`cms.config.js` declares the single approved field: `home` -> `hero.eyebrow`, text, with a 120-character limit. The server-only loader uses the site-scoped CMS API key to fetch published content and keeps `A SLOWER STATE OF BEING` as its fallback. Draft editing happens in the central CMS dashboard; drafts do not appear on this site until they are explicitly published.
