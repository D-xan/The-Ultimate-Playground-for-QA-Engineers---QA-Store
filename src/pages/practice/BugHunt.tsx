import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { useChallengeMode } from '@/store/useChallengeMode';
import { PLANTED_BUGS, DECOY_SYMPTOMS, type PlantedBug } from '@/data/bugCatalog';
import { matchReport } from '@/utils/bugHunt';

type Area = PlantedBug['area'];
const AREAS: Area[] = ['Cart', 'Products', 'Search', 'Checkout'];

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const selectClass =
  'h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary';

export default function BugHunt() {
  const bugHunt = useChallengeMode((s) => s.bugHunt);
  const foundBugs = useChallengeMode((s) => s.foundBugs);
  const updateSettings = useChallengeMode((s) => s.updateSettings);
  const reportFound = useChallengeMode((s) => s.reportFound);
  const resetBugHunt = useChallengeMode((s) => s.resetBugHunt);

  // Planted and decoy symptoms, shuffled once per mount.
  const [symptoms] = useState(() => shuffle([...PLANTED_BUGS, ...DECOY_SYMPTOMS]));
  const [area, setArea] = useState<Area>('Cart');
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState<ResultState>('pending');
  const [message, setMessage] = useState('Pick an area and a symptom, then report it');
  const [revealed, setRevealed] = useState(false);

  const areaSymptoms = symptoms.filter((s) => s.area === area);

  const report = () => {
    const bug = matchReport(area, symptom);
    if (bug && !foundBugs.includes(bug.id)) {
      reportFound(bug.id);
      setResult('success');
      setMessage('Confirmed bug!');
    } else {
      setResult('failure');
      setMessage('Not a planted bug (or already reported)');
    }
  };

  const reset = () => {
    resetBugHunt();
    setRevealed(false);
    setResult('pending');
    setMessage('Pick an area and a symptom, then report it');
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bug Hunt</h1>
        <p className="text-slate-500">Switch on Bug Hunt and six real defects appear in the QA Store. Explore the store like a tester, write checks that catch them, then report each bug you find. Each task ticks itself when the page sees it done.</p>
      </div>

      <Section n={1} title="Turn on Bug Hunt">
        <PracticeElement
          id="setup" label="Switch on Bug Hunt"
          goal={"Turn on the toggle, then open the QA Store and exercise the cart, product lists, search and checkout."}
          pass={["With Bug Hunt on, at least one store feature behaves differently from its label or spec."]}
          fail={["With Bug Hunt off, the store behaves correctly: the cart subtotal equals price × quantity."]}
          hint={"Assert computed values, not just presence: compare the cart subtotal with unit price × quantity, and read every price to check a sort."}
          code={{
            playwright: "await page.locator('#bug-hunt-toggle').check();\nawait page.locator('#open-store').click();\n// e.g. after adding 2 of a product to the cart:\nconst unit = Number((await page.getByTestId('cart-unit-price').first().innerText()).replace(/[^\\d.]/g, ''));\nawait expect(page.getByTestId('cart-subtotal')).toContainText((unit * 2).toFixed(2));",
            seleniumJava: "WebElement toggle = driver.findElement(By.id(\"bug-hunt-toggle\"));\nif (!toggle.isSelected()) toggle.click();\ndriver.findElement(By.id(\"open-store\")).click();\n// then check totals, sorting, search and checkout against what they should be",
            seleniumPython: "toggle = driver.find_element(By.ID, \"bug-hunt-toggle\")\nif not toggle.is_selected():\n    toggle.click()\ndriver.find_element(By.ID, \"open-store\").click()\n# then check totals, sorting, search and checkout against what they should be",
            cypress: "cy.get('#bug-hunt-toggle').check();\ncy.get('#open-store').click();\n// then check totals, sorting, search and checkout against what they should be",
          }}
          done={bugHunt}
        >
          <div className="space-y-4">
            <label htmlFor="bug-hunt-toggle" className="flex items-center gap-3 text-sm font-medium text-slate-900">
              <input
                type="checkbox"
                id="bug-hunt-toggle"
                data-no-persist
                className="h-4 w-4 accent-primary"
                checked={bugHunt}
                onChange={(e) => updateSettings({ bugHunt: e.target.checked })}
              />
              Bug Hunt mode {bugHunt ? 'on' : 'off'}
            </label>
            <Link to="/" id="open-store" className="inline-block text-sm font-medium text-primary hover:underline">
              Open the QA Store →
            </Link>
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Report a bug">
        <PracticeElement
          id="report" label="Report every bug"
          goal={"For each defect you found, choose its area and the symptom you saw, then press Report. The task ticks once all six are on the scoreboard."}
          pass={["Reporting a planted bug shows 'Confirmed bug!' and adds it to the scoreboard."]}
          fail={["Reporting correct behaviour, or the same bug twice, is rejected."]}
          hint={""}
          code={{
            playwright: "async function report(area: string, symptom: string) {\n  await page.locator('#bug-area').selectOption(area);\n  await page.locator('#bug-symptom').selectOption(symptom);\n  await page.locator('#report-bug').click();\n  await expect(page.getByTestId('result-report')).toHaveAttribute('data-state', 'success');\n}",
            seleniumJava: "void report(String area, String symptom) {\n  new Select(driver.findElement(By.id(\"bug-area\"))).selectByValue(area);\n  new Select(driver.findElement(By.id(\"bug-symptom\"))).selectByValue(symptom);\n  driver.findElement(By.id(\"report-bug\")).click();\n}",
            seleniumPython: "def report(area, symptom):\n    Select(driver.find_element(By.ID, \"bug-area\")).select_by_value(area)\n    Select(driver.find_element(By.ID, \"bug-symptom\")).select_by_value(symptom)\n    driver.find_element(By.ID, \"report-bug\").click()",
            cypress: "const report = (area, symptom) => {\n  cy.get('#bug-area').select(area);\n  cy.get('#bug-symptom').select(symptom);\n  cy.get('#report-bug').click();\n  cy.get('[data-testid=result-report]').should('have.attr', 'data-state', 'success');\n};",
          }}
          done={foundBugs.length === PLANTED_BUGS.length}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Area
                <select
                  id="bug-area"
                  className={`${selectClass} mt-1`}
                  value={area}
                  onChange={(e) => { setArea(e.target.value as Area); setSymptom(''); }}
                >
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Symptom
                <select
                  id="bug-symptom"
                  className={`${selectClass} mt-1`}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                >
                  <option value="">Choose a symptom…</option>
                  {areaSymptoms.map((s) => <option key={s.symptom} value={s.symptom}>{s.symptom}</option>)}
                </select>
              </label>
            </div>
            <Button id="report-bug" onClick={report}>Report bug</Button>
            <ChallengeResult testId="result-report" state={result} message={message} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Scoreboard">
        <div className="space-y-4">
          <p id="bugs-found" className="text-2xl font-bold text-slate-900">{foundBugs.length} / {PLANTED_BUGS.length} found</p>
          {foundBugs.length > 0 && (
            <ul id="found-list" className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {PLANTED_BUGS.filter((b) => foundBugs.includes(b.id)).map((b) => (
                <li key={b.id}><strong>{b.area}:</strong> {b.symptom}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            <Button id="reveal-bugs" variant="outline" onClick={() => setRevealed(true)}>Reveal all bugs</Button>
            <Button id="reset-bug-hunt" variant="outline" onClick={reset}>Reset Bug Hunt</Button>
          </div>
          {revealed && (
            <ul id="all-bugs" className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {PLANTED_BUGS.map((b) => (
                <li key={b.id}><strong>{b.area}:</strong> {b.symptom}</li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}
