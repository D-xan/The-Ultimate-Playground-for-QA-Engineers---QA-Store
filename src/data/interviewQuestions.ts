export type Topic = 'Selenium' | 'Playwright' | 'Cypress' | 'API Testing' | 'Manual & Process' | 'Framework Design';

export const TOPICS: Topic[] = ['Selenium', 'Playwright', 'Cypress', 'API Testing', 'Manual & Process', 'Framework Design'];

export const topicSlug = (t: Topic): string => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export interface Question {
  id: string;
  topic: Topic;
  level: 'Junior' | 'Mid' | 'Senior';
  q: string;
  a: string;
}

export const questions: Question[] = [
  // ---------- Selenium ----------
  {
    id: 'sel-1', topic: 'Selenium', level: 'Junior',
    q: 'What is the difference between implicit, explicit and fluent waits?',
    a: 'An implicit wait is a global timeout the driver applies to every findElement call, polling until the element exists. An explicit wait (WebDriverWait with ExpectedConditions) waits for one specific condition on one element, such as clickable or visible. A fluent wait is an explicit wait where you also configure the polling interval and the exceptions to ignore. Prefer explicit waits, because they state what you are really waiting for.',
  },
  {
    id: 'sel-2', topic: 'Selenium', level: 'Mid',
    q: 'Why should you avoid mixing implicit and explicit waits?',
    a: 'The Selenium documentation warns that mixing them can cause unpredictable wait times. The implicit wait applies inside every lookup that the explicit wait performs, so the two timeouts can stack, and the behaviour differs between drivers and remote setups. Pick one strategy, normally explicit waits with the implicit wait left at zero.',
  },
  {
    id: 'sel-3', topic: 'Selenium', level: 'Junior',
    q: 'How do you choose between ID, CSS and XPath locators?',
    a: 'Prefer a stable, unique ID or a dedicated attribute such as data-testid because it survives layout changes. CSS selectors are fast, readable and cover most cases. Use XPath when you need to walk up to a parent, match by text, or use sibling axes that CSS cannot express. Avoid long absolute paths and generated class names, since they break on every UI change.',
  },
  {
    id: 'sel-4', topic: 'Selenium', level: 'Junior',
    q: 'How do you handle an iframe in Selenium?',
    a: 'Elements inside a frame are invisible to the driver until you switch context with driver.switchTo().frame(...), using an index, a name or ID, or a WebElement. Return to the main document with switchTo().defaultContent(), or go up one level with parentFrame(). For nested frames you switch one level at a time. A NoSuchElementException for an element that is clearly on screen often means you are in the wrong frame.',
  },
  {
    id: 'sel-5', topic: 'Selenium', level: 'Mid',
    q: 'How do you work with multiple windows or tabs?',
    a: 'Store the current handle with getWindowHandle(), trigger the action, then loop over getWindowHandles() to find the new one and call switchTo().window(handle). In Selenium 4 you can also open one directly with driver.switchTo().newWindow(WindowType.TAB). Close it with driver.close() and switch back to the original handle, because close() does not move focus for you.',
  },
  {
    id: 'sel-6', topic: 'Selenium', level: 'Senior',
    q: 'How do you interact with elements inside a shadow DOM?',
    a: 'Selenium 4 exposes WebElement.getShadowRoot(), which returns a SearchContext you can call findElement on with CSS selectors. XPath does not work inside a shadow root. This only works for open shadow roots, and a closed root cannot be reached through the standard API, so you would need a JavaScript hook or ask developers for a test seam.',
  },
  {
    id: 'sel-7', topic: 'Selenium', level: 'Mid',
    q: 'What causes StaleElementReferenceException and how do you fix it?',
    a: 'It is thrown when a WebElement you hold is no longer attached to the DOM, typically because the page re-rendered or navigated. Fix it by re-locating the element after the change, or by wrapping the lookup in a wait that retries. Do not cache elements across page updates. Page objects that store By locators instead of WebElements avoid most of these errors.',
  },
  {
    id: 'sel-8', topic: 'Selenium', level: 'Mid',
    q: 'When would you use JavascriptExecutor, and what are its risks?',
    a: 'Use it for things WebDriver cannot do cleanly, such as scrolling an element into view, reading computed state, or as a last resort for clicking an element that a native click cannot reach. The risk is that it bypasses the checks a real user faces, so a JS click can pass while the button is covered or disabled. Overusing it hides genuine usability bugs.',
  },
  {
    id: 'sel-9', topic: 'Selenium', level: 'Mid',
    q: 'What is the difference between driver.close() and driver.quit()?',
    a: 'close() closes only the current window or tab, and the session stays alive if other windows are open. quit() ends the whole session, closes every window and shuts down the driver process. Always call quit() in teardown, otherwise browser and driver processes leak on your CI machines.',
  },
  {
    id: 'sel-10', topic: 'Selenium', level: 'Senior',
    q: 'How does Selenium Grid 4 run tests in parallel?',
    a: 'Grid 4 is made of a Router, Distributor, Session Map, New Session Queue, Event Bus and Nodes, and can run as standalone, hub and nodes, or fully distributed. Tests create a RemoteWebDriver pointing at the Router URL. The Router puts the request on the New Session Queue, and the Distributor takes it from the queue and assigns it to a Node with a free slot that matches the requested capabilities.',
  },
  {
    id: 'sel-11', topic: 'Selenium', level: 'Mid',
    q: 'What is the Actions class used for?',
    a: 'Actions builds composite input sequences that a plain click or sendKeys cannot, such as hover (moveToElement), drag and drop, double click, context click and keyboard chords. You chain the steps and finish with perform(). It sends them through the W3C Actions endpoint, and Selenium 4 made W3C the only protocol, which makes this consistent across browsers.',
  },
  {
    id: 'sel-12', topic: 'Selenium', level: 'Senior',
    q: 'What new capabilities did Selenium 4 add over Selenium 3?',
    a: 'Selenium 4 makes W3C WebDriver the only protocol, adds relative locators (above, below, toLeftOf, near), newWindow for tabs, and a redesigned Grid. It also introduces Chrome DevTools Protocol access for network and console features, and WebDriver BiDi support for event-driven features such as log and network listening. CDP is browser specific, so prefer BiDi where it is available.',
  },

  // ---------- Playwright ----------
  {
    id: 'pw-1', topic: 'Playwright', level: 'Junior',
    q: 'What is auto-waiting in Playwright?',
    a: 'Before an action Playwright runs actionability checks and retries until they pass or the timeout expires. The checks depend on the action: click waits for the element to be visible, stable, able to receive events and enabled, while fill waits for it to be visible, enabled and editable. Locators are lazy by design, they only resolve when used, and that is what lets every action re-resolve the element and retry, so you rarely need explicit sleeps.',
  },
  {
    id: 'pw-2', topic: 'Playwright', level: 'Junior',
    q: 'Which locators does Playwright recommend, and in what order?',
    a: 'Prefer user-facing locators, in roughly this order: getByRole, getByText, getByLabel, getByPlaceholder, getByAltText, getByTitle and then getByTestId. They mirror how users and assistive technology find things, and getByRole nudges you towards accessible markup. Use CSS or XPath only as a last resort. You can chain and filter locators, for example page.getByRole("listitem").filter({ hasText: "Pro" }).',
  },
  {
    id: 'pw-3', topic: 'Playwright', level: 'Mid',
    q: 'What is a browser context and why is it useful for test isolation?',
    a: 'A BrowserContext is an isolated, incognito-like profile with its own cookies, storage and cache, created in milliseconds inside one browser process. The test runner gives every test a fresh context, so tests do not leak state into each other and can run in parallel cheaply. You can also create several contexts in one test to simulate two users, such as a chat between an admin and a customer.',
  },
  {
    id: 'pw-4', topic: 'Playwright', level: 'Mid',
    q: 'What are Playwright fixtures and how do you write a custom one?',
    a: 'Fixtures are the setup and teardown units injected into tests by name, such as page, context and request. They are lazy, so only fixtures a test asks for are created, and they compose by depending on other fixtures. You extend the base with test.extend({ loggedInPage: async ({ page }, use) => { await login(page); await use(page); } }) and the code after use() acts as teardown.',
  },
  {
    id: 'pw-5', topic: 'Playwright', level: 'Mid',
    q: 'How do you mock or modify network requests?',
    a: 'Use page.route(urlPattern, handler) and then call route.fulfill() with a stub response, route.continue() with overrides, or route.abort() to simulate failures. You can also fetch the real response with route.fetch() and alter it before fulfilling. Register routes before the navigation that triggers the request. context.route applies the handler to every page in the context, and page.unroute removes a handler you no longer want.',
  },
  {
    id: 'pw-6', topic: 'Playwright', level: 'Mid',
    q: 'What is the Playwright trace viewer and when do you turn it on?',
    a: 'A trace is a zip with a timeline of actions, DOM snapshots before and after each step, network calls, console messages and source. Open it with npx playwright show-trace. A common setting is trace: "on-first-retry", which records only when a failed test is retried, so it needs retries greater than zero in the config. That keeps CI artifacts small while giving you a trace for exactly the tests that failed.',
  },
  {
    id: 'pw-7', topic: 'Playwright', level: 'Mid',
    q: 'How do web-first assertions differ from plain assertions?',
    a: 'Web-first assertions such as await expect(locator).toBeVisible() or toHaveText() retry until the condition holds or the assertion timeout is reached. A plain assertion on a value you already read, like expect(await locator.textContent()), runs once and can fail on a page that is still updating. Prefer the retrying form and always await it.',
  },
  {
    id: 'pw-8', topic: 'Playwright', level: 'Senior',
    q: 'How do you reuse authentication across tests?',
    a: 'Log in once in a setup project, save the session with context.storageState({ path: "auth.json" }), then declare use: { storageState: "auth.json" } in dependent projects. Tests start already signed in without repeating the UI flow. For tests that mutate account state, create one account per worker, so parallel tests do not collide.',
  },
  {
    id: 'pw-9', topic: 'Playwright', level: 'Mid',
    q: 'How does Playwright run tests in parallel?',
    a: 'Test files run in parallel across worker processes by default, and tests inside one file run in order in the same worker. Set fullyParallel: true to parallelise individual tests, and control the count with workers in the config or --workers on the command line. Each worker has its own browser, and test.describe.configure({ mode: "serial" }) opts a group out when steps truly depend on each other.',
  },
  {
    id: 'pw-10', topic: 'Playwright', level: 'Mid',
    q: 'How do you handle iframes and shadow DOM in Playwright?',
    a: 'For iframes use page.frameLocator("#payment") and then chain normal locators off it, which keeps auto-waiting. Playwright CSS and text locators pierce open shadow roots by default, so no special switch is needed. XPath does not pierce shadow DOM, and closed shadow roots are not reachable.',
  },
  {
    id: 'pw-11', topic: 'Playwright', level: 'Junior',
    q: 'How do you handle dialogs, popups and file downloads?',
    a: 'Alerts, confirms and prompts are auto-dismissed unless you register page.on("dialog", d => d.accept()) first. For a new tab, start listening before the click: const popupPromise = page.waitForEvent("popup"); await page.getByText("Open").click(); const popup = await popupPromise. Downloads use page.waitForEvent("download") around the click and then download.saveAs() or suggestedFilename().',
  },
  {
    id: 'pw-12', topic: 'Playwright', level: 'Senior',
    q: 'How do you debug a test that passes locally but fails in CI?',
    a: 'Start from the CI trace and video rather than guessing, and compare viewport, locale, timezone and headless mode. Run locally with the same --workers count and in the same container image, because races often appear only under load. Look for hidden dependencies on test order or shared data. Replace any waitForTimeout with a web-first assertion or waitForResponse on the real signal.',
  },

  // ---------- Cypress ----------
  {
    id: 'cy-1', topic: 'Cypress', level: 'Mid',
    q: 'How is Cypress architecturally different from Selenium?',
    a: 'Cypress runs in the same browser run loop as the application under test, with a Node process behind it for file system and network tasks. It does not use the WebDriver protocol, which gives it direct DOM access, automatic snapshots and synchronous-feeling control over network traffic. The trade-off is that your test code executes in the browser, so it cannot drive multiple browser windows or run arbitrary Node code directly.',
  },
  {
    id: 'cy-2', topic: 'Cypress', level: 'Junior',
    q: 'Why are Cypress commands asynchronous but not promises?',
    a: 'Commands such as cy.get() and cy.click() are queued, and Cypress runs them later in order. They return chainables, not real promises, so you cannot await them or store the return value in a variable and use it immediately. Use .then() or .should() to work with yielded values, and aliases with .as() to share them.',
  },
  {
    id: 'cy-3', topic: 'Cypress', level: 'Mid',
    q: 'What is retry-ability, and which commands retry?',
    a: 'Cypress retries queries and assertions until they pass or the command timeout (4 seconds by default) is reached. The query, for instance cy.get(".item").should("have.length", 3), is re-run along with its assertions. Action commands like click do not retry as a whole, and a .then() callback runs once. That is why you put assertions in .should() rather than inside .then().',
  },
  {
    id: 'cy-4', topic: 'Cypress', level: 'Mid',
    q: 'How does cy.intercept work, and how do you wait for a request?',
    a: 'cy.intercept(method, url, stubOrHandler) spies on or stubs matching network calls, and you can give it a fixture, a static response, or a handler that edits req and res. Alias it with .as("getUsers") and then call cy.wait("@getUsers") to synchronise on the real request. Declare the intercept before the action that triggers the call.',
  },
  {
    id: 'cy-5', topic: 'Cypress', level: 'Mid',
    q: 'What are the main limitations of Cypress?',
    a: 'Tests run inside the browser, so you cannot control several tabs or windows, and cross-origin navigation needs cy.origin(). It cannot drive native browser dialogs the way an OS-level tool can, and it has no mobile app support. Language support is JavaScript and TypeScript only. Parallelism is available through Cypress Cloud or an external orchestrator rather than being built into the open-source runner.',
  },
  {
    id: 'cy-6', topic: 'Cypress', level: 'Mid',
    q: 'What is the difference between cy.get() and cy.contains()?',
    a: 'cy.get(selector) finds elements by CSS selector. cy.contains(text) finds an element containing the given text, usually the deepest one, but it prefers certain higher elements such as input[type=submit], button, a and label when they contain the text. With a selector first, cy.contains(".btn", "Save"), it narrows to a matching element. Contains is handy for visible labels but sensitive to copy changes, so a data-cy attribute is more stable for core flows.',
  },
  {
    id: 'cy-7', topic: 'Cypress', level: 'Mid',
    q: 'How do you create reusable commands and when is that a bad idea?',
    a: 'Add them with Cypress.Commands.add("login", (user) => { ... }) in the support file and type them for TypeScript. Custom commands are good for repeated low-level steps like login via API. They become a problem when they hide page structure and grow into a second, untyped page object layer, so keep them small and consider plain helper functions for most logic.',
  },
  {
    id: 'cy-8', topic: 'Cypress', level: 'Senior',
    q: 'How do you log in once and reuse the session in Cypress?',
    a: 'Use cy.session(id, setupFn), which runs the setup once, caches cookies, local storage and session storage under that id, and restores them on later calls. Call it where each test needs the login, usually in beforeEach. Log in through the API with cy.request inside the setup for speed, and pass a validate function so Cypress re-runs setup if the cached session expires. Cypress clears the page after cy.session, so the test must still cy.visit the page it wants.',
  },
  {
    id: 'cy-9', topic: 'Cypress', level: 'Mid',
    q: 'What is the difference between cy.wait(1000) and cy.wait("@alias")?',
    a: 'cy.wait(1000) is a hard sleep that slows every run and still fails when the app takes longer. cy.wait("@alias") waits until the aliased network request has completed, and yields the interception so you can assert on its status and body. Almost every hard wait can be replaced by a retrying assertion or a wait on an alias.',
  },
  {
    id: 'cy-10', topic: 'Cypress', level: 'Junior',
    q: 'What is the difference between e2e and component testing in Cypress?',
    a: 'End-to-end tests visit a running application URL and exercise the full stack. Component tests mount a single React, Vue or Angular component in isolation with cy.mount() and run in the real browser, which makes them fast and good for states that are hard to reach in the full app. Both use the same commands and assertions.',
  },
  {
    id: 'cy-11', topic: 'Cypress', level: 'Mid',
    q: 'How do you handle flaky tests in Cypress?',
    a: 'First find the cause: a missing wait on a network alias, an assertion inside .then(), or a shared state between tests. Fix it by asserting on the real end state and waiting on aliases. As a safety net you can turn on test retries in the config with retries: { runMode: 2, openMode: 0 }, but treat any test that needs a retry as a defect to investigate, not a pass.',
  },
  {
    id: 'cy-12', topic: 'Cypress', level: 'Senior',
    q: 'How does Cypress handle iframes and why does it need cy.origin?',
    a: 'Cypress has no built-in frame switching, so you get the iframe body yourself: read the contentDocument body of the iframe element, wrap it with cy.wrap, and then query within it. cy.origin() is a separate feature. Since Cypress 14 it is required whenever a test navigates to a different origin (scheme, host or port, so even another subdomain), such as an OAuth provider, because the browser same-origin policy would otherwise block Cypress from controlling that page. This is consistent with the cross-origin limitation of the runner.',
  },

  // ---------- API Testing ----------
  {
    id: 'api-1', topic: 'API Testing', level: 'Junior',
    q: 'What do the main HTTP status code classes mean?',
    a: '2xx means success (200 OK, 201 Created, 204 No Content), 3xx is redirection, 4xx is a client error (400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 429 too many requests) and 5xx is a server error. A good API test asserts the exact code for each scenario, not just that the response is "not an error".',
  },
  {
    id: 'api-2', topic: 'API Testing', level: 'Junior',
    q: 'What is the difference between 401 and 403?',
    a: '401 Unauthorized means the request has no valid credentials, so the server does not know who you are, and RFC 9110 says the response must include a WWW-Authenticate header. 403 Forbidden means the server knows who you are but you are not allowed to do this. Testing both for a protected endpoint shows whether authentication and authorisation are enforced separately.',
  },
  {
    id: 'api-3', topic: 'API Testing', level: 'Mid',
    q: 'What does idempotent mean, and which HTTP methods are idempotent?',
    a: 'An operation is idempotent if repeating it leaves the server in the same state as doing it once. GET, PUT, DELETE, HEAD and OPTIONS are idempotent by definition, while POST and PATCH are not guaranteed to be. In tests, send the same PUT twice and check the resource is unchanged, and check that a second DELETE returns 404 or 204 consistently without side effects.',
  },
  {
    id: 'api-4', topic: 'API Testing', level: 'Junior',
    q: 'What is the difference between PUT and PATCH?',
    a: 'PUT replaces the whole resource with the representation you send, so missing fields may be reset or cleared. PATCH applies a partial update to only the fields you send. Test both: PUT with a full body should overwrite, and PATCH with one field must leave the others untouched.',
  },
  {
    id: 'api-5', topic: 'API Testing', level: 'Mid',
    q: 'How do Basic auth, API keys, bearer tokens and OAuth 2.0 differ?',
    a: 'Basic auth sends base64-encoded username and password on every request, so it needs HTTPS and is rarely used for modern APIs. An API key identifies the calling application and is usually sent in a header. A bearer token such as a JWT is sent as Authorization: Bearer <token> and typically expires. OAuth 2.0 is a framework for getting such tokens by delegated authorisation, with flows like authorization code and client credentials.',
  },
  {
    id: 'api-6', topic: 'API Testing', level: 'Mid',
    q: 'What would you assert on a response besides the status code?',
    a: 'Check the response body against a JSON schema or an exact expected value for key fields, the Content-Type header, and any pagination, caching or rate-limit headers. Also assert response time against a budget and verify side effects, such as fetching the resource after a POST. Asserting only the status code misses wrong data returned with a 200.',
  },
  {
    id: 'api-7', topic: 'API Testing', level: 'Senior',
    q: 'What is contract testing and how is it different from end-to-end API tests?',
    a: 'A contract test verifies that a consumer and a provider agree on the shape of their interactions, without deploying both. In consumer-driven tools like Pact the consumer records the requests and responses it expects, and the provider replays them in its own pipeline. It catches breaking changes early and cheaply, whereas an end-to-end test needs every service running and fails for many unrelated reasons.',
  },
  {
    id: 'api-8', topic: 'API Testing', level: 'Mid',
    q: 'How do you test pagination, filtering and sorting?',
    a: 'Create a known data set, then request pages with limit and offset or a cursor and assert page size, total count, and that no item appears twice or is skipped. For sorting, check order on the full returned set including ties. Test boundary cases like page zero, a page past the end, a huge limit and invalid values, which should produce a clear 400 rather than a 500.',
  },
  {
    id: 'api-9', topic: 'API Testing', level: 'Mid',
    q: 'How do you test rate limiting?',
    a: 'Send requests in a loop until the API returns 429 Too Many Requests, and verify the limit matches the documented number. Check headers such as Retry-After and any X-RateLimit-* headers, then wait the stated time and confirm requests succeed again. Run it against a test environment with its own quota so you do not block other users.',
  },
  {
    id: 'api-10', topic: 'API Testing', level: 'Mid',
    q: 'What negative tests should every endpoint have?',
    a: 'Missing and malformed authentication, a body with missing required fields, wrong data types, values over length limits, unexpected extra fields, invalid JSON, and unsupported content types. Also test accessing another user\'s resource by ID, which exposes broken authorisation. The expectation is a clear 4xx with a consistent error body, never a 500 or a stack trace.',
  },
  {
    id: 'api-11', topic: 'API Testing', level: 'Mid',
    q: 'REST versus GraphQL: how does testing differ?',
    a: 'REST has many URLs, with method and status code carrying meaning. GraphQL usually has a single POST endpoint, where the query in the body decides what comes back, and errors often arrive in an errors array alongside a 200. So you assert on the response errors field rather than only on the status, and you test query depth and cost limits, authorisation per field, and that the schema stays backward compatible.',
  },
  {
    id: 'api-12', topic: 'API Testing', level: 'Senior',
    q: 'How do you test an asynchronous endpoint or a webhook?',
    a: 'An endpoint that returns 202 Accepted does the work later, so assert the 202 and a status URL or job ID, then poll that URL with a bounded timeout until it reports completion, never with a fixed sleep. For webhooks, run a small receiver or a request-capture service in the test and assert on the payload and signature header. Also test retries and duplicate deliveries, since the consumer should handle the same event twice.',
  },

  // ---------- Manual & Process ----------
  {
    id: 'man-1', topic: 'Manual & Process', level: 'Junior',
    q: 'What are the phases of the Software Testing Life Cycle (STLC)?',
    a: 'Typically: requirement analysis, test planning, test case design, test environment setup, test execution, and test closure. Each phase has entry and exit criteria, such as signed-off requirements before design starts. In agile teams these phases overlap inside each sprint instead of happening strictly one after another.',
  },
  {
    id: 'man-2', topic: 'Manual & Process', level: 'Junior',
    q: 'What is the difference between severity and priority?',
    a: 'Severity measures the technical impact of a defect on the system, for example a crash is high severity. Priority is the order in which the business wants it fixed. They can disagree: a typo in the company name on the home page is low severity but high priority, while a crash in a rarely used admin report is high severity but may be low priority.',
  },
  {
    id: 'man-3', topic: 'Manual & Process', level: 'Junior',
    q: 'Explain boundary value analysis with an example.',
    a: 'Defects cluster at the edges of input ranges, so you test at and next to each boundary. For an age field that accepts 18 to 60, three-value BVA tests 17, 18, 19, 59, 60 and 61, the boundary and the values on both sides. Two-value BVA tests only 17, 18, 60 and 61, each boundary and its nearest neighbour in the adjacent partition. It pairs naturally with equivalence partitioning.',
  },
  {
    id: 'man-4', topic: 'Manual & Process', level: 'Junior',
    q: 'What is equivalence partitioning?',
    a: 'You split the input domain into groups that the system should treat the same, then test one representative from each group. For an age field of 18 to 60 you have three partitions: below 18 (invalid), 18 to 60 (valid) and above 60 (invalid). It reduces the number of test cases while keeping coverage of distinct behaviours.',
  },
  {
    id: 'man-5', topic: 'Manual & Process', level: 'Junior',
    q: 'What is the difference between verification and validation?',
    a: 'Verification asks whether we built the product right, meaning it conforms to the specification, and uses reviews, inspections and static checks. Validation asks whether we built the right product, meaning it meets real user needs, and relies on executing the software and acceptance testing. A feature can pass verification and still fail validation if the spec was wrong.',
  },
  {
    id: 'man-6', topic: 'Manual & Process', level: 'Junior',
    q: 'What is a good bug report?',
    a: 'It has a clear title, environment details (build, browser, OS), numbered reproduction steps, expected versus actual result, and evidence such as screenshots, logs or a video. It also states severity and how often it reproduces. The goal is that a developer can reproduce it without asking you anything.',
  },
  {
    id: 'man-7', topic: 'Manual & Process', level: 'Mid',
    q: 'What is the difference between smoke, sanity and regression testing?',
    a: 'Smoke testing is a shallow check that the critical functions of a new build work before deeper testing starts. Sanity testing is a narrow check after a small change or fix to confirm that specific area behaves. Regression testing re-runs a broader set of tests to confirm that existing features still work after changes.',
  },
  {
    id: 'man-8', topic: 'Manual & Process', level: 'Mid',
    q: 'How do you decide what to test when time is short?',
    a: 'Use risk-based testing: rank features by likelihood of failure and business impact, then test the highest combinations first, including recently changed code and critical user paths such as login and checkout. Agree explicitly with stakeholders what will not be tested, and report that residual risk rather than silently dropping scope.',
  },
  {
    id: 'man-9', topic: 'Manual & Process', level: 'Mid',
    q: 'What is exploratory testing and when is it better than scripted testing?',
    a: 'In exploratory testing you design, execute and learn at the same time, usually in a time-boxed session with a written charter. It finds unexpected problems, usability issues and gaps in requirements that scripted cases do not anticipate. It works well on new features and complements automation, but needs notes so findings are reproducible.',
  },
  {
    id: 'man-10', topic: 'Manual & Process', level: 'Mid',
    q: 'What is a requirements traceability matrix?',
    a: 'It is a table that links each requirement to the test cases that cover it, and often to defects found. It shows coverage gaps, requirements with no tests, and which tests are affected when a requirement changes. Many teams keep the links in their test management tool rather than a spreadsheet.',
  },
  {
    id: 'man-11', topic: 'Manual & Process', level: 'Junior',
    q: 'What is the difference between a test plan and a test strategy?',
    a: 'A test strategy is a high-level, long-lived document describing the general approach for an organisation or product: test levels, tools, standards and risk handling. A test plan is specific to a project or release and covers scope, schedule, resources, environments, entry and exit criteria and deliverables. One strategy usually supports many plans.',
  },
  {
    id: 'man-12', topic: 'Manual & Process', level: 'Mid',
    q: 'How does a QA engineer contribute in an agile team?',
    a: 'QA joins refinement to challenge acceptance criteria, writes test ideas and examples before development ("shift left"), tests stories during the sprint instead of after it, and automates regression checks alongside features. They also help define the definition of done and raise quality risks early. Quality is a whole-team responsibility, with QA guiding it rather than gatekeeping at the end.',
  },

  // ---------- Framework Design ----------
  {
    id: 'fw-1', topic: 'Framework Design', level: 'Junior',
    q: 'What is the Page Object Model and why use it?',
    a: 'A page object is a class that wraps one page or component, exposing intent-level methods like login(user, pass) and hiding the locators behind them. When the UI changes you fix a locator in one place instead of in every test. Keep assertions mostly in the tests and keep page objects free of test logic.',
  },
  {
    id: 'fw-2', topic: 'Framework Design', level: 'Mid',
    q: 'What is the test pyramid and why does it matter?',
    a: 'It describes a healthy mix of many fast unit tests at the base, fewer integration or API tests in the middle, and a small number of slow UI end-to-end tests at the top. Lower layers are cheaper, faster and less flaky, so most logic should be verified there. A suite shaped like an ice-cream cone, with mostly UI tests, is slow and fragile.',
  },
  {
    id: 'fw-3', topic: 'Framework Design', level: 'Mid',
    q: 'What are the common causes of flaky tests and how do you reduce them?',
    a: 'The usual causes are fixed sleeps instead of condition waits, shared or order-dependent test data, unstable locators, race conditions in the app, and unreliable environments or third-party services. Remove the cause: wait on real signals, isolate data per test, and mock external services. Quarantine a flaky test quickly so it stops eroding trust, and track flake rate over time.',
  },
  {
    id: 'fw-4', topic: 'Framework Design', level: 'Mid',
    q: 'How do you run automated tests in CI/CD?',
    a: 'Trigger the suite on pull requests and merges, run it in a clean, reproducible environment such as a container, and publish reports and artifacts like screenshots and traces. Split fast smoke tests on every commit from the long regression run on a schedule or before release. Make failures block the merge only when the tests are stable enough to trust.',
  },
  {
    id: 'fw-5', topic: 'Framework Design', level: 'Mid',
    q: 'How do you make tests run in parallel safely?',
    a: 'Every test must be independent: its own data, its own browser session, and no reliance on execution order. Never keep the driver or page in a shared static field, and use thread-local or per-worker instances. Watch for shared resources such as one user account or a database row, and give each worker its own or generate unique data.',
  },
  {
    id: 'fw-6', topic: 'Framework Design', level: 'Mid',
    q: 'What is data-driven testing and how do you implement it?',
    a: 'The same test logic runs against many input sets stored outside the code, in a CSV, JSON file or database. Frameworks support this directly: TestNG DataProvider, JUnit parameterised tests, pytest.mark.parametrize, or a loop that generates tests in Playwright and Cypress. It increases coverage cheaply, but name each case clearly so a failure tells you which data broke.',
  },
  {
    id: 'fw-7', topic: 'Framework Design', level: 'Mid',
    q: 'What makes a good test report?',
    a: 'It shows pass, fail and skipped counts, trends over time, and for each failure the error, steps, screenshot or trace and environment. It should be readable by non-engineers and published automatically from CI. Allure, the Playwright HTML reporter and JUnit XML consumed by the CI server are common choices.',
  },
  {
    id: 'fw-8', topic: 'Framework Design', level: 'Senior',
    q: 'How do you manage test data and environments?',
    a: 'Prefer creating data through APIs or database seeding at the start of each test, with unique values, rather than relying on records that already exist. Keep per-environment configuration such as URLs and credentials in config files or CI secrets, never in test code. Where possible use disposable environments, so a run starts from a known state.',
  },
  {
    id: 'fw-9', topic: 'Framework Design', level: 'Senior',
    q: 'How do you decide what to automate?',
    a: 'Automate checks that are repeated often, stable, deterministic and high value, such as regression of critical paths and data-heavy combinations. Do not automate one-off checks, rapidly changing features or tests that need human judgment like visual appeal. Estimate the maintenance cost against the time saved, and push each check down to the cheapest layer that can catch the bug.',
  },
  {
    id: 'fw-10', topic: 'Framework Design', level: 'Senior',
    q: 'How would you structure a framework from scratch?',
    a: 'Separate layers: tests, page or component objects, helpers and fixtures, test data, and configuration. Pick the runner for built-in parallelism, retries and reporting, add typed API clients for fast setup, and keep utilities small and independent. Add linting and a pipeline from day one, and write a short contributing guide so the team follows the same conventions.',
  },
  {
    id: 'fw-11', topic: 'Framework Design', level: 'Mid',
    q: 'What is the difference between a hard assertion and a soft assertion?',
    a: 'A hard assertion stops the test at the first failure. A soft assertion records the failure and continues, then reports all failures at the end, as with SoftAssert in TestNG, expect.soft in Playwright or AssertJ SoftAssertions. Soft assertions suit checking many independent fields on one page, but do not use them when later steps depend on the earlier check.',
  },
  {
    id: 'fw-12', topic: 'Framework Design', level: 'Senior',
    q: 'How do you handle cross-browser testing without doubling your runtime?',
    a: 'Run the full suite on one primary browser on every commit, and run a smaller set of critical-path tests across Chromium, Firefox and WebKit, or on a cloud grid, on a schedule or before release. Use real data on browser usage to decide the matrix. Playwright projects or a Selenium Grid make the matrix a configuration choice rather than extra test code.',
  },
];
