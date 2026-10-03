# SEO/SERP brief (shared by all page agents)

Site: free QA automation practice playground, moving to https://qa.randomly.online (subdomain of Randomly.online, a free tools site). Each page gets its own clean URL, prerendered HTML, its own title/meta/canonical/OG image/JSON-LD. Goal: each URL ranks individually on Google for its own query and gets cited by AI answers (Google AI Overviews, ChatGPT, Perplexity, Copilot).

URL pattern: practice/tool pages are https://qa.randomly.online/practice/<id>; the hub is https://qa.randomly.online/practice ; the store home is https://qa.randomly.online/

Every page: free, no signup, runs in the browser; tasks list with positive/negative test cases, a pass/fail result box, per-task hints, and (for newer pages) reference solutions in Playwright, Selenium Java, Selenium Python and Cypress.

## Pages (id | name | what it is | level)
- basic | Basic Elements | Interact with inputs, buttons, and forms | Beginner
- advanced | Advanced Inputs | Handle date pickers, range sliders, and uploads | Intermediate
- tables | Tables & Lists | Extract data from dynamic data grids | Intermediate
- interactions | Mouse & Keyboard | Drag-and-drop, hover, right-click, and hotkeys | Advanced
- dialogs | Popups & Dialogs | Manage alerts, confirm prompts, and modals | Beginner
- frames | Frames & Shadow DOM | Switching contexts into iframes and shadow roots | Advanced
- dynamic | Dynamic & Waits | Handle elements appearing asynchronously | Intermediate
- pagination-test | Store Pagination | Navigate multiple pages of products | Intermediate
- lazy-load | Store Lazy Loading | Scroll to trigger dynamic content fetching | Intermediate
- api-interception | API Interception | Mock and modify network requests directly | Advanced
- progress-bar | Progress Bar | Test waits on a dynamic progress bar | Intermediate
- click-traps | Click Traps | Covered, moving and delayed elements that break naive clicks | Advanced
- locator-traps | Locator Traps | Dynamic IDs, shuffled classes, hidden spaces and shifting layouts | Intermediate
- deep-dom | Deep DOM | Nested iframes, closed shadow roots and shadow DOM inside frames | Advanced
- flaky | Flaky Page | Random failures, random delays and re-rendered elements | Advanced
- widgets | Real-World Widgets | OTP boxes, tag inputs and star ratings | Intermediate
- windows | Windows & Tabs | New tabs, popups that close themselves and windows found by title | Advanced
- sortable | Sortable Lists | HTML5 drag and drop, press-and-hold sorting and a Kanban board | Advanced
- virtual-table | Virtual Table | 10,000 rows with only a few in the DOM: scroll to find and sort to pick | Advanced
- auth-flows | Auth Flows | Two-step login, sessions that expire mid-task and remembered logins | Advanced
- canvas | Canvas & Charts | Click a moving canvas target, draw a stroke and read chart tooltips | Advanced
- a11y | Accessibility Lab | Find planted axe violations, assert a clean scan and finish a form by keyboard | Intermediate
- bug-hunt | Bug Hunt | Find six real bugs planted in the QA Store | Advanced
- data-generator | Test Data Generator | Unlimited fake users, orders and cards as CSV, JSON or SQL | Beginner
- api-playground | API Playground | Mock REST API with auth, status codes, delays and rate limits | Intermediate
- interview | Interview Kit | 60+ QA and SDET interview questions with answers and flashcards | Beginner
- certificate | Certificate | Finish every challenge and download your certificate | Beginner
- (hub) practice | QA Practice Arena | dashboard listing all challenges and tools | -
- (home) / | QA Store | a mock e-commerce store (products, cart, checkout, admin) built as a test target, plus links to the practice arena and QA docs | -

## Your job for EACH page assigned to you
1. SERP analysis: use WebSearch (several queries per page, e.g. '<topic> practice site', '<topic> selenium practice', '<topic> playwright example', '<topic> automation testing practice page'). Note who ranks top 5 (URL + what they offer), the search intent, and the gap we can beat. Use WebFetch on 1-2 top results if useful.
2. Pick one primary keyword (realistic to rank for; prefer specific long-tail over head terms we can't win) and 3-6 secondary keywords.
3. Write: title (<= 60 chars, keyword first, end with ' | QA Playground'), metaDescription (140-155 chars, concrete, includes 'free'), h1Subtitle (one sentence shown under the H1), answer (AEO/GEO: a 45-70 word self-contained paragraph that directly answers 'what is <topic> and how do you practice/automate it' - first sentence must be a quotable definition), faqs (4-5 Q&A pairs; questions phrased the way people search/ask AI; answers 35-70 words, factual, framework-specific where useful), ogHeadline (<= 38 chars, for the share image), ogSubline (<= 60 chars), imageAlt (describes the share image), relatedIds (3-4 other page ids from the list above that a learner should visit next - used for internal links), schemaType (pick: 'LearningResource' for practice pages, 'WebApplication' for tools, 'CollectionPage' for the hub, 'WebSite' for home).
4. Facts must be correct for current versions (Selenium 4, Playwright 1.5x, Cypress 13+). No hype words (no 'ultimate', 'seamless', 'unlock', 'master', 'dive', 'robust', 'comprehensive'), no em dashes, no exclamation marks. Plain direct sentences.

## Output
Write ONE JSON file per page to /tmp/claude-1000/-home-dhruba-Documents-projects-QA-automation/8231e861-a210-4398-add3-76abe2d80694/scratchpad/seo/<id>.json (use 'practice' for the hub and 'home' for /). Exact shape:
{
 "id": "windows",
 "primaryKeyword": "",
 "secondaryKeywords": [],
 "intent": "",
 "serpTop": [
  {
   "url": "",
   "note": ""
  }
 ],
 "gap": "",
 "title": "",
 "metaDescription": "",
 "h1Subtitle": "",
 "answer": "",
 "faqs": [
  {
   "q": "",
   "a": ""
  }
 ],
 "ogHeadline": "",
 "ogSubline": "",
 "imageAlt": "",
 "relatedIds": [],
 "schemaType": "LearningResource"
}
Validate each file with: python3 -c "import json,sys;json.load(open(sys.argv[1]))" <file>. Do not edit anything else. Final message: one line per page: id, primary keyword, title.