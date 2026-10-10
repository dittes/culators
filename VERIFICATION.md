# Verification — 10 October 2026

- Static build: **207 calculator pages**, covering **204/204** Calculator.net sitemap topics plus three additional tools. Category totals: finance 76, health 31, math 44, everyday 56.
- Formula and boundary checks: **41 tests passed**. Includes loan/APR/Canadian mortgage calculations, FHA/VA editable charges, exact large fractions and LCMs, statistics, health equations, DST transitions, calendar boundaries, subnet limits, secure random generation, and extras.
- Browser smoke: **all 207 calculators** loaded their JS modules and submitted the default inputs without errors. No page or console errors.
- Responsive checks: home, category, mortgage, BMI, scientific, password, age and conversion pages at **320, 375, 414, 768 and 1440 pixels**. No horizontal overflow. Representative desktop/mobile screenshots were visually inspected.
- Interactions: search/no-match/reset, filters, favourites, scenario comparison, clipboard/share-link restoration, FAQs and reset passed. Additional checks confirmed nutrition/budget mode switching, sphere field visibility and a real CSV download.
- Static integrity: every generated HTML page’s local links and assets exist; calculator titles/descriptions, canonicals, hreflang and JSON-LD were validated.
- Security/accessibility: expression calculation was verified under a strict CSP without unsafe-eval. Primary text contrast measured 6.19:1 or higher; reduced motion, visible focus rings, labelled inputs, native controls and minimum touch targets are included.

These checks cover known answers, selected boundaries and default browser flows; they do not establish every possible input as correct. Tools cover the reference topics with the displayed modes and assumptions, rather than every reference feature. Calculations requiring tax/jurisdiction rules, medical interpretation or engineering specifications state their limits and often use editable assumptions.

The imprint retains the supplied six-digit postcode **101829** pending owner correction. The production domain **culators.com** has not been connected by this build. The Sites preview is owner-private.

Reproduce with `npm run build`, `npm test`, `npm run verify`, then run `node tests/browser.mjs` with the local preview server running. Browser testing uses this Mac’s bundled Playwright and installed Chrome.
