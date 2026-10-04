import React, { useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { moveItem, HOLD_DELAY_MS, HOLD_TOLERANCE_PX, HOLD_MIN_MOVES } from '@/utils/reorder';

const ITEM = 'flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium select-none';

const HTML5_START = ['Step 3', 'Step 1', 'Step 5', 'Step 2', 'Step 4'];
const HOLD_START = ['C', 'A', 'E', 'B', 'D'];
type Column = 'todo' | 'progress' | 'done';
const KANBAN_START: Record<Column, string[]> = {
  todo: ['Write tests', 'Fix bug #42', 'Update docs'],
  progress: ['Review PR'],
  done: ['Set up CI'],
};
const COLUMNS: { id: Column; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const isSorted = (list: string[]) => list.every((v, i) => i === 0 || list[i - 1].localeCompare(v, 'en', { numeric: true }) < 0);
const sameSet = (a: string[], b: string[]) => a.length === b.length && b.every((x) => a.includes(x));

interface HoldDrag { from: number; startX: number; startY: number; active: boolean; over: number; moves: number; timer: number }

/** Keeps pointer events coming while the pointer leaves the element. Synthetic events (Cypress, dispatchEvent) have no active pointer to capture. */
function capturePointer(e: React.PointerEvent<Element>) {
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not a real pointer */ }
}

export default function SortableLists() {
  const [html5, setHtml5] = useState(HTML5_START);
  const [hold, setHold] = useState(HOLD_START);
  const [holdOver, setHoldOver] = useState<number | null>(null);
  const [kanban, setKanban] = useState(KANBAN_START);
  const drag = useRef<HoldDrag | null>(null);
  const holdRefs = useRef<(HTMLLIElement | null)[]>([]);

  const onHtml5Drop = (e: React.DragEvent, to: number) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(from)) setHtml5((list) => moveItem(list, from, to));
  };

  const indexAt = (clientY: number) => {
    const i = holdRefs.current.findIndex((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientY >= r.top && clientY <= r.bottom;
    });
    return i;
  };

  const onHoldDown = (e: React.PointerEvent<HTMLLIElement>, from: number) => {
    capturePointer(e);
    const state: HoldDrag = { from, startX: e.clientX, startY: e.clientY, active: false, over: from, moves: 0, timer: 0 };
    state.timer = window.setTimeout(() => { state.active = true; setHoldOver(from); }, HOLD_DELAY_MS);
    drag.current = state;
  };

  const onHoldMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > HOLD_TOLERANCE_PX) {
        clearTimeout(d.timer);
        drag.current = null;
      }
      return;
    }
    d.moves += 1;
    const i = indexAt(e.clientY);
    if (i >= 0) { d.over = i; setHoldOver(i); }
  };

  const onHoldUp = () => {
    const d = drag.current;
    drag.current = null;
    setHoldOver(null);
    if (!d) return;
    clearTimeout(d.timer);
    if (d.active && d.moves >= HOLD_MIN_MOVES) setHold((list) => moveItem(list, d.from, d.over));
  };

  const onCardDrop = (e: React.DragEvent, to: Column) => {
    e.preventDefault();
    const card = e.dataTransfer.getData('text/plain');
    setKanban((k) => {
      const from = (Object.keys(k) as Column[]).find((c) => k[c].includes(card));
      if (!from || from === to) return k;
      return { ...k, [from]: k[from].filter((c) => c !== card), [to]: [...k[to], card] };
    });
  };

  const kanbanDone = sameSet(kanban.todo, ['Update docs']) && sameSet(kanban.progress, ['Review PR', 'Fix bug #42']) && sameSet(kanban.done, ['Set up CI', 'Write tests']);

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Sortable Lists</h1>
        <p className="text-slate-500">Three kinds of drag: native HTML5 drag and drop, a press-and-hold list that ignores quick drags, and a Kanban board. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="HTML5 Drag and Drop">
        <PracticeElement
          id="html5" label="HTML5 drag and drop"
          goal={"Drag the steps so they read Step 1 to Step 5 from top to bottom. Dropping an item on another puts it in that position."}
          pass={["When the list reads Step 1 to Step 5 the result turns green."]}
          fail={["Selenium's dragAndDrop leaves the list unchanged."]}
          hint={"Drop each step onto the item that is currently in its target position, starting with Step 1. Re-read the list after every drop."}
          code={{
            playwright: "const items = page.getByTestId('html5-item');\nconst goal = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];\nfor (let i = 0; i < goal.length; i++) {\n  if ((await items.nth(i).innerText()).trim() === goal[i]) continue;\n  await items.filter({ hasText: goal[i] }).dragTo(items.nth(i));\n}",
            seleniumJava: "// Selenium's dragAndDrop fires no HTML5 drag events, so fire them in the page\nstatic final String HTML5_DND = \"const [src, dst] = arguments; const dt = new DataTransfer();\"\n  + \"const fire = (el, t) => el.dispatchEvent(new DragEvent(t, {dataTransfer: dt, bubbles: true, cancelable: true}));\"\n  + \"fire(src, 'dragstart'); fire(dst, 'dragenter'); fire(dst, 'dragover'); fire(dst, 'drop'); fire(src, 'dragend');\";\n\nBy items = By.cssSelector(\"[data-testid='html5-item']\");\nString[] goal = {\"Step 1\", \"Step 2\", \"Step 3\", \"Step 4\", \"Step 5\"};\nfor (int i = 0; i < goal.length; i++) {\n  List<WebElement> now = driver.findElements(items);\n  if (now.get(i).getText().trim().equals(goal[i])) continue;\n  final String want = goal[i];\n  WebElement source = now.stream().filter(e -> e.getText().trim().equals(want)).findFirst().get();\n  ((JavascriptExecutor) driver).executeScript(HTML5_DND, source, now.get(i));\n}",
            seleniumPython: "HTML5_DND = \"\"\"const [src, dst] = arguments; const dt = new DataTransfer();\nconst fire = (el, t) => el.dispatchEvent(new DragEvent(t, {dataTransfer: dt, bubbles: true, cancelable: true}));\nfire(src, 'dragstart'); fire(dst, 'dragenter'); fire(dst, 'dragover'); fire(dst, 'drop'); fire(src, 'dragend');\"\"\"\n\ngoal = [\"Step 1\", \"Step 2\", \"Step 3\", \"Step 4\", \"Step 5\"]\nfor i, want in enumerate(goal):\n    items = driver.find_elements(By.CSS_SELECTOR, \"[data-testid='html5-item']\")\n    if items[i].text.strip() == want:\n        continue\n    source = next(e for e in items if e.text.strip() == want)\n    driver.execute_script(HTML5_DND, source, items[i])",
            cypress: "// accepts a selector or a jQuery element\nconst el = (x) => (typeof x === 'string' ? cy.get(x) : cy.wrap(x));\nconst html5Drag = (source, target) => cy.window().then((win) => {\n  const dataTransfer = new win.DataTransfer();\n  el(source).trigger('dragstart', { dataTransfer });\n  el(target).trigger('dragover', { dataTransfer }).trigger('drop', { dataTransfer });\n});\n\n['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'].forEach((want, i) => {\n  cy.get('[data-testid=html5-item]').then(($items) => {\n    if ($items.eq(i).text().trim() === want) return;\n    html5Drag($items.filter((_, el) => el.textContent.trim() === want), $items.eq(i));\n  });\n});",
          }}
          done={isSorted(html5)}
        >
          <ul id="html5-list" data-testid="html5-list" className="space-y-2 max-w-sm mb-4">
            {html5.map((item, i) => (
              <li
                key={item}
                data-testid="html5-item"
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onHtml5Drop(e, i)}
                className={`${ITEM} cursor-grab`}
              >
                <GripVertical className="h-4 w-4 text-slate-400" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
          <div className="space-y-4">
            <Button id="reset-html5" data-testid="reset-html5" variant="outline" onClick={() => setHtml5(HTML5_START)}>Reset</Button>
            <ChallengeResult testId="result-html5" state={isSorted(html5) ? 'success' : 'pending'} message={isSorted(html5) ? 'Steps are in order' : 'Sort the steps'} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Press-and-Hold Sortable">
        <PracticeElement
          id="hold" label="Press-and-hold sortable"
          goal={"Press an item and hold it still for a moment before moving. Release it over the place it should go."}
          pass={["Holding, moving and releasing reorders the list.","When it reads A to E the result turns green."]}
          fail={["Moving straight away (a quick drag) does nothing.","Jumping to the target in a single move does nothing either."]}
          hint={"Press, wait about 300 ms without moving, then move to the target in several small steps before releasing."}
          code={{
            playwright: "// Press, hold still past 250 ms, then move in small steps\nasync function holdDrag(source, target) {\n  await source.scrollIntoViewIfNeeded();\n  const s = (await source.boundingBox())!, t = (await target.boundingBox())!;\n  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);\n  await page.mouse.down();\n  await page.waitForTimeout(300);\n  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 });\n  await page.mouse.up();\n}\nconst items = page.getByTestId('hold-item');\nfor (const [i, want] of ['A', 'B', 'C', 'D', 'E'].entries()) {\n  if ((await items.nth(i).innerText()).trim() === want) continue;\n  await holdDrag(items.filter({ hasText: new RegExp(`^${want}$`) }), items.nth(i));\n}",
            seleniumJava: "String[] goal = {\"A\", \"B\", \"C\", \"D\", \"E\"};\nfor (int i = 0; i < goal.length; i++) {\n  List<WebElement> items = driver.findElements(By.cssSelector(\"[data-testid='hold-item']\"));\n  if (items.get(i).getText().trim().equals(goal[i])) continue;\n  final String want = goal[i];\n  WebElement source = items.stream().filter(e -> e.getText().trim().equals(want)).findFirst().get();\n  int dy = items.get(i).getRect().getY() - source.getRect().getY();\n  Actions a = new Actions(driver).clickAndHold(source).pause(Duration.ofMillis(300));\n  for (int step = 0; step < 5; step++) a.moveByOffset(0, dy / 5);\n  a.release().perform();\n}",
            seleniumPython: "for i, want in enumerate(\"ABCDE\"):\n    items = driver.find_elements(By.CSS_SELECTOR, \"[data-testid='hold-item']\")\n    if items[i].text.strip() == want:\n        continue\n    source = next(e for e in items if e.text.strip() == want)\n    dy = items[i].rect[\"y\"] - source.rect[\"y\"]\n    chain = ActionChains(driver).click_and_hold(source).pause(0.3)\n    for _ in range(5):\n        chain.move_by_offset(0, dy / 5)\n    chain.release().perform()",
            cypress: "// Pointer events: press, wait past the hold delay, move, release\n'ABCDE'.split('').forEach((want, i) => {\n  cy.get('[data-testid=hold-item]').then(($items) => {\n    if ($items.eq(i).text().trim() === want) return;\n    cy.contains('[data-testid=hold-item]', new RegExp(`^${want}$`)).trigger('pointerdown', { pointerId: 1 });\n    cy.wait(300);\n    for (let s = 0; s < 3; s++) cy.wrap($items.eq(i)).trigger('pointermove', { pointerId: 1 });\n    cy.wrap($items.eq(i)).trigger('pointerup', { pointerId: 1 });\n  });\n});",
          }}
          done={isSorted(hold)}
        >
          <ul id="hold-list" data-testid="hold-list" className="space-y-2 max-w-sm mb-4">
            {hold.map((item, i) => (
              <li
                key={item}
                ref={(el) => { holdRefs.current[i] = el; }}
                data-testid="hold-item"
                onPointerDown={(e) => onHoldDown(e, i)}
                onPointerMove={onHoldMove}
                onPointerUp={onHoldUp}
                onPointerCancel={onHoldUp}
                style={{ touchAction: 'none' }}
                className={`${ITEM} cursor-grab ${holdOver === i ? 'ring-2 ring-primary' : ''}`}
              >
                <GripVertical className="h-4 w-4 text-slate-400" aria-hidden="true" /><span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-4">
            <Button id="reset-hold" data-testid="reset-hold" variant="outline" onClick={() => setHold(HOLD_START)}>Reset</Button>
            <ChallengeResult testId="result-hold" state={isSorted(hold) ? 'success' : 'pending'} message={isSorted(hold) ? 'Letters are in order' : 'Sort the letters'} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Kanban Board">
        <PracticeElement
          id="kanban" label="Kanban board"
          goal={"Move 'Write tests' to Done and 'Fix bug #42' to In Progress. Leave the other cards where they are."}
          pass={["With both cards moved and nothing else changed, the result turns green."]}
          fail={["Moving any other card keeps the result pending."]}
          hint={"Drop each card on the column itself, then check the column's text."}
          code={{
            playwright: "await page.getByTestId('card').filter({ hasText: 'Write tests' }).dragTo(page.locator('#col-done'));\nawait page.getByTestId('card').filter({ hasText: 'Fix bug #42' }).dragTo(page.locator('#col-progress'));\nawait expect(page.locator('#col-done')).toContainText('Write tests');",
            seleniumJava: "// Selenium's dragAndDrop fires no HTML5 drag events, so fire them in the page\nstatic final String HTML5_DND = \"const [src, dst] = arguments; const dt = new DataTransfer();\"\n  + \"const fire = (el, t) => el.dispatchEvent(new DragEvent(t, {dataTransfer: dt, bubbles: true, cancelable: true}));\"\n  + \"fire(src, 'dragstart'); fire(dst, 'dragenter'); fire(dst, 'dragover'); fire(dst, 'drop'); fire(src, 'dragend');\";\n\nWebElement tests = driver.findElement(By.xpath(\"//*[@data-testid='card'][normalize-space()='Write tests']\"));\nWebElement bug = driver.findElement(By.xpath(\"//*[@data-testid='card'][normalize-space()='Fix bug #42']\"));\n((JavascriptExecutor) driver).executeScript(HTML5_DND, tests, driver.findElement(By.id(\"col-done\")));\n((JavascriptExecutor) driver).executeScript(HTML5_DND, bug, driver.findElement(By.id(\"col-progress\")));",
            seleniumPython: "HTML5_DND = \"\"\"const [src, dst] = arguments; const dt = new DataTransfer();\nconst fire = (el, t) => el.dispatchEvent(new DragEvent(t, {dataTransfer: dt, bubbles: true, cancelable: true}));\nfire(src, 'dragstart'); fire(dst, 'dragenter'); fire(dst, 'dragover'); fire(dst, 'drop'); fire(src, 'dragend');\"\"\"\n\ncard = lambda text: driver.find_element(By.XPATH, f\"//*[@data-testid='card'][normalize-space()='{text}']\")\ndriver.execute_script(HTML5_DND, card(\"Write tests\"), driver.find_element(By.ID, \"col-done\"))\ndriver.execute_script(HTML5_DND, card(\"Fix bug #42\"), driver.find_element(By.ID, \"col-progress\"))",
            cypress: "// accepts a selector or a jQuery element\nconst el = (x) => (typeof x === 'string' ? cy.get(x) : cy.wrap(x));\nconst html5Drag = (source, target) => cy.window().then((win) => {\n  const dataTransfer = new win.DataTransfer();\n  el(source).trigger('dragstart', { dataTransfer });\n  el(target).trigger('dragover', { dataTransfer }).trigger('drop', { dataTransfer });\n});\n\nhtml5Drag(Cypress.$('[data-testid=card]:contains(\"Write tests\")'), '#col-done');\nhtml5Drag(Cypress.$('[data-testid=card]:contains(\"Fix bug #42\")'), '#col-progress');",
          }}
          done={kanbanDone}
        >
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                id={`col-${col.id}`}
                data-testid={`col-${col.id}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onCardDrop(e, col.id)}
                className="min-h-32 rounded-xl bg-slate-50 border border-border p-3 space-y-2"
              >
                <h3 className="text-sm font-semibold text-slate-600">{col.title}</h3>
                {kanban[col.id].map((card) => (
                  <div
                    key={card}
                    data-testid="card"
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', card); e.dataTransfer.effectAllowed = 'move'; }}
                    className={`${ITEM} cursor-grab`}
                  >
                    {card}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Button id="reset-kanban" data-testid="reset-kanban" variant="outline" onClick={() => setKanban(KANBAN_START)}>Reset</Button>
            <ChallengeResult testId="result-kanban" state={kanbanDone ? 'success' : 'pending'} message={kanbanDone ? 'Board is up to date' : 'Move the two cards'} />
          </div>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="sortable" number={4} />
    </div>
  );
}
