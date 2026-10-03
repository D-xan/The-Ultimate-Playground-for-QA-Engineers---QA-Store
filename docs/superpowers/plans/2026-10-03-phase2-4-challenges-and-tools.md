# Phase 2–4: Challenges, Free Premium Tools, Bug Hunt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Tier-1 automation challenges, the free versions of features other sites charge for (test data generator, selector lab, solutions, API playground, interview kit, certificate), and a bug-hunt mode.

**Architecture:** Each challenge or tool is one lazy-loaded page under `/practice/<id>`, registered in `src/data/challenges.tsx` (Phase 1's single registry). Pure logic lives in `src/tools/*.ts` with Vitest tests; every page has Playwright e2e tests in `e2e/<id>.spec.ts` that double as the reference solution shown by the Solutions tab.

**Tech Stack:** React 19, Vite 8, Tailwind 4, react-router-dom 7 (HashRouter), zustand 5 (+persist), Vitest 5, @playwright/test 1.63, lucide-react, @faker-js/faker 10.

**Spec:** conversation research (gap analysis, premium-features table) + Phase 1 plan `docs/superpowers/plans/2026-10-03-qa-playground-roadmap.md`.

## Global Constraints

- No backend, no paid API, no new runtime dependency except moving `@faker-js/faker` from devDependencies to dependencies (Task 6). Everything runs in the browser on GitHub Pages.
- Routes: add each page as `React.lazy` in `src/routes.tsx` inside the `/practice` route, path = registry `id`.
- Registry: every page gets one entry in `challenges` in `src/data/challenges.tsx` (`id`, `label`, `desc`, `difficulty`, `icon` as a lucide component). Tools also get `kind: 'tool'` (introduced in Task 6).
- Page shape (copy from `src/pages/practice/ProgressBarChallenge.tsx` / `BasicElements.tsx`): root `<div className="space-y-12 pb-12">`; one `<h1 className="text-3xl font-bold text-slate-900 mb-2">`; intro `<p className="text-slate-500">`; `<HintAccordion hints={[...]}/>` with Selenium, Playwright and Cypress hints; each section a `<section className="bg-white p-6 rounded-2xl shadow-sm border border-border">` with `<h2 className="text-xl font-bold mb-6 border-b border-border pb-2">` numbered `1. `, `2. `… sequentially; each challenge section has `<TaskQuestions groupId="<section-slug>" tasks={[...]}/>` (title, description, positive[], negative[]) — tools have no TaskQuestions.
- Pass/fail is reported with `<ChallengeResult testId="result-<slug>" state message/>` (Task 1 adds the `testId` prop). Never invent a different success signal.
- Every interactive element has the exact `id` / `data-testid` the brief names. Do not rename them: tests and the Solutions tab depend on them.
- e2e tests navigate with `page.goto('/#/practice/<id>')`. Run e2e with `npx playwright test e2e/<file>` while iterating, the full suite `npx vitest run && npx playwright test` once before committing; both must pass, and `npm run build` must succeed.
- Existing tests in `e2e/layout.spec.ts` and `e2e/smoke.spec.ts` iterate the registry and must keep passing for new pages (h1 visible, sidebar `nav-<id>` gets `aria-current="page"`, numbered h2s run 1..n, no page errors).
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push.

## Review Focus

1. A page reached by deep link with empty `localStorage` renders without console errors (smoke test covers registry routes).
2. Timing-based challenges (animated button, delayed enable, flaky request, random delay) must pass their e2e tests 5/5 with `--repeat-each 5` — no test may depend on luck beyond its own retry loop.
3. Text that users paste into tools (data generator field names with commas/quotes, API body that is invalid JSON, selector lab invalid selectors) must produce a visible error or correctly escaped output, never an uncaught exception.
4. Bug-hunt defects must be completely inert when bug-hunt mode is off — Task 12 tests the cart total both ways.
5. Phone width 375px: new pages must not cause horizontal page scroll (Task 6 extends the layout test to every registry page).

---

### Task 1: Click Traps page (+ `ChallengeResult` testId prop)

**Files:**
- Modify: `src/components/ui/ChallengeResult.tsx` (add `testId?: string`, default `'challenge-result'`, used for `data-testid`)
- Create: `src/pages/practice/ClickTraps.tsx`, `e2e/click-traps.spec.ts`
- Modify: `src/data/challenges.tsx` (entry: `id: 'click-traps'`, label `Click Traps`, desc `Covered, moving and delayed elements that break naive clicks`, difficulty `Advanced`, icon `MousePointerClick`), `src/routes.tsx`

**Interfaces:**
- Produces: `ChallengeResult({ state, message, testId? })`; page `/practice/click-traps`.

Sections (in order):
1. **Overlapped Element** (groupId `overlap`): a `relative` box containing `<button id="overlapped-button">Submit Order</button>` and an absolutely positioned cover `<div id="overlap-cover">` (semi-opaque, fully covers the button, `pointer-events: auto`) holding `<button id="overlap-dismiss">Dismiss banner</button>`. Clicking dismiss removes the cover. Clicking `#overlapped-button` → `result-overlap` success "Order submitted". Initial state pending "The button is covered — get rid of the cover first".
2. **Moving Button** (groupId `moving`): `<button id="start-animation">Start animation</button>` makes `<button id="moving-button">Catch me</button>` slide horizontally for 2.5 s (CSS transition/animation on `transform`); while moving it has class `animating`. Clicking it while `animating` → `result-moving` failure "Clicked while moving"; after it stops → success "Clicked after it stopped".
3. **Hidden Layers** (groupId `layers`): `<button id="green-button">` (green). First click → `result-layers` success "Green clicked once" and renders `<button id="blue-button">` absolutely on top of it, same size/position, higher z-index. Clicking blue → failure "You clicked the blue layer — the green button is covered now". A `Reset` button `#reset-layers` restores.
4. **Disabled → Enabled** (groupId `enabled`): `<button id="enable-input">Enable input</button>`; `<input id="delayed-input" disabled>` becomes enabled after a random 2000–4000 ms; `<button id="submit-delayed">Submit</button>` → `result-enabled` success when value is exactly `QA`, failure otherwise.

- [ ] **Step 1: Write the failing test** — `e2e/click-traps.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/click-traps');
});

test('covered button cannot be clicked until the cover is dismissed', async ({ page }) => {
  await expect(page.locator('#overlapped-button').click({ timeout: 1000 })).rejects.toThrow();
  await page.locator('#overlap-dismiss').click();
  await page.locator('#overlapped-button').click();
  await expect(page.getByTestId('result-overlap')).toHaveAttribute('data-state', 'success');
});

test('moving button is clicked only after it stops', async ({ page }) => {
  await page.locator('#start-animation').click();
  await expect(page.locator('#moving-button')).not.toHaveClass(/animating/, { timeout: 5000 });
  await page.locator('#moving-button').click();
  await expect(page.getByTestId('result-moving')).toHaveAttribute('data-state', 'success');
});

test('second click lands on the hidden layer', async ({ page }) => {
  await page.locator('#green-button').click();
  await expect(page.getByTestId('result-layers')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('#blue-button')).toBeVisible();
  await expect(page.locator('#green-button').click({ timeout: 1000 })).rejects.toThrow();
});

test('input is typed only once it becomes enabled', async ({ page }) => {
  await expect(page.locator('#delayed-input')).toBeDisabled();
  await page.locator('#enable-input').click();
  await expect(page.locator('#delayed-input')).toBeEnabled({ timeout: 6000 });
  await page.locator('#delayed-input').fill('QA');
  await page.locator('#submit-delayed').click();
  await expect(page.getByTestId('result-enabled')).toHaveAttribute('data-state', 'success');
});
```

- [ ] **Step 2:** Run `npx playwright test e2e/click-traps.spec.ts` — Expected: FAIL (route missing).
- [ ] **Step 3:** Implement `testId` prop, page, registry entry and route per the section spec above.
- [ ] **Step 4:** Run `npx playwright test e2e/click-traps.spec.ts --repeat-each 5` — Expected: 20 passed. Then full suite + `npm run build` — Expected: pass.
- [ ] **Step 5:** Commit `feat: Click Traps challenge page`.

---

### Task 2: Locator Traps page

**Files:** Create `src/pages/practice/LocatorTraps.tsx`, `e2e/locator-traps.spec.ts`; modify registry (`id: 'locator-traps'`, label `Locator Traps`, desc `Dynamic IDs, shuffled classes, hidden spaces and shifting layouts`, `Intermediate`, icon `ScanSearch`), `src/routes.tsx`.

**Interfaces:** Consumes `ChallengeResult` with `testId` (Task 1).

Sections:
1. **Dynamic ID** (groupId `dynamic-id`): button text `Dynamic ID Button`, `id` = `btn-` + 6 random base36 chars, regenerated on mount and after every click; class `dynamic-id-btn`. Click → `result-dynamic-id` success "Clicked without relying on the ID".
2. **Class Attribute** (groupId `class-attr`): container `<div id="class-trap">` with three buttons labelled `Primary`, `Secondary`, `Warning`. Each has classes `btn`, `btn-test` and one of `btn-primary` / `btn-secondary` / `btn-warning`, in a random order per render (e.g. `class="btn-test btn-primary btn"`); button order shuffles too. Clicking the `btn-primary` one → `result-class-attr` success; any other → failure "Wrong button — match the class, not its position".
3. **Non-breaking Space** (groupId `nbsp`): `<div id="nbsp-section">` holding one button whose text is `Click` + U+00A0 + `Me` (write it as `{'Click Me'}`). Click → `result-nbsp` success.
4. **Shifting Content** (groupId `shifting`): `<div id="shifting-menu">` with buttons `Home`, `About`, `Gallery`, `Contact`, `Portfolio` in random order on mount; a left margin of random 0–120px on the menu; `<button id="shift-button">Shift layout</button>` reshuffles both. Clicking `Gallery` → `result-shifting` success; others → failure.

- [ ] **Step 1: Write the failing test** — `e2e/locator-traps.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/locator-traps');
});

test('dynamic id button is found by its text', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Dynamic ID Button' });
  const firstId = await button.getAttribute('id');
  await button.click();
  await expect(page.getByTestId('result-dynamic-id')).toHaveAttribute('data-state', 'success');
  await expect(button).not.toHaveAttribute('id', firstId!);
});

test('primary button is found by class, whatever the class order', async ({ page }) => {
  await page.locator('#class-trap .btn-primary').click();
  await expect(page.getByTestId('result-class-attr')).toHaveAttribute('data-state', 'success');
});

test('text with a non-breaking space defeats exact XPath text()', async ({ page }) => {
  expect(await page.locator("xpath=//div[@id='nbsp-section']//button[text()='Click Me']").count()).toBe(0);
  await page.locator('#nbsp-section button', { hasText: /Click\s+Me/ }).click();
  await expect(page.getByTestId('result-nbsp')).toHaveAttribute('data-state', 'success');
});

test('shifting menu is clicked by name, not position', async ({ page }) => {
  await page.locator('#shift-button').click();
  await page.locator('#shifting-menu').getByRole('button', { name: 'Gallery' }).click();
  await expect(page.getByTestId('result-shifting')).toHaveAttribute('data-state', 'success');
});
```

- [ ] **Step 2:** Run it — Expected: FAIL (route missing).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npx playwright test e2e/locator-traps.spec.ts --repeat-each 5` → 20 passed; full suite + build pass.
- [ ] **Step 5:** Commit `feat: Locator Traps challenge page`.

---

### Task 3: Deep DOM page (nested frames, changing frame, closed shadow, shadow in frame)

**Files:** Create `src/pages/practice/DeepDom.tsx`, `src/components/practice/ClosedShadowWidget.ts`, `e2e/deep-dom.spec.ts`; modify registry (`id: 'deep-dom'`, label `Deep DOM`, desc `Nested iframes, closed shadow roots and shadow DOM inside frames`, `Advanced`, icon `Layers`), routes.

Sections:
1. **Nested iframes** (groupId `nested-frames`): `<iframe id="frame-level-1">` whose `srcDoc` contains `<iframe id="frame-level-2">` whose srcdoc contains `<iframe id="frame-level-3">` containing `<button id="deep-button">Click me, three frames deep</button>`. Build the nested srcdoc with a helper that HTML-escapes (`&` → `&amp;`, `"` → `&quot;`) each inner document before embedding it in the outer `srcdoc="..."`. The button runs `window.top.postMessage({ type: 'deep-click' }, '*')`; the page listens (`message` event, check `event.data?.type`) and sets `result-nested-frames` success.
2. **Changing iframe** (groupId `countdown`): `<iframe id="countdown-frame">` (srcdoc) shows `<span id="countdown">5</span>` counting down once per second to 0, then shows `<p id="countdown-done">Liftoff!</p>`. `<button id="restart-countdown">` remounts the iframe (change its React `key`).
3. **Closed Shadow DOM** (groupId `closed-shadow`): custom element `closed-shadow-widget` defined in `ClosedShadowWidget.ts` (guard with `customElements.get` before `define`), using `attachShadow({ mode: 'closed' })`, containing a text input and a `Submit` button. Submit dispatches `new CustomEvent('widget-submit', { detail: { value }, bubbles: true, composed: true })` on the host. Place `<button id="before-shadow">Start here</button>` immediately before the widget so Tab moves into the input. Page listens on the host: value `shadow` → `result-closed-shadow` success, else failure.
4. **Shadow DOM inside an iframe** (groupId `shadow-frame`): `<iframe id="shadow-frame">` srcdoc whose script attaches an OPEN shadow root to `#shadow-host` containing `<button id="shadow-frame-button">` and `<p id="shadow-frame-status"></p>`; click sets status `Clicked inside shadow in frame` and posts `{ type: 'shadow-frame-click' }` to `window.top` → `result-shadow-frame` success.

- [ ] **Step 1: Write the failing test** — `e2e/deep-dom.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
});

test('button three iframes deep', async ({ page }) => {
  await page.frameLocator('#frame-level-1').frameLocator('#frame-level-2').frameLocator('#frame-level-3').locator('#deep-button').click();
  await expect(page.getByTestId('result-nested-frames')).toHaveAttribute('data-state', 'success');
});

test('wait for the iframe countdown to finish', async ({ page }) => {
  await expect(page.frameLocator('#countdown-frame').locator('#countdown-done')).toHaveText('Liftoff!', { timeout: 10_000 });
});

test('closed shadow root is driven with the keyboard', async ({ page }) => {
  expect(await page.locator('closed-shadow-widget input').count()).toBe(0);
  await page.locator('#before-shadow').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.type('shadow');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-closed-shadow')).toHaveAttribute('data-state', 'success');
});

test('open shadow DOM inside an iframe', async ({ page }) => {
  const frame = page.frameLocator('#shadow-frame');
  await frame.locator('#shadow-frame-button').click();
  await expect(frame.locator('#shadow-frame-status')).toHaveText('Clicked inside shadow in frame');
  await expect(page.getByTestId('result-shadow-frame')).toHaveAttribute('data-state', 'success');
});
```

- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `--repeat-each 5` → 20 passed; full suite + build.
- [ ] **Step 5:** Commit `feat: Deep DOM challenge page`.

---

### Task 4: Flaky Page

**Files:** Create `src/pages/practice/FlakyPage.tsx`, `e2e/flaky.spec.ts`; registry (`id: 'flaky'`, label `Flaky Page`, desc `Random failures, random delays and re-rendered elements`, `Advanced`, icon `Shuffle`), routes.

Sections:
1. **Unreliable Request** (groupId `unreliable`): `<button id="load-data">Load data</button>`. Each click: hide previous outcome, show `#flaky-loading`, after 300 ms with probability 0.5 show `<p id="flaky-error">Server error 503 — try again</p>`, otherwise `<ul id="flaky-data">` with three `<li>` items and `result-unreliable` success. Failure attempts set `result-unreliable` failure "503 — retry".
2. **Random Delay** (groupId `random-delay`): `<button id="slow-button">Run job</button>` → after random 500–5000 ms shows `<p id="slow-result">Done after {ms} ms</p>`.
3. **Re-rendered List** (groupId `rerender`): `<div id="rerender-list">` with buttons `Alpha`, `Target`, `Omega` whose React keys change (forcing new DOM nodes) once 800 ms after mount and on every `<button id="refresh-list">` click. Clicking `Target` → `result-rerender` success.
4. **Async Counter** (groupId `counter`): `<button id="start-counter">` increments `<span id="async-counter">` from 0 to 3, each step after random 200–900 ms. No ChallengeResult; the lesson is asserting with a wait.

- [ ] **Step 1: Write the failing test** — `e2e/flaky.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/flaky');
});

test('retry the unreliable request until it succeeds', async ({ page }) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await page.locator('#load-data').click();
    await expect(page.locator('#flaky-data, #flaky-error')).toBeVisible();
    if (await page.locator('#flaky-data').isVisible()) break;
  }
  await expect(page.locator('#flaky-data li')).toHaveCount(3);
  await expect(page.getByTestId('result-unreliable')).toHaveAttribute('data-state', 'success');
});

test('wait for a job with a random duration', async ({ page }) => {
  await page.locator('#slow-button').click();
  await expect(page.locator('#slow-result')).toContainText('Done after', { timeout: 7000 });
});

test('click an element that is re-rendered', async ({ page }) => {
  await page.locator('#refresh-list').click();
  await page.locator('#rerender-list').getByRole('button', { name: 'Target' }).click();
  await expect(page.getByTestId('result-rerender')).toHaveAttribute('data-state', 'success');
});

test('assert a counter with a retrying assertion', async ({ page }) => {
  await page.locator('#start-counter').click();
  await expect(page.locator('#async-counter')).toHaveText('3', { timeout: 5000 });
});
```

- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement. The `toBeVisible` on the union locator must never see both or neither once loading ends — clear the previous outcome synchronously on click.
- [ ] **Step 4:** `--repeat-each 5` → 20 passed; full suite + build.
- [ ] **Step 5:** Commit `feat: Flaky Page challenge`.

---

### Task 5: Widgets page (OTP, tags input, star rating)

**Files:** Create `src/pages/practice/Widgets.tsx`, `e2e/widgets.spec.ts`; registry (`id: 'widgets'`, label `Real-World Widgets`, desc `OTP boxes, tag inputs and star ratings`, `Intermediate`, icon `Puzzle`), routes.

Sections:
1. **OTP Verification** (groupId `otp`): show `Your code is <strong id="otp-code">482915</strong>`. Six inputs `#otp-0`…`#otp-5`, `inputMode="numeric"`, `maxLength={1}`, `aria-label="Digit N"`. Non-digits are rejected (value stays empty). Typing a digit moves focus to the next box. Backspace in an empty box moves focus to the previous one and clears it. Pasting into any box distributes up to 6 digits from the clipboard text (non-digits stripped) starting at box 0. `<button id="verify-otp">Verify</button>` → `result-otp` success "Code verified" when the 6 digits equal `482915`, failure "Wrong code" otherwise.
2. **Tags Input** (groupId `tags`): `<input id="tag-input" placeholder="Add a tag and press Enter">`. Enter adds the trimmed value as a chip `<span data-testid="tag">{tag}<button aria-label="Remove {tag}">×</button></span>`; empty values and case-insensitive duplicates are ignored; input clears after add. `<p id="tag-count">` shows `{n} tags` (`1 tag` singular).
3. **Star Rating** (groupId `rating`): `<div id="star-rating" role="radiogroup" aria-label="Rating">` with five `<button role="radio" aria-checked aria-label="{n} stars">` (`1 star` singular). Click sets the rating; stars ≤ rating are filled. `<p id="rating-value">` shows `{n}/5` (`0/5` initially).

- [ ] **Step 1: Write the failing test** — `e2e/widgets.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/widgets');
});

test('typing the OTP auto-advances through the boxes', async ({ page }) => {
  await page.locator('#otp-0').click();
  await page.keyboard.type('482915');
  await expect(page.locator('#otp-5')).toHaveValue('5');
  await page.locator('#verify-otp').click();
  await expect(page.getByTestId('result-otp')).toHaveAttribute('data-state', 'success');
});

test('pasting the OTP fills every box', async ({ page }) => {
  await page.locator('#otp-0').evaluate((el) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', '48-29 15');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  for (const [i, d] of [...'482915'].entries()) await expect(page.locator(`#otp-${i}`)).toHaveValue(d);
});

