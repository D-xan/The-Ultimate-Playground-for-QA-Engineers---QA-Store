# Tier 2/3 Challenges — Design

Six new practice pages, built and shipped one at a time (each merged to `main` → live on GitHub Pages before the next starts). Domain move and SEO stay last (see roadmap).

## Shared rules (every page)

- Route `/practice/<id>`, lazy-loaded in `src/routes.tsx`, entry in `src/data/challenges.tsx` (sidebar, dashboard, smoke tests and certificate pick it up automatically).
- Page shape matches `Widgets.tsx`: `h1` + intro + `HintAccordion`, numbered `<section>`s (`SECTION`/`H2` classes), `TaskQuestions` per section with a distinct `groupId`, and `<SolutionTabs challengeId=… number={last+1} />` at the end.
- Every interactive element has a stable `id` and `data-testid`. Every task has a `<ChallengeResult testId="result-…">` whose `data-state` turns `success` only when the task is truly done.
- Deterministic content (no `Math.random` in anything a test asserts on) unless randomness *is* the lesson, in which case the test reads the value from the page.
- `e2e/<id>.spec.ts` solves the page and doubles as the Playwright solution (imported `?raw`). Selenium Java, Selenium Python and Cypress solutions live in `src/data/solutions/<id>.ts`, use `${SITE_URL}`, and wait for `main h1` after every `driver.get` (enforced by `solutions.test.ts`).
- Each page: focused spec passes with `--repeat-each 5`, full unit + e2e suite and `npm run build` pass, then commit `feat: <Page> challenge page`, merge to `main`, push, verify live.
- Side effect accepted: the certificate requires all practice challenges, so the six new pages join its requirement.

## 1. Windows & Tabs — `windows` (Advanced, icon `ExternalLink`)

Child pages live on a bare route `/popup/:kind` (outside `PracticeLayout`, no sidebar) rendered by `src/pages/practice/PopupPage.tsx`.

