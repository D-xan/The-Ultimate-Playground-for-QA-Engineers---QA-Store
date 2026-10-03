import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
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
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bug Hunt</h1>
        <p className="text-slate-500">Switch on Bug Hunt and six real defects appear in the QA Store. Explore the store like a tester, then report each bug you find.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> Assert computed values, not just presence: read the cart subtotal with <code>getText()</code> and compare it to unit price × quantity.",
          "<strong>Playwright:</strong> Use <code>expect(locator).toHaveText()</code> on totals after changing quantities, and check sort order by reading every card's price with <code>allTextContents()</code>.",
          "<strong>Cypress:</strong> Chain <code>cy.get(...).invoke('text')</code> and parse the number before asserting; try the same search in upper and lower case.",
          "Check boundaries and negative cases too: remove a line that is not the first one, and try an email address with no <code>@</code>."
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Turn on Bug Hunt</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="setup" tasks={[
          {
            title: "Switch on Bug Hunt and explore the store",
            description: "Turn on the toggle, open the QA Store and exercise the cart, product lists, search and checkout.",
            positive: ["With Bug Hunt on, at least one store feature behaves differently from its label or spec."],
            negative: ["With Bug Hunt off, the store behaves correctly: the cart subtotal equals price × quantity."]
          }
        ]} /></div>
        <div className="space-y-4">
          <label htmlFor="bug-hunt-toggle" className="flex items-center gap-3 text-sm font-medium text-slate-900">
            <input
              type="checkbox"
              id="bug-hunt-toggle"
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
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Report a bug</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="report" tasks={[
          {
            title: "Report each bug you found",
            description: "Choose the area and the symptom you observed. Some symptoms describe correct behaviour, so only report what you saw.",
            positive: ["Reporting a planted bug shows 'Confirmed bug!' and adds it to the scoreboard."],
            negative: ["Reporting correct behaviour, or the same bug twice, is rejected."]
          }
        ]} /></div>
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
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Scoreboard</h2>
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
      </section>
    </div>
  );
}