test('OTP rejects letters and a wrong code fails', async ({ page }) => {
  await page.locator('#otp-0').click();
  await page.keyboard.type('a');
  await expect(page.locator('#otp-0')).toHaveValue('');
  await page.keyboard.type('111111');
  await page.locator('#verify-otp').click();
  await expect(page.getByTestId('result-otp')).toHaveAttribute('data-state', 'failure');
});

test('tags are added, de-duplicated and removed', async ({ page }) => {
  const input = page.locator('#tag-input');
  for (const t of ['selenium', 'playwright', 'Selenium', '  ']) { await input.fill(t); await input.press('Enter'); }
  await expect(page.getByTestId('tag')).toHaveCount(2);
  await expect(page.locator('#tag-count')).toHaveText('2 tags');
  await page.getByRole('button', { name: 'Remove playwright' }).click();
  await expect(page.locator('#tag-count')).toHaveText('1 tag');
});

test('star rating', async ({ page }) => {
  await expect(page.locator('#rating-value')).toHaveText('0/5');
  await page.getByRole('radio', { name: '4 stars' }).click();
  await expect(page.locator('#rating-value')).toHaveText('4/5');
  await expect(page.getByRole('radio', { name: '4 stars' })).toHaveAttribute('aria-checked', 'true');
});
```

- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Focused tests pass; full suite + build.
- [ ] **Step 5:** Commit `feat: Real-World Widgets challenge page`.

---

### Task 6: Tools section + Test Data Generator

**Files:**
- Modify: `package.json` (move `@faker-js/faker` to `dependencies`), `src/data/challenges.tsx`, `src/pages/practice/PracticeDashboard.tsx`, `src/layouts/PracticeLayout.tsx`, `e2e/smoke.spec.ts`, `e2e/layout.spec.ts`, routes
- Create: `src/tools/dataGenerator.ts`, `src/tools/dataGenerator.test.ts`, `src/pages/practice/DataGenerator.tsx`, `e2e/data-generator.spec.ts`

**Interfaces:**
- Produces (registry):
```ts
export interface Challenge { id: string; label: string; desc: string; difficulty: Difficulty; icon: LucideIcon; kind?: 'tool' }
export const practiceChallenges: Challenge[]; // challenges.filter(c => c.kind !== 'tool')
export const tools: Challenge[];              // challenges.filter(c => c.kind === 'tool')
```
- Produces (`dataGenerator.ts`):
```ts
export type FieldType = 'fullName' | 'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'phone' | 'streetAddress' | 'city' | 'country' | 'zipCode' | 'company' | 'jobTitle' | 'uuid' | 'date' | 'integer' | 'price' | 'boolean' | 'creditCard' | 'url';
export const FIELD_TYPES: { value: FieldType; label: string }[];
export interface FieldSpec { name: string; type: FieldType }
export type Row = Record<string, string | number | boolean>;
export const MAX_ROWS = 100_000;
export function generateRows(fields: FieldSpec[], count: number, seed?: number): Row[]; // count clamped to 1..MAX_ROWS; same seed → identical rows
export function toCSV(rows: Row[]): string;   // header line; RFC 4180 quoting for , " \r \n; lines joined with \n
export function toJSON(rows: Row[]): string;  // JSON.stringify(rows, null, 2)
export function toSQL(rows: Row[], table: string): string; // one INSERT per row; identifiers in double quotes; strings single-quoted with ' doubled; numbers/booleans bare (TRUE/FALSE)
```

Registry/UI changes: give the data generator entry `kind: 'tool'` (`id: 'data-generator'`, label `Test Data Generator`, desc `Unlimited fake users, orders and cards as CSV, JSON or SQL`, difficulty `Beginner`, icon `Database`). Dashboard: the challenges grid and overall-progress ring use `practiceChallenges`; add a second section `<div data-testid="tools-section">` headed `Free QA Tools` with cards `data-testid="tool-card-<id>"` (same card style, no difficulty badge, no completion tick, CTA `Open tool`). Sidebar: render `practiceChallenges` then a small `TOOLS` label (`text-xs uppercase text-slate-500 px-3 mt-4 mb-1`) then `tools`, both lists still with `data-testid="nav-<id>"`. `FloatingProgress` dashboard ratio uses `practiceChallenges`. Hide the bottom action bar (Reset/Save/Next) on tool pages.

Update `e2e/smoke.spec.ts` dashboard test to expect `challenge-card-<id>` for challenges and `tool-card-<id>` for tools. Extend `e2e/layout.spec.ts` phone test into a loop over every registry entry (each page at 375px has `scrollWidth - clientWidth <= 0`), keeping the dashboard check.

Page (`DataGenerator.tsx`, no TaskQuestions): sections `1. Fields`, `2. Generate`, `3. Preview`.
- Fields: rows of `<input data-testid="field-name">` + `<select data-testid="field-type">` (options from `FIELD_TYPES`) + remove button `aria-label="Remove field"`; `<button id="add-field">Add field</button>`. Default fields: `id`/uuid, `name`/fullName, `email`/email, `city`/city.
- Generate: `<input id="row-count" type="number" min=1 max=100000 value=100>`, `<input id="seed" placeholder="Seed (optional)">`, `<select id="format">` CSV/JSON/SQL, `<input id="table-name" value="users">` shown only for SQL, `<button id="generate">Generate</button>`. Blank or duplicate field names → `<p id="generator-error">` message, no generation.
- Preview: `<p id="rows-generated">{n} rows generated</p>`, `<table id="preview-table">` with the first 10 rows, `<button id="download-data">` downloads `test-data.csv|json|sql` via Blob, `<button id="copy-data">` copies the formatted text (show `Copied!` for 2 s).

- [ ] **Step 1: Write failing unit tests** — `src/tools/dataGenerator.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateRows, toCSV, toJSON, toSQL, MAX_ROWS } from './dataGenerator';

