import React, { useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult } from '@/components/ui/ChallengeResult';
import { moveItem, HOLD_DELAY_MS, HOLD_TOLERANCE_PX, HOLD_MIN_MOVES } from '@/utils/reorder';

const SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border';
const H2 = 'text-xl font-bold mb-6 border-b border-border pb-2';
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
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Sortable Lists</h1>
        <p className="text-slate-500">Practice drag and drop the way real apps build it: native HTML5 drag events, a press-and-hold sortable list and a Kanban board.</p>
        <HintAccordion hints={[
          "<strong>Playwright:</strong> <code>source.dragTo(target)</code> works for HTML5 drag and drop. For the press-and-hold list use <code>page.mouse</code>: down, wait about 300 ms, then <code>move(x, y, { steps: 10 })</code> and up.",
          "<strong>Selenium:</strong> <code>Actions.dragAndDrop</code> does not fire HTML5 <code>dragstart</code>/<code>drop</code> events. Dispatch them with JavaScript and a <code>DataTransfer</code> object. For the hold list use <code>clickAndHold().pause(Duration.ofMillis(300))</code>.",
          "<strong>Cypress:</strong> Use <code>trigger('dragstart', { dataTransfer })</code> and <code>trigger('drop', { dataTransfer })</code> with the same DataTransfer object.",
          "Re-read the list after every move: the items are re-rendered and the order you saw before is stale."
        ]} />
      </div>

      <section className={SECTION}>
        <h2 className={H2}>1. HTML5 Drag and Drop</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="html5" tasks={[
          {
            title: "Put the steps in order",
            description: "Drag the steps so they read Step 1 to Step 5 from top to bottom. Dropping an item on another puts it in that position.",
            positive: ["When the list reads Step 1 to Step 5 the result turns green."],
            negative: ["Selenium's dragAndDrop leaves the list unchanged."]
          }
        ]} /></div>
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
      </section>

      <section className={SECTION}>
        <h2 className={H2}>2. Press-and-Hold Sortable</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="hold" tasks={[
          {
            title: "Sort A to E with press and hold",
            description: "Press an item and hold it still for a moment before moving. Release it over the place it should go.",
            positive: ["Holding, moving and releasing reorders the list.", "When it reads A to E the result turns green."],
            negative: ["Moving straight away (a quick drag) does nothing.", "Jumping to the target in a single move does nothing either."]
          }
        ]} /></div>
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
      </section>

      <section className={SECTION}>
        <h2 className={H2}>3. Kanban Board</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="kanban" tasks={[
          {
            title: "Move two cards",
            description: "Move 'Write tests' to Done and 'Fix bug #42' to In Progress. Leave the other cards where they are.",
            positive: ["With both cards moved and nothing else changed, the result turns green."],
            negative: ["Moving any other card keeps the result pending."]
          }
        ]} /></div>
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
      </section>

      <SolutionTabs challengeId="sortable" number={4} />
    </div>
  );
}
