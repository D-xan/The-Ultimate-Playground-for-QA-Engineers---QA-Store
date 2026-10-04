import React, { useEffect, useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { defineClosedShadowWidget, CLOSED_SHADOW_TAG } from '@/components/practice/ClosedShadowWidget';

defineClosedShadowWidget();

const escapeAttr = (html: string) => html.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const wrap = (body: string) =>
  `<!doctype html><html><body style="font-family:sans-serif;margin:8px">${body}</body></html>`;

const nestedFrame = (id: string, inner: string) =>
  `<iframe id="${id}" style="width:100%;height:${id === 'frame-level-2' ? '110' : '70'}px;border:1px dashed #94a3b8" srcdoc="${escapeAttr(inner)}"></iframe>`;

const LEVEL_3 = wrap(
  `<button id="deep-button" style="padding:6px 12px">Click me, three frames deep</button>
   <script>document.getElementById('deep-button').addEventListener('click', function () { window.top.postMessage({ type: 'deep-click' }, '*'); });</script>`
);
const LEVEL_2 = wrap(nestedFrame('frame-level-3', LEVEL_3));
const LEVEL_1 = wrap(nestedFrame('frame-level-2', LEVEL_2));

/** The launch code only appears after liftoff, so reading it proves the script waited. */
const countdownDoc = (code: string) => wrap(
  `<p>Countdown: <span id="countdown">5</span></p>
   <script>
     var n = 5;
     var el = document.getElementById('countdown');
     var timer = setInterval(function () {
       n -= 1;
       el.textContent = String(n);
       if (n <= 0) {
         clearInterval(timer);
         document.body.innerHTML = '<p id="countdown-done">Liftoff!</p><p>Launch code: <strong id="launch-code">${code}</strong></p>';
       }
     }, 1000);
   </script>`
);

const SHADOW_FRAME_DOC = wrap(
  `<div id="shadow-host"></div>
   <script>
     var root = document.getElementById('shadow-host').attachShadow({ mode: 'open' });
     root.innerHTML = '<button id="shadow-frame-button" type="button">Click inside the shadow root</button><p id="shadow-frame-status"></p>';
     root.getElementById('shadow-frame-button').addEventListener('click', function () {
       root.getElementById('shadow-frame-status').textContent = 'Clicked inside shadow in frame';
       window.top.postMessage({ type: 'shadow-frame-click' }, '*');
     });
   </script>`
);

export default function DeepDom() {
  const [nestedResult, setNestedResult] = useState<ResultState>('pending');
  const [shadowFrameResult, setShadowFrameResult] = useState<ResultState>('pending');
  const [countdownKey, setCountdownKey] = useState(0);
  const [launchCode] = useState(() => `LAUNCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [closedResult, setClosedResult] = useState<ResultState>('pending');
  const [closedMsg, setClosedMsg] = useState('Type "shadow" into the widget and submit');
  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (type === 'deep-click') setNestedResult('success');
      if (type === 'shadow-frame-click') setShadowFrameResult('success');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const host = widgetRef.current;
    if (!host) return;
    const onSubmit = (event: Event) => {
      const value = (event as CustomEvent<{ value: string }>).detail?.value;
      if (value === 'shadow') {
        setClosedResult('success');
        setClosedMsg('Submitted "shadow" through the closed shadow root');
      } else {
        setClosedResult('failure');
        setClosedMsg(`Wrong value "${value}" - type shadow`);
      }
    };
    host.addEventListener('widget-submit', onSubmit);
    return () => host.removeEventListener('widget-submit', onSubmit);
  }, []);

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Deep DOM</h1>
        <p className="text-slate-500">Elements buried in nested iframes, a frame that rewrites itself, a closed shadow root and a shadow root inside an iframe. Each task ticks itself when your script gets there.</p>
      </div>

      <Section n={1} title="Nested iframes">
        <PracticeElement
          id="nested-frames" label="Three frames deep"
          goal="Switch into frame-level-1, then frame-level-2, then frame-level-3, and click the button."
          pass={['Entering each frame in order and clicking shows success']}
          fail={['Looking for the button from the top-level page finds nothing', 'Jumping straight to frame-level-3: frames are entered one level at a time']}
          hint="Chain the frame switches. In Selenium, go back with defaultContent() when you are done."
          code={{
            playwright: "await page.frameLocator('#frame-level-1').frameLocator('#frame-level-2')\n  .frameLocator('#frame-level-3').locator('#deep-button').click();",
            seleniumJava: 'driver.switchTo().frame("frame-level-1").switchTo().frame("frame-level-2").switchTo().frame("frame-level-3");\ndriver.findElement(By.id("deep-button")).click();\ndriver.switchTo().defaultContent();',
            seleniumPython: 'for frame in ("frame-level-1", "frame-level-2", "frame-level-3"):\n    driver.switch_to.frame(frame)\ndriver.find_element(By.ID, "deep-button").click()\ndriver.switch_to.default_content()',
            cypress: "cy.get('#frame-level-1').its('0.contentDocument.body')\n  .find('#frame-level-2').its('0.contentDocument.body')\n  .find('#frame-level-3').its('0.contentDocument.body')\n  .find('#deep-button').click();",
          }}
          done={nestedResult === 'success'}
        >
          <iframe id="frame-level-1" title="Frame level 1" className="w-full h-[170px] border border-dashed border-slate-400 rounded-lg" srcDoc={LEVEL_1} />
          <div className="mt-4"><ChallengeResult testId="result-nested-frames" state={nestedResult} message={nestedResult === 'success' ? 'Clicked the deep button' : 'Click the button inside the innermost frame'} /></div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Changing iframe">
        <PracticeElement
          id="countdown" label="Frame that rewrites itself"
          goal="The frame counts down from 5, then replaces its content. Wait for liftoff and type the launch code in the answer box."
          pass={['The answer matches the launch code shown after liftoff']}
          fail={['Reading #countdown once and expecting it to stay', 'Holding a reference to an element that the frame has since replaced']}
          hint="Stay scoped to the frame and wait for #launch-code to appear. Restart the countdown if you missed it."
          code={{
            playwright: "const frame = page.frameLocator('#countdown-frame');\nconst code = await frame.locator('#launch-code').textContent({ timeout: 10000 });\nawait page.getByTestId('answer-countdown').fill(code!);",
            seleniumJava: 'driver.switchTo().frame("countdown-frame");\nString code = new WebDriverWait(driver, Duration.ofSeconds(10))\n  .until(ExpectedConditions.visibilityOfElementLocated(By.id("launch-code"))).getText();\ndriver.switchTo().defaultContent();\ndriver.findElement(By.cssSelector("[data-testid=answer-countdown]")).sendKeys(code);',
            seleniumPython: 'driver.switch_to.frame("countdown-frame")\ncode = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "launch-code"))).text\ndriver.switch_to.default_content()\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-countdown]").send_keys(code)',
            cypress: "cy.get('#countdown-frame').its('0.contentDocument.body').should('contain', 'Launch code')\n  .find('#launch-code').invoke('text')\n  .then((code) => cy.get('[data-testid=answer-countdown]').type(code));",
          }}
          answer={{ prompt: 'Launch code:', expected: launchCode }}
        >
          <iframe key={countdownKey} id="countdown-frame" title="Countdown frame" className="w-full h-24 border border-dashed border-slate-400 rounded-lg" srcDoc={countdownDoc(launchCode)} />
          <Button id="restart-countdown" variant="outline" className="mt-3" onClick={() => setCountdownKey(k => k + 1)}>Restart countdown</Button>
        </PracticeElement>
      </Section>

      <Section n={3} title="Closed shadow DOM">
        <PracticeElement
          id="closed-shadow" label="Closed shadow root"
          goal="Submit “shadow” through the widget. Its input and button are in a closed shadow root that selectors cannot reach."
          pass={['Tab into the input, type shadow, Tab to Submit and press Enter']}
          fail={['element.shadowRoot is null for a closed root', 'Any other value turns the result red']}
          hint="Focus “Start here”, then drive the widget with the keyboard, the way a keyboard user would."
          code={{
            playwright: "await page.locator('#before-shadow').focus();\nawait page.keyboard.press('Tab');\nawait page.keyboard.type('shadow');\nawait page.keyboard.press('Tab');\nawait page.keyboard.press('Enter');",
            seleniumJava: 'driver.findElement(By.id("before-shadow")).click();\nnew Actions(driver).sendKeys(Keys.TAB).sendKeys("shadow").sendKeys(Keys.TAB).sendKeys(Keys.ENTER).perform();',
            seleniumPython: 'driver.find_element(By.ID, "before-shadow").click()\nActionChains(driver).send_keys(Keys.TAB).send_keys("shadow").send_keys(Keys.TAB).send_keys(Keys.ENTER).perform()',
            cypress: "// Cypress has no native Tab: use the cypress-real-events plugin\ncy.get('#before-shadow').focus().realPress('Tab');\ncy.realType('shadow');\ncy.realPress('Tab');\ncy.realPress('Enter');",
          }}
          done={closedResult === 'success'}
        >
          <div className="flex flex-wrap items-center gap-3">
            <button id="before-shadow" type="button" className="rounded-lg border border-border bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">Start here</button>
            {React.createElement(CLOSED_SHADOW_TAG, { ref: widgetRef })}
          </div>
          <div className="mt-4"><ChallengeResult testId="result-closed-shadow" state={closedResult} message={closedMsg} /></div>
        </PracticeElement>
      </Section>

      <Section n={4} title="Shadow DOM inside an iframe">
        <PracticeElement
          id="shadow-frame" label="Shadow root in a frame"
          goal="Enter the iframe, then reach into the open shadow root under #shadow-host and click its button."
          pass={['The status inside the frame reads “Clicked inside shadow in frame”']}
          fail={['Searching for the button without entering the frame', 'Searching the frame document without opening the shadow root']}
          hint="Two boundaries: switch into the frame first, then open the shadow root from its host."
          code={{
            playwright: "const frame = page.frameLocator('#shadow-frame');\nawait frame.locator('#shadow-frame-button').click(); // CSS pierces open shadow roots\nawait expect(frame.locator('#shadow-frame-status')).toHaveText('Clicked inside shadow in frame');",
            seleniumJava: 'driver.switchTo().frame("shadow-frame");\nSearchContext root = driver.findElement(By.id("shadow-host")).getShadowRoot();\nroot.findElement(By.cssSelector("#shadow-frame-button")).click();\ndriver.switchTo().defaultContent();',
            seleniumPython: 'driver.switch_to.frame("shadow-frame")\nroot = driver.find_element(By.ID, "shadow-host").shadow_root\nroot.find_element(By.CSS_SELECTOR, "#shadow-frame-button").click()\ndriver.switch_to.default_content()',
            cypress: "cy.get('#shadow-frame').its('0.contentDocument.body')\n  .find('#shadow-host').shadow().find('#shadow-frame-button').click();",
          }}
          done={shadowFrameResult === 'success'}
        >
          <iframe id="shadow-frame" title="Shadow frame" className="w-full h-32 border border-dashed border-slate-400 rounded-lg" srcDoc={SHADOW_FRAME_DOC} />
          <div className="mt-4"><ChallengeResult testId="result-shadow-frame" state={shadowFrameResult} message={shadowFrameResult === 'success' ? 'Clicked the button inside the shadow root' : 'Click the button inside the frame'} /></div>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="deep-dom" number={5} />
    </div>
  );
}
