# SERP notes (2026-10-04)

Collected by 12 research agents. Several searches were rate-limited, so some competitor entries are from memory; re-check before acting on them.

## a11y
- Primary: accessibility testing practice page
- Secondary: axe-core practice site, playwright axe accessibility test example, selenium accessibility testing practice, wcag violations test page, keyboard navigation testing practice
- Intent: Learners and QA engineers want a page with known accessibility defects to run axe against, plus examples of asserting a clean scan and testing keyboard-only flows.
- Gap: Top results are docs and articles. None offer a free interactive page with planted axe violations, a pass/fail result, and reference solutions in four frameworks.
- Top results:
  - https://playwright.dev/docs/accessibility-testing — Official Playwright guide to @axe-core/playwright; docs only, no page with planted violations.
  - https://docs.deque.com/devtools-for-web/4/en/node-pl-write-tests — Deque docs for axe tests in Playwright; vendor documentation.
  - https://dzone.com/articles/accessibility-testing-playwright — Tutorial article with code, run against third-party sites.
  - https://dev.to/subito/how-we-automate-accessibility-testing-with-playwright-and-axe — Case study of an a11y pipeline; not hands-on practice.
  - https://infinum.com/?p=19265085 — Blog walkthrough of Playwright accessibility testing.

## advanced
- Primary: date picker range slider file upload automation practice
- Secondary: selenium date picker practice, playwright file upload example, automate range slider selenium, cypress file upload practice, setInputFiles practice page
- Intent: Intermediate testers needing a safe page to practice automating date pickers, range sliders and file uploads, usually after reading how-to posts.
- Gap: Existing results split these controls across tutorials and single-purpose pages. We put date pickers, range sliders and uploads on one page with scored tasks and solutions in four frameworks.
- Top results:
  - https://birdeatsbug.com/blog/automate-date-picker-in-selenium — Tutorial on date picker automation in Selenium; no practice page
  - https://softwaretestpilot.com/practice/file-upload — Practice page for file upload only
  - https://github.com/NarendraCodeHub/QA-Practice-Playwright-Automation — Repo of Playwright specs for date pickers and uploads against a third-party site
  - https://dev.to/lambdatest/how-to-use-date-picker-in-selenium-using-javascript-4mbl — Date picker tutorial with JavaScript
  - https://pypi.org/project/selenium-tools — Python helper for dragging range sliders

## api-interception
- Primary: api mocking practice playwright
- Secondary: playwright route fulfill example, cypress intercept practice, network interception testing practice, mock api responses selenium, page.route practice page
- Intent: Informational and practical: testers who read the Playwright mock docs or Cypress intercept docs and want a live page to try page.route, cy.intercept or Selenium CDP interception against.
- Gap: Every top result is documentation or a tutorial. None gives a free, no-signup page whose UI actually calls APIs, with graded tasks and reference solutions in Playwright, Selenium and Cypress.
- Top results:
  - https://playwright.dev/docs/mock — Official Playwright mocking docs. Code snippets only, no page to run them against.
  - https://testdino.com/blog/playwright-network-mocking — Tutorial blog on intercepting and mocking requests. Reading material, no practice target.
  - https://join.momentic.ai/resources/a-guide-to-mocking-api-requests-in-playwright-from-basics-to-advanced — Guide from basics to advanced. Text only.
  - https://codesignal.com/learn/courses/bridging-playwright-with-api-testing/lessons/mocking-api-requests-in-playwright — Paid-platform lesson with a sandboxed exercise, not a free standalone page.
  - https://dzone.com/articles/mock-the-API-data-with-playwright — Article with a short example.

