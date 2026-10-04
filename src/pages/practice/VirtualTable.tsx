import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { ChallengeResult } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { makeRows, ROW_HEIGHT, VIEWPORT_HEIGHT, TOP_SCORER_ID, type VirtualRow } from '@/data/virtualRows';

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

  const gridRef = useRef<HTMLDivElement>(null);
  // A new sort starts at the top, as most data grids do.
  const cycleSort = () => {
    setSort((s) => (s === 'descending' ? 'ascending' : 'descending'));
    if (gridRef.current) gridRef.current.scrollTop = 0;
    setScrollTop(0);
  };
  const SortIcon = sort === 'descending' ? ArrowDown : sort === 'ascending' ? ArrowUp : ArrowUpDown;

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Virtual Table</h1>
        <p className="text-slate-500">A table of 10,000 rows that only renders the twenty or so on screen. Rows that are not visible do not exist in the DOM, so you have to scroll them into being. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="Find a Row That Is Not in the DOM">
        <PracticeElement
          id="find" label="Row that is not in the DOM"
          goal={"Bring row 7342 into view and press its Select button. Its email appears below the table."}
          pass={["Selecting row 7342 shows its email and the result turns green."]}
          fail={["Only around 20 rows exist in the DOM at once."]}
          hint={"Rows are 40 px tall: set the grid's scrollTop to (7342 - 1) × 40, then wait for [data-row-id=\"7342\"]."}
          code={{
            playwright: "const grid = page.locator('#virtual-grid');\nawait grid.evaluate((el) => { el.scrollTop = (7342 - 1) * 40; }); // rows are 40 px tall\nawait grid.locator('[data-row-id=\"7342\"]').getByRole('button', { name: 'Select' }).click();\nawait expect(page.locator('#selected-email')).toHaveText(/7342@example\\.test$/);",
            seleniumJava: "WebElement grid = driver.findElement(By.id(\"virtual-grid\"));\n((JavascriptExecutor) driver).executeScript(\"arguments[0].scrollTop = (7342 - 1) * 40\", grid);\nwait.until(ExpectedConditions.elementToBeClickable(\n  By.cssSelector(\"#virtual-grid [data-row-id='7342'] button\"))).click();",
            seleniumPython: "grid = driver.find_element(By.ID, \"virtual-grid\")\ndriver.execute_script(\"arguments[0].scrollTop = (7342 - 1) * 40\", grid)\nwait.until(EC.element_to_be_clickable(\n    (By.CSS_SELECTOR, \"#virtual-grid [data-row-id='7342'] button\"))).click()",
            cypress: "cy.get('#virtual-grid').scrollTo(0, (7342 - 1) * 40);\ncy.get('#virtual-grid [data-row-id=\"7342\"]').contains('button', 'Select').click();\ncy.get('#selected-email').should('contain', '7342@example.test');",
          }}
          done={found}
        >
          <ChallengeResult testId="result-find" state={found ? 'success' : 'pending'} message={found ? 'Row 7342 selected' : 'Select row 7342'} />
        </PracticeElement>
      </Section>

      <Section n={2} title="Sort Then Pick">
        <PracticeElement
          id="sort" label="Sort, then pick"
          goal={"Sort by score so the highest score is first, then select that row."}
          pass={["The first click on Score sorts from highest to lowest.","Selecting the top row turns the result green."]}
          fail={["Without sorting, the top scorer is thousands of rows down."]}
          hint={"Click the Score header once (highest first), then select the first rendered row."}
          code={{
            playwright: "await page.locator('#sort-score').click();\nawait expect(page.locator('#sort-score')).toHaveAttribute('aria-sort', 'descending');\nawait page.locator('#virtual-grid [data-row-id]').first().getByRole('button', { name: 'Select' }).click();",
            seleniumJava: "driver.findElement(By.id(\"sort-score\")).click();\nwait.until(ExpectedConditions.attributeToBe(By.id(\"sort-score\"), \"aria-sort\", \"descending\"));\ndriver.findElement(By.cssSelector(\"#virtual-grid [data-row-id] button\")).click();",
            seleniumPython: "driver.find_element(By.ID, \"sort-score\").click()\nwait.until(lambda d: d.find_element(By.ID, \"sort-score\").get_attribute(\"aria-sort\") == \"descending\")\ndriver.find_element(By.CSS_SELECTOR, \"#virtual-grid [data-row-id] button\").click()",
            cypress: "cy.get('#sort-score').click().should('have.attr', 'aria-sort', 'descending');\ncy.get('#virtual-grid [data-row-id]').first().contains('button', 'Select').click();",
          }}
          done={foundTop}
        >
          <ChallengeResult testId="result-sort" state={foundTop ? 'success' : 'pending'} message={foundTop ? 'Top scorer selected' : 'Select the row with the highest score'} />
        </PracticeElement>
      </Section>

      <Section n={3} title="The Table">
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
            ref={gridRef}
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
      </Section>

      <SolutionTabs challengeId="virtual-table" number={4} />
    </div>
  );
}