const fields = [{ name: 'name', type: 'fullName' as const }, { name: 'age', type: 'integer' as const }];

describe('dataGenerator', () => {
  it('generates the requested number of rows with the requested keys', () => {
    const rows = generateRows(fields, 25);
    expect(rows).toHaveLength(25);
    expect(Object.keys(rows[0])).toEqual(['name', 'age']);
  });
  it('is reproducible with a seed', () => {
    expect(generateRows(fields, 5, 42)).toEqual(generateRows(fields, 5, 42));
  });
  it('clamps the row count', () => {
    expect(generateRows(fields, 0)).toHaveLength(1);
    expect(MAX_ROWS).toBe(100_000);
  });
  it('quotes CSV values that contain commas, quotes or newlines', () => {
    const csv = toCSV([{ a: 'x,y', b: 'say "hi"', c: 'line1\nline2', d: 3 }]);
    expect(csv).toBe('a,b,c,d\n"x,y","say ""hi""","line1\nline2",3');
  });
  it('round-trips JSON', () => {
    const rows = [{ a: 1, b: 'two', c: true }];
    expect(JSON.parse(toJSON(rows))).toEqual(rows);
  });
  it('escapes SQL strings', () => {
    expect(toSQL([{ name: "O'Brien", age: 30, active: true }], 'users'))
      .toBe(`INSERT INTO "users" ("name", "age", "active") VALUES ('O''Brien', 30, TRUE);`);
  });
});
```

- [ ] **Step 2: Write failing e2e** — `e2e/data-generator.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/data-generator');
});