## api-playground
- Primary: mock rest api for testing practice
- Secondary: practice api testing online, free api for testing status codes, rate limit 429 test api, api testing practice for beginners, bearer token practice api
- Intent: Practical: testers and learners looking for a free REST API to practice requests, auth, error codes, delays and rate limits with Postman, REST Assured, requests or Playwright.
- Gap: Existing options are either fake-data CRUD with no failure modes, or need signup, keys or Docker. None combines auth, forced status codes, delays and rate limits with graded tasks and reference solutions.
- Top results:
  - https://jsonplaceholder.typicode.com/ — Fake CRUD API for posts and users. No real auth, rate limits or controllable status codes.
  - https://gorest.co.in/about — Public REST API with bearer tokens, validation errors and rate limits. Needs a token from a login, no guided tasks.
  - https://reqres.in/ — Hosted test API for users and login. Now requires an API key for most calls.
  - https://hub.docker.com/r/rvancea/json-api-mockserver — Self-hosted mock server with JWT and error codes. Needs Docker.
  - https://cloudqa.io/mock-api-testing-tool/ — Commercial mock API builder. Create-your-own, not a practice target.

## auth-flows
- Primary: login flow automation practice
- Secondary: two-step login automation practice, session expiry test automation, remember me login test playwright, playwright storageState practice, selenium login practice site
- Intent: Testers wanting a free site to practice automating multi-step login, session timeouts and remembered logins, and learning how to reuse authenticated state in Playwright, Selenium and Cypress.
- Gap: Competing practice pages cover one simple login or one OTP step. None combine a two-step login, a session that expires mid-task and a remembered login, so there is room to rank for session expiry and storageState practice.
- Top results:
  - https://softwaretestpilot.com/practice/auth-flow — Closest competitor: username/password step then six-digit OTP with simulated network delay; no session expiry or remember-me tasks.
  - https://techbeamers.com/practice-test-login — Simple login practice page with positive and negative cases; single step only.
  - https://www.browserstack.com/guide/playwright-storage-state — Guide to Playwright storageState for reusing login; explains the concept, no practice page.
  - https://labs.sogeti.com/conquering-mfa-how-playwrights-built-in-storage-state-revolutionizes-multi-factor-authentication-testing/ — Article on MFA and storageState; theory without a hands-on target.
  - https://mailosaur.com/blog/testing-otp-playwright — OTP login testing with email retrieval; vendor tutorial.

## basic
- Primary: selenium practice form inputs buttons
- Secondary: automation practice page text input, playwright practice website forms, cypress practice form, selenium practice website for beginners, web elements practice for testers
- Intent: Beginner testers looking for a free page to practice locating and interacting with inputs, buttons, checkboxes and forms in Selenium, Playwright or Cypress.
- Gap: Competitors offer static elements with no scoring. We give tasks with positive and negative cases, a pass/fail box, hints and solutions in four frameworks.
- Top results:
  - https://techbeamers.com/selenium-practice-test-page — Test page with text inputs, dropdowns, checkboxes, radios; no pass/fail checks or solutions
  - https://bugbug.io/blog/testing-frameworks/best-selenium-practice-websites/ — Listicle of practice sites; informational, no hands-on page
  - https://softwaretestpilot.com/practice — Practice pages for text input in Playwright, Selenium, Cypress
  - https://unogeeks.com/demo-selenium-easy/ — Selenium Easy style input forms overview
  - https://unogeeks.com/way2-automation-demo-site/ — Way2Automation demo widgets overview

## bug-hunt
- Primary: bug hunt practice website for testers
- Secondary: website with bugs for testing practice, practice finding bugs manual testing, exploratory testing practice site, bug reporting practice, buggy ecommerce site for testers
- Intent: Testers want a site with deliberately planted bugs to practice exploratory testing and bug reporting, and to write automated checks that expose them.
- Gap: Existing buggy sites are static and give no feedback. We offer six planted bugs in a working store, a pass/fail result per bug, hints, and automated reference solutions.
- Top results:
  - https://bugbug.io/blog/software-testing/best-websites-with-bugs-for-testing/ — Listicle of buggy sites for testing; the intent we match.
  - https://academybugs.com — Demo store with 25 planted bugs; manual only, no automation solutions.
  - https://www.guru99.com — Live project with deliberate bugs; old design, no checking of answers.
  - https://testsigma.com/blog/how-to-find-bugs — General how-to-find-bugs article.
  - https://betatesting.com/bug-hunt — Commercial crowdtesting service, different intent.

