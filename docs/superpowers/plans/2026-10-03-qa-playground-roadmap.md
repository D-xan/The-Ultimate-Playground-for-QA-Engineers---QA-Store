# QA Playground Roadmap — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the practice portal feel finished and give it the foundation (domain, tests, one challenge registry, reliable progress, a success-signal pattern) that every later challenge and premium feature builds on.

**Architecture:** Static React SPA on GitHub Pages, moving from `d-xan.github.io/<repo>/` to `qa.randomly.online`. No backend: all state is zustand + `localStorage`. One registry file (`src/data/challenges.tsx`) becomes the single source for the sidebar, dashboard and e2e tests. Playwright e2e tests live in `e2e/` and double as the reference solutions shown in Phase 3.

**Tech Stack:** React 19, Vite 8, Tailwind 4, react-router-dom 7 (HashRouter), zustand 5, Vitest (unit), @playwright/test (e2e).

**Spec:** this conversation's research (competitor gap analysis + premium-features table + Randomly subdomain decision), summarised in "Roadmap" below.

## Global Constraints

- No backend, no paid API. Everything runs in the browser on GitHub Pages.
- Custom domain: `qa.randomly.online`. Vite `base` must be `'/'`.
- **Do not push the domain change to `main` until the owner has added the Cloudflare CNAME (`qa` → `d-xan.github.io`, DNS-only) and set the custom domain in GitHub Pages settings** — pushing first breaks the live github.io URL (assets resolve to `/assets/` on the wrong path).
- Keep `HashRouter` in Phase 1 (switching routers is its own decision; see Phase 5).
- No Randomly.online GTM / analytics on this site — automation scripts would pollute Randomly's GA4.
- Every interactive element in a challenge has a stable `id` AND `data-testid` (except where the challenge is *about* unstable locators).
- Every new challenge exposes its pass state through `<ChallengeResult>` (`data-testid="challenge-result"`, `role="status"`, `data-state="pending|success|failure"`).
- Match existing styling: white cards `bg-white p-6 rounded-2xl shadow-sm border border-border`, headings `text-xl font-bold mb-6 border-b border-border pb-2`.

## Review Focus

1. A returning visitor with old `qa-playground-progress-v2` data in `localStorage` must load the portal without errors (progress starts fresh; old key is removed).
2. On a page with several task groups, ticking task 1 in one group must not tick task 1 in another — Task 3 test pins this.
3. "Reset All" must clear task progress as well as saved form state — Task 3 test pins this.
4. Refreshing on a deep link (`/#/practice/tables`) must render that page, not the dashboard — Task 2 smoke test covers every registry route.
5. Phone width (375px): sidebar collapses, no horizontal scroll on the dashboard — Task 4 test pins this.

---

## Roadmap (all phases)

| Phase | Scope | Plan |
|---|---|---|
| **1 — Foundation & polish** | Domain move, test harness, progress bug, numbering, single registry, success-signal pattern | **this file** |
| 2 — Tier-1 challenges | Overlapped element, animated button, disabled→enabled, shifting content, text traps (nbsp / class order), hidden layers, nested + changing iframes, closed shadow DOM, flaky page, OTP input. Each ships with a Playwright test that solves it. | `2026-xx-xx-tier1-challenges.md` (written when Phase 1 lands) |
| 3 — Premium features, free | Selector Lab overlay; Solutions tab (Playwright / Selenium Java / Selenium Python / Cypress, Playwright code imported from `e2e/` via `?raw`); Test data generator (faker, CSV/JSON/SQL, no row cap); Mock REST API (MSW in-browser, auth + error codes + delays); Certificate PDF; Interview kit with flashcards | one plan per feature |
| 4 — Bug-hunt mode | Extend existing `useChallengeMode` with injected store defects + scoreboard | own plan |
| 5 — Reach | BrowserRouter + prerendered routes for SEO, Tier-2/3 challenges, cross-links with Randomly dev-tools hub (change happens in the Randomly repo) | own plans |

---

## File Structure (Phase 1)