1. **New tab** — `#open-tab` is `<a target="_blank" href="#/popup/secret">`. On mount the parent writes a fresh secret word to `localStorage['qa-windows-secret']`; the child shows it in `#tab-secret`. Typing it into `#tab-secret-input` + `#check-secret` → `result-tab` success.
2. **Popup that reports back and closes** — `#open-popup` calls `window.open('#/popup/approve', 'approve', 'width=480,height=600')`. Child `#approve-btn` sends `postMessage({ type: 'qa-approve', code })` to `window.opener` (same origin only) and calls `window.close()`. Parent shows the code in `#approval-code` → `result-popup` success. Lesson: the handle you switched to disappears.
3. **Slow popup** — `#open-delayed` opens `#/popup/delayed` at once (a delayed `window.open` would be blocked by real browsers' popup blockers), but the child shows `Loading…` and only renders `#delayed-confirm` after 1–3 s (random; that is the lesson). Clicking it posts `qa-delayed` → `result-delayed`.
4. **Pick the right window** — three buttons `#open-a/b/c` each open `#/popup/pick?w=A|B|C` in a new tab whose `document.title` is `Window A/B/C`. Only the child titled `Window B` has `#pick-me` enabled; clicking it posts `qa-pick` → `result-pick`. Lesson: find a window by title, not by order.

Child pages without an `opener` (e.g. Cypress visiting them directly) show `#no-opener` text instead of failing. Cypress solution stubs `window.open` / removes `target` and says plainly which parts Cypress cannot do.

## 2. Sortable Lists — `sortable` (Advanced, icon `GripVertical`)

Fixed shuffled start order; a `Reset` button per section.

1. **HTML5 drag and drop** — `#html5-list` of five `draggable` `li[data-testid="html5-item"]` ("Step 1".."Step 5") using `dragstart/dragover/drop`. Correct order → `result-html5`. Lesson: Playwright `dragTo` works; Selenium `Actions.dragAndDrop` does not fire HTML5 events — solutions use the JS `DataTransfer` workaround.
2. **Press-and-hold sortable** — `#hold-list` built on pointer events. A drag activates only after the pointer is held **250 ms** without moving more than 5 px (like dnd-kit's delay sensor); drop index comes from the last `pointermove`. A plain `dragTo` fails. Solution: `mouse.down()`, wait 300 ms, `mouse.move(…, { steps: 10 })`, `mouse.up()`; Selenium `clickAndHold().pause(300).moveToElement().release()`. Correct order (A–E) → `result-hold`.
3. **Kanban** — columns `#col-todo`, `#col-progress`, `#col-done` (HTML5 DnD). Move "Write tests" to Done and "Fix bug #42" to In Progress, everything else unchanged → `result-kanban`.

## 3. Virtual Table — `virtual-table` (Advanced, icon `Rows3`)

10,000 rows from a seeded generator in `src/data/virtualRows.ts` (`id`, `name`, `email`, `score`), unit-tested for determinism.

1. **Find a row that isn't in the DOM** — `#virtual-grid` (`role="grid"`, `aria-rowcount="10000"`), 400 px tall, 40 px rows, renders only the visible rows + 5 overscan, each `[data-row-id]` with `aria-rowindex`. Click Select on row **#7342** → `result-find` success with its email shown in `#selected-email`. Lesson: scroll until present (or compute `scrollTop`), never `nth(7341)`.
2. **Sort then pick** — `#sort-score` toggles score asc/desc. Select the row with the highest score → `result-sort`. The max row is far from the top in default order.

(Infinite scroll already lives on Store Lazy Loading; not repeated.)

## 4. Auth Flows — `auth-flows` (Advanced, icon `KeyRound`)

Self-contained mock auth (not the store login). Credentials shown on the page: `tester@qa.test` / `Passw0rd!`. Logic in `src/utils/mockAuth.ts`, unit-tested.

1. **Two-step login** — `#auth-email`, `#auth-password`, `#auth-login`. Then the "Inbox" panel `#inbox` receives an email after 1.5 s with a random 6-digit code (`#inbox-code`), valid 60 s. Enter in `#auth-otp` + `#auth-verify` → `#auth-dashboard` and `result-2fa`. Wrong/expired code shows an error.
2. **Session expires mid-task** — after login, `#start-wizard` starts a 3-step wizard. The elevated session lasts 8 s; the next step after that opens `#session-expired-modal` asking for the password (`#reauth-password`, `#reauth-submit`). After re-auth the wizard resumes on the same step; finishing → `result-session`.
3. **Remember me** — `#remember-me` stores a session token (expiry 1 h) in `localStorage['qa-auth-session']` and cookie `qa_session`. Loading the page with a valid token skips login and shows `#session-restored` → `result-remember`. Lesson: log in once, save `storageState` / cookies, reuse.

## 5. Canvas & Charts — `canvas` (Advanced, icon `PenTool`)

Both canvases have a fixed drawing size but are displayed at `width: 100%; max-width` of that size, so they shrink on phones (the layout suite checks 375 px). All coordinates exposed to tests are CSS pixels relative to the canvas's displayed box.

1. **Moving target** — `#target-canvas` (600×300 drawing size) draws a circle (r = 30) moving at ≤ 60 px/s. `window.qaCanvas.target()` returns `{ x, y, r }` in CSS pixels relative to the canvas (a test hook, as real canvas apps expose). 3 hits → `result-target`; hits/misses in `#canvas-hits`/`#canvas-misses`. Lesson: click by coordinates, nothing in the DOM.
2. **Draw a line** — `#draw-canvas` with a "start" box on the left and "end" box on the right; a pointer stroke that starts in one and ends in the other, staying inside the canvas → `result-draw`. Lesson: `mouse.move` with `steps`.
3. **Chart tooltip** — `#sales-chart` SVG with 12 bars (`[data-month]`, no values in the DOM). Hovering a bar shows `#chart-tooltip` "Mar: 4,210". Type the peak month into `#peak-month` + `#check-peak` → `result-chart`.

## 6. Accessibility Lab — `a11y` (Intermediate, icon `Accessibility`)

Adds dev dependency `@axe-core/playwright`.

1. **Find the planted issues** — `#a11y-broken` contains exactly these axe violations: `image-alt`, `label`, `color-contrast`, `button-name`, `link-name`. A checklist `#a11y-checklist` of 8 rule ids (the 5 plus decoys `heading-order`, `list`, `aria-allowed-attr` which the region does *not* violate). Ticking exactly the five + `#check-a11y` → `result-axe`. E2E asserts axe on `#a11y-broken` reports exactly those five ids.
2. **The fixed version** — `#a11y-fixed`, same form with zero violations. E2E asserts `violations` is empty (the pattern users copy into their own suites).
3. **Keyboard only** — `#keyboard-form`: name input, a custom listbox (`role="listbox"`, arrow keys + Enter), a checkbox, and a Submit that opens a confirm dialog with a focus trap (Tab cycles inside, `Escape` cancels, `Enter` on Confirm submits). Any `pointerdown` inside the section sets `data-mouse-used="true"` and the result fails with "Mouse used — try again with only the keyboard" (Reset clears it). Submitting via keyboard only → `result-keyboard`.

## Out of scope

Offline / network-error page (covered by API Interception and API Playground), mobile emulation page, visual-regression page. Revisit after this batch.