## canvas
- Primary: canvas automation testing practice
- Secondary: playwright test canvas element, selenium canvas click coordinates, test chart tooltip canvas, draw on canvas automation, cypress canvas testing
- Intent: Testers need to automate canvas content that has no DOM nodes and want a safe page to practice coordinate clicks, drawing and chart tooltips.
- Gap: Results are articles with snippets. We offer a live canvas with a moving target, a stroke to draw and chart tooltips, each with pass/fail checks and solutions in four frameworks.
- Top results:
  - https://www.browserstack.com/guide/canvas-cypress — Guide to canvas with Selenium and Cypress, no practice page
  - https://applitools.com/?p=29018 — Selenium Java canvas article, theory plus snippets
  - https://medium.com/@BioCatchTechBlog/automating-canvas-testing-with-playwright-and-object-detection-models-8d58235b17b7 — Playwright with object detection, advanced and no live target
  - https://docs.stably.ai/guides/interacting-with-canvases — AI-testing tool guide to canvases
  - https://github.com/seleniumbase/SeleniumBase — SeleniumBase canvas example test, code only

## certificate
- Primary: free QA automation certificate
- Secondary: test automation practice certificate, free selenium practice certificate, QA automation challenges completion, playwright practice certificate
- Intent: Transactional/informational: learners look for a free certificate to show for QA automation practice.
- Gap: Others certify video watching or exams. Ours is earned by passing hands-on automation challenges, free, with no signup. Position it honestly as a practice completion certificate, not an accredited credential.
- Top results:
  - https://testautomationu.applitools.com — Free course certificates from video courses; strongest competitor.
  - https://www.lambdatest.com/certifications — Free Selenium certification via exam, vendor linked.
  - https://www.istqb.org — Paid recognized certification, different intent.
  - https://www.coursera.org — Paid specializations with certificates.
  - https://cursa.app/free-online-courses/test-automation — Free courses with certificate lists. (From memory and partial search; tool was rate limited.)

## click-traps
- Primary: element click intercepted practice page
- Secondary: selenium element click intercepted exception, playwright element intercepts pointer events, overlapped element test automation, moving element click automation, cypress element covered by another element
- Intent: Informational and troubleshooting: testers who hit ElementClickInterceptedException or Playwright pointer-events timeouts want an explanation, fixes and a page to reproduce the failure safely.
- Gap: Existing results are articles without a live page, or a single-example playground. We offer several trap types (covered, moving, delayed) with pass/fail checks, hints and solutions in four frameworks.
- Top results:
  - https://testingbot.com/resources/articles/selenium-elementclickinterceptedexception — Explains causes (overlays, animations, timing) and fixes; no hands-on page.
  - https://testrigor.com/blog/elementclickinterceptedexception/ — Blog explainer with generic wait and JS click advice.
  - https://blog.qasource.com/software-development-and-qa-tips/how-to-resolve-element-click-intercepted-exception-in-selenium — Selenium-only fix list.
  - https://birdeatsbug.com/blog/elementclickinterceptedexception — Short explainer with code samples.
  - http://uitestingplayground.com/overlapped — Closest practice page; one overlapped-element example, no tasks, results or solutions.

## data-generator
- Primary: test data generator for QA
- Secondary: fake user data generator, generate fake data CSV JSON SQL, mock test data online, random user data for testing, fake credit card numbers for testing
- Intent: Informational/tool: testers want a quick free generator for realistic fake records to seed forms, databases and API tests.
- Gap: Most tools cap rows or need signup. Ours is unlimited, no signup, covers users, orders and cards, and sits beside QA practice pages so testers can use the data on the same site.
- Top results:
  - https://www.mockaroo.com — Schema-based generator, CSV/JSON/SQL export; free tier capped at 1,000 rows, signup for more.
  - https://generatedata.com — Open-source generator with many export formats; dated UI.
  - https://randomuser.me — Random user API and JSON only; no SQL or orders.
  - https://fakerjs.dev — Library docs; needs code to use.
  - https://www.fakenamegenerator.com — Identity generator, limited bulk and formats. (SERP checked from memory; search tool was rate limited.)