| File | Responsibility |
|---|---|
| `vite.config.ts` | `base: '/'`, Vitest config |
| `public/CNAME` | `qa.randomly.online` |
| `index.html`, `README.md`, `public/docs/index.html`, `selenium-framework/.../LoginTest.java` | old URL → new URL |
| `playwright.config.ts` | e2e runner, starts Vite dev server |
| `e2e/smoke.spec.ts` | every registry route renders |
| `e2e/progress.spec.ts` | progress isolation + reset |
| `e2e/layout.spec.ts` | numbering + phone width |
| `src/store/progressLogic.ts` | pure progress functions (unit-tested) |
| `src/store/progressLogic.test.ts` | Vitest tests |
| `src/store/useProgressStore.ts` | zustand store using `progressLogic` |
| `src/components/ui/TaskQuestions.tsx` | takes `groupId` |
| `src/data/challenges.tsx` | single challenge registry |
| `src/components/ui/ChallengeResult.tsx` | success-signal component |
| `src/layouts/PracticeLayout.tsx`, `src/pages/practice/PracticeDashboard.tsx` | read registry + progress helpers |
| `src/pages/practice/*.tsx` | sequential section numbers, `groupId`s |

---

### Task 1: Move to `qa.randomly.online`

**Files:**
- Modify: `vite.config.ts:8`
- Create: `public/CNAME`
- Modify: `index.html` (og/twitter/JSON-LD URLs), `README.md`, `public/docs/index.html`, `selenium-framework/src/test/java/com/qastore/LoginTest.java:29`

**Interfaces:** Produces: site served from `/`; `import.meta.env.BASE_URL === '/'`.

- [ ] **Step 1: Change the base path**

```ts
// vite.config.ts
  base: '/',
```

- [ ] **Step 2: Add the CNAME file**

`public/CNAME`:
```
qa.randomly.online
```

- [ ] **Step 3: Replace hardcoded URLs**

```bash
grep -rl "d-xan.github.io/The-Ultimate-Playground-for-QA-Engineers---QA-Store" index.html README.md public/docs/index.html selenium-framework/src \
  | xargs sed -i 's#https://d-xan.github.io/The-Ultimate-Playground-for-QA-Engineers---QA-Store#https://qa.randomly.online#g'
```
Then fix the README badge label: `Live%20Demo-GitHub%20Pages` → `Live%20Demo-qa.randomly.online`.

- [ ] **Step 4: Verify the build**

Run: `npm run build && grep -o 'src="/assets/[^"]*"' dist/index.html && cat dist/CNAME && grep -rc "d-xan.github.io/The-Ultimate" index.html README.md public/docs/index.html`
Expected: asset paths start with `/assets/`, CNAME prints `qa.randomly.online`, every grep count is `0`.

- [ ] **Step 5: Commit (do NOT push until DNS is live — see Global Constraints)**

```bash
git add vite.config.ts public/CNAME index.html README.md public/docs/index.html selenium-framework/src
git commit -m "chore: serve from qa.randomly.online"
```

---

### Task 2: Test harness + challenge registry

The sidebar (`PracticeLayout.tsx`) and dashboard (`PracticeDashboard.tsx`) each hard-code the challenge list. Make one registry, wire both to it, and add a smoke test that visits every entry.

**Files:**
- Modify: `package.json` (scripts, devDeps)
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`, `src/data/challenges.tsx`
- Modify: `vite.config.ts`, `src/layouts/PracticeLayout.tsx:11-23`, `src/pages/practice/PracticeDashboard.tsx:12-24`

**Interfaces:**
- Produces:
```ts
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export interface Challenge {
  id: string;            // route segment, also the progress pageId
  label: string;
  desc: string;
  difficulty: Difficulty;
  icon: LucideIcon;
}
export const challenges: Challenge[];
export const challengePath = (c: Challenge) => `/practice/${c.id}`;
```

- [ ] **Step 1: Install tools**

```bash
npm i -D vitest @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Scripts and configs**

`package.json` scripts — add:
```json
"test": "vitest run",
"test:e2e": "playwright test"
```

`vite.config.ts` — add the reference line at the top and a `test` block:
```ts
/// <reference types="vitest/config" />
...
  test: {
    include: ['src/**/*.test.ts'],
  },
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:5179/',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 5179 --strictPort',
    url: 'http://localhost:5179/',
    reuseExistingServer: !process.env.CI,
  },
});
```

