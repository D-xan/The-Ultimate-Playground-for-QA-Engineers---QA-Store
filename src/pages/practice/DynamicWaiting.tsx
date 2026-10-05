import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const slot = 'min-h-12 border-2 border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50 p-2';
const NAMES = ['ada.lovelace', 'grace.hopper', 'alan.turing', 'margaret.hamilton', 'linus.t', 'barbara.liskov'];

/** Timers that are cleared when the page unmounts. */
function useTimers() {
  const ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => ids.current.forEach((id) => { clearTimeout(id); clearInterval(id); }), []);
  return {
    after: (ms: number, fn: () => void) => { ids.current.push(setTimeout(fn, ms)); },
    every: (ms: number, fn: () => void) => { const id = setInterval(fn, ms); ids.current.push(id); return id; },
  };
}

export default function DynamicWaiting() {
  const timers = useTimers();

  const [delayed, setDelayed] = useState<'idle' | 'loading' | 'ready' | 'clicked'>('idle');
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [continued, setContinued] = useState<'no' | 'early' | 'yes'>('no');
  const [dynamicId, setDynamicId] = useState('dynamic-btn-initial');
  const [dynamicClicked, setDynamicClicked] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const [receipt] = useState(() => `R-${rand(10000, 99999)}`);
  const [profile, setProfile] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const [username] = useState(() => NAMES[rand(0, NAMES.length - 1)]);

  // The id keeps changing, so a script holding an old id never finds the button again.
  useEffect(() => {
    const id = setInterval(() => setDynamicId(`dynamic-btn-${rand(1000, 9999)}`), 3000);
    return () => clearInterval(id);
  }, []);

  const startProgress = () => {
    clearInterval(progressTimer.current);
    setProgress(0);
    progressTimer.current = timers.every(400, () => setProgress((p) => {
      if (p >= 100) { clearInterval(progressTimer.current); return 100; }
      return p + 10;
    }));
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dynamic Elements & Waits</h1>
        <p className="text-slate-500">Elements that appear late, disappear, change their id, or load behind a skeleton. Each delay is random, so fixed sleeps fail sooner or later. Use explicit waits. Each task ticks itself the moment your script gets it right.</p>
      </div>

      <Section n={1} title="Appearing and disappearing">
        <PracticeElement
          id="btn-delayed" label="Element that appears later"
          goal="Click “Load”, wait for the “I am here now!” button to appear, and click it."
          pass={['The button appears after 2 to 5 seconds', 'The click lands on the new button']}
          fail={['A fixed 3 second sleep: sometimes the button is not there yet', 'Looking for the button straight after clicking Load']}
          hint="Wait for the button itself to become visible or clickable, with a timeout longer than the longest delay."
          code={{
            playwright: "await page.locator('#btn-load-delayed').click();\nawait page.locator('#btn-delayed').click({ timeout: 8000 }); // click() waits for it",
            seleniumJava: 'driver.findElement(By.id("btn-load-delayed")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(8))\n  .until(ExpectedConditions.elementToBeClickable(By.id("btn-delayed"))).click();',
            seleniumPython: 'driver.find_element(By.ID, "btn-load-delayed").click()\nWebDriverWait(driver, 8).until(EC.element_to_be_clickable((By.ID, "btn-delayed"))).click()',
            cypress: "cy.get('#btn-load-delayed').click();\ncy.get('#btn-delayed', { timeout: 8000 }).click();",
          }}
          done={delayed === 'clicked'}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button id="btn-load-delayed" variant="outline" disabled={delayed === 'loading'} onClick={() => { setDelayed('loading'); timers.after(rand(2000, 5000), () => setDelayed('ready')); }}>Load</Button>
            <div className={`${slot} flex-1`}>
              {delayed === 'ready' || delayed === 'clicked'
                ? <Button id="btn-delayed" className="bg-green-600 text-white hover:bg-green-700" onClick={() => setDelayed('clicked')}>{delayed === 'clicked' ? 'Clicked!' : 'I am here now!'}</Button>
                : <span className="text-sm text-slate-500">{delayed === 'loading' ? <span className="animate-pulse">Loading...</span> : 'Nothing here yet'}</span>}
            </div>
          </div>
        </PracticeElement>

        <PracticeElement
          id="btn-disappearing" label="Element that disappears"
          goal="Click “Save”, wait for the “Saving...” spinner to disappear, then click “Continue”."
          pass={['Continue is clicked only after the spinner is gone', 'The page reads “Continued after save”']}
          fail={['Clicking Continue while it still says Saving: the page records it as too early', 'Waiting for “Saved” text that might render before the spinner is removed']}
          hint="Wait for the spinner to be hidden or detached. That is a different wait from waiting for something to appear."
          code={{
            playwright: "await page.locator('#btn-save').click();\nawait expect(page.locator('#saving-spinner')).toBeHidden({ timeout: 8000 });\nawait page.locator('#btn-continue').click();",
            seleniumJava: 'driver.findElement(By.id("btn-save")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(8))\n  .until(ExpectedConditions.invisibilityOfElementLocated(By.id("saving-spinner")));\ndriver.findElement(By.id("btn-continue")).click();',
            seleniumPython: 'driver.find_element(By.ID, "btn-save").click()\nWebDriverWait(driver, 8).until(EC.invisibility_of_element_located((By.ID, "saving-spinner")))\ndriver.find_element(By.ID, "btn-continue").click()',
            cypress: "cy.get('#btn-save').click();\ncy.get('#saving-spinner', { timeout: 8000 }).should('not.exist');\ncy.get('#btn-continue').click();",
          }}
          done={continued === 'yes'}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button id="btn-save" variant="outline" disabled={saving === 'saving'} onClick={() => { setSaving('saving'); setContinued('no'); timers.after(rand(1500, 4000), () => setSaving('saved')); }}>Save</Button>
            <div className={`${slot} flex-1`}>
              {saving === 'saving'
                ? <span id="saving-spinner" role="status" className="flex items-center gap-2 text-sm text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />Saving...</span>
                : <span className="text-sm text-slate-500">{saving === 'saved' ? 'Saved' : 'Not saved yet'}</span>}
            </div>
            <Button id="btn-continue" onClick={() => setContinued(saving === 'saved' ? 'yes' : 'early')}>Continue</Button>
          </div>
          {continued !== 'no' && (
            <p id="continue-result" className={`mt-2 text-sm font-medium ${continued === 'yes' ? 'text-green-700' : 'text-red-600'}`}>
              {continued === 'yes' ? 'Continued after save' : 'Too early: still saving'}
            </p>
          )}
        </PracticeElement>

        <PracticeElement
          id="dynamic-id" label="Changing id"
          goal="Click the button whose id changes every 3 seconds."
          pass={['The click lands, whatever the id is at that moment']}
          fail={['Copying the id from DevTools: it is gone 3 seconds later', 'Finding the element once and reusing it after a change']}
          hint="Do not use the id. Use something that stays the same: the button text, its role, or a data attribute."
          code={{
            playwright: "await page.getByRole('button', { name: 'My ID changes every 3s' }).click();",
            seleniumJava: 'driver.findElement(By.xpath("//button[normalize-space()=\'My ID changes every 3s\']")).click();',
            seleniumPython: 'driver.find_element(By.XPATH, "//button[normalize-space()=\'My ID changes every 3s\']").click()',
            cypress: "cy.contains('button', 'My ID changes every 3s').click();",
          }}
          done={dynamicClicked}
        >
          <p className="text-xs text-slate-500 mb-2">Current ID: <code>{dynamicId}</code></p>
          <Button id={dynamicId} onClick={() => setDynamicClicked(true)}>My ID changes every 3s</Button>
          {dynamicClicked && <p className="mt-2 text-sm font-medium text-green-700" data-testid="dynamic-result">Clicked</p>}
        </PracticeElement>
      </Section>

      <Section n={2} title="Loading states">
        <PracticeElement
          id="progress-task" label="Progress to 100%"
          goal="Start the task, wait for 100%, then type the receipt number that appears in the answer box."
          pass={['The receipt appears only at 100%', 'The answer matches it']}
          fail={['Reading the receipt early: it is not there yet', 'Polling the bar width in pixels instead of the text or aria value']}
          hint="Wait for the progress text to read “100% Complete”, or for the receipt itself to be visible."
          code={{
            playwright: "await page.locator('#btn-start-progress').click();\nawait expect(page.locator('#progress-text')).toHaveText('100% Complete', { timeout: 10000 });\nconst receipt = await page.locator('#progress-receipt').textContent();\nawait page.getByTestId('answer-progress-task').fill(receipt!.match(/R-\\d+/)![0]);",
            seleniumJava: 'driver.findElement(By.id("btn-start-progress")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(10))\n  .until(ExpectedConditions.textToBe(By.id("progress-text"), "100% Complete"));\nString receipt = driver.findElement(By.id("progress-receipt")).getText().replaceAll(".*(R-\\\\d+).*", "$1");',
            seleniumPython: 'driver.find_element(By.ID, "btn-start-progress").click()\nWebDriverWait(driver, 10).until(EC.text_to_be_present_in_element((By.ID, "progress-text"), "100% Complete"))\nreceipt = re.search(r"R-\\d+", driver.find_element(By.ID, "progress-receipt").text).group()',
            cypress: "cy.get('#btn-start-progress').click();\ncy.get('#progress-text', { timeout: 10000 }).should('have.text', '100% Complete');\ncy.get('#progress-receipt').invoke('text')\n  .then((t) => cy.get('[data-testid=answer-progress-task]').type(t.match(/R-\\d+/)[0]));",
          }}
          answer={{ prompt: 'Receipt:', expected: receipt }}
        >
          <Button onClick={startProgress} size="sm" className="mb-4" id="btn-start-progress">Start Task</Button>
          <div className="w-full bg-slate-200 rounded-full h-4 mb-2" role="progressbar" aria-label="Task progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="bg-primary h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} id="progress-bar-fill" />
          </div>
          <p className="text-sm font-medium" id="progress-text">{progress}% Complete</p>
          {progress === 100 && <p className="mt-1 text-sm text-green-700" id="progress-receipt">Done. Receipt {receipt}</p>}
        </PracticeElement>

        <PracticeElement
          id="skeleton" label="Skeleton loader"
          goal="Load the profile, wait for the skeleton to be replaced by real content, and type the username in the answer box."
          pass={['The answer matches the loaded username']}
          fail={['Reading text while the skeleton is showing: it has none', 'Waiting on the skeleton’s animation instead of the content']}
          hint="Wait for the real content element, not for the placeholder to change."
          code={{
            playwright: "await page.locator('#btn-load-profile').click();\nconst name = await page.locator('#profile-username').textContent({ timeout: 8000 });\nawait page.getByTestId('answer-skeleton').fill(name!);",
            seleniumJava: 'driver.findElement(By.id("btn-load-profile")).click();\nString name = new WebDriverWait(driver, Duration.ofSeconds(8))\n  .until(ExpectedConditions.visibilityOfElementLocated(By.id("profile-username"))).getText();',
            seleniumPython: 'driver.find_element(By.ID, "btn-load-profile").click()\nname = WebDriverWait(driver, 8).until(EC.visibility_of_element_located((By.ID, "profile-username"))).text',
            cypress: "cy.get('#btn-load-profile').click();\ncy.get('#profile-username', { timeout: 8000 }).invoke('text')\n  .then((t) => cy.get('[data-testid=answer-skeleton]').type(t));",
          }}
          answer={{ prompt: 'Username:', expected: username }}
        >
          <Button id="btn-load-profile" variant="outline" size="sm" className="mb-4" disabled={profile === 'loading'} onClick={() => { setProfile('loading'); timers.after(rand(1500, 4000), () => setProfile('loaded')); }}>Load profile</Button>
          {profile === 'loaded' ? (
            <div className="flex items-center gap-4" id="profile-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-stone-900">{username[0].toUpperCase()}</div>
              <div><p className="font-semibold text-slate-900" id="profile-username">{username}</p><p className="text-xs text-slate-500">QA engineer</p></div>
            </div>
          ) : (
            <div className={`flex space-x-4 ${profile === 'loading' ? 'animate-pulse' : ''}`} id="profile-skeleton" aria-busy={profile === 'loading'}>
              <div className="rounded-full bg-slate-200 h-10 w-10" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-2 bg-slate-200 rounded w-1/3" />
                <div className="h-2 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          )}
        </PracticeElement>
      </Section>
    </div>
  );
}
