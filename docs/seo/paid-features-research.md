# Paid features we could build free (browser-only)

Prices verified by search: SelectorsHub (selectorshub.com/?p=5174), Mockaroo (mockaroo.com/pricing), Postman (postman.com/pricing), Rahul Shetty (courses.rahulshettyacademy.com). Others marked "unverified" are from memory/search snippets; demand is my rough judgment, not tool data.

| # | Feature | Who charges | Price seen | Free in-browser? | Demand keywords | Effort |
|---|---|---|---|---|---|---|
| 1 | ISTQB CTFL mock exams + explanations | Udemy sellers; ISTQB itself | Udemy sets exist (e.g. udemy.com/course/istqb-foundation-v4-pass-with-mock-exams-quizzes/); price not shown, typically ~$10-20 (unverified) | Yes. Original questions in JSON, timer, scoring, per-chapter. Must write own questions, not copy ISTQB | "istqb foundation mock exam", "ctfl v4 practice questions free" (high) | M |
| 2 | XPath/CSS selector tester + cheat sheet | SelectorsHub Pro | $5/member/mo outside India, 3000 INR/yr; teams from $600/yr | Partly. Paste HTML, test selector, see matches, generate suggestions. No live-page access | "xpath tester online", "css selector tester", "xpath cheat sheet" (high) | M |
| 3 | Mock REST API with saved endpoints/custom responses | Postman mock servers; Mockaroo | Postman Basic $14/user/mo (10k mock requests); Mockaroo Silver $60/yr | Partly. Service-worker/in-browser mock; no public URL | "mock api online", "fake rest api for testing" (high, crowded) | S (exists) |
| 4 | Test data generator, larger rows, schema save/share | Mockaroo | Silver $60/yr (100k rows), Gold $500/yr | Yes up to ~1M rows with a Web Worker; URL-encoded schemas | "test data generator", "random csv generator", "fake data generator sql" (high) | S |
| 5 | Regex tester for QA (with test-case examples) | regex101 premium, various | Free tools mostly; low monetization | Yes | "regex tester online" (very high, very crowded) | S |
| 6 | Interview Q&A banks per tool (Selenium, Playwright, Cypress, API) | Udemy, Rahul Shetty, Naukri-type sites | RSA: Selenium Java $19, Playwright JS $25 (courses.rahulshettyacademy.com); interview packs ~$10-30 (unverified) | Yes. Static pages, one URL per question group, FAQPage schema | "selenium interview questions", "playwright interview questions", "cypress interview questions" (very high) | M |
| 7 | QA resume/portfolio builder (ATS-friendly, print to PDF) | Resume.io, Zety etc. | ~$2-3 trial then ~$25/mo (unverified) | Yes. Form, template, window.print PDF; data stays local | "qa automation resume", "sdet resume example" (high) | M |
| 8 | Test case / bug report template generator | Katalon TestOps, TestRail, Jira add-ons | TestRail ~$38+/user/mo (unverified) | Yes. Forms, markdown/CSV export | "bug report template", "test case template" (high) | S |
| 9 | Locator strategy / Playwright-vs-Selenium-vs-Cypress comparison and migration cheatsheets | Course paywalls | Courses $19-25 (RSA) | Yes. Static content | "playwright vs selenium", "selenium to playwright cheat sheet" (very high) | S |
| 10 | Test-script generator from page HTML (rule-based, not AI) | Testim, Katalon, Testsigma AI | Katalon/Testsigma paid, quote-based (unverified) | Partly. Rule-based POM generator from pasted HTML; no real AI without API | "page object generator", "playwright locator generator" (medium) | M |
| 11 | JSON/JWT/Base64 and API response validators for testers | Postman, assorted | Free elsewhere | Yes | "jwt decoder", "json schema validator" (very high, dominated by big sites) | S |
| 12 | Learning paths / roadmap with progress tracking | Test Automation University (free), Udemy bundles, RSA All-Access | RSA All-Access (courses.rahulshettyacademy.com/p/all-access-membership), price not captured | Yes. localStorage progress; ties to existing 23 challenges | "qa automation roadmap", "how to become sdet" (high) | M |
| 13 | Cross-browser/device "viewport and user-agent" practice | BrowserStack/LambdaTest | Plans ~ $29+/mo (unverified) | No for real devices; partly for viewport emulation | "responsive tester" (medium) | S |
| 14 | Accessibility checker for pasted HTML | axe DevTools Pro, Deque | Paid (unverified) | Yes with axe-core in-page | "accessibility checker online", "wcag checklist" (high) | S-M |
| 15 | Performance/Lighthouse practice | BrowserStack, paid tools | n/a | No (needs real run) | - | L |

## Ranked shortlist (search potential first, then effort)

1. **Interview question banks, one page per tool/topic** (#6). Biggest query volume, easy to cite, each page ranks alone. Add FAQPage schema and short direct answers. Already have a flashcard base; split it into indexable URLs.
2. **ISTQB CTFL mock exam** (#1). Paid everywhere, steady demand, strong return visits. Write original questions with explanations, per-chapter pages. State it is not affiliated with ISTQB.
3. **Playwright vs Selenium vs Cypress comparison + migration cheatsheets** (#9). Cheapest to build, very high demand, highly citable by AI answers. Reuse the reference solutions you already have as side-by-side code.
4. **XPath/CSS selector tester + cheat sheet** (#2). Pairs with your overlay, same audience as SelectorsHub's paid users. Separate pages: "xpath tester", "css selector tester", "xpath cheat sheet".
5. **QA resume builder + bug report/test case templates** (#7, #8). Resume queries are high-intent and few QA-specific competitors. Templates are tiny and each ranks as its own page.

Next in line: upgrade the data generator (#4, simple, Web Worker) and QA roadmap (#12).

## Caveats
- Search demand is rough judgment; confirm with Search Console or Ahrefs before committing.
- Regex/JWT/JSON tools (#5, #11) have huge volume but are owned by big sites; skip.
- Anything claiming "AI" test generation needs a paid API; do rule-based instead.
