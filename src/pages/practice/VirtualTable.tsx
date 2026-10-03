import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult } from '@/components/ui/ChallengeResult';
import { makeRows, ROW_HEIGHT, VIEWPORT_HEIGHT, TOP_SCORER_ID, type VirtualRow } from '@/data/virtualRows';

const SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border';
const H2 = 'text-xl font-bold mb-6 border-b border-border pb-2';
const COLS = 'grid grid-cols-[3.5rem_1fr_4.5rem_4.5rem] sm:grid-cols-[4rem_1fr_1.5fr_5rem_5rem] items-center gap-2 px-3';
const OVERSCAN = 5;
const FIND_ID = 7342;

type Sort = 'none' | 'descending' | 'ascending';
const ROWS = makeRows();

export default function VirtualTable() {
  const [scrollTop, setScrollTop] = useState(0);
  const [sort, setSort] = useState<Sort>('none');
  const [selected, setSelected] = useState<VirtualRow | null>(null);
  const [found, setFound] = useState(false);
  const [foundTop, setFoundTop] = useState(false);

  const rows = useMemo(() => {
    if (sort === 'none') return ROWS;
    const dir = sort === 'descending' ? -1 : 1;
    return [...ROWS].sort((a, b) => dir * (a.score - b.score));
  }, [sort]);

  const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const last = Math.min(rows.length - 1, Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN);
  const visible = rows.slice(first, last + 1);

  const select = (row: VirtualRow) => {
    setSelected(row);
    if (row.id === FIND_ID) setFound(true);
    if (row.id === TOP_SCORER_ID) setFoundTop(true);
  };

  const cycleSort = () => setSort((s) => (s === 'descending' ? 'ascending' : 'descending'));
  const SortIcon = sort === 'descending' ? ArrowDown : sort === 'ascending' ? ArrowUp : ArrowUpDown;

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Virtual Table</h1>
        <p className="text-slate-500">This table has 10,000 rows but only keeps about 20 in the page at a time, like the data grids in real admin tools. Rows that are scrolled away do not exist in the DOM.</p>
        <HintAccordion hints={[
          "A locator such as <code>nth(7341)</code> finds nothing: row 7342 is not in the DOM until it is scrolled into view.",
          "Every row is 40 px tall, so you can jump straight there: set the grid's <code>scrollTop</code> to <code>(7342 - 1) * 40</code>, then wait for <code>[data-row-id=\"7342\"]</code>.",
          "If you do not know the position, scroll in steps of one screen and check for the row after each step until it appears or you reach the bottom.",
          "<strong>Cypress:</strong> <code>cy.get('#virtual-grid').scrollTo(0, 7341 * 40)</code>. <strong>Selenium:</strong> run <code>arguments[0].scrollTop = …</code> with <code>executeScript</code>."
        ]} />
      </div>

      <section className={SECTION}>
        <h2 className={H2}>1. Find a Row That Is Not in the DOM</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="find" tasks={[
          {
            title: "Select row #7342",
            description: "Bring row 7342 into view and press its Select button. Its email appears below the table.",
            positive: ["Selecting row 7342 shows its email and the result turns green."],
            negative: ["Only around 20 rows exist in the DOM at once."],
            hint: "Rows are 40 px tall: set the grid's scrollTop to (7342 - 1) × 40, then wait for [data-row-id=\"7342\"]."
          }
        ]} /></div>
        <ChallengeResult testId="result-find" state={found ? 'success' : 'pending'} message={found ? 'Row 7342 selected' : 'Select row 7342'} />
      </section>

      <section className={SECTION}>
        <h2 className={H2}>2. Sort Then Pick</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="sort" tasks={[
          {
            title: "Select the top scorer",
            description: "Sort by score so the highest score is first, then select that row.",
            positive: ["The first click on Score sorts from highest to lowest.", "Selecting the top row turns the result green."],
            negative: ["Without sorting, the top scorer is thousands of rows down."],
            hint: "Click the Score header once (highest first), then select the first rendered row."
          }
        ]} /></div>
        <ChallengeResult testId="result-sort" state={foundTop ? 'success' : 'pending'} message={foundTop ? 'Top scorer selected' : 'Select the row with the highest score'} />
      </section>

      <section className={SECTION}>
        <h2 className={H2}>3. The Table</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className={`${COLS} h-10 bg-slate-50 border-b border-border text-xs font-semibold uppercase text-slate-500`}>
            <span>ID</span>
            <span>Name</span>
            <span className="hidden sm:block">Email</span>
            <button
              type="button"
              id="sort-score"
              data-testid="sort-score"
              role="columnheader"
              aria-sort={sort}
              onClick={cycleSort}
              className="flex items-center gap-1 uppercase hover:text-slate-900"
            >
              Score <SortIcon className="h-3 w-3" aria-hidden="true" />
            </button>
            <span className="sr-only">Action</span>
          </div>
          <div
            id="virtual-grid"
            data-testid="virtual-grid"
            role="grid"
            aria-rowcount={rows.length}
            aria-label="People"
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            style={{ height: VIEWPORT_HEIGHT }}
            className="relative overflow-y-auto"
          >
            <div style={{ height: rows.length * ROW_HEIGHT }} className="relative">
              {visible.map((row, i) => {
                const index = first + i;
                return (
                  <div
                    key={row.id}
                    role="row"
                    data-row-id={row.id}
                    aria-rowindex={index + 1}
                    aria-selected={selected?.id === row.id}
                    style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT }}
                    className={`${COLS} absolute inset-x-0 border-b border-slate-100 text-sm ${selected?.id === row.id ? 'bg-primary/10' : ''}`}
                  >
                    <span role="gridcell" className="text-slate-500">{row.id}</span>
                    <span role="gridcell" className="truncate">{row.name}</span>
                    <span role="gridcell" className="hidden sm:block truncate text-slate-500">{row.email}</span>
                    <span role="gridcell">{row.score.toLocaleString('en-US')}</span>
                    <span role="gridcell">
                      <button type="button" onClick={() => select(row)} className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-slate-50">Select</button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">Selected: <strong id="selected-email" data-testid="selected-email">{selected?.email ?? ''}</strong></p>
      </section>

      <SolutionTabs challengeId="virtual-table" number={4} />
    </div>
  );
}
