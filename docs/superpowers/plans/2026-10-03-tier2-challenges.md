# Tier 2/3 Challenges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship six new practice pages (Windows & Tabs, Sortable Lists, Virtual Table, Auth Flows, Canvas & Charts, Accessibility Lab), each live on GitHub Pages before the next starts.

**Architecture:** Each page is a lazy-loaded route under `PracticeLayout`, registered in `src/data/challenges.tsx`. Pure logic (row generation, auth tokens, message parsing, canvas geometry) lives in small `src/utils` / `src/data` modules with Vitest tests; each page's Playwright spec solves it and is shown as the Playwright solution; Selenium Java / Python / Cypress solutions live in `src/data/solutions/<id>.ts`.

**Tech Stack:** React 19 + Vite + Tailwind, react-router `HashRouter`, Vitest, Playwright, `@axe-core/playwright` (Task 6 only).

**Spec:** `docs/superpowers/specs/2026-10-03-tier2-challenges-design.md`

## Global Constraints

- Page shape copies `src/pages/practice/Widgets.tsx`: `SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border'`, `H2 = 'text-xl font-bold mb-6 border-b border-border pb-2'`, `h1` + intro + `HintAccordion`, one `TaskQuestions` per section with a distinct `groupId`, `<SolutionTabs challengeId number={sections+1} />` last.
- Every interactive element has a stable `id` and `data-testid` (same value unless noted).
- Every task's pass state is a `<ChallengeResult testId="result-…">`; once `success`, it stays `success` until that section's Reset.
- Solutions: register in `src/data/solutions/index.ts`; Selenium snippets use `${SITE_URL}` and wait for `main h1` after every `driver.get` (enforced by `src/data/solutions/solutions.test.ts`).
- No horizontal scroll at 375 px (`e2e/layout.spec.ts` checks every registry page automatically).
- Per task ship loop: focused spec `--repeat-each 5` green → `npx vitest run` + `npx playwright test` + `npm run build` green → commit → `git checkout main && git merge --ff-only feat/tier2-challenges && git push origin main && git checkout feat/tier2-challenges` → wait for the Pages deploy (`gh run watch`) → load the live page and check `main h1`.

## Review Focus

1. Opening a `#/popup/*` URL directly (no `window.opener`, e.g. Cypress or a bookmarked tab) must render `#no-opener`, not crash — Task 1 e2e.
2. A corrupt, foreign-shaped or expired `qa-auth-session` value must fall back to the login form — Task 4 unit + e2e.
3. Scrolling the virtual grid to the very bottom must render row 10000 with no blank band — Task 3 e2e.
4. Reset on each sortable section restores the start order and sets the result back to pending — Task 2 e2e.
5. `postMessage` from another origin, or with an unknown `type`, must be ignored — Task 1 unit test of `parseWindowMessage`.

---

### Task 1: Windows & Tabs (`windows`)

**Files:**
- Create: `src/utils/windowMessages.ts`, `src/utils/windowMessages.test.ts`, `src/pages/practice/WindowsTabs.tsx`, `src/pages/practice/PopupPage.tsx`, `e2e/windows.spec.ts`, `src/data/solutions/windows.ts`
- Modify: `src/data/challenges.tsx` (entry, icon `ExternalLink`), `src/routes.tsx` (practice child route `windows` + top-level `/popup/:kind`), `src/data/solutions/index.ts`

**Interfaces:**
- Produces: `type WindowMessage = { type: 'qa-approve'; code: string } | { type: 'qa-delayed' } | { type: 'qa-pick'; window: string }`; `parseWindowMessage(e: { origin: string; data: unknown }, expectedOrigin: string): WindowMessage | null`; `SECRET_KEY = 'qa-windows-secret'`.

