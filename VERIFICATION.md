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

## White, grey and orange redesign — 2026-10-10

- Shared desktop sidebar, white panels and bold result typography applied to every calculator. Decorative navigation arrows and number-input spinners removed.
- Every successful calculation animates the result number, even when the answer is unchanged. Reduced motion uses a 120 ms opacity fade. Calculation confirmation appears without shifting focus.
- `node tests/result-motion.mjs`: repeated submissions, preserved answers, bold result weight, confirmation, reduced motion and mobile result scrolling passed.
- `node tests/browser.mjs`: all 207 routes, 320/375/414/768/1440 px viewport checks and existing interactions passed with no console or page errors.
- `npm test`: 41 passed. `npm run verify`: 207 definitions, all 204 reference topics, SEO metadata and generated links passed.

## German language and calculator workspace — 2026-10-10

- All 207 calculators have German content under `/de/`, with translated fields, formulas, practical scenarios, FAQ content, runtime feedback and search. 214 German pages have reciprocal hreflang links, language-specific canonicals and sitemap entries.
- Footer changed to “Made with ♡ in Berlin”; the sidebar ends with “Use at your own discretion”. Consistent SVG icons and expandable topic groups replace the favourites list and category counts.
- Results grow from 72% size and fade in on every successful calculation; reduced motion uses a brief fade. Native disclosure controls expose currency labels, entered currency pairs and compatible metric/imperial input conversions. Tools that already have unit selectors retain those selectors.
- Fixed finance breakdown rows that were blank due to an array/object data mismatch. ROI now compares starting/ending amounts, with no 100% ring. Removed unrelated pace/duration clocks and ungrounded solid diagrams. IRR now uses percentage units and percentage scaling.
- `npm test`: 45 passed, including regression checks for ROI rows, IRR units, measurement conversion and preservation of passwords/IPv4 data during localization.
- `node tests/browser.mjs`: 414 calculator routes, both language variants at 320/375/414/768/1440 px, existing interactions, no overflow or console/page errors.
- `node tests/settings-browser.mjs`: BMI unit conversion, sharing/reset, currency controls, ROI chart/rows, native pace unit selection, German search/runtime, language counterparts and sidebar expansion passed.
- `node tests/result-motion.mjs`: repeated calculations, unchanged answers, growing/fading result, reduced motion and mobile visibility passed.
- `npm run verify:locales`: all German translation fields, select options, FAQ shapes, reciprocal language links and visible breakdowns passed.
- During QA, the Python preview server dropped several sockets under repeated page loads. Replaced it with a dependency-free Node static preview server; the full browser audit then passed. This is development infrastructure only; deployment remains static.
