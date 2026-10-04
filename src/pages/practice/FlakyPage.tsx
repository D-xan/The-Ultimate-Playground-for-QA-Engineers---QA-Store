import { useEffect, useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

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
  const [verify, setVerify] = useState<{ state: ResultState; msg: string }>({ state: 'pending', msg: 'Start the counter, wait for 3, then press Verify' });

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
    setVerify({ state: 'pending', msg: 'Counting... press Verify once it shows 3' });
    const step = (n: number) => {
      after(() => {
        setCounter(n);
        if (n < 3) step(n + 1); else setCounting(false);
      }, randomBetween(200, 900));
    };
    step(1);
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Flaky Page</h1>
        <p className="text-slate-500">Random failures, random delays, elements re-created while you work, and a counter that settles in its own time. Write tests that pass every run. Each task ticks itself when your script gets it right.</p>
      </div>

      <Section n={1} title="Unreliable request">
        <PracticeElement
          id="unreliable" label="Retry until it works"
          goal="Each request fails about half the time with a 503. Retry until the data list appears."
          pass={['The list of three orders is shown and the result reads “Data loaded”', 'The retry loop has an upper limit']}
          fail={['Assuming one attempt succeeds', 'Checking the outcome before the request finishes', 'An endless loop']}
          hint="In a bounded loop: click, wait for either the list or the error, stop when the list is there."
          code={{
            playwright: "for (let attempt = 0; attempt < 20; attempt++) {\n  await page.locator('#load-data').click();\n  await expect(page.locator('#flaky-data, #flaky-error')).toBeVisible();\n  if (await page.locator('#flaky-data').isVisible()) break;\n}\nawait expect(page.locator('#flaky-data li')).toHaveCount(3);",
            seleniumJava: 'for (int attempt = 0; attempt < 20; attempt++) {\n  driver.findElement(By.id("load-data")).click();\n  wait.until(ExpectedConditions.or(\n    ExpectedConditions.visibilityOfElementLocated(By.id("flaky-data")),\n    ExpectedConditions.visibilityOfElementLocated(By.id("flaky-error"))));\n  if (!driver.findElements(By.id("flaky-data")).isEmpty()) break;\n}',
            seleniumPython: 'for attempt in range(20):\n    driver.find_element(By.ID, "load-data").click()\n    wait.until(EC.any_of(EC.visibility_of_element_located((By.ID, "flaky-data")),\n                         EC.visibility_of_element_located((By.ID, "flaky-error"))))\n    if driver.find_elements(By.ID, "flaky-data"):\n        break',
            cypress: "const load = (attempt = 0) => {\n  if (attempt >= 20) throw new Error('never loaded');\n  cy.get('#load-data').click();\n  cy.get('#flaky-data, #flaky-error').should('be.visible').then(($el) => {\n    if ($el.is('#flaky-error')) load(attempt + 1);\n  });\n};\nload();",
          }}
          done={unreliable === 'success'}
        >
          <div className="space-y-4">
            <button id="load-data" type="button" onClick={loadData} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-slate-900">Load data</button>
            {loading && <p id="flaky-loading" className="text-sm text-slate-500">Loading...</p>}
            {outcome === 'error' && <p id="flaky-error" className="text-sm text-red-600">Server error 503 — try again</p>}
            {outcome === 'data' && <ul id="flaky-data" className="list-disc pl-6 text-sm text-slate-700">{ITEMS.map(item => <li key={item}>{item}</li>)}</ul>}
            <ChallengeResult testId="result-unreliable" state={unreliable} message={unreliableMsg} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Random delay">
        <PracticeElement
          id="random-delay" label="Job of unknown length"
          goal="Run the job, wait for it to finish (0.5 to 5 seconds), and type how many milliseconds it took."
          pass={['The answer matches the number in “Done after N ms”']}
          fail={['A fixed short sleep reads the page before the job finishes', 'A fixed long sleep wastes up to 5 seconds every run']}
          hint="Wait for the result element to appear, then pull the number out of its text."
          code={{
            playwright: "await page.locator('#slow-button').click();\nconst text = await page.locator('#slow-result').textContent({ timeout: 7000 });\nawait page.getByTestId('answer-random-delay').fill(text!.match(/\\d+/)![0]);",
            seleniumJava: 'driver.findElement(By.id("slow-button")).click();\nString text = new WebDriverWait(driver, Duration.ofSeconds(7))\n  .until(ExpectedConditions.visibilityOfElementLocated(By.id("slow-result"))).getText();\nString ms = text.replaceAll("\\\\D", "");',
            seleniumPython: 'driver.find_element(By.ID, "slow-button").click()\ntext = WebDriverWait(driver, 7).until(EC.visibility_of_element_located((By.ID, "slow-result"))).text\nms = re.search(r"\\d+", text).group()',
            cypress: "cy.get('#slow-button').click();\ncy.get('#slow-result', { timeout: 7000 }).invoke('text')\n  .then((t) => cy.get('[data-testid=answer-random-delay]').type(t.match(/\\d+/)[0]));",
          }}
          answer={jobMs === null ? undefined : { prompt: 'Milliseconds:', expected: String(jobMs) }}
        >
          <div className="space-y-4">
            <Button id="slow-button" onClick={runJob} disabled={jobRunning}>Run job</Button>
            {jobRunning && <p className="text-sm text-slate-500 animate-pulse">Working...</p>}
            {jobMs !== null && <p id="slow-result" className="text-sm text-slate-700">Done after {jobMs} ms</p>}
          </div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Re-rendered list">
        <PracticeElement
          id="rerender" label="Buttons that are re-created"
          goal="Click Target. The buttons are replaced with new DOM nodes shortly after load and on every refresh."
          pass={['Clicking Target shows success']}
          fail={['Selenium: a stored WebElement throws StaleElementReferenceException after a refresh', 'Cypress: an alias saved before the refresh points at a detached node']}
          hint="Look the element up again right before each action instead of keeping it."
          code={{
            playwright: "// Locators re-resolve on every action, so a re-render is harmless\nawait page.locator('#refresh-list').click();\nawait page.locator('#rerender-list').getByRole('button', { name: 'Target' }).click();",
            seleniumJava: 'driver.findElement(By.id("refresh-list")).click();\n// find it again after the refresh instead of reusing an older WebElement\nwait.until(ExpectedConditions.elementToBeClickable(\n  By.xpath("//div[@id=\'rerender-list\']/button[.=\'Target\']"))).click();',
            seleniumPython: 'driver.find_element(By.ID, "refresh-list").click()\nwait.until(EC.element_to_be_clickable(\n    (By.XPATH, "//div[@id=\'rerender-list\']/button[.=\'Target\']"))).click()',
            cypress: "cy.get('#refresh-list').click();\ncy.contains('#rerender-list button', 'Target').click();",
          }}
          done={rerender === 'success'}
        >
          <div className="space-y-4">
            <Button id="refresh-list" variant="outline" onClick={() => setGeneration(g => g + 1)}>Refresh list</Button>
            <div id="rerender-list" className="flex flex-wrap gap-3">
              {['Alpha', 'Target', 'Omega'].map(name => (
                <button key={`${name}-${generation}`} type="button" onClick={() => name === 'Target' && setRerender('success')} className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium">{name}</button>
              ))}
            </div>
            <ChallengeResult testId="result-rerender" state={rerender} message={rerender === 'success' ? 'Clicked Target' : 'Click the Target button'} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={4} title="Async counter">
        <PracticeElement
          id="counter" label="Counter that settles"
          goal="Start the counter, wait until it shows 3 with a retrying assertion, then press Verify."
          pass={['Verify is pressed only once the counter reads 3']}
          fail={['Reading the counter right after Start gets 0 or a value on the way', 'Pressing Verify early turns the result red']}
          hint="Use an assertion or wait that retries until the text is 3, not one that reads it once."
          code={{
            playwright: "await page.locator('#start-counter').click();\nawait expect(page.locator('#async-counter')).toHaveText('3', { timeout: 5000 });\nawait page.locator('#verify-counter').click();",
            seleniumJava: 'driver.findElement(By.id("start-counter")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(5))\n  .until(ExpectedConditions.textToBe(By.id("async-counter"), "3"));\ndriver.findElement(By.id("verify-counter")).click();',
            seleniumPython: 'driver.find_element(By.ID, "start-counter").click()\nWebDriverWait(driver, 5).until(EC.text_to_be_present_in_element((By.ID, "async-counter"), "3"))\ndriver.find_element(By.ID, "verify-counter").click()',
            cypress: "cy.get('#start-counter').click();\ncy.get('#async-counter', { timeout: 5000 }).should('have.text', '3');\ncy.get('#verify-counter').click();",
          }}
          done={verify.state === 'success'}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button id="start-counter" onClick={startCounter} disabled={counting}>Start counter</Button>
              <span id="async-counter" className="text-2xl font-bold text-slate-900">{counter}</span>
              <Button id="verify-counter" variant="outline" onClick={() => setVerify(counter === 3 && !counting
                ? { state: 'success', msg: 'Verified at 3' }
                : { state: 'failure', msg: `Too early: the counter was ${counter}` })}>Verify</Button>
            </div>
            <ChallengeResult testId="result-counter" state={verify.state} message={verify.msg} />
          </div>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="flaky" number={5} />
    </div>
  );
}