- [ ] **Step 1: Failing unit test** — `src/utils/windowMessages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseWindowMessage } from './windowMessages';

const O = 'https://example.test';
describe('parseWindowMessage', () => {
  it('accepts known messages from our origin', () => {
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-approve', code: 'AB12' } }, O)).toEqual({ type: 'qa-approve', code: 'AB12' });
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-delayed' } }, O)).toEqual({ type: 'qa-delayed' });
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-pick', window: 'B' } }, O)).toEqual({ type: 'qa-pick', window: 'B' });
  });
  it('ignores other origins, unknown types and malformed data', () => {
    expect(parseWindowMessage({ origin: 'https://evil.test', data: { type: 'qa-delayed' } }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: { type: 'other' } }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: 'qa-delayed' }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: { type: 'qa-approve' } }, O)).toBeNull();
    expect(parseWindowMessage({ origin: O, data: null }, O)).toBeNull();
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/windows.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/windows');
  await expect(page.locator('main h1')).toBeVisible();
});

test('read a secret from a new tab', async ({ page, context }) => {
  const tabPromise = context.waitForEvent('page');
  await page.locator('#open-tab').click();
  const tab = await tabPromise;
  const secret = (await tab.locator('#tab-secret').innerText()).trim();
  await tab.close();
  await page.locator('#tab-secret-input').fill(secret);
  await page.locator('#check-secret').click();
  await expect(page.getByTestId('result-tab')).toHaveAttribute('data-state', 'success');
});

test('approve in a popup that closes itself', async ({ page }) => {
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#open-popup').click();
  const popup = await popupPromise;
  await popup.locator('#approve-btn').click();
  await expect.poll(() => popup.isClosed()).toBe(true);
  await expect(page.locator('#approval-code')).toHaveText(/^[A-Z0-9]{6}$/);
  await expect(page.getByTestId('result-popup')).toHaveAttribute('data-state', 'success');
});

test('wait for a slow popup', async ({ page }) => {
  const popupPromise = page.waitForEvent('popup');
  await page.locator('#open-delayed').click();
  const popup = await popupPromise;
  await popup.locator('#delayed-confirm').click({ timeout: 5000 });
  await expect(page.getByTestId('result-delayed')).toHaveAttribute('data-state', 'success');
});

test('find the window by its title', async ({ page, context }) => {
  for (const w of ['a', 'b', 'c']) await page.locator(`#open-${w}`).click();
  await expect.poll(() => context.pages().length).toBe(4);
  let target;
  for (const p of context.pages()) {
    if (p === page) continue;
    await expect(p).toHaveTitle(/^Window [ABC]$/);
    if ((await p.title()) === 'Window B') target = p;
  }
  await target!.locator('#pick-me').click();
  await expect(page.getByTestId('result-pick')).toHaveAttribute('data-state', 'success');
});

test('a wrong secret fails', async ({ page }) => {
  await page.locator('#tab-secret-input').fill('nope');
  await page.locator('#check-secret').click();
  await expect(page.getByTestId('result-tab')).toHaveAttribute('data-state', 'failure');
});

test('a popup opened directly says it has no opener', async ({ page }) => {
  await page.goto('/#/popup/approve');
  await expect(page.locator('#no-opener')).toBeVisible();
});
```

- [ ] **Step 3:** Run `npx vitest run src/utils/windowMessages.test.ts && npx playwright test e2e/windows.spec.ts` — Expected: FAIL (module/route missing).
- [ ] **Step 4: Implement.**
  - `windowMessages.ts`: validate `e.origin === expectedOrigin`, `data` is a non-null object, `type` is one of the three, `code`/`window` is a non-empty string where required; otherwise `null`.
  - `WindowsTabs.tsx`: on mount write a random word from a fixed list (`['falcon','harbor','ember','quartz','meadow','cobalt']`) to `localStorage[SECRET_KEY]`; `#open-tab` = `<a target="_blank" rel="noopener" href="#/popup/secret">`; `#open-popup` → `window.open('#/popup/approve', 'approve', 'width=480,height=600')`; `#open-delayed` → `window.open('#/popup/delayed', 'delayed', 'width=480,height=600')`; `#open-a/b/c` → `window.open('#/popup/pick?w=A|B|C', '_blank')`. One `message` listener using `parseWindowMessage(e, window.location.origin)` sets `#approval-code` + `result-popup`, `result-delayed`, and `result-pick` (success only when `window === 'B'`). Four sections + Solutions (number 5).
  - `PopupPage.tsx` (no layout): reads `kind` param. `secret` shows `#tab-secret` from localStorage. `approve`/`delayed`/`pick`: if `!window.opener` render `<p id="no-opener">Open this page from the Windows & Tabs challenge.</p>`. `approve`: random 6-char `[A-Z0-9]` code; `#approve-btn` posts `{type:'qa-approve',code}` to `window.opener` with `targetOrigin = location.origin`, then `window.close()`. `delayed`: `Loading…` then after `1000 + Math.random()*2000` ms render `#delayed-confirm` posting `qa-delayed`. `pick`: `document.title = 'Window ' + w`; `#pick-me` enabled only for `B`, posts `{type:'qa-pick', window: w}`.
- [ ] **Step 5:** Solutions `src/data/solutions/windows.ts` — Java: `getWindowHandle`, `getWindowHandles` loop + `switchTo().window`, title match, switch back after popup closes; Python: same with `driver.window_handles`; Cypress: remove `target` / stub `window.open` and `cy.visit` the child, with a comment that Cypress cannot drive a second tab and the parent result will not turn green. Register in `index.ts`.
- [ ] **Step 6:** `npx playwright test e2e/windows.spec.ts --repeat-each 5` → all pass; full `npx vitest run`, `npx playwright test`, `npm run build` pass.
- [ ] **Step 7:** Commit `feat: Windows & Tabs challenge page`, ship loop (Global Constraints).

### Task 2: Sortable Lists (`sortable`)

**Files:**
- Create: `src/utils/reorder.ts`, `src/utils/reorder.test.ts`, `src/pages/practice/SortableLists.tsx`, `e2e/sortable.spec.ts`, `src/data/solutions/sortable.ts`
- Modify: `src/data/challenges.tsx` (icon `GripVertical`), `src/routes.tsx`, `src/data/solutions/index.ts`

**Interfaces:**
- Produces: `moveItem<T>(list: T[], from: number, to: number): T[]` (returns a new array; item ends at index `to`); `HOLD_DELAY_MS = 250`; `HOLD_TOLERANCE_PX = 5`.