Add to `.gitignore`: `test-results/`, `playwright-report/`, `.playwright-mcp/`.

- [ ] **Step 3: Write the failing smoke test**

`e2e/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { challenges } from '../src/data/challenges';

test('dashboard lists every challenge', async ({ page }) => {
  await page.goto('/#/practice');
  for (const c of challenges) {
    await expect(page.getByTestId(`challenge-card-${c.id}`)).toBeVisible();
  }
});

for (const c of challenges) {
  test(`deep link renders ${c.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/#/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.getByTestId(`nav-${c.id}`)).toHaveAttribute('aria-current', 'page');
    expect(errors).toEqual([]);
  });
}
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx playwright test e2e/smoke.spec.ts`
Expected: FAIL — cannot resolve `../src/data/challenges`.

- [ ] **Step 5: Create the registry**

`src/data/challenges.tsx` (`.tsx` kept for future JSX fields; icons are stored as components, not elements, so the file imports cleanly into Node-side Playwright):
```tsx
import type { LucideIcon } from 'lucide-react';
import { Type, MousePointer2, List, Mouse, MessageSquare, AppWindow, Activity, Network } from 'lucide-react';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Challenge {
  id: string;
  label: string;
  desc: string;
  difficulty: Difficulty;
  icon: LucideIcon;
}

export const challenges: Challenge[] = [
  { id: 'basic', label: 'Basic Elements', desc: 'Interact with inputs, buttons, and forms', icon: Type, difficulty: 'Beginner' },
  { id: 'advanced', label: 'Advanced Inputs', desc: 'Handle date pickers, range sliders, and uploads', icon: MousePointer2, difficulty: 'Intermediate' },
  { id: 'tables', label: 'Tables & Lists', desc: 'Extract data from dynamic data grids', icon: List, difficulty: 'Intermediate' },
  { id: 'interactions', label: 'Mouse & Keyboard', desc: 'Drag-and-drop, hover, right-click, and hotkeys', icon: Mouse, difficulty: 'Advanced' },
  { id: 'dialogs', label: 'Popups & Dialogs', desc: 'Manage alerts, confirm prompts, and modals', icon: MessageSquare, difficulty: 'Beginner' },
  { id: 'frames', label: 'Frames & Shadow DOM', desc: 'Switching contexts into iframes and shadow roots', icon: AppWindow, difficulty: 'Advanced' },
  { id: 'dynamic', label: 'Dynamic & Waits', desc: 'Handle elements appearing asynchronously', icon: Activity, difficulty: 'Intermediate' },
  { id: 'pagination-test', label: 'Store Pagination', desc: 'Navigate multiple pages of products', icon: List, difficulty: 'Intermediate' },
  { id: 'lazy-load', label: 'Store Lazy Loading', desc: 'Scroll to trigger dynamic content fetching', icon: MousePointer2, difficulty: 'Intermediate' },
  { id: 'api-interception', label: 'API Interception', desc: 'Mock and modify network requests directly', icon: Network, difficulty: 'Advanced' },
  { id: 'progress-bar', label: 'Progress Bar', desc: 'Test waits on a dynamic progress bar', icon: Activity, difficulty: 'Intermediate' },
];