test('generates rows and previews ten of them', async ({ page }) => {
  await page.locator('#row-count').fill('25');
  await page.locator('#generate').click();
  await expect(page.locator('#rows-generated')).toHaveText('25 rows generated');
  await expect(page.locator('#preview-table tbody tr')).toHaveCount(10);
});

test('downloads SQL', async ({ page }) => {
  await page.locator('#format').selectOption('sql');
  await page.locator('#generate').click();
  const download = page.waitForEvent('download');
  await page.locator('#download-data').click();
  expect((await download).suggestedFilename()).toBe('test-data.sql');
});

test('rejects duplicate field names', async ({ page }) => {
  await page.getByTestId('field-name').nth(1).fill('id');
  await page.locator('#generate').click();
  await expect(page.locator('#generator-error')).toBeVisible();
});
```

- [ ] **Step 3:** Run `npx vitest run src/tools && npx playwright test e2e/data-generator.spec.ts` — Expected: FAIL.
- [ ] **Step 4:** Implement (faker: `import { faker } from '@faker-js/faker'`; `faker.seed(seed)` when a seed is given; for unseeded runs call `faker.seed()` with a random number so a previous seed does not leak).
- [ ] **Step 5:** Full suite + build pass. Commit `feat: tools section and free test data generator`.

---

### Task 7: Selector Lab

**Files:** Create `src/tools/selectorEngine.ts`, `src/components/practice/SelectorLab.tsx`, `e2e/selector-lab.spec.ts`; modify `src/layouts/PracticeLayout.tsx` (render `<SelectorLab/>` once), `src/index.css` (or the global stylesheet the app imports) for the highlight rule.

**Interfaces:**
```ts
export type SelectorKind = 'css' | 'xpath';
export interface SelectorOptions { pierceShadow: boolean; includeFrames: boolean }
export interface SelectorResult { kind: SelectorKind; elements: Element[]; error?: string }
export function detectKind(query: string): SelectorKind; // trimmed query starting with '/', './' or '(' → 'xpath'
export function findMatches(root: Element, query: string, opts: SelectorOptions): SelectorResult;
// CSS: root.querySelectorAll, plus (pierceShadow) every open shadowRoot under root recursively,
//      plus (includeFrames) every same-origin iframe's document body under root, recursively with the same options.
// XPath: document.evaluate with ORDERED_NODE_SNAPSHOT_TYPE scoped to root; (includeFrames) also each same-origin frame document. XPath does not pierce shadow roots.
// Invalid syntax → { elements: [], error: <message> } — never throws. Cross-origin frames are skipped silently.
```

UI: floating button `<button id="selector-lab-toggle" aria-label="Open Selector Lab">` fixed bottom-right (above the action bar, `bottom-24 right-6`, z-50). Panel `<div data-testid="selector-lab">` (fixed, right side, w-96 max-w-[calc(100vw-2rem)]): `<input id="selector-input" placeholder="CSS or XPath">`, checkboxes `#pierce-shadow` (default on) and `#include-frames` (default on), badge `#selector-kind` (`CSS`/`XPath`), `<p id="selector-count">` (`{n} matches`, `1 match`), `<p id="selector-error">` when invalid, list of the first 20 matches (`tag#id.class` + 40 chars of text), clicking one scrolls it into view. Search root is the layout's `<main>` element, excluding the panel itself. Matches get attribute `data-selector-lab-match`; the global rule `[data-selector-lab-match]{outline:2px solid #f59e0b !important;outline-offset:2px}` — and for frame documents inject the same rule as a `<style data-selector-lab-style>` once per document. Re-run on input change (debounce 150 ms) and on route change; clear every attribute (main document, shadow roots, frames) when the query changes and when the panel closes.

