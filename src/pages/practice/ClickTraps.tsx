import { useEffect, useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const MOVE_MS = 2500;

export default function ClickTraps() {
  // 1. Overlapped element
  const [coverVisible, setCoverVisible] = useState(true);
  const [overlap, setOverlap] = useState<ResultState>('pending');

  // 2. Moving button
  const [moving, setMoving] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [movingResult, setMovingResult] = useState<ResultState>('pending');
  const [movingMsg, setMovingMsg] = useState('Start the animation, then click the button');

  // 3. Hidden layers
  const [blueVisible, setBlueVisible] = useState(false);
  const [layers, setLayers] = useState<ResultState>('pending');
  const [layersMsg, setLayersMsg] = useState('Click the green button');

  // 4. Disabled -> enabled
  const [enabled, setEnabled] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [delayedValue, setDelayedValue] = useState('');
  const [enabledResult, setEnabledResult] = useState<ResultState>('pending');
  const [enabledMsg, setEnabledMsg] = useState('Enable the input, type QA and submit');

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startAnimation = () => {
    if (moving) return;
    setMovingResult('pending');
    setMovingMsg('Wait for the button to stop, then click it');
    setAtEnd(prev => !prev);
    setMoving(true);
    timers.current.push(setTimeout(() => setMoving(false), MOVE_MS));
  };

  const clickMoving = () => {
    if (moving) {
      setMovingResult('failure');
      setMovingMsg('Clicked while moving');
    } else {
      setMovingResult('success');
      setMovingMsg('Clicked after it stopped');
    }
  };

  const resetLayers = () => {
    setBlueVisible(false);
    setLayers('pending');
    setLayersMsg('Click the green button');
  };

  const enableInput = () => {
    if (waiting) return;
    setWaiting(true);
    setEnabled(false);
    const delay = 2000 + Math.floor(Math.random() * 2001);
    timers.current.push(setTimeout(() => { setEnabled(true); setWaiting(false); }, delay));
  };

  const submitDelayed = () => {
    if (delayedValue === 'QA') {
      setEnabledResult('success');
      setEnabledMsg('Submitted "QA"');
    } else {
      setEnabledResult('failure');
      setEnabledMsg('Expected the value QA');
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Click Traps</h1>
        <p className="text-slate-500">Elements that are covered, moving, stacked under other layers or not yet enabled. Never force the click: the point is to wait for, or remove, whatever is in the way. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="Overlapped element">
        <PracticeElement
          id="overlap" label="Covered button"
          goal="The Submit Order button is under a banner. Dismiss the banner, then click the button."
          pass={['After dismissing, the click shows “Order submitted”']}
          fail={['Clicking while covered: Selenium throws ElementClickInterceptedException', 'force: true or a JavaScript click: it skips the check a real user would hit']}
          hint="Dismiss the cover, wait for it to be gone, then click normally."
          code={{
            playwright: "await page.locator('#overlap-dismiss').click();\nawait expect(page.locator('#overlap-cover')).toBeHidden();\nawait page.locator('#overlapped-button').click();\nawait expect(page.getByTestId('result-overlap')).toHaveAttribute('data-state', 'success');",
            seleniumJava: 'driver.findElement(By.id("overlap-dismiss")).click();\nwait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("overlap-cover")));\ndriver.findElement(By.id("overlapped-button")).click();',
            seleniumPython: 'driver.find_element(By.ID, "overlap-dismiss").click()\nwait.until(EC.invisibility_of_element_located((By.ID, "overlap-cover")))\ndriver.find_element(By.ID, "overlapped-button").click()',
            cypress: "cy.get('#overlap-dismiss').click();\ncy.get('#overlap-cover').should('not.exist');\ncy.get('#overlapped-button').click();\ncy.get('[data-testid=result-overlap]').should('have.attr', 'data-state', 'success');",
          }}
          done={overlap === 'success'}
        >
          <div className="relative rounded-xl border border-border bg-slate-50 p-8 flex justify-center overflow-hidden">
            <Button id="overlapped-button" onClick={() => setOverlap('success')}>Submit Order</Button>
            {coverVisible && (
              <div id="overlap-cover" className="absolute inset-0 bg-slate-900/70 flex items-center justify-center pointer-events-auto">
                <Button id="overlap-dismiss" variant="outline" className="bg-white" onClick={() => setCoverVisible(false)}>Dismiss banner</Button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <ChallengeResult testId="result-overlap" state={overlap} message={overlap === 'success' ? 'Order submitted' : 'The button is covered — get rid of the cover first'} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Moving button">
        <PracticeElement
          id="moving" label="Click after it stops"
          goal="Start the animation, then click “Catch me” only once it has stopped sliding."
          pass={['The button no longer has the animating class when clicked', 'The result reads “Clicked after it stopped”']}
          fail={['Clicking mid-slide reports “Clicked while moving”', 'A fixed sleep tuned to this machine']}
          hint="While it moves, the button has the class animating. Wait for that class to go, then click."
          code={{
            playwright: "await page.locator('#start-animation').click();\nawait expect(page.locator('#moving-button')).not.toHaveClass(/animating/, { timeout: 5000 });\nawait page.locator('#moving-button').click();",
            seleniumJava: 'driver.findElement(By.id("start-animation")).click();\nwait.until(ExpectedConditions.attributeContains(By.id("moving-button"), "class", "animating"));\nwait.until(ExpectedConditions.not(ExpectedConditions.attributeContains(By.id("moving-button"), "class", "animating")));\ndriver.findElement(By.id("moving-button")).click();',
            seleniumPython: 'driver.find_element(By.ID, "start-animation").click()\nwait.until(lambda d: "animating" not in d.find_element(By.ID, "moving-button").get_attribute("class"))\ndriver.find_element(By.ID, "moving-button").click()',
            cypress: "cy.get('#start-animation').click();\ncy.get('#moving-button', { timeout: 5000 }).should('not.have.class', 'animating').click();",
          }}
          done={movingResult === 'success'}
        >
          <div className="space-y-4">
            <Button id="start-animation" onClick={startAnimation} disabled={moving}>Start animation</Button>
            <div className="rounded-xl border border-border bg-slate-50 p-4 overflow-hidden">
              <button
                id="moving-button"
                type="button"
                onClick={clickMoving}
                className={`rounded-lg bg-primary px-4 py-2 text-sm font-medium text-stone-900 ${moving ? 'animating' : ''}`}
                style={{ transform: atEnd ? 'translateX(min(240px, 40vw))' : 'translateX(0)', transition: `transform ${MOVE_MS}ms linear` }}
              >
                Catch me
              </button>
            </div>
            <ChallengeResult testId="result-moving" state={movingResult} message={movingMsg} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Hidden layers">
        <PracticeElement
          id="layers" label="Stacked buttons"
          goal="Click the green button once. Then prove that a blue copy now sits on top of it."
          pass={['The first click reports “Green clicked once”', 'Your script asserts the blue button is visible and intercepts a second click']}
          fail={['Clicking the blue layer turns the result red', 'Assuming the green button is still clickable because it is still in the DOM']}
          hint="Both buttons have the same text, so find them by id. Assert which element is on top before clicking again."
          code={{
            playwright: "await page.locator('#green-button').click();\nawait expect(page.getByTestId('result-layers')).toHaveAttribute('data-state', 'success');\nawait expect(page.locator('#blue-button')).toBeVisible();\n// a trial click checks actionability without clicking: it fails because blue is on top\nawait expect(page.locator('#green-button').click({ trial: true, timeout: 1000 })).rejects.toThrow();",
            seleniumJava: 'driver.findElement(By.id("green-button")).click();\nassertTrue(driver.findElement(By.id("blue-button")).isDisplayed());\nassertThrows(ElementClickInterceptedException.class,\n  () -> driver.findElement(By.id("green-button")).click());',
            seleniumPython: 'driver.find_element(By.ID, "green-button").click()\nassert driver.find_element(By.ID, "blue-button").is_displayed()\nwith pytest.raises(ElementClickInterceptedException):\n    driver.find_element(By.ID, "green-button").click()',
            cypress: "cy.get('#green-button').click();\ncy.get('[data-testid=result-layers]').should('have.attr', 'data-state', 'success');\ncy.get('#blue-button').should('be.visible');",
          }}
          done={layers === 'success'}
        >
          <div className="space-y-4">
            <div className="relative inline-block">
              <button id="green-button" type="button" onClick={() => { setLayers('success'); setLayersMsg('Green clicked once'); setBlueVisible(true); }} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">Layered button</button>
              {blueVisible && (
                <button id="blue-button" type="button" onClick={() => { setLayers('failure'); setLayersMsg('You clicked the blue layer — the green button is covered now'); }} className="absolute inset-0 z-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Layered button</button>
              )}
            </div>
            <div><Button id="reset-layers" variant="outline" onClick={resetLayers}>Reset</Button></div>
            <ChallengeResult testId="result-layers" state={layers} message={layersMsg} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={4} title="Disabled → enabled">
        <PracticeElement
          id="enabled" label="Input that enables later"
          goal="Click “Enable input”, wait for the field to become enabled (2 to 4 seconds), type QA and submit."
          pass={['The script waits for the enabled state, then submits QA and sees success']}
          fail={['Typing into the disabled field: nothing is entered', 'Submitting anything other than QA']}
          hint="Wait for the input to be enabled, not for a set time. The delay is random."
          code={{
            playwright: "await page.locator('#enable-input').click();\nawait page.locator('#delayed-input').fill('QA'); // fill() waits for enabled\nawait page.locator('#submit-delayed').click();",
            seleniumJava: 'driver.findElement(By.id("enable-input")).click();\nnew WebDriverWait(driver, Duration.ofSeconds(6))\n  .until(ExpectedConditions.elementToBeClickable(By.id("delayed-input"))).sendKeys("QA");\ndriver.findElement(By.id("submit-delayed")).click();',
            seleniumPython: 'driver.find_element(By.ID, "enable-input").click()\nWebDriverWait(driver, 6).until(EC.element_to_be_clickable((By.ID, "delayed-input"))).send_keys("QA")\ndriver.find_element(By.ID, "submit-delayed").click()',
            cypress: "cy.get('#enable-input').click();\ncy.get('#delayed-input', { timeout: 6000 }).should('be.enabled').type('QA');\ncy.get('#submit-delayed').click();",
          }}
          done={enabledResult === 'success'}
        >
          <div className="space-y-4 max-w-md">
            <Button id="enable-input" onClick={enableInput}>Enable input</Button>
            <Input id="delayed-input" aria-label="Delayed input" disabled={!enabled} value={delayedValue} onChange={e => setDelayedValue(e.target.value)} placeholder="Disabled until enabled" />
            <Button id="submit-delayed" onClick={submitDelayed}>Submit</Button>
            <ChallengeResult testId="result-enabled" state={enabledResult} message={enabledMsg} />
          </div>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="click-traps" number={5} />
    </div>
  );
}