- [ ] **Step 1: Failing unit test** — `src/utils/reorder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { moveItem } from './reorder';

describe('moveItem', () => {
  it('moves up and down, landing at the target index', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });
  it('is a no-op for same or out-of-range indexes and never mutates', () => {
    const list = ['a', 'b'];
    expect(moveItem(list, 1, 1)).toEqual(['a', 'b']);
    expect(moveItem(list, 5, 0)).toEqual(['a', 'b']);
    expect(list).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/sortable.spec.ts`:

```ts
import { test, expect, type Page, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/sortable');
  await expect(page.locator('main h1')).toBeVisible();
});

async function holdDrag(page: Page, source: Locator, target: Locator) {
  const s = (await source.boundingBox())!;
  const t = (await target.boundingBox())!;
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 });
  await page.mouse.up();
}

const texts = (l: Locator) => l.allInnerTexts().then((a) => a.map((t) => t.trim()));

test('sort the HTML5 list with dragTo', async ({ page }) => {
  const items = page.getByTestId('html5-item');
  const goal = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];
  for (let i = 0; i < goal.length; i++) {
    if ((await texts(items))[i] === goal[i]) continue;
    await items.filter({ hasText: goal[i] }).dragTo(items.nth(i));
  }
  expect(await texts(items)).toEqual(goal);
  await expect(page.getByTestId('result-html5')).toHaveAttribute('data-state', 'success');
});

test('a quick dragTo does not start the press-and-hold drag', async ({ page }) => {
  const items = page.getByTestId('hold-item');
  const before = await texts(items);
  await items.nth(0).dragTo(items.nth(3));
  expect(await texts(items)).toEqual(before);
});

test('sort the press-and-hold list', async ({ page }) => {
  const items = page.getByTestId('hold-item');
  const goal = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < goal.length; i++) {
    if ((await texts(items))[i] === goal[i]) continue;
    await holdDrag(page, items.filter({ hasText: new RegExp(`^${goal[i]}$`) }), items.nth(i));
  }
  expect(await texts(items)).toEqual(goal);
  await expect(page.getByTestId('result-hold')).toHaveAttribute('data-state', 'success');
});

test('move kanban cards', async ({ page }) => {
  await page.getByTestId('card').filter({ hasText: 'Write tests' }).dragTo(page.locator('#col-done'));
  await page.getByTestId('card').filter({ hasText: 'Fix bug #42' }).dragTo(page.locator('#col-progress'));
  await expect(page.locator('#col-done')).toContainText('Write tests');
  await expect(page.getByTestId('result-kanban')).toHaveAttribute('data-state', 'success');
});

test('reset restores the start order', async ({ page }) => {
  const items = page.getByTestId('html5-item');
  const start = await texts(items);
  await items.nth(4).dragTo(items.nth(0));
  expect(await texts(items)).not.toEqual(start);
  await page.locator('#reset-html5').click();
  expect(await texts(items)).toEqual(start);
  await expect(page.getByTestId('result-html5')).toHaveAttribute('data-state', 'pending');
});
```