## deep-dom
- Primary: nested iframe and closed shadow root practice
- Secondary: closed shadow DOM selenium, nested iframes selenium practice, playwright nested frameLocator, shadow DOM inside iframe automation, closed shadow root playwright
- Intent: Experienced testers hitting hard cases: iframes inside iframes, closed shadow roots and shadow DOM inside frames, looking for explanations and something to practice on.
- Gap: No result offers a runnable page combining nested iframes, closed shadow roots and shadow DOM inside frames. We give a free page with those cases, hints and four-framework solutions.
- Top results:
  - https://www.selectorshub.com/?p=16554 — Guide to nested shadow DOM in Selenium; open roots only, no iframe nesting.
  - https://www.automatetheplanet.com/playwright-tutorial-iframe-and-shadow-dom-automation/ — Playwright iframe and shadow DOM tutorial; basic cases, no closed roots.
  - https://community.grafana.com/t/identify-an-iframe-and-then-shadow-elements-under-it/133839 — Forum question about shadow elements under an iframe; shows demand, no practice page.
  - https://softwaretestpilot.com/practice/shadow-dom — Practice page for open shadow DOM only.
  - https://qaskills.sh/blog/selenium-shadow-dom-piercing — Selenium piercing explainer; text only.

## dialogs
- Primary: selenium alert popup practice
- Secondary: javascript alert practice page, handle confirm prompt selenium, playwright dialog handling example, modal dialog automation practice, cypress alert confirm test
- Intent: Learners want a live page with JavaScript alerts, confirms, prompts and modals to practice handling them in Selenium, Playwright or Cypress, plus code snippets.
- Gap: Top results are either tutorials with no page to run against or a bare herokuapp page. We combine alerts, confirms, prompts and HTML modals with positive and negative test cases, a pass/fail box, hints and solutions in four frameworks.
- Top results:
  - https://the-internet.herokuapp.com/javascript_alerts — Three buttons for alert, confirm and prompt with a result line. Minimal, no modals, no tasks, no solutions.
  - https://techbeamers.com/handle-alert-popup-selenium-python — Python-only tutorial on switch_to.alert, accept, dismiss and send_keys. No live page.
  - https://requestly.com/blog/alerts-in-selenium/ — Blog explaining alert types in Selenium Java. Reading only.
  - https://birdeatsbug.com/blog/handle-alerts-in-selenium — Alert handling guide for Selenium. No practice target.
  - https://blog.apify.com/how-to-handle-popups-in-selenium/ — Popup handling overview with code. No interactive page.

## dynamic
- Primary: dynamic waits selenium practice
- Secondary: explicit wait practice page, playwright auto-wait example, element appears after delay test, selenium WebDriverWait practice, dynamic loading test page
- Intent: Learners want a live page where elements appear, disappear or enable after a delay, so they can try explicit waits and assertions that auto-wait.
- Gap: Existing practice pages show one delayed element each and give no verdict. We offer several async scenarios on one URL with positive and negative cases, a pass/fail box, hints and solutions in four frameworks. Note: live search was rate limited; ranking list partly from known sites.
- Top results:
  - https://the-internet.herokuapp.com/dynamic_loading — Two fixed examples (hidden element, element rendered after the fact); no pass/fail feedback or solutions.
  - https://uitestingplayground.com/ajax — Single AJAX button scenario plus load delay page; one scenario per URL, no task list.
  - https://elementalselenium.com/tips/23-dynamic-pages — Tutorial article in Ruby/Java, not an interactive practice page.
  - https://katalon.com/resources-center/blog/explicit-wait-in-selenium — Explainer on explicit waits, no live page to practice on.
  - https://smartbear.com/blog/test-a-dynamic-web-page-selenium — Article on testing dynamic pages with Selenium.