- [ ] **Step 1: Write the failing test** — `e2e/selector-lab.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('CSS selector highlights matches', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#start-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await expect(page.locator('#start-button')).toHaveAttribute('data-selector-lab-match', '');
  await expect(page.locator('#selector-kind')).toHaveText('CSS');
});

test('XPath is detected and counted', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('//h1');
  await expect(page.locator('#selector-kind')).toHaveText('XPath');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
});

test('invalid selector shows an error', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('##nope');
  await expect(page.locator('#selector-error')).toBeVisible();
});

test('pierces open shadow DOM inside iframes only when enabled', async ({ page }) => {
  await page.goto('/#/practice/deep-dom');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('#shadow-frame-button');
  await expect(page.locator('#selector-count')).toHaveText('1 match');
  await page.locator('#include-frames').uncheck();
  await expect(page.locator('#selector-count')).toHaveText('0 matches');
});

test('closing the lab removes highlights', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#selector-lab-toggle').click();
  await page.locator('#selector-input').fill('button');
  await expect(page.locator('[data-selector-lab-match]').first()).toBeAttached();
  await page.locator('#selector-lab-toggle').click();
  await expect(page.locator('[data-selector-lab-match]')).toHaveCount(0);
});
```

- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Focused + full suite + build pass.
- [ ] **Step 5:** Commit `feat: Selector Lab overlay (free SelectorsHub-style tester)`.

---

### Task 8: Solutions tab (Playwright / Selenium Java / Selenium Python / Cypress)

**Files:** Create `src/components/practice/SolutionTabs.tsx`, `src/data/solutions/index.ts` (+ one file per challenge if large: `src/data/solutions/<id>.ts`), `e2e/solutions.spec.ts`; modify `ClickTraps.tsx`, `LocatorTraps.tsx`, `DeepDom.tsx`, `FlakyPage.tsx`, `Widgets.tsx`, `ProgressBarChallenge.tsx` (append `<SolutionTabs challengeId="<id>"/>` as the last section, heading numbered as the next section `N. Solutions`).

**Interfaces:**
```ts
export interface Solution { playwright: string; seleniumJava: string; seleniumPython: string; cypress: string }
export const solutions: Record<string, Solution>;
// playwright = raw text of e2e/<id>.spec.ts imported with Vite '?raw' (progress-bar uses e2e/progress-bar.spec.ts)
```

Component: section with `<button id="reveal-solution">Show solutions</button>` (spoiler gate; solutions hidden until clicked), then `role="tablist"` with tabs (`role="tab"`, `aria-selected`) named exactly `Playwright`, `Selenium Java`, `Selenium Python`, `Cypress`; `role="tabpanel"` containing `<pre><code>` with the code; `<button id="copy-solution">Copy</button>` (shows `Copied!`). Selenium Java snippets: JUnit 5 + `WebDriverWait`/`ExpectedConditions`, `driver.get("https://qa.randomly.online/#/practice/<id>")`. Python: pytest + selenium 4 (`find_element(By...)`, `WebDriverWait`). Cypress: `cy.visit('/#/practice/<id>')` with the same IDs. Every snippet must solve the same tasks as the Playwright spec using the exact IDs on the page — including the closed-shadow (keyboard Tab) and nested-frame (switch_to.frame chain / `cy.get('iframe').its('0.contentDocument.body')`) techniques. Add `declare module '*?raw'` only if `vite/client` types are not already referenced.

