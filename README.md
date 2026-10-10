# culators

A framework-free, mobile-first HTML/JS calculator website. 207 working tools: all 204 calculator topics in Calculator.net’s sitemap captured on 10 October 2026, plus unit price, reading time and break-even calculators. Implementations and explanatory copy are original. Tools cover the listed topics; they do not reproduce every mode, jurisdiction or option of the reference website.

## Run

Node 20+ and Python 3 are enough. No install step or runtime CDN is required.

```sh
npm run build
npm test
npm run verify
npm run dev
```

Open http://localhost:4173/en/. The domain root redirects to `/en/`. Upload **dist/** to a static host such as Cloudflare Pages or GitHub Pages with a custom domain. The site uses absolute paths and must be hosted at a domain root, not a GitHub repository subpath.

Optional browser audit: start the local server, then run `node tests/browser.mjs`. This audit uses the bundled Playwright runtime and installed Chrome on this Mac; `CULATORS_BASE_URL` and `CULATORS_CHROME_BIN` can override the target and browser.

## Structure

- `calculators/*.mjs`: definitions, topic-specific formulas, validation and original article content.
- `data/catalogue.json`: reference topic inventory with source URLs.
- `data/site.json`: origin, category copy and imprint.
- `scripts/build.mjs`: creates real HTML for calculator/category/legal pages, sitemap, metadata and structured data.
- `assets/app.mjs`: search, favourites, share links, comparisons and CSV export.
- `tokens.css` / `assets/site.css`: system-font design and reduced-motion support.
- `tests/*.test.mjs`: known-answer and boundary tests.

## SEO and languages

Every calculator has a distinct `/en/<slug>/index.html`, title, description, canonical, English hreflang, breadcrumb and WebApplication/FAQ structured data. Content, default results and internal links are rendered at build time. `sitemap.xml` and `robots.txt` use the origin in `data/site.json`. SEO markup helps crawlability; it does not guarantee search ranking or rich results.

For another language, introduce localized tool/article and interface copy, generate it under that language’s folder, and add reciprocal hreflang links for actual translations. Do not publish empty language folders. Current generator supports English; adding a language requires extending it, rather than only changing a setting.

## Privacy and assumptions

Inputs calculate locally. Favourites store only tool identifiers in localStorage. Scenario comparisons live in page memory. Share links explicitly include inputs in the URL; they can enter browser history and hosting logs. Avoid sharing sensitive inputs. CSV export sanitizes formula-leading text. No external fonts, advertising or analytics scripts are included.

Tax, pension, medical, sizing, material and engineering tools label their assumptions and limits. Many rates and factors are editable and are not live data. Currency is a user-supplied exchange-rate converter; official tax/pension assessments and medical decisions require the applicable rules and professional context.

The imprint uses the supplied address verbatim. **The six-digit postcode `101829` still needs correction by the owner before public launch.** Update `data/site.json` and rebuild.

## Deployment

`.openai/hosting.json` identifies the private Sites preview. Canonicals intentionally target the requested production domain `culators.com`; they should be changed if a different public domain is used. A private preview does not connect or launch that custom domain.

Cloudflare Pages honors `dist/_headers`. Other hosts need equivalent security headers configured separately. The expression calculator uses a bounded parser and works without `unsafe-eval`.