## flaky
- Primary: flaky test practice page
- Secondary: flaky tests selenium practice, random delay test page, stale element reference practice, playwright flaky test example, re-rendered element automation
- Intent: Learners want a deliberately unreliable page to reproduce flaky failures and practice retries, waits and re-locating elements.
- Gap: Results explain flakiness but offer nothing to run against. We provide a page with random failures, delays and re-rendered elements, with tasks, a verdict, hints and solutions. Search was partly rate limited.
- Top results:
  - https://dev.to/pratik01/a-simple-guide-to-fixing-flaky-playwright-tests-1k9j — Guide to fixing flaky Playwright tests; article only.
  - https://trunk.io/learn/managing-flaky-tests-at-scale — Vendor explainer on managing flaky tests in CI.
  - https://yrkan.com/course/module-08-automation/flaky-tests/ — Course lesson defining flaky tests.
  - https://dev.to/devassure/flaky-tests-from-race-conditions-root-causes-and-fixes-1j5f — Race conditions and fixes.
  - https://uitestingplayground.com/ — Scenario pages for dynamic IDs and delays; no unified flaky page.

## frames
- Primary: iframe and shadow DOM practice page
- Secondary: selenium switch to iframe practice, playwright frameLocator example, shadow DOM automation practice, selenium getShadowRoot example, cypress iframe shadow DOM
- Intent: Learners and QA engineers looking for a hands-on page to practice switching into iframes and piercing shadow roots, plus tutorials explaining the framework syntax.
- Gap: Existing results are either tutorials with no page to test against or a shadow DOM page without iframes. We offer one free page with iframe and shadow root tasks, positive and negative cases, hints, and solutions in four frameworks.
- Top results:
  - https://softwaretestpilot.com/practice/shadow-dom — Free shadow DOM practice page for Playwright, Selenium and Cypress; shadow DOM only, no iframe combination or hints.
  - https://www.automatetheplanet.com/playwright-tutorial-iframe-and-shadow-dom-automation/ — Playwright tutorial covering iframes and shadow DOM; article only, nothing to run tests against.
  - https://www.selectorshub.com/?p=16554 — Selenium nested shadow DOM guide with a SelectorsHub practice form; Selenium only.
  - https://dzone.com/articles/how-to-automate-shadow-dom-in-selenium-webdriver — Selenium shadow DOM article using JavaScript executor and Selenium 4 API; no practice target.
  - https://qaskills.sh/blog/selenium-shadow-dom-piercing — Selenium shadow root piercing explainer; text only.

## home
- Primary: demo ecommerce website for automation testing
- Secondary: ecommerce practice site for selenium, mock online store for QA testing, test automation demo shop, playwright ecommerce demo site, checkout flow test practice
- Intent: Testers and students want a free demo online store with products, cart, checkout and login to write end-to-end automation against.
- Gap: Other demo stores lack an admin area, pagination, lazy loading and planted bugs in one place. QA Store links directly to the practice arena and docs, and is free with no signup.
- Top results:
  - https://www.saucedemo.com/ — Sauce Labs demo store: login, inventory, cart, checkout; fixed small catalog, no admin
  - https://demowebshop.tricentis.com/ — Tricentis demo web shop with registration, search, cart
  - https://www.demoblaze.com/ — Product store with cart and order modal
  - https://magento.softwaretestingboard.com/ — Luma Magento store, large and slow, heavy markup
  - https://dev.to/douglasfugazi/building-a-professional-e-commerce-demo-platform-for-automation-testing-practice-ac3 — Article on building a demo platform

## interactions
- Primary: selenium drag and drop practice
- Secondary: mouse hover automation practice, right click context menu selenium, keyboard shortcuts playwright test, selenium actions class practice page, playwright hover and drag example
- Intent: Learners want a page to try Actions-class or Playwright mouse and keyboard calls (dragTo, hover, contextClick, hotkeys) and a working code example.
- Gap: Existing results are single-widget demos or docs. We combine drag, hover, right-click and hotkeys on one page with pass/fail checks, hints and reference solutions in four frameworks.
- Top results:
  - https://the-internet.herokuapp.com/drag_and_drop — Single drag-and-drop demo, no tasks, no pass/fail, no solutions
  - https://demoqa.com/droppable — Droppable demo, ad heavy, no verification result
  - https://www.selenium.dev/documentation/webdriver/actions_api/mouse/ — Official docs, API reference only, no live page
  - https://playwright.dev/docs/input — Official docs for hover, drag, keyboard; no practice target
  - https://www.browserstack.com/guide/drag-and-drop-in-selenium — Tutorial with code, no hands-on page