- [ ] **Step 3:** Run both — Expected: FAIL.
- [ ] **Step 4: Implement.** Start orders: HTML5 `['Step 3','Step 1','Step 5','Step 2','Step 4']`; hold `['C','A','E','B','D']`; kanban todo `['Write tests','Fix bug #42','Update docs']`, progress `['Review PR']`, done `['Set up CI']`. HTML5 list: `draggable`, `dragstart` stores the index in `dataTransfer`, `dragover` `preventDefault`, `drop` on an item → `moveItem(list, from, overIndex)`. Hold list: `pointerdown` → `setPointerCapture`, start a `HOLD_DELAY_MS` timer; a `pointermove` beyond `HOLD_TOLERANCE_PX` before the timer fires cancels; after it fires, moves set `overIndex` from the item rect containing `clientY` (highlight it); `pointerup` → `moveItem`; `touch-action: none` on items. Kanban: cards draggable, columns are drop zones (append to column). Results: html5 / hold success when sorted; kanban success when done ⊇ {Set up CI, Write tests}, progress = {Review PR, Fix bug #42}, todo = {Update docs}. `#reset-html5`, `#reset-hold`, `#reset-kanban`. Solutions number 4.
- [ ] **Step 5:** Solutions: Java/Python HTML5 via a JS `DataTransfer` dispatch snippet (explain `Actions.dragAndDrop` does not fire HTML5 events), hold list via `clickAndHold().pause(Duration.ofMillis(300)).moveToElement(target).release()` / `ActionChains.click_and_hold().pause(0.3)`; Cypress: `trigger('dragstart', { dataTransfer })` + `trigger('drop', …)` for HTML5, `trigger('pointerdown')`, `cy.wait(300)`, `trigger('pointermove', …)` for hold.
- [ ] **Step 6:** `--repeat-each 5` green; full suite + build.
- [ ] **Step 7:** Commit `feat: Sortable Lists challenge page`, ship loop.

### Task 3: Virtual Table (`virtual-table`)

**Files:**
- Create: `src/data/virtualRows.ts`, `src/data/virtualRows.test.ts`, `src/pages/practice/VirtualTable.tsx`, `e2e/virtual-table.spec.ts`, `src/data/solutions/virtual-table.ts`
- Modify: `src/data/challenges.tsx` (icon `Rows3`), `src/routes.tsx`, `src/data/solutions/index.ts`

**Interfaces:**
- Produces: `interface VirtualRow { id: number; name: string; email: string; score: number }`; `makeRows(count?: number): VirtualRow[]` (default 10000, seeded); `ROW_HEIGHT = 40`; `VIEWPORT_HEIGHT = 400`.

- [ ] **Step 1: Failing unit test** — `src/data/virtualRows.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { makeRows } from './virtualRows';

describe('makeRows', () => {
  const rows = makeRows();
  it('makes 10,000 rows with ids 1..10000', () => {
    expect(rows).toHaveLength(10000);
    expect(rows[0].id).toBe(1);
    expect(rows[9999].id).toBe(10000);
  });
  it('is deterministic', () => {
    expect(makeRows()).toEqual(rows);
  });
  it('has unique emails that contain the id', () => {
    expect(new Set(rows.map((r) => r.email)).size).toBe(10000);
    expect(rows[7341].email).toMatch(/^[a-z]+\.[a-z]+7342@example\.test$/);
  });
  it('has exactly one top score, far from the top', () => {
    const max = Math.max(...rows.map((r) => r.score));
    const top = rows.filter((r) => r.score === max);
    expect(top).toHaveLength(1);
    expect(top[0].id).toBeGreaterThan(100);
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/virtual-table.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/virtual-table');
  await expect(page.locator('main h1')).toBeVisible();
});

test('only a few rows are in the DOM', async ({ page }) => {
  const rows = page.locator('#virtual-grid [data-row-id]');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeLessThan(40);
  await expect(page.locator('#virtual-grid')).toHaveAttribute('aria-rowcount', '10000');
});

test('scroll to row 7342 and select it', async ({ page }) => {
  const grid = page.locator('#virtual-grid');
  await grid.evaluate((el) => { el.scrollTop = (7342 - 1) * 40; });
  const row = grid.locator('[data-row-id="7342"]');
  await row.getByRole('button', { name: 'Select' }).click();
  await expect(page.locator('#selected-email')).toHaveText(/7342@example\.test$/);
  await expect(page.getByTestId('result-find')).toHaveAttribute('data-state', 'success');
});

test('sort by score and pick the top row', async ({ page }) => {
  await page.locator('#sort-score').click();
  await expect(page.locator('#sort-score')).toHaveAttribute('aria-sort', 'descending');
  await page.locator('#virtual-grid [data-row-id]').first().getByRole('button', { name: 'Select' }).click();
  await expect(page.getByTestId('result-sort')).toHaveAttribute('data-state', 'success');
});

test('the last row renders at the bottom', async ({ page }) => {
  const grid = page.locator('#virtual-grid');
  await grid.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(grid.locator('[data-row-id="10000"]')).toBeVisible();
});
```

- [ ] **Step 3:** Run both — FAIL.
- [ ] **Step 4: Implement.** `virtualRows.ts`: mulberry32 PRNG seeded `20261003`; 40 first names × 40 last names; `email = \`${first}.${last}${id}@example.test\`.toLowerCase()`; `score = Math.floor(rand() * 100000)`; after generating, if the max is not unique or its id ≤ 100, set row 6481's score to `100000` (guarantees the unit test). Page: header row (`#sort-score` is a `<button role="columnheader" aria-sort="none|descending|ascending">`, click cycles desc → asc), `#virtual-grid` `role="grid"` `aria-rowcount=10000`, `height: VIEWPORT_HEIGHT`, `overflow-y: auto`, inner spacer `rows.length * ROW_HEIGHT`; render rows `[first-5, last+5]` absolutely positioned at `index * ROW_HEIGHT`, each `role="row"` `data-row-id` `aria-rowindex={index+2}` with a `Select` button. Columns ID / Name / Email / Score; on phones hide Email via `hidden sm:block` but keep `#selected-email`. Selecting sets `#selected-email` and latches `result-find` (id 7342) / `result-sort` (top score id). Solutions number 3.
- [ ] **Step 5:** Solutions: Java `((JavascriptExecutor) driver).executeScript("arguments[0].scrollTop = arguments[1]", grid, 7341 * 40)` then wait for the row; Python same; Cypress `cy.get('#virtual-grid').scrollTo(0, 7341 * 40)`. Also show the scroll-until-present loop in a comment.
- [ ] **Step 6:** `--repeat-each 5`; full suite + build.
- [ ] **Step 7:** Commit `feat: Virtual Table challenge page`, ship loop.

### Task 4: Auth Flows (`auth-flows`)

**Files:**
- Create: `src/utils/mockAuth.ts`, `src/utils/mockAuth.test.ts`, `src/pages/practice/AuthFlows.tsx`, `e2e/auth-flows.spec.ts`, `src/data/solutions/auth-flows.ts`
- Modify: `src/data/challenges.tsx` (icon `KeyRound`), `src/routes.tsx`, `src/data/solutions/index.ts`

**Interfaces:**
- Produces: `DEMO_USER = { email: 'tester@qa.test', password: 'Passw0rd!' }`; `checkCredentials(email: string, password: string): boolean` (email trimmed, case-insensitive); `makeOtp(rand?: () => number): string` (6 digits, zero-padded); `otpValid(issuedAt: number, now: number, ttlMs = 60_000): boolean`; `encodeSession(user: string, now: number, ttlMs = 3_600_000): string`; `decodeSession(token: string | null | undefined, now: number): { user: string; exp: number } | null`; `SESSION_KEY = 'qa-auth-session'`; `SESSION_COOKIE = 'qa_session'`; `ELEVATED_MS = 8000`; `PROCESSING_MS = 9000`.

- [ ] **Step 1: Failing unit test** — `src/utils/mockAuth.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { checkCredentials, makeOtp, otpValid, encodeSession, decodeSession } from './mockAuth';

describe('mockAuth', () => {
  it('checks credentials', () => {
    expect(checkCredentials(' Tester@QA.test ', 'Passw0rd!')).toBe(true);
    expect(checkCredentials('tester@qa.test', 'passw0rd!')).toBe(false);
  });
  it('makes zero-padded 6-digit codes', () => {
    expect(makeOtp(() => 0)).toBe('000000');
    expect(makeOtp(() => 0.999999)).toMatch(/^\d{6}$/);
  });
  it('expires codes after the ttl', () => {
    expect(otpValid(0, 59_999)).toBe(true);
    expect(otpValid(0, 60_001)).toBe(false);
  });
  it('round-trips a session and rejects expired or junk tokens', () => {
    const t = encodeSession('tester@qa.test', 1000);
    expect(decodeSession(t, 2000)).toEqual({ user: 'tester@qa.test', exp: 1000 + 3_600_000 });
    expect(decodeSession(t, 1000 + 3_600_001)).toBeNull();
    expect(decodeSession('%%%not-base64', 0)).toBeNull();
    expect(decodeSession(btoa('{"foo":1}'), 0)).toBeNull();
    expect(decodeSession(null, 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/auth-flows.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';

const PATH = '/#/practice/auth-flows';

async function login(page: Page, remember = false) {
  await page.locator('#auth-email').fill('tester@qa.test');
  await page.locator('#auth-password').fill('Passw0rd!');
  if (remember) await page.locator('#remember-me').check();
  await page.locator('#auth-login').click();
  const code = page.locator('#inbox-code');
  await expect(code).toHaveText(/^\d{6}$/, { timeout: 5000 });
  await page.locator('#auth-otp').fill(await code.innerText());
  await page.locator('#auth-verify').click();
  await expect(page.locator('#auth-dashboard')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator('main h1')).toBeVisible();
});

test('two-step login with a code from the inbox', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('result-2fa')).toHaveAttribute('data-state', 'success');
});

test('wrong password and wrong code are rejected', async ({ page }) => {
  await page.locator('#auth-email').fill('tester@qa.test');
  await page.locator('#auth-password').fill('wrong');
  await page.locator('#auth-login').click();
  await expect(page.locator('#login-error')).toBeVisible();
  await page.locator('#auth-password').fill('Passw0rd!');
  await page.locator('#auth-login').click();
  const code = await page.locator('#inbox-code').innerText({ timeout: 5000 });
  await page.locator('#auth-otp').fill(code === '000000' ? '111111' : '000000');
  await page.locator('#auth-verify').click();
  await expect(page.locator('#otp-error')).toBeVisible();
  await expect(page.getByTestId('result-2fa')).toHaveAttribute('data-state', 'pending');
});

test('survive a session that expires mid-wizard', async ({ page }) => {
  test.setTimeout(45_000);
  await login(page);
  await page.locator('#start-wizard').click();
  await expect(page.locator('#wizard-step')).toHaveText('Step 1 of 3');
  await page.locator('#wizard-next').click();
  await expect(page.locator('#wizard-next')).toBeEnabled({ timeout: 12_000 });
  await page.locator('#wizard-next').click();
  await expect(page.locator('#session-expired-modal')).toBeVisible();
  await page.locator('#reauth-password').fill('Passw0rd!');
  await page.locator('#reauth-submit').click();
  await expect(page.locator('#session-expired-modal')).toBeHidden();
  await expect(page.locator('#wizard-step')).toHaveText('Step 2 of 3');
  await page.locator('#wizard-next').click();
  await page.locator('#wizard-finish').click();
  await expect(page.getByTestId('result-session')).toHaveAttribute('data-state', 'success');
});

test('remember me survives a new browser context', async ({ page, browser }) => {
  await login(page, true);
  const state = await page.context().storageState();
  const ctx = await browser.newContext({ storageState: state });
  const fresh = await ctx.newPage();
  await fresh.goto(new URL(page.url()).origin + '/' + PATH);
  await expect(fresh.locator('#session-restored')).toBeVisible();
  await expect(fresh.getByTestId('result-remember')).toHaveAttribute('data-state', 'success');
  await ctx.close();
});

test('without remember me a reload shows the login form', async ({ page }) => {
  await login(page);
  await page.reload();
  await expect(page.locator('#auth-login')).toBeVisible();
});

test('a corrupt stored session falls back to login', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('qa-auth-session', 'garbage'));
  await page.reload();
  await expect(page.locator('#auth-login')).toBeVisible();
});
```

- [ ] **Step 3:** Run both — FAIL.
- [ ] **Step 4: Implement.** `mockAuth.ts` per Interfaces (`encodeSession` = `btoa(JSON.stringify({ user, exp }))`; `decodeSession` wraps `atob`/`JSON.parse` in try/catch and requires `typeof user === 'string' && typeof exp === 'number' && exp > now`). Page phases `login | otp | in`. Login: show credentials, `#login-error` on bad credentials; on success the `#inbox` panel shows "No new mail" then after 1500 ms an email with `#inbox-code`. `#auth-otp`/`#auth-verify`; `#otp-error` for wrong or expired code. On success: if `#remember-me` was checked, write `localStorage[SESSION_KEY]` and `document.cookie = \`${SESSION_COOKIE}=${token}; path=/; max-age=3600; SameSite=Lax\``; latch `result-2fa`. On mount, `decodeSession(localStorage[SESSION_KEY], Date.now())` → phase `in`, show `#session-restored`, latch `result-remember`; invalid → remove the key. `#auth-logout` clears both and returns to login. Wizard (`#start-wizard`, visible only when `in`): `elevatedUntil = now + ELEVATED_MS`; step 2 shows `#wizard-processing` and keeps `#wizard-next` disabled for `PROCESSING_MS`; any Next/Finish click when `Date.now() > elevatedUntil` opens `#session-expired-modal` (`role="dialog"`) instead; `#reauth-password` + `#reauth-submit` with the right password resets `elevatedUntil` and closes it (`#reauth-error` otherwise). `#wizard-finish` on step 3 latches `result-session` only if the modal was passed at least once. Three sections + Solutions (number 4).
- [ ] **Step 5:** Solutions: Java/Python read `#inbox-code` with an explicit wait, handle the modal with a wait-then-branch helper, and save/restore cookies + localStorage via `executeScript`; Cypress uses `cy.session()` for the remember-me part.
- [ ] **Step 6:** `--repeat-each 5`; full suite + build.
- [ ] **Step 7:** Commit `feat: Auth Flows challenge page`, ship loop.

### Task 5: Canvas & Charts (`canvas`)

**Files:**
- Create: `src/utils/canvasMath.ts`, `src/utils/canvasMath.test.ts`, `src/pages/practice/CanvasCharts.tsx`, `e2e/canvas.spec.ts`, `src/data/solutions/canvas.ts`
- Modify: `src/data/challenges.tsx` (icon `PenTool`), `src/routes.tsx`, `src/data/solutions/index.ts`

**Interfaces:**
- Produces: `TARGET_W = 600`, `TARGET_H = 300`, `TARGET_R = 30`; `targetAt(tSeconds: number): { x: number; y: number }` (drawing coordinates); `isHit(p: {x:number;y:number}, t: {x:number;y:number}, r: number): boolean`; `SALES: { month: string; value: number }[]` (12 entries, unique max `Aug`); `window.qaCanvas.target(): { x: number; y: number; r: number }` in displayed CSS pixels.

- [ ] **Step 1: Failing unit test** — `src/utils/canvasMath.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { targetAt, isHit, SALES, TARGET_W, TARGET_H, TARGET_R } from './canvasMath';

describe('canvasMath', () => {
  it('keeps the target fully inside the canvas', () => {
    for (let t = 0; t < 120; t += 0.25) {
      const { x, y } = targetAt(t);
      expect(x - TARGET_R).toBeGreaterThanOrEqual(0);
      expect(x + TARGET_R).toBeLessThanOrEqual(TARGET_W);
      expect(y - TARGET_R).toBeGreaterThanOrEqual(0);
      expect(y + TARGET_R).toBeLessThanOrEqual(TARGET_H);
    }
  });
  it('moves at most 60 px per second', () => {
    for (let t = 0; t < 60; t += 0.1) {
      const a = targetAt(t), b = targetAt(t + 0.1);
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThanOrEqual(6.01);
    }
  });
  it('detects hits inside the radius only', () => {
    expect(isHit({ x: 10, y: 10 }, { x: 30, y: 10 }, 20)).toBe(true);
    expect(isHit({ x: 10, y: 10 }, { x: 31, y: 10 }, 20)).toBe(false);
  });
  it('has twelve months with a unique August peak', () => {
    expect(SALES).toHaveLength(12);
    const max = Math.max(...SALES.map((s) => s.value));
    expect(SALES.filter((s) => s.value === max).map((s) => s.month)).toEqual(['Aug']);
  });
});
```

- [ ] **Step 2: Failing e2e** — `e2e/canvas.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/canvas');
  await expect(page.locator('main h1')).toBeVisible();
});

test('hit the moving target three times', async ({ page }) => {
  const canvas = page.locator('#target-canvas');
  await canvas.scrollIntoViewIfNeeded();
  for (let i = 0; i < 3; i++) {
    const box = (await canvas.boundingBox())!;
    const t = await page.evaluate(() => (window as unknown as { qaCanvas: { target(): { x: number; y: number } } }).qaCanvas.target());
    await page.mouse.click(box.x + t.x, box.y + t.y);
  }
  await expect(page.locator('#canvas-hits')).toHaveText('3');
  await expect(page.getByTestId('result-target')).toHaveAttribute('data-state', 'success');
});

test('draw a line from box to box', async ({ page }) => {
  const canvas = page.locator('#draw-canvas');
  await canvas.scrollIntoViewIfNeeded();
  const b = (await canvas.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.1, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2, { steps: 20 });
  await page.mouse.up();
  await expect(page.getByTestId('result-draw')).toHaveAttribute('data-state', 'success');
});

test('a jump with no steps in between is not a stroke', async ({ page }) => {
  const canvas = page.locator('#draw-canvas');
  await canvas.scrollIntoViewIfNeeded();
  const b = (await canvas.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.1, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2);
  await page.mouse.up();
  await expect(page.getByTestId('result-draw')).toHaveAttribute('data-state', 'failure');
});

test('find the peak month from the tooltips', async ({ page }) => {
  const bars = page.locator('#sales-chart [data-month]');
  let best = { month: '', value: -1 };
  for (let i = 0; i < (await bars.count()); i++) {
    const month = (await bars.nth(i).getAttribute('data-month'))!;
    await bars.nth(i).hover();
    const tip = page.locator('#chart-tooltip');
    await expect(tip).toContainText(month);
    const value = Number((await tip.innerText()).replace(/\D/g, ''));
    if (value > best.value) best = { month, value };
  }
  await page.locator('#peak-month').fill(best.month);
  await page.locator('#check-peak').click();
  await expect(page.getByTestId('result-chart')).toHaveAttribute('data-state', 'success');
});
```

- [ ] **Step 3:** Run both — FAIL.
- [ ] **Step 4: Implement.** `canvasMath.ts`: `targetAt(t) = { x: 300 + 220 * Math.sin(t * 0.2), y: 150 + 100 * Math.sin(t * 0.33 + 1) }` (peak speed ≈ 54 px/s; bounds 80–520 × 50–250); `isHit` = `hypot ≤ r`; `SALES` Jan 3120, Feb 2890, Mar 4210, Apr 3980, May 4560, Jun 5120, Jul 6030, Aug 7940, Sep 6410, Oct 5280, Nov 4870, Dec 6650. Target canvas: `width=600 height=300` (×`devicePixelRatio` backing store), CSS `w-full max-w-[600px] h-auto`; `requestAnimationFrame` draws the circle at `targetAt(elapsed)`; `pointerdown` maps client → drawing coords via `rect.width / TARGET_W`, `isHit` → `#canvas-hits` else `#canvas-misses`; 3 hits latches `result-target`; expose `window.qaCanvas = { target: () => scaled position + r }` on mount, delete on unmount. Draw canvas 600×200, start box x 20–100, end box x 500–580, y 60–140 (drawing coords): stroke = pointerdown → pointerup with `pointermove` count; success when it starts in start box, ends in end box and had ≥ 5 moves, otherwise `failure` "Draw one continuous line from the left box to the right box"; Clear button `#clear-draw`. Chart: SVG `viewBox="0 0 600 260"` `w-full`, `<rect data-month>` with `onMouseEnter` setting `#chart-tooltip` to `"Aug: 7,940"` (`toLocaleString('en-US')`), month labels under bars, no values in the DOM until hover; `#peak-month` accepts `aug`/`august` case-insensitively. Three sections + Solutions (number 4).
- [ ] **Step 5:** Solutions: Java/Python `executeScript("return window.qaCanvas.target()")` + `Actions.moveToElement(canvas, dx, dy)` (Selenium 4 offsets are from the element centre — subtract half the size), stroke via `clickAndHold` + several `moveByOffset`; Cypress `cy.window().then(w => w.qaCanvas.target())` + `trigger('pointerdown', x, y)`.
- [ ] **Step 6:** `--repeat-each 5`; full suite + build.
- [ ] **Step 7:** Commit `feat: Canvas & Charts challenge page`, ship loop.

### Task 6: Accessibility Lab (`a11y`)

**Files:**
- Create: `src/pages/practice/AccessibilityLab.tsx`, `e2e/a11y.spec.ts`, `src/data/solutions/a11y.ts`
- Modify: `package.json` (dev dep `@axe-core/playwright`), `src/data/challenges.tsx` (icon `Accessibility`, difficulty Intermediate), `src/routes.tsx`, `src/data/solutions/index.ts`

**Interfaces:**
- Produces: `PLANTED = ['image-alt', 'label', 'color-contrast', 'button-name', 'link-name']`, `DECOYS = ['heading-order', 'list', 'aria-allowed-attr']` exported from the page module's sibling `src/data/a11yRules.ts`.

- [ ] **Step 1:** `npm i -D @axe-core/playwright`.
- [ ] **Step 2: Failing e2e** — `e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PLANTED } from '../src/data/a11yRules';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/practice/a11y');
  await expect(page.locator('main h1')).toBeVisible();
});

const scan = (page: import('@playwright/test').Page, selector: string) =>
  new AxeBuilder({ page }).include(selector).withTags(['wcag2a', 'wcag2aa']).analyze();

test('the broken form has exactly the planted violations', async ({ page }) => {
  const { violations } = await scan(page, '#a11y-broken');
  expect(violations.map((v) => v.id).sort()).toEqual([...PLANTED].sort());
  for (const id of PLANTED) await page.locator(`#rule-${id}`).check();
  await page.locator('#check-a11y').click();
  await expect(page.getByTestId('result-axe')).toHaveAttribute('data-state', 'success');
});