- [ ] **Step 1: Write the failing test** — `e2e/solutions.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

for (const id of ['click-traps', 'locator-traps', 'deep-dom', 'flaky', 'widgets', 'progress-bar']) {
  test(`${id} shows four solutions after reveal`, async ({ page }) => {
    await page.goto(`/#/practice/${id}`);
    await expect(page.getByRole('tab', { name: 'Playwright' })).toHaveCount(0);
    await page.locator('#reveal-solution').click();
    await expect(page.getByRole('tabpanel')).toContainText('@playwright/test');
    await page.getByRole('tab', { name: 'Selenium Java' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('driver.findElement');
    await page.getByRole('tab', { name: 'Selenium Python' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('find_element');
    await page.getByRole('tab', { name: 'Cypress' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('cy.visit');
  });
}
```

- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Full suite (layout numbering test covers the new numbered heading) + build pass.
- [ ] **Step 5:** Commit `feat: free multi-framework solutions for each challenge`.

---

### Task 9: API Playground (in-browser mock REST API)

**Files:** Create `src/tools/mockApi.ts`, `src/tools/mockApi.test.ts`, `src/pages/practice/ApiPlayground.tsx`, `e2e/api-playground.spec.ts`; registry (`kind: 'tool'`, `id: 'api-playground'`, label `API Playground`, desc `Mock REST API with auth, status codes, delays and rate limits`, `Intermediate`, icon `Server`), routes.

**Interfaces:**
```ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface ApiRequest { method: HttpMethod; path: string; headers?: Record<string, string>; body?: string }
export interface ApiResponse { status: number; headers: Record<string, string>; body: unknown; durationMs: number }
export interface MockApi { handle(req: ApiRequest): Promise<ApiResponse>; reset(): void }
export function createMockApi(opts?: { now?: () => number; sleep?: (ms: number) => Promise<void> }): MockApi;
export const ENDPOINTS: { method: HttpMethod; path: string; auth: boolean; description: string }[];
```

Behaviour (headers always include `content-type: application/json`; header names matched case-insensitively):
- `POST /api/auth/login` body `{"username":"qa","password":"qa123"}` → 200 `{ token }` (token `qa-` + random); else 401 `{ error: 'Invalid credentials' }`.
- `GET /api/users?page=1&limit=5` → 200 `{ data, page, limit, total }` (10 seeded users `{ id, name, email, role }`, ids 1–10). `GET /api/users/:id` → 200 or 404.
- `POST /api/users` (auth) → 201 with new user (id = max+1); missing/blank `name` or `email`, or email without `@` → 422 `{ errors: { field: message } }`.
- `PUT /api/users/:id` (auth, full replace, same validation) → 200/404/422; `PATCH` (auth, partial) → 200/404; `DELETE` (auth) → 204 (body `null`) / 404.
- Auth = header `Authorization: Bearer <token issued by login>`; missing/unknown → 401 `{ error: 'Unauthorized' }`.
- Body that is not valid JSON on POST/PUT/PATCH → 400 `{ error: 'Invalid JSON' }`.
- `GET /api/status/:code` → that status (100–599) with `{ status: code }`; otherwise 400.
- `GET /api/delay/:ms` → waits `min(ms, 10000)` via `sleep`, 200 `{ delayedMs }`.
- `GET /api/rate-limited` → 200 for the first 5 calls in any 10 s window (`now`), then 429 with header `retry-after` = seconds until the window frees.
- Anything else → 404 `{ error: 'Not found' }`. `reset()` restores seed data, tokens and rate-limit state.

Page (tool, sections `1. Endpoints`, `2. Request`, `3. Response`): endpoint table (clicking a row fills the builder); `<select id="api-method">`, `<input id="api-path">`, `<textarea id="api-headers">` (JSON object, invalid → `#api-error`), `<textarea id="api-body">`, `<button id="api-send">Send</button>`, `<button id="api-reset">Reset data</button>`; response `<span id="api-status">`, `<span id="api-time">{ms} ms</span>`, `<pre id="api-response">` pretty JSON. After a successful login response, show `<code id="api-token">` with a `Use token` button `#use-token` that writes `{"Authorization":"Bearer <token>"}` into `#api-headers`. One API instance per page mount. Note on the page: "Runs in your browser — use it from Playwright with page.evaluate or by driving this UI; external clients like Postman cannot reach it."

- [ ] **Step 1: Failing unit tests** — `src/tools/mockApi.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createMockApi } from './mockApi';

const fast = () => createMockApi({ sleep: async () => {} });

describe('mockApi', () => {
  it('logs in and creates a user with the token', async () => {
    const api = fast();
    const login = await api.handle({ method: 'POST', path: '/api/auth/login', body: '{"username":"qa","password":"qa123"}' });
    expect(login.status).toBe(200);
    const token = (login.body as { token: string }).token;
    const created = await api.handle({ method: 'POST', path: '/api/users', headers: { authorization: `Bearer ${token}` }, body: '{"name":"Ada","email":"ada@x.io"}' });
    expect(created.status).toBe(201);
    expect((created.body as { id: number }).id).toBe(11);
  });
  it('rejects writes without a token', async () => {
    expect((await fast().handle({ method: 'DELETE', path: '/api/users/1' })).status).toBe(401);
  });
  it('validates input with 422', async () => {
    const api = fast();
    const { body } = await api.handle({ method: 'POST', path: '/api/auth/login', body: '{"username":"qa","password":"qa123"}' });
    const r = await api.handle({ method: 'POST', path: '/api/users', headers: { Authorization: `Bearer ${(body as { token: string }).token}` }, body: '{"name":"","email":"nope"}' });
    expect(r.status).toBe(422);
    expect(Object.keys((r.body as { errors: object }).errors).sort()).toEqual(['email', 'name']);
  });
  it('returns 400 for invalid JSON', async () => {
    expect((await fast().handle({ method: 'POST', path: '/api/auth/login', body: '{oops' })).status).toBe(400);
  });
  it('paginates users', async () => {
    const r = await fast().handle({ method: 'GET', path: '/api/users?page=2&limit=4' });
    expect(r.body).toMatchObject({ page: 2, limit: 4, total: 10 });
    expect((r.body as { data: unknown[] }).data).toHaveLength(4);
  });
  it('echoes status codes and 404s unknown routes', async () => {
    expect((await fast().handle({ method: 'GET', path: '/api/status/503' })).status).toBe(503);
    expect((await fast().handle({ method: 'GET', path: '/api/status/999' })).status).toBe(400);
    expect((await fast().handle({ method: 'GET', path: '/api/nope' })).status).toBe(404);
  });
  it('rate limits after five calls in ten seconds', async () => {
    let t = 0;
    const api = createMockApi({ now: () => t, sleep: async () => {} });
    for (let i = 0; i < 5; i++) expect((await api.handle({ method: 'GET', path: '/api/rate-limited' })).status).toBe(200);
    const limited = await api.handle({ method: 'GET', path: '/api/rate-limited' });
    expect(limited.status).toBe(429);
    expect(limited.headers['retry-after']).toBe('10');
    t = 10_001;
    expect((await api.handle({ method: 'GET', path: '/api/rate-limited' })).status).toBe(200);
  });
  it('caps delays at ten seconds', async () => {
    const waited: number[] = [];
    const api = createMockApi({ sleep: async (ms) => { waited.push(ms); } });
    await api.handle({ method: 'GET', path: '/api/delay/60000' });
    expect(waited).toEqual([10_000]);
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/api-playground.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('login, use the token, create a user', async ({ page }) => {
  await page.goto('/#/practice/api-playground');
  await page.locator('#api-method').selectOption('POST');
  await page.locator('#api-path').fill('/api/auth/login');
  await page.locator('#api-body').fill('{"username":"qa","password":"qa123"}');
  await page.locator('#api-send').click();
  await expect(page.locator('#api-status')).toHaveText('200');
  await page.locator('#use-token').click();
  await page.locator('#api-path').fill('/api/users');
  await page.locator('#api-body').fill('{"name":"Ada","email":"ada@x.io"}');
  await page.locator('#api-send').click();
  await expect(page.locator('#api-status')).toHaveText('201');
  await expect(page.locator('#api-response')).toContainText('"Ada"');
});

test('write without a token is 401', async ({ page }) => {
  await page.goto('/#/practice/api-playground');
  await page.locator('#api-method').selectOption('DELETE');
  await page.locator('#api-path').fill('/api/users/1');
  await page.locator('#api-send').click();
  await expect(page.locator('#api-status')).toHaveText('401');
});
```

- [ ] **Step 3:** Run — FAIL. **Step 4:** Implement. **Step 5:** Full suite + build. Commit `feat: in-browser API Playground with auth, errors and rate limits`.

---

### Task 10: Interview Kit

**Files:** Create `src/data/interviewQuestions.ts`, `src/data/interviewQuestions.test.ts`, `src/store/useInterviewStore.ts`, `src/pages/practice/InterviewKit.tsx`, `e2e/interview.spec.ts`; registry (`kind: 'tool'`, `id: 'interview'`, label `Interview Kit`, desc `60+ QA and SDET interview questions with answers and flashcards`, `Beginner`, icon `GraduationCap`), routes.

**Interfaces:**
```ts
export type Topic = 'Selenium' | 'Playwright' | 'Cypress' | 'API Testing' | 'Manual & Process' | 'Framework Design';
export const TOPICS: Topic[];
export const topicSlug: (t: Topic) => string; // lower-case, non-alphanumerics → '-', e.g. 'manual-process', 'api-testing'
export interface Question { id: string; topic: Topic; level: 'Junior' | 'Mid' | 'Senior'; q: string; a: string }
export const questions: Question[];
// useInterviewStore (persist name 'qa-interview-kit'): { known: string[]; toggleKnown(id: string): void; setKnown(id: string, known: boolean): void; reset(): void }
```

Content: at least 60 questions, at least 8 per topic, technically accurate, answers 2–6 sentences (short code allowed, as plain text). Cover waits (implicit/explicit/fluent, auto-wait), locator strategy, POM, frames/windows/shadow, Playwright fixtures/contexts/tracing/route, Cypress architecture/retry-ability/intercept/limitations, REST status codes/idempotency/auth/contract testing, test pyramid/flakiness/CI/parallelism/reporting, STLC/severity vs priority/boundary values/equivalence partitioning.

Page sections `1. Practice` (mode switch) and `2. Questions`: topic chips `<button data-testid="topic-all">All</button>` + `data-testid="topic-<slug>"` (aria-pressed); `<p id="known-count">{k} / {n} known</p>` (n = questions in current filter); `<button id="flashcard-mode">` toggles between list and flashcards. List mode: each question `<div data-testid="question" data-topic="<Topic>">` with the question, a `Show answer` toggle and a `Mark as known` checkbox. Flashcard mode: `<div id="flashcard">` shows one question, `<button id="show-answer">`, `<div id="flashcard-answer">` after reveal, `<button id="mark-known">I knew it</button>` (marks known, next card), `<button id="mark-review">Review again</button>` (marks not known, next card); unknown cards first.

- [ ] **Step 1: Failing data test** — `src/data/interviewQuestions.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { questions, TOPICS } from './interviewQuestions';

describe('interview questions', () => {
  it('has at least 60 questions with unique ids', () => {
    expect(questions.length).toBeGreaterThanOrEqual(60);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });
  it('has at least 8 questions per topic', () => {
    for (const t of TOPICS) expect(questions.filter((q) => q.topic === t).length).toBeGreaterThanOrEqual(8);
  });
  it('has no empty question or answer', () => {
    for (const q of questions) { expect(q.q.trim()).not.toBe(''); expect(q.a.trim().length).toBeGreaterThan(40); }
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/interview.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('filtering by topic shows only that topic', async ({ page }) => {
  await page.goto('/#/practice/interview');
  await page.getByTestId('topic-playwright').click();
  const topics = await page.getByTestId('question').evaluateAll((els) => els.map((e) => e.getAttribute('data-topic')));
  expect(topics.length).toBeGreaterThanOrEqual(8);
  expect(new Set(topics)).toEqual(new Set(['Playwright']));
});

test('flashcard progress persists across reloads', async ({ page }) => {
  await page.goto('/#/practice/interview');
  await page.locator('#flashcard-mode').click();
  await page.locator('#show-answer').click();
  await expect(page.locator('#flashcard-answer')).toBeVisible();
  await page.locator('#mark-known').click();
  await expect(page.locator('#known-count')).toContainText('1 /');
  await page.reload();
  await expect(page.locator('#known-count')).toContainText('1 /');
});
```

- [ ] **Step 3:** Run — FAIL. **Step 4:** Implement. **Step 5:** Full suite + build. Commit `feat: free QA interview kit with flashcards`.

---

### Task 11: Completion Certificate

**Files:** Create `src/tools/certificate.ts`, `src/tools/certificate.test.ts`, `src/pages/practice/Certificate.tsx`, `e2e/certificate.spec.ts`; registry (`kind: 'tool'`, `id: 'certificate'`, label `Certificate`, desc `Finish every challenge and download your certificate`, `Beginner`, icon `Award`), routes.

**Interfaces:**
```ts
export async function certificateId(name: string, dateISO: string, challengeIds: string[]): Promise<string>;
// first 12 hex chars of SHA-256 (crypto.subtle) over `${name.trim()}|${dateISO}|${[...challengeIds].sort().join(',')}`, upper-case
export function linkedInUrl(opts: { certId: string; issued: Date }): string;
// https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=QA%20Automation%20Practitioner&organizationName=QA%20Playground&issueYear=YYYY&issueMonth=M&certId=<id>&certUrl=https%3A%2F%2Fqa.randomly.online%2F
export function drawCertificate(canvas: HTMLCanvasElement, data: { name: string; dateLabel: string; certId: string; challengeCount: number }): void; // 1600×1131, Canvas 2D only
```

Page sections `1. Your progress`, `2. Your certificate`: eligibility = every `practiceChallenges` entry `isPageComplete` (from `src/store/progressLogic.ts` with `useProgressStore()` state). Not eligible → `<div id="cert-locked">` with `<ul id="remaining-list">` linking to each unfinished challenge. Eligible → `<input id="cert-name" maxLength={60}>`, `<button id="generate-cert">` (disabled for a blank name), preview `<div id="certificate">` (HTML version showing the name, `QA Automation Practitioner`, date, `Certificate ID <id>`, challenge count), `<button id="download-cert">` (draws to an offscreen canvas, downloads `qa-certificate.png`), `<a id="share-linkedin" target="_blank" rel="noopener">`. State plainly on the page: the ID is a fingerprint of name, date and completed challenges; there is no central registry.

- [ ] **Step 1: Failing unit test** — `src/tools/certificate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { certificateId, linkedInUrl } from './certificate';

describe('certificate', () => {
  it('id is 12 upper-case hex chars and independent of challenge order', async () => {
    const a = await certificateId('Ada', '2026-10-03', ['b', 'a']);
    expect(a).toMatch(/^[0-9A-F]{12}$/);
    expect(await certificateId(' Ada ', '2026-10-03', ['a', 'b'])).toBe(a);
    expect(await certificateId('Bob', '2026-10-03', ['a', 'b'])).not.toBe(a);
  });
  it('builds the LinkedIn add-to-profile URL', () => {
    const url = new URL(linkedInUrl({ certId: 'ABC', issued: new Date('2026-10-03T00:00:00Z') }));
    expect(url.searchParams.get('certId')).toBe('ABC');
    expect(url.searchParams.get('issueYear')).toBe('2026');
    expect(url.searchParams.get('certUrl')).toBe('https://qa.randomly.online/');
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/certificate.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { practiceChallenges } from '../src/data/challenges';

test('locked until every challenge is complete', async ({ page }) => {
  await page.goto('/#/practice/certificate');
  await expect(page.locator('#cert-locked')).toBeVisible();
  await expect(page.locator('#remaining-list li')).toHaveCount(practiceChallenges.length);
});

test('generates and downloads once complete', async ({ page }) => {
  const ids = practiceChallenges.map((c) => c.id);
  await page.addInitScript((ids) => {
    const totals = Object.fromEntries(ids.map((id) => [id, { main: 1 }]));
    const completed = Object.fromEntries(ids.map((id) => [id, ['main:0']]));
    localStorage.setItem('qa-playground-progress-v3', JSON.stringify({ state: { totals, completed }, version: 0 }));
  }, ids);
  await page.goto('/#/practice/certificate');
  await page.locator('#cert-name').fill('Ada Lovelace');
  await page.locator('#generate-cert').click();
  await expect(page.locator('#certificate')).toContainText('Ada Lovelace');
  const download = page.waitForEvent('download');
  await page.locator('#download-cert').click();
  expect((await download).suggestedFilename()).toBe('qa-certificate.png');
});
```

- [ ] **Step 3:** Run — FAIL. **Step 4:** Implement. **Step 5:** Full suite + build. Commit `feat: free completion certificate with LinkedIn share`.

---

### Task 12: Bug Hunt mode

**Files:** Modify `src/store/useChallengeMode.ts` (add `bugHunt: boolean`, `foundBugs: string[]`, `reportFound(id)`, `resetBugHunt()`); create `src/data/bugCatalog.ts`, `src/utils/bugHunt.ts`, `src/utils/bugHunt.test.ts`, `src/pages/practice/BugHunt.tsx`, `e2e/bug-hunt.spec.ts`; modify the customer-store files that host each defect; registry (`id: 'bug-hunt'`, label `Bug Hunt`, desc `Find six real bugs planted in the QA Store`, `Advanced`, icon `Bug`; a challenge, not a tool), routes.

**Interfaces:**
```ts
export interface PlantedBug { id: string; area: 'Cart' | 'Products' | 'Search' | 'Checkout'; symptom: string }
export const PLANTED_BUGS: PlantedBug[];      // exactly 6
export const DECOY_SYMPTOMS: { area: PlantedBug['area']; symptom: string }[]; // at least 6 plausible non-bugs
export function isBugActive(id: string): boolean;          // useChallengeMode.getState().bugHunt
export function matchReport(area: string, symptom: string): PlantedBug | undefined;
```

Bugs (each gated by `isBugActive('<id>')`, inert when off). Before coding, confirm each host feature exists in the customer store; if one does not exist, substitute a defect of similar size in an existing feature and record the substitution in your report:
1. `cart-subtotal-qty` (Cart): subtotal counts the last cart line's price once, ignoring its quantity.
2. `cart-tax-rate` (Cart): tax line labelled 8% is computed at 18%.
3. `products-sort-asc` (Products): "Price: Low to High" sorts high to low.
4. `search-case` (Search): product search is case-sensitive.
5. `cart-remove-wrong` (Cart): removing an item removes the first line instead.
6. `checkout-email` (Checkout): checkout accepts an email without `@`.

Page (challenge, sections `1. Turn on Bug Hunt` (groupId `setup`), `2. Report a bug` (groupId `report`), `3. Scoreboard`): `<input type="checkbox" id="bug-hunt-toggle">` bound to `bugHunt`; link to the store (`/`); report form `<select id="bug-area">`, `<select id="bug-symptom">` (planted + decoy symptoms for the chosen area, shuffled once per mount), `<button id="report-bug">` → `result-report` success "Confirmed bug!" when `matchReport` finds a bug not yet found (adds to `foundBugs`), failure "Not a planted bug (or already reported)" otherwise; `<p id="bugs-found">{n} / 6 found</p>`; `<button id="reveal-bugs">` lists all six; `<button id="reset-bug-hunt">`.

- [ ] **Step 1: Failing unit test** — `src/utils/bugHunt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PLANTED_BUGS, DECOY_SYMPTOMS } from '../data/bugCatalog';
import { matchReport } from './bugHunt';

describe('bug hunt catalog', () => {
  it('has six bugs with unique ids and no decoy that matches a bug', () => {
    expect(PLANTED_BUGS).toHaveLength(6);
    expect(new Set(PLANTED_BUGS.map((b) => b.id)).size).toBe(6);
    for (const d of DECOY_SYMPTOMS) expect(matchReport(d.area, d.symptom)).toBeUndefined();
  });
  it('matches a planted bug by area and symptom', () => {
    const b = PLANTED_BUGS[0];
    expect(matchReport(b.area, b.symptom)?.id).toBe(b.id);
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/bug-hunt.spec.ts` (adapt the cart steps to the store's real selectors, which you must read from `src/pages/customer/*` — keep the assertions):

```ts
import { test, expect, type Page } from '@playwright/test';

async function cartSubtotalWithQty2(page: Page): Promise<{ subtotal: number; unit: number }> {
  // Add one product to the cart with quantity 2 using the store UI, open the cart,
  // and return the displayed subtotal and unit price as numbers.
  throw new Error('implement with the store selectors');
}

test('bug hunt off: cart subtotal is price × quantity', async ({ page }) => {
  const { subtotal, unit } = await cartSubtotalWithQty2(page);
  expect(subtotal).toBeCloseTo(unit * 2, 2);
});

test('bug hunt on: subtotal bug appears and can be reported', async ({ page }) => {
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-hunt-toggle').check();
  const { subtotal, unit } = await cartSubtotalWithQty2(page);
  expect(subtotal).toBeCloseTo(unit, 2);
  await page.goto('/#/practice/bug-hunt');
  await page.locator('#bug-area').selectOption('Cart');
  await page.locator('#bug-symptom').selectOption({ label: 'Subtotal ignores the quantity of the last item' });
  await page.locator('#report-bug').click();
  await expect(page.getByTestId('result-report')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('#bugs-found')).toHaveText('1 / 6 found');
});
```
The `cart-subtotal-qty` bug's `symptom` string must be exactly `Subtotal ignores the quantity of the last item`.

- [ ] **Step 3:** Run — FAIL. **Step 4:** Implement (fill in `cartSubtotalWithQty2`). **Step 5:** Full suite + build. Commit `feat: Bug Hunt mode with six planted store defects`.