## interview
- Primary: QA automation interview questions and answers
- Secondary: SDET interview questions, Selenium interview questions, Playwright interview questions, manual testing interview questions, QA interview flashcards
- Intent: Informational: job seekers want a list of common QA and SDET questions with concise answers, often for quick revision.
- Gap: Competitors are long articles per tool. Ours is one free page with 60+ QA and SDET questions across tools, filterable, with flashcards for revision, next to hands-on practice pages.
- Top results:
  - https://www.guru99.com/selenium-interview-questions-answers.html — Long Selenium Q&A list, ad heavy, no flashcards.
  - https://www.geeksforgeeks.org/software-testing/ — Large testing question lists, text only.
  - https://www.interviewbit.com/selenium-interview-questions/ — Selenium questions grouped by level.
  - https://www.lambdatest.com/learning-hub/selenium-interview-questions — Vendor guide with promo content.
  - https://www.softwaretestinghelp.com — Many articles split across tools. (From memory; search tool was rate limited.)

## lazy-load
- Primary: lazy loading automation testing practice
- Secondary: infinite scroll test page, playwright scroll to load more, selenium scroll to load content, lazy loaded products test, scrollIntoView lazy load test
- Intent: Learners want a page whose items load on scroll, to practice scrolling, waiting for new items and counting them.
- Gap: Results are articles or one bare infinite scroll page. We give a store product list that loads on scroll with positive and negative cases, a verdict, hints and solutions in four frameworks. Search was partly rate limited.
- Top results:
  - https://the-internet.herokuapp.com/infinite_scroll — Classic infinite scroll with text paragraphs; no tasks or feedback.
  - https://www.browserstack.com/guide/playwright-scroll-to-bottom — Guide on scrolling to bottom in Playwright; article, no practice page.
  - https://medium.com/@iragantiganesh555/testing-infinite-scroll-and-pagination-in-playwright-f3c8b1f61c9a — Article on testing infinite scroll and pagination in Playwright.
  - https://qaskills.sh/blog/playwright-locator-scroll-into-view-lazy-lists — Blog on scrollIntoView and lazy lists.
  - https://www.lambdatest.com/selenium-playground/ — Includes generic scroll demos.

## locator-traps
- Primary: dynamic id locator practice page
- Secondary: selenium dynamic id xpath practice, playwright locator strategies practice, class attribute locator trap, hidden layers shifting layout test, flaky locators test automation practice, stable locator best practices
- Intent: Learners and testers want a hands-on page to practice writing locators that survive changing IDs, reordered classes and layout shifts, plus guidance on stable selectors.
- Gap: Results split into articles with no target page and playground pages with one example each. We combine dynamic IDs, shuffled classes, hidden spaces and shifting layouts with pass/fail checks, hints and four-framework solutions.
- Top results:
  - http://uitestingplayground.com/dynamicid — Well-known Dynamic ID page; one example per trap, no scoring, no solutions.
  - http://uitestingplayground.com/classattr — Class attribute trap, single example.
  - https://dev.to/razgandeanu/selenium-webdriver-and-dynamic-locators-40b1 — Article on dynamic locators in Selenium; no practice page.
  - https://dev.to/michael_weber_709b43dc7f0/advanced-playwright-locator-strategies-for-messy-and-complex-uis-3eh9 — Playwright locator article; no practice target.
  - https://oneuptime.com/blog/post/2026-02-02-playwright-locators/view — Playwright locators guide, generic.

## pagination-test
- Primary: pagination testing practice site
- Secondary: selenium pagination practice, playwright pagination example, automate next page button, test pagination automation, pagination test cases
- Intent: Testers want a page with real multi-page product listings to practice looping through pages, plus test cases and code for pagination.
- Gap: Results are Selenium tutorials or scraping sandboxes. None offers a paginated store with graded tasks, negative cases like the last page and four-framework solutions.
- Top results:
  - https://dzone.com/articles/selenium-pagination-tutorial-page-navigation — Selenium pagination tutorial, no live page
  - https://plushcap.com/analysis/lambdatest/lambdatest-selenium-pagination — LambdaTest pagination walkthrough using a cloud demo store
  - https://www.lambdatest.com/blog/ — Vendor blog posts on pagination in Selenium
  - https://scrapeme.live/shop/ — Paginated demo shop, mostly used for scraping, not guided tests
  - https://books.toscrape.com/ — Paginated catalogue for scraping practice, no test tasks

