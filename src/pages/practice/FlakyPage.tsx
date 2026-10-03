import React, { useEffect, useRef, useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';

const ITEMS = ['Order #1001', 'Order #1002', 'Order #1003'];
const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export default function FlakyPage() {
  // 1. Unreliable request
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<'none' | 'data' | 'error'>('none');
  const [unreliable, setUnreliable] = useState<ResultState>('pending');
  const [unreliableMsg, setUnreliableMsg] = useState('Click Load data');

  // 2. Random delay
  const [jobRunning, setJobRunning] = useState(false);
  const [jobMs, setJobMs] = useState<number | null>(null);

  // 3. Re-rendered list
  const [generation, setGeneration] = useState(0);
  const [rerender, setRerender] = useState<ResultState>('pending');

  // 4. Async counter
  const [counter, setCounter] = useState(0);
  const [counting, setCounting] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const after = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    const t = setTimeout(() => setGeneration(g => g + 1), 800);
    const all = timers.current;
    return () => {
      clearTimeout(t);
      all.forEach(clearTimeout);
      if (loadTimer.current) clearTimeout(loadTimer.current);
    };
  }, []);

  const loadData = () => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    // Clear the previous outcome synchronously so stale elements never linger.
    setOutcome('none');
    setUnreliable('pending');
    setUnreliableMsg('Loading...');
    setLoading(true);
    loadTimer.current = setTimeout(() => {
      loadTimer.current = null;
      setLoading(false);
      if (Math.random() < 0.5) {
        setOutcome('error');
        setUnreliable('failure');
        setUnreliableMsg('503 — retry');
      } else {
        setOutcome('data');
        setUnreliable('success');
        setUnreliableMsg('Data loaded');
      }
    }, 300);
  };

  const runJob = () => {
    if (jobRunning) return;
    setJobRunning(true);
    setJobMs(null);
    const delay = randomBetween(500, 5000);
    after(() => { setJobMs(delay); setJobRunning(false); }, delay);
  };

  const startCounter = () => {
    if (counting) return;
    setCounting(true);
    setCounter(0);
    const step = (n: number) => {
      after(() => {
        setCounter(n);
        if (n < 3) step(n + 1); else setCounting(false);
      }, randomBetween(200, 900));
    };
    step(1);
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Flaky Page</h1>
        <p className="text-slate-500">Practice tests that survive random failures, random delays and elements that are re-created while you work.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> Use <code>WebDriverWait</code> with <code>ExpectedConditions.visibilityOfElementLocated</code>, and catch <code>StaleElementReferenceException</code> by re-locating the element before clicking.",
          "<strong>Playwright:</strong> Locators re-resolve on every action and web-first assertions retry, so prefer <code>await expect(locator).toHaveText('3')</code> over fixed sleeps.",
          "<strong>Cypress:</strong> <code>cy.get('#async-counter').should('have.text', '3')</code> retries until it passes; re-query after the list re-renders instead of reusing an alias.",
          "A retry loop around a random failure must be bounded, and each attempt should wait for the outcome before checking it."
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Unreliable Request</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="unreliable" tasks={[
          {
            title: "Retry until the request succeeds",
            description: "Each request fails about half of the time with a 503. Retry until the data list appears.",
            positive: ["The list with three items is shown and the result reads 'Data loaded'."],
            negative: ["A single attempt is assumed to succeed and the test fails on '503 — retry'."]
          }
        ]} /></div>
        <div className="space-y-4">
          <button id="load-data" type="button" onClick={loadData} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">Load data</button>
          {loading && <p id="flaky-loading" className="text-sm text-slate-500">Loading...</p>}
          {outcome === 'error' && <p id="flaky-error" className="text-sm text-red-600">Server error 503 — try again</p>}
          {outcome === 'data' && (
            <ul id="flaky-data" className="list-disc pl-6 text-sm text-slate-700">
              {ITEMS.map(item => <li key={item}>{item}</li>)}
            </ul>
          )}
          <ChallengeResult testId="result-unreliable" state={unreliable} message={unreliableMsg} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Random Delay</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="random-delay" tasks={[
          {
            title: "Wait for a job of unknown duration",
            description: "The job takes between 0.5 and 5 seconds. Wait for the result without a fixed sleep.",
            positive: ["The message 'Done after N ms' appears."],
            negative: ["A fixed short sleep reads the page before the job has finished."]
          }
        ]} /></div>
        <div className="space-y-4">
          <Button id="slow-button" onClick={runJob} disabled={jobRunning}>Run job</Button>
          {jobMs !== null && <p id="slow-result" className="text-sm text-slate-700">Done after {jobMs} ms</p>}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Re-rendered List</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="rerender" tasks={[
          {
            title: "Click Target in a list that re-renders",
            description: "The buttons are replaced with new DOM nodes shortly after load and on every refresh. Click Target without holding a stale reference.",
            positive: ["Clicking Target shows a success result."],
            negative: ["A stored element reference goes stale and the click fails or hits a detached node."]
          }
        ]} /></div>
        <div className="space-y-4">
          <Button id="refresh-list" variant="outline" onClick={() => setGeneration(g => g + 1)}>Refresh list</Button>
          <div id="rerender-list" className="flex gap-3">
            {['Alpha', 'Target', 'Omega'].map(name => (
              <button
                key={`${name}-${generation}`}
                type="button"
                onClick={() => name === 'Target' && setRerender('success')}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium"
              >
                {name}
              </button>
            ))}
          </div>
          <ChallengeResult
            testId="result-rerender"
            state={rerender}
            message={rerender === 'success' ? 'Clicked Target' : 'Click the Target button'}
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">4. Async Counter</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="counter" tasks={[
          {
            title: "Assert the final counter value",
            description: "The counter goes from 0 to 3 with a random pause between steps. Assert 3 with a retrying assertion.",
            positive: ["The counter eventually shows 3."],
            negative: ["Reading the counter right after the click returns 0 or an intermediate value."]
          }
        ]} /></div>
        <div className="flex items-center gap-4">
          <Button id="start-counter" onClick={startCounter} disabled={counting}>Start counter</Button>
          <span id="async-counter" className="text-2xl font-bold text-slate-900">{counter}</span>
        </div>
      </section>
    </div>
  );
}
