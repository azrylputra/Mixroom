# Mixroom

A pixel-faithful, animated build of the **Mixroom** music-school website, implemented from a Figma design as a static, self-contained site (HTML + CSS + vanilla JS, no build step).

## Pages
- `index.html` — home (hero, learn, classes, how-it-works, showcase, blogs, CTA, footer)
- `program.html` — programs/class listing with working filters (categories, level, price)
- `blogs.html` — blog listing with working search + category tabs
- `blog-detail.html` — single article page

Shared `styles.css` and `app.js` power all pages. Images live in `assets/`.

## Run locally
Any static server works. A tiny one is included:

```bash
node server.js
# then open http://localhost:4321
```

## Notes
- Design is a fixed 1440px canvas scaled responsively via CSS `zoom`.
- Fonts use **Onest** (Google Fonts) as a close stand-in for the paid **Delight** typeface used in the Figma file.
- Card/blog images use lightweight placeholder photos.