export const challengePath = (c: Challenge) => `/practice/${c.id}`;
```

- [ ] **Step 6: Wire the sidebar and dashboard**

`PracticeLayout.tsx`: delete the local `sidebarLinks` array; import `{ challenges, challengePath }`; replace every `sidebarLinks` use with `challenges`, `link.to` with `challengePath(link)`, `link.icon` with `<link.icon className="h-4 w-4" />`. On each `NavLink` add `data-testid={\`nav-${link.id}\`}` (NavLink sets `aria-current="page"` itself).

`PracticeDashboard.tsx`: delete the local `challenges` array; import the registry; `to={challengePath(challenge)}`, icon `<challenge.icon className="h-5 w-5" />`, and add `data-testid={\`challenge-card-${challenge.id}\`}` to each card `Link`.

- [ ] **Step 7: Run tests and build**

Run: `npx playwright test e2e/smoke.spec.ts && npm run build`
Expected: 12 passed; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts playwright.config.ts .gitignore e2e/smoke.spec.ts src/data/challenges.tsx src/layouts/PracticeLayout.tsx src/pages/practice/PracticeDashboard.tsx
git commit -m "feat: single challenge registry with Playwright smoke tests"
```

---

### Task 3: Fix progress tracking (per-group tasks + Reset All)

**Bug:** `TaskQuestions` keys progress by page only, so pages with several task groups (BasicElements has 5) share indexes: ticking task 1 under "Buttons" also ticks task 1 under "Input Fields", and the page total is whichever group mounted last. "Reset All" leaves task progress untouched.

**Files:**
- Create: `src/store/progressLogic.ts`, `src/store/progressLogic.test.ts`, `e2e/progress.spec.ts`
- Modify: `src/store/useProgressStore.ts`, `src/components/ui/TaskQuestions.tsx`, `src/layouts/PracticeLayout.tsx`, `src/pages/practice/PracticeDashboard.tsx`, and every page with more than one `<TaskQuestions>` (BasicElements, AdvancedInputs, PopupsDialogs, FramesDOM, DynamicWaiting)

**Interfaces:**
- Consumes: `challenges` from Task 2.
- Produces:
```ts
export interface ProgressData {
  completed: Record<string, string[]>;               // pageId -> task keys "group:index"
  totals: Record<string, Record<string, number>>;    // pageId -> groupId -> task count
}
export const taskKey: (groupId: string, index: number) => string;
export const toggle: (d: ProgressData, pageId: string, key: string) => ProgressData;
export const registerGroup: (d: ProgressData, pageId: string, groupId: string, count: number) => ProgressData;
export const pageTotal: (d: ProgressData, pageId: string) => number;
export const pageDone: (d: ProgressData, pageId: string) => number;
export const isPageComplete: (d: ProgressData, pageId: string) => boolean;
// store: useProgressStore() => ProgressData & { toggleTask(pageId, key), registerGroup(pageId, groupId, count), resetProgress() }
// <TaskQuestions tasks={...} groupId="buttons" />   groupId defaults to 'main'
```

- [ ] **Step 1: Write the failing unit tests**

`src/store/progressLogic.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { taskKey, toggle, registerGroup, pageTotal, pageDone, isPageComplete, type ProgressData } from './progressLogic';

const empty: ProgressData = { completed: {}, totals: {} };

describe('progressLogic', () => {
  it('keeps groups on one page independent', () => {
    let d = registerGroup(empty, 'basic', 'inputs', 2);
    d = registerGroup(d, 'basic', 'buttons', 3);
    d = toggle(d, 'basic', taskKey('buttons', 0));
    expect(d.completed.basic).toEqual(['buttons:0']);
    expect(pageTotal(d, 'basic')).toBe(5);
    expect(pageDone(d, 'basic')).toBe(1);
  });

  it('toggle twice un-completes', () => {
    let d = registerGroup(empty, 'p', 'main', 1);
    d = toggle(d, 'p', 'main:0');
    d = toggle(d, 'p', 'main:0');
    expect(pageDone(d, 'p')).toBe(0);
  });

  it('page is complete only when every group is done', () => {
    let d = registerGroup(empty, 'p', 'a', 1);
    d = registerGroup(d, 'p', 'b', 1);
    d = toggle(d, 'p', 'a:0');
    expect(isPageComplete(d, 'p')).toBe(false);
    d = toggle(d, 'p', 'b:0');
    expect(isPageComplete(d, 'p')).toBe(true);
  });

  it('ignores stale keys when a group shrinks', () => {
    let d = registerGroup(empty, 'p', 'main', 3);
    d = toggle(d, 'p', 'main:2');
    d = registerGroup(d, 'p', 'main', 2);
    expect(pageDone(d, 'p')).toBe(0);
    expect(isPageComplete(d, 'p')).toBe(false);
  });

  it('a page with no registered tasks is never complete', () => {
    expect(isPageComplete(empty, 'nothing')).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/store/progressLogic.test.ts`
Expected: FAIL — cannot find module `./progressLogic`.

- [ ] **Step 3: Implement `progressLogic.ts`**

```ts
export interface ProgressData {
  completed: Record<string, string[]>;
  totals: Record<string, Record<string, number>>;
}

export const taskKey = (groupId: string, index: number) => `${groupId}:${index}`;

export const toggle = (d: ProgressData, pageId: string, key: string): ProgressData => {
  const current = d.completed[pageId] ?? [];
  const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
  return { ...d, completed: { ...d.completed, [pageId]: next } };
};

export const registerGroup = (d: ProgressData, pageId: string, groupId: string, count: number): ProgressData => {
  if (d.totals[pageId]?.[groupId] === count) return d;
  return { ...d, totals: { ...d.totals, [pageId]: { ...d.totals[pageId], [groupId]: count } } };
};

export const pageTotal = (d: ProgressData, pageId: string) =>
  Object.values(d.totals[pageId] ?? {}).reduce((a, b) => a + b, 0);

const isLiveKey = (d: ProgressData, pageId: string, key: string) => {
  const sep = key.lastIndexOf(':');
  const count = d.totals[pageId]?.[key.slice(0, sep)];
  return count !== undefined && Number(key.slice(sep + 1)) < count;
};

export const pageDone = (d: ProgressData, pageId: string) =>
  (d.completed[pageId] ?? []).filter((k) => isLiveKey(d, pageId, k)).length;

export const isPageComplete = (d: ProgressData, pageId: string) => {
  const total = pageTotal(d, pageId);
  return total > 0 && pageDone(d, pageId) >= total;
};
```

- [ ] **Step 4: Run unit tests**

Run: `npx vitest run`
Expected: 5 passed.

- [ ] **Step 5: Rewrite the store on top of it**

`src/store/useProgressStore.ts`:
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toggle, registerGroup, type ProgressData } from './progressLogic';

interface ProgressState extends ProgressData {
  toggleTask: (pageId: string, key: string) => void;
  registerGroup: (pageId: string, groupId: string, count: number) => void;
  resetProgress: () => void;
}

// v2 keyed tasks by page only, so its data is ambiguous; drop it.
try { localStorage.removeItem('qa-playground-progress-v2'); } catch { /* storage unavailable */ }

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      totals: {},
      toggleTask: (pageId, key) => set((s) => toggle(s, pageId, key)),
      registerGroup: (pageId, groupId, count) => set((s) => registerGroup(s, pageId, groupId, count)),
      resetProgress: () => set({ completed: {} }),
    }),
    { name: 'qa-playground-progress-v3' }
  )
);
```

- [ ] **Step 6: Update `TaskQuestions`**

Add `groupId?: string` to props (default `'main'`). Replace store usage:
```tsx
const { completed, toggleTask, registerGroup } = useProgressStore();
React.useEffect(() => {
  if (challengeId) registerGroup(challengeId, groupId, tasks.length);
}, [challengeId, groupId, tasks.length, registerGroup]);
...
const key = taskKey(groupId, index);
const isCompleted = (completed[challengeId] ?? []).includes(key);
...
onClick={() => toggleTask(challengeId, key)}
data-testid={`task-toggle-${groupId}-${index}`}
```

- [ ] **Step 7: Update Layout and Dashboard**

Replace every `totalTasks[id] && completedTasks[id]?.length === totalTasks[id]` with `isPageComplete(progress, id)` where `const progress = useProgressStore();`. In `FloatingProgress` use `pageDone` / `pageTotal`. In `handleResetAll` call `useProgressStore.getState().resetProgress()` before reloading.

- [ ] **Step 8: Give each multi-group page distinct `groupId`s**

| Page | groupIds, in page order |
|---|---|
| BasicElements | `inputs`, `buttons`, `checkboxes`, `radios`, `sliders` (match the section each block sits in) |
| AdvancedInputs | `dropdowns`, `datetime`, `uploads`, `pickers` |
| PopupsDialogs | `js-dialogs`, `modals`, `tooltips` |
| FramesDOM | `windows`, `frames` (or the two sections the blocks sit in) |
| DynamicWaiting | `dynamic-elements`, `loading-states` |

Read each block's surrounding `<section>` to confirm which section it belongs to before naming it.

- [ ] **Step 9: Write the e2e test**

`e2e/progress.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('groups on one page are independent', async ({ page }) => {
  await page.goto('/#/practice/basic');
  await page.getByTestId('task-toggle-buttons-0').click();
  await expect(page.getByTestId('task-toggle-buttons-0').locator('svg')).toHaveClass(/text-green-500/);
  await expect(page.getByTestId('task-toggle-inputs-0').locator('svg')).not.toHaveClass(/text-green-500/);
});

test('Reset All clears task progress', async ({ page }) => {
  await page.goto('/#/practice/basic');
  await page.getByTestId('task-toggle-inputs-0').click();
  await page.getByRole('button', { name: 'Reset All' }).click();
  await page.waitForLoadState('load');
  await expect(page.getByTestId('task-toggle-inputs-0').locator('svg')).not.toHaveClass(/text-green-500/);
});

test('old v2 progress data does not break the portal', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('qa-playground-progress-v2', JSON.stringify({ state: { completedTasks: { basic: [0] }, totalTasks: { basic: 3 } }, version: 0 }))
  );
  await page.goto('/#/practice');
  await expect(page.getByTestId('challenge-card-basic')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('qa-playground-progress-v2'))).toBeNull();
});
```

- [ ] **Step 10: Run everything**

Run: `npx vitest run && npx playwright test && npm run build`
Expected: all pass.

- [ ] **Step 11: Commit**

```bash
git add src/store src/components/ui/TaskQuestions.tsx src/layouts/PracticeLayout.tsx src/pages/practice e2e/progress.spec.ts
git commit -m "fix: per-group task progress and Reset All clears progress"
```

---

### Task 4: Sequential section numbers + phone layout check

Headings carry numbers from an old master list (`5. Dropdowns`, `9. File Uploads` twice, `37. Advanced Pickers`).

**Files:**
- Create: `e2e/layout.spec.ts`
- Modify: section `<h2>`s in `AdvancedInputs`, `BasicElements`, `DynamicWaiting`, `FramesDOM`, `Interactions`, `PopupsDialogs`, `TablesLists`

**Interfaces:** Consumes `challenges` (Task 2).

- [ ] **Step 1: Write the failing test**

`e2e/layout.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { challenges } from '../src/data/challenges';

for (const c of challenges) {
  test(`${c.id}: numbered sections run 1..n`, async ({ page }) => {
    await page.goto(`/#/practice/${c.id}`);
    await expect(page.locator('main h1').first()).toBeVisible();
    const texts = await page.locator('main h2').allInnerTexts();
    const nums = texts.map((t) => t.match(/^(\d+)\.\s/)?.[1]).filter(Boolean).map(Number);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
}

test('dashboard has no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/practice');
  await expect(page.getByTestId('challenge-card-basic')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test e2e/layout.spec.ts`
Expected: FAIL on advanced, basic, dynamic, frames, interactions, dialogs, tables.

- [ ] **Step 3: Renumber**

Renumber each page's `<h2>` sections 1..n in document order. Exact edits:

| Page | New headings |
|---|---|
| AdvancedInputs | `1. Dropdowns`, `2. Date & Time`, `3. File Uploads`, `4. Downloads`, `5. Advanced Pickers` |
| BasicElements | `1. Input Fields`, `2. Buttons`, `3. Checkboxes`, `4. Radio Buttons`, `5. Sliders`, `6. Toggle Controls`, `7. Links` |
| DynamicWaiting | `1. Dynamic Elements`, `2. Loading States` |
| FramesDOM | `1. Browser Windows`, `2. Frames (iframe)`, `3. Shadow DOM` |
| Interactions | `1. Mouse Actions`, `2. Keyboard Actions` |
| PopupsDialogs | `1. JavaScript Dialogs`, `2. Custom Popups / Modals`, `3. Tooltips` |
| TablesLists | `1. Tables`, `2. Lists`, `3. Pagination` |

- [ ] **Step 4: Run tests**

Run: `npx playwright test`
Expected: all pass. If the phone test fails, find the overflowing element with `document.querySelectorAll('*')` filtered by `getBoundingClientRect().right > innerWidth` and fix its width.

- [ ] **Step 5: Commit**

```bash
git add e2e/layout.spec.ts src/pages/practice
git commit -m "fix: number practice sections sequentially per page"
```

---

### Task 5: `ChallengeResult` success-signal pattern

Every Phase 2 challenge reports pass/fail the same way, so tests (and the Solutions tab) assert one thing. Retrofit it onto the Progress Bar challenge as the first user.

**Files:**
- Create: `src/components/ui/ChallengeResult.tsx`, `e2e/progress-bar.spec.ts`
- Modify: `src/pages/practice/ProgressBarChallenge.tsx`

**Interfaces:**
- Produces:
```tsx
export type ResultState = 'pending' | 'success' | 'failure';
export function ChallengeResult(props: { state: ResultState; message: string }): JSX.Element;
// renders <div data-testid="challenge-result" role="status" aria-live="polite" data-state={state}>{message}</div>
```

- [ ] **Step 1: Write the failing test (this file is also the Phase 3 reference solution)**

`e2e/progress-bar.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('stop the progress bar at 75% or more', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#start-button').click();
  await expect
    .poll(async () => Number(await page.locator('#progress-bar-fill').getAttribute('aria-valuenow')), { timeout: 15_000, intervals: [100] })
    .toBeGreaterThanOrEqual(75);
  await page.locator('#stop-button').click();
  await expect(page.getByTestId('challenge-result')).toHaveAttribute('data-state', 'success');
});

test('waiting for 100% shows the completion message', async ({ page }) => {
  await page.goto('/#/practice/progress-bar');
  await page.locator('#start-button').click();
  await expect(page.locator('#success-message')).toHaveText('Process Completed Successfully!', { timeout: 15_000 });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx playwright test e2e/progress-bar.spec.ts`
Expected: first test FAILS (no `aria-valuenow`, no `challenge-result`).

- [ ] **Step 3: Create the component**

`src/components/ui/ChallengeResult.tsx`:
```tsx
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

export type ResultState = 'pending' | 'success' | 'failure';

const styles: Record<ResultState, string> = {
  pending: 'bg-slate-50 text-slate-500 border-slate-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  failure: 'bg-red-50 text-red-700 border-red-200',
};

const icons = { pending: Circle, success: CheckCircle2, failure: XCircle };

export function ChallengeResult({ state, message }: { state: ResultState; message: string }) {
  const Icon = icons[state];
  return (
    <div
      data-testid="challenge-result"
      role="status"
      aria-live="polite"
      data-state={state}
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${styles[state]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
```

- [ ] **Step 4: Use it in ProgressBarChallenge**

Add `role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}` to `#progress-bar-fill`. Track the stop result:
```tsx
const [result, setResult] = useState<ResultState>('pending');
// handleStart: setResult('pending');
const handleStop = () => {
  setIsStarting(false);
  setResult(progress >= 75 ? 'success' : 'failure');
};
```
Render under the buttons:
```tsx
<ChallengeResult
  state={result}
  message={result === 'success' ? `Stopped at ${progress}% — target reached` : result === 'failure' ? `Stopped at ${progress}% — too early, target is 75%` : 'Start the bar, then stop it at 75% or more'}
/>
```

- [ ] **Step 5: Run tests**

Run: `npx playwright test && npx vitest run && npm run build`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ChallengeResult.tsx src/pages/practice/ProgressBarChallenge.tsx e2e/progress-bar.spec.ts
git commit -m "feat: ChallengeResult success signal, first used by Progress Bar"
```

---

## Owner actions (outside the repo)

1. Cloudflare → `randomly.online` → DNS → add `CNAME`, name `qa`, target `d-xan.github.io`, **DNS only**.
2. GitHub → repo → Settings → Pages → Custom domain `qa.randomly.online` → wait for check → **Enforce HTTPS**.
3. Then push `main`. Verify `https://qa.randomly.online/#/practice` loads and the old github.io URL redirects.
