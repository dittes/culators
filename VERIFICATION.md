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

## Czech and result-character update — 2026-10-10

- Added 207 Czech calculators under `/cs/`, including interface, calculator inputs/options, explanations, practical scenarios, FAQs and runtime feedback. Three-language menu links to the corresponding calculator, with reciprocal EN/DE/CS hreflang and sitemap entries.
- German amount labels default to EUR; Czech labels default to CZK. Explicit shared currency choices override defaults. Currency labels do not convert amounts or change jurisdiction-specific formulas.
- Primary orange buttons use white, bold 19.2 px text. The hero accent uses the same orange; scenario comparison stays neutral. Each result grapheme fades and grows separately, preserving exact answer text. Reduced motion retains a short opacity-only confirmation.
- Reproduce the additional design/currency/language checks with `node tests/language-design.mjs`.
- `node tests/browser.mjs`: all **621 calculator routes** passed default load/submission checks; all three languages passed representative **320/375/414/768/1440 px** viewport checks. No route failures, overflow, interaction failures, console errors or page errors.
- `npm test`: **45 passed**. `npm run verify:locales`: **414 DE/CS translations** passed field/option/FAQ and language-link checks. Static local links and assets passed.
- `node tests/result-motion.mjs`, `node tests/settings-browser.mjs` and `node tests/language-design.mjs`: passed character staggering/repeated submissions, exact answer preservation, reduced motion, mobile result scrolling, measurement conversions, shared settings, EUR/CZK defaults, explicit USD override, white primary labels, matching hero orange, neutral scenario action, language counterparts and Czech search.
- Visually inspected the Czech ROI desktop page and German BMI page at 320 px.

## Localized URLs and Polish — 2026-10-10

- Canonical URLs now use language-specific calculator and category words, including `/de/bmi-rechner/`, `/cz/kalkulacka-bmi/` and `/pl/kalkulator-bmi/`. Czech shows CZ and uses `/cz/`; HTML language and hreflang correctly remain `cs`.
- One generated route table drives translated search URLs, navigation, language counterparts, canonicals, Open Graph URLs, structured data and sitemap entries. Calculator IDs remain stable across languages so stored favourites and calculation modules keep working.
- Previous `/cs/` links and English calculator/category slugs on localized pages redirect to the translated route. Redirect aliases are excluded from the sitemap and marked noindex. Static-host fallback redirects preserve query parameters and fragments; `_redirects` declares 301 rules, and the local server verifies those rules.
- Added complete Polish calculator/interface content and PLN as the default Polish amount currency, with the same explicit-label assumptions as other currencies.
- `npm test`: **45 tests passed**. `npm run verify:locales`: **621 DE/CS/PL translations** passed content, field/option/FAQ, reciprocal-language and visible-result checks. `npm run verify`: catalogue, SEO and all generated links/assets passed.
- `node tests/routes-browser.mjs`: **1,064 legacy redirect mappings** passed status/location/query-retention checks. Browser checks passed old DE/CS link restoration, CZ display with correct `cs` HTML language, translated search, four-language counterparts and the JavaScript fallback preserving query/fragment.
- Settings, repeated result animation, reduced motion, unchanged answers, neutral scenario button, white primary labels, identical hero orange and EUR/CZK/PLN defaults passed. Visually inspected Polish ROI on desktop and BMI at 375 px.
- `node tests/browser.mjs`: **828 calculator routes** passed default load/submission checks. All four languages passed representative **320/375/414/768/1440 px** checks, with no overflow, route/interaction failures, console errors or page errors.
- Final wording pass corrected Polish reset to “Przywróć”, added natural singular/plural search counts and completed the remaining variant-result translations.