## practice
- Primary: selenium practice website
- Secondary: automation testing practice website, QA automation practice site, playwright practice website, cypress practice site, test automation practice challenges
- Intent: Informational/commercial list intent: testers want a free site with realistic UI to practice Selenium, Playwright or Cypress. SERP is dominated by listicles and a few hosted practice sites.
- Gap: Existing sites are static component pages or listicles. This hub offers 20+ task-based challenges with pass/fail results, hints, deliberate traps (flaky, locator, click traps) and reference solutions in four frameworks.
- Top results:
  - https://bugbug.io/blog/software-testing/best-selenium-practice-websites — Listicle of Selenium practice sites; no hands-on tasks itself
  - https://techbeamers.com/websites-to-practice-selenium-webdriver-online/ — Listicle with short descriptions of sites
  - https://the-internet.herokuapp.com/ — Classic component-per-page site, no pass/fail checks or solutions
  - https://www.saucedemo.com/ — Mock e-commerce login/cart flow, no guided tasks
  - https://demoqa.com/ — Widgets and forms by category, no task validation

## progress-bar
- Primary: progress bar automation testing practice
- Secondary: wait for progress bar selenium, playwright wait for progress bar to complete, aria-valuenow test, progress bar test page, cypress progress bar wait
- Intent: Learners need a progress bar to automate: wait for 100 percent, read the value or stop it at a target.
- Gap: Competing pages are one widget with no feedback. We provide a bar with task cases (wait for completion, stop at a target, read aria-valuenow), pass/fail results, hints and four-framework solutions. Note: live search was rate limited; list partly from known sites.
- Top results:
  - https://demoqa.com/progress-bar — Start/stop/reset bar widely used for tutorials; no tasks, results or solutions.
  - https://uitestingplayground.com/progressbar — Stop the bar at 75 percent; a single scenario, precise timing challenge.
  - https://www.guru99.com/ — Tutorials covering waits generally; no dedicated live page.
  - https://stackoverflow.com/questions/tagged/selenium — Q&A threads on waiting for progress bars to finish.
  - https://www.lambdatest.com/selenium-playground/ — Includes a progress bar demo among many widgets; generic.

## sortable
- Primary: drag and drop sortable list automation practice
- Secondary: html5 drag and drop playwright, selenium drag and drop not working, kanban board drag and drop test, press and hold sorting test, playwright dragTo sortable
- Intent: Testers whose drag and drop scripts fail on sortable lists or Kanban boards want a target page and a working approach.
- Gap: Competitors show one drag style. We provide three on one page, native HTML5 lists, press-and-hold sorting and a Kanban board, each with pass/fail checks and four-framework solutions.
- Top results:
  - https://the-internet.herokuapp.com/drag_and_drop — Two boxes swap, one HTML5 case only
  - https://jqueryui.com/sortable/ — jQuery UI sortable demo, mouse-event based, not a test target with results
  - https://playwright.dev/docs/input#drag-and-drop — Official dragTo and manual mouse steps
  - https://qaskills.sh/blog/drag-and-drop-testing-html5-pointer — Article on HTML5 vs pointer drag, no live page
  - https://wanago.io/?p=6277 — Playwright tests for a React drag and drop to-do list, tutorial only

## tables
- Primary: web table practice for automation testing
- Secondary: selenium web table practice, playwright table locator example, dynamic data grid automation, extract table data selenium, sortable table test page
- Intent: Learners and QA engineers want a live table to practice reading rows, cells, sorting and filtering with Selenium, Playwright or Cypress, plus code patterns for it.
- Gap: Top results are either static demo tables with no tasks or Selenium-only articles. We offer a dynamic grid with graded tasks, positive and negative cases, hints and solutions in four frameworks.
- Top results:
  - https://the-internet.herokuapp.com/tables — Two static sortable tables, no tasks, no solutions
  - https://practice-automation.com/tables/ — Simple static tables page, no guided tasks or pass/fail
  - https://testsigma.com/blog/webtable-in-selenium/ — Tutorial on Selenium web tables with XPath, no live practice
  - https://www.testleaf.com/blog/managing-web-tables-in-selenium/ — Blog article, Selenium Java only
  - https://birdeatsbug.com/blog/webtable-in-selenium-tutorial — Tutorial, no practice page