test('ticking a decoy fails', async ({ page }) => {
  for (const id of PLANTED) await page.locator(`#rule-${id}`).check();
  await page.locator('#rule-heading-order').check();
  await page.locator('#check-a11y').click();
  await expect(page.getByTestId('result-axe')).toHaveAttribute('data-state', 'failure');
});

test('the fixed form has no violations', async ({ page }) => {
  const { violations } = await scan(page, '#a11y-fixed');
  expect(violations).toEqual([]);
});

const focusedInDialog = (page: import('@playwright/test').Page) =>
  page.evaluate(() => !!document.activeElement?.closest('#kb-dialog'));

test('complete the form with only the keyboard', async ({ page }) => {
  await page.locator('#kb-name').focus();
  await page.keyboard.type('Ada');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#kb-tool [aria-selected="true"]')).toHaveText('Cypress');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#kb-dialog')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    expect(await focusedInDialog(page)).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#kb-dialog')).toBeHidden();
  await expect(page.locator('#kb-submit')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#kb-confirm')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-keyboard')).toHaveAttribute('data-state', 'success');
});

test('using the mouse fails the keyboard challenge', async ({ page }) => {
  await page.locator('#kb-name').click();
  await expect(page.locator('#keyboard-form')).toHaveAttribute('data-mouse-used', 'true');
  await page.keyboard.type('Ada');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('result-keyboard')).toHaveAttribute('data-state', 'failure');
});
```

- [ ] **Step 3:** Run — FAIL.
- [ ] **Step 4: Implement.** `src/data/a11yRules.ts` exports `PLANTED`, `DECOYS`. `#a11y-broken`: an `<img src="…og-image.jpg">` with no `alt`; an `<input id="broken-email">` with no label; a paragraph `#broken-low-contrast` in `#b0b0b0` on white; an icon-only `<button>` with no name; an `<a href="#">` wrapping only an icon. Nothing else that axe's `wcag2a`/`wcag2aa` rules flag (iterate with the e2e until the set is exact). `#a11y-fixed`: same controls with `alt`, `<label>`, `#475569` text, `aria-label`s. Checklist `#a11y-checklist`: checkboxes `#rule-<id>` for `PLANTED` + `DECOYS` in a fixed mixed order; `#check-a11y` → success only for exactly `PLANTED`. Keyboard section `#keyboard-form` (`data-mouse-used`): `#kb-name`; `#kb-tool` `role="listbox"` `tabIndex=0` with options Playwright/Selenium/Cypress/WebdriverIO (`role="option"`, `aria-selected`; ArrowDown/ArrowUp move selection, starting with Playwright selected); `#kb-terms` checkbox; `#kb-submit` opens `#kb-dialog` (`role="dialog" aria-modal="true"`) only when all are filled (else `#kb-error`), initial focus on `#kb-confirm`, Tab/Shift+Tab cycle between `#kb-cancel` and `#kb-confirm`, `Escape`/Cancel close and refocus `#kb-submit`, Confirm submits → `result-keyboard` success unless `data-mouse-used="true"`, then failure "Mouse used — reset and try again with only the keyboard". A `pointerdown` listener on the section sets mouse-used; `#kb-reset` clears everything (Reset itself is clicked, so it clears the flag *after* handling). Three sections + Solutions (number 4).
- [ ] **Step 5:** Solutions: Java `com.deque.html.axe-core:selenium` `new AxeBuilder().include("#a11y-broken")`; Python `axe-selenium-python`; Cypress `cypress-axe` `cy.injectAxe(); cy.checkA11y('#a11y-fixed')`. Keyboard part with `sendKeys(Keys.TAB)` / `cy.realPress` note (Cypress needs `cypress-real-events` for real Tab).
- [ ] **Step 6:** `--repeat-each 5`; full suite + build.
- [ ] **Step 7:** Commit `feat: Accessibility Lab challenge page`, ship loop.

### Task 7: Wrap-up

- [ ] Tick this plan's checkboxes, update `README.md`'s challenge list with the six pages, commit `docs: tier 2/3 challenges done`, ship loop.