## virtual-table
- Primary: virtual scroll table testing
- Secondary: virtualized list automation, playwright virtual scrolling, selenium virtual table scroll, test virtualized grid, 10000 rows table automation
- Intent: Engineers hit problems automating virtualized grids where only a few rows exist in the DOM, and want a practice target and patterns to scroll, find and sort.
- Gap: Only articles and libraries exist. No free practice page gives a 10,000 row virtualized table with graded tasks to find a row by scrolling or by sorting.
- Top results:
  - https://medium.com/@ulissesbgd/virtual-scrolling-with-playwright-fb741100c8b5 — Playwright virtual scrolling article, no live page
  - https://qaskills.sh/blog/playwright-locator-scroll-into-view-lazy-lists — Scroll into view for lazy lists, text only
  - https://qaskills.sh/blog/playwright-test-infinite-scroll-until-last-item — Infinite scroll test pattern, text only
  - https://github.com/rickcedwhat/playwright-smart-table — Library for smart table locators incl. virtual scroll
  - https://www.ag-grid.com/ — AG Grid docs, a virtualized grid but not a practice target

## widgets
- Primary: otp input automation practice
- Secondary: automate otp input boxes selenium, tag input automation testing, star rating automation playwright, custom widgets test automation practice, six digit otp input playwright
- Intent: Learners and testers looking for a hands-on page to practice automating custom UI widgets (split OTP boxes, tag inputs, star ratings) that standard fill() or sendKeys() calls often handle badly.
- Gap: Existing results are OTP-delivery vendor guides or a single OTP form. Nobody offers one free page with OTP boxes, tag inputs and star ratings plus pass/fail checks and solutions in four frameworks.
- Top results:
  - https://softwaretestpilot.com/practice/auth-flow — Multi-step login plus six-digit OTP practice page for Playwright, Selenium and Cypress; covers OTP but not tag inputs or ratings.
  - https://mailosaur.com/blog/testing-otp-playwright — Blog on testing OTP login with Playwright by reading emails; vendor content, no practice page.
  - https://www.mailslurp.com/guides/test-sms-otp-mfa-using-playwright/ — Guide to SMS OTP and MFA tests with a demo app; focused on the message-fetching service.
  - https://mailinator.com/documentation/docs/test-automation/playwright/ — Docs for fetching OTP codes in Playwright; no widget practice.
  - https://techbeamers.com/practice-test-login — General login practice page; no OTP boxes or rating widgets.

## windows
- Primary: selenium switch between windows tabs practice
- Secondary: selenium window handles example, switch to window by title selenium, playwright new tab popup example, cypress multiple tabs, handle popup window that closes itself
- Intent: Learners want a live page that opens new tabs and popups to practice window handle switching, plus working code for Selenium, Playwright and Cypress.
- Gap: Existing practice pages open one static window. We add popups that close themselves, delayed tabs and windows that must be found by title, with pass/fail checks and solutions in four frameworks.
- Top results:
  - https://the-internet.herokuapp.com/windows — A single link that opens one new window titled New Window. No titles to match, no timing, no tasks.
  - https://elementalselenium.com/tips/work-with-multiple-windows/_java — Short Java tip using getWindowHandles against the herokuapp page.
  - https://katalon.com/resources-center/blog/how-to-handle-tabs-in-selenium — Blog on tab handling in Selenium. No practice page.
  - https://browserstack.wpengine.com/guide/handle-multiple-windows-in-selenium — BrowserStack guide on window handles with code. Reading only.
  - https://blog.qasource.com/software-development-and-qa-tips/how-to-handle-window-using-selenium-java — Java tutorial including switching by title. No live target.
