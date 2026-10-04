import { useEffect, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { parseWindowMessage, SECRET_KEY } from '@/utils/windowMessages';

const WORDS = ['falcon', 'harbor', 'ember', 'quartz', 'meadow', 'cobalt'];
const POPUP_FEATURES = 'width=480,height=600';

export default function WindowsTabs() {
  const [secret] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [secretInput, setSecretInput] = useState('');
  const [tabResult, setTabResult] = useState<ResultState>('pending');
  const [approvalCode, setApprovalCode] = useState('');
  const [delayedDone, setDelayedDone] = useState(false);
  const [pickResult, setPickResult] = useState<ResultState>('pending');

  useEffect(() => {
    try { localStorage.setItem(SECRET_KEY, secret); } catch { /* storage blocked: the tab shows a notice */ }
  }, [secret]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const msg = parseWindowMessage(e, window.location.origin);
      if (!msg) return;
      if (msg.type === 'qa-approve') setApprovalCode(msg.code);
      if (msg.type === 'qa-delayed') setDelayedDone(true);
      if (msg.type === 'qa-pick') setPickResult((prev) => (prev === 'success' ? prev : msg.window === 'B' ? 'success' : 'failure'));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const checkSecret = () => {
    if (tabResult === 'success') return;
    setTabResult(secretInput.trim().toLowerCase() === secret ? 'success' : 'failure');
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Windows &amp; Tabs</h1>
        <p className="text-slate-500">Switch between tabs and popup windows: read data from a new tab, approve in a popup that closes itself, wait for a slow popup and pick the right window by its title. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="New tab">
        <PracticeElement
          id="tab" label="Read from a new tab"
          goal="Open the link in a new tab, read the secret word, close the tab, then type the word here and press Check."
          pass={['The new tab shows a secret word', 'Typing it and pressing Check shows success']}
          fail={['A wrong word shows a failure', 'Switching before the new tab exists']}
          hint="Wait for the new window to exist before switching: compare the window handles from before and after the click."
          code={{
            playwright: "const tabPromise = page.context().waitForEvent('page');\nawait page.locator('#open-tab').click();\nconst tab = await tabPromise;\nconst secret = (await tab.locator('#tab-secret').innerText()).trim();\nawait tab.close();\nawait page.locator('#tab-secret-input').fill(secret);\nawait page.locator('#check-secret').click();",
            seleniumJava: 'String main = driver.getWindowHandle();\ndriver.findElement(By.id("open-tab")).click();\nwait.until(ExpectedConditions.numberOfWindowsToBe(2));\nfor (String h : driver.getWindowHandles()) if (!h.equals(main)) driver.switchTo().window(h);\nString secret = driver.findElement(By.id("tab-secret")).getText().trim();\ndriver.close();\ndriver.switchTo().window(main);\ndriver.findElement(By.id("tab-secret-input")).sendKeys(secret);\ndriver.findElement(By.id("check-secret")).click();',
            seleniumPython: 'main = driver.current_window_handle\ndriver.find_element(By.ID, "open-tab").click()\nwait.until(EC.number_of_windows_to_be(2))\ndriver.switch_to.window(next(h for h in driver.window_handles if h != main))\nsecret = driver.find_element(By.ID, "tab-secret").text.strip()\ndriver.close()\ndriver.switch_to.window(main)\ndriver.find_element(By.ID, "tab-secret-input").send_keys(secret)\ndriver.find_element(By.ID, "check-secret").click()',
            cypress: "// Cypress drives one tab, so this task cannot turn green in Cypress.\n// What you can test: the link opens a new tab, and the page it opens.\ncy.get('#open-tab').should('have.attr', 'target', '_blank');\ncy.get('#open-tab').invoke('removeAttr', 'target').click();\ncy.get('#tab-secret').invoke('text').should('match', /^[a-z]+$/);",
          }}
          done={tabResult === 'success'}
        >
          <a id="open-tab" data-testid="open-tab" href={`${import.meta.env.BASE_URL}popup/secret`} target="_blank" rel="noopener" className="text-primary font-semibold underline">Open the secret in a new tab</a>
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
            <input id="tab-secret-input" data-testid="tab-secret-input" value={secretInput} onChange={(e) => setSecretInput(e.target.value)} placeholder="Secret word" aria-label="Secret word"
              className="w-full max-w-xs px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <Button id="check-secret" data-testid="check-secret" onClick={checkSecret}>Check</Button>
          </div>
          <ChallengeResult testId="result-tab" state={tabResult} message={tabResult === 'success' ? 'Secret matched' : tabResult === 'failure' ? 'That is not the secret' : 'Read the secret from the new tab'} />
        </PracticeElement>
      </Section>

      <Section n={2} title="Popup that reports back">
        <PracticeElement
          id="popup" label="Approve in a popup"
          goal="Open the popup and press Approve. The popup sends a code back to this page and closes itself."
          pass={['After Approve, the code appears here and the popup is gone']}
          fail={['Running another command on the closed popup: it throws NoSuchWindowException']}
          hint="After Approve the popup closes itself. Switch back to the main window straight away."
          code={{
            playwright: "const popupPromise = page.waitForEvent('popup');\nawait page.locator('#open-popup').click();\nconst popup = await popupPromise;\nawait popup.locator('#approve-btn').click();\nawait expect(page.locator('#approval-code')).toHaveText(/^[A-Z0-9]{6}$/);",
            seleniumJava: 'String main = driver.getWindowHandle();\ndriver.findElement(By.id("open-popup")).click();\nwait.until(ExpectedConditions.numberOfWindowsToBe(2));\nfor (String h : driver.getWindowHandles()) if (!h.equals(main)) driver.switchTo().window(h);\ndriver.findElement(By.id("approve-btn")).click();\nwait.until(ExpectedConditions.numberOfWindowsToBe(1));\ndriver.switchTo().window(main);',
            seleniumPython: 'main = driver.current_window_handle\ndriver.find_element(By.ID, "open-popup").click()\nwait.until(EC.number_of_windows_to_be(2))\ndriver.switch_to.window(next(h for h in driver.window_handles if h != main))\ndriver.find_element(By.ID, "approve-btn").click()\nwait.until(EC.number_of_windows_to_be(1))\ndriver.switch_to.window(main)',
            cypress: "// Cypress cannot switch windows: check what window.open was asked to load\ncy.window().then((win) => cy.stub(win, 'open').as('open'));\ncy.get('#open-popup').click();\ncy.get('@open').should('have.been.calledWithMatch', 'popup/approve');",
          }}
          done={!!approvalCode}
        >
          <Button id="open-popup" data-testid="open-popup" onClick={() => window.open(`${import.meta.env.BASE_URL}popup/approve`, 'approve', POPUP_FEATURES)}>Open approval popup</Button>
          <p className="mt-4 mb-4 text-slate-600">Approval code: <strong id="approval-code" data-testid="approval-code">{approvalCode}</strong></p>
          <ChallengeResult testId="result-popup" state={approvalCode ? 'success' : 'pending'} message={approvalCode ? 'Approved in the popup' : 'Waiting for approval'} />
        </PracticeElement>
      </Section>

      <Section n={3} title="Slow popup">
        <PracticeElement
          id="delayed" label="Wait inside a popup"
          goal="Open the slow popup. Its Confirm button appears after 1 to 3 seconds: wait for it and click it."
          pass={['Clicking Confirm shows success here']}
          fail={['A fixed sleep is either too short or wastes time']}
          hint="Switch to the popup, then wait for the Confirm button to be clickable inside it."
          code={{
            playwright: "const popupPromise = page.waitForEvent('popup');\nawait page.locator('#open-delayed').click();\nconst popup = await popupPromise;\nawait popup.locator('#delayed-confirm').click({ timeout: 5000 });",
            seleniumJava: 'String main = driver.getWindowHandle();\ndriver.findElement(By.id("open-delayed")).click();\nwait.until(ExpectedConditions.numberOfWindowsToBe(2));\nfor (String h : driver.getWindowHandles()) if (!h.equals(main)) driver.switchTo().window(h);\nwait.until(ExpectedConditions.elementToBeClickable(By.id("delayed-confirm"))).click();\ndriver.switchTo().window(main);',
            seleniumPython: 'main = driver.current_window_handle\ndriver.find_element(By.ID, "open-delayed").click()\nwait.until(EC.number_of_windows_to_be(2))\ndriver.switch_to.window(next(h for h in driver.window_handles if h != main))\nwait.until(EC.element_to_be_clickable((By.ID, "delayed-confirm"))).click()\ndriver.switch_to.window(main)',
            cypress: "// Cypress cannot switch windows: check what window.open was asked to load\ncy.window().then((win) => cy.stub(win, 'open').as('open'));\ncy.get('#open-delayed').click();\ncy.get('@open').should('have.been.calledWithMatch', 'popup/delayed');",
          }}
          done={delayedDone}
        >
          <Button id="open-delayed" data-testid="open-delayed" onClick={() => window.open(`${import.meta.env.BASE_URL}popup/delayed`, 'delayed', POPUP_FEATURES)}>Open slow popup</Button>
          <div className="mt-4"><ChallengeResult testId="result-delayed" state={delayedDone ? 'success' : 'pending'} message={delayedDone ? 'Confirmed in the slow popup' : 'Waiting for confirmation'} /></div>
        </PracticeElement>
      </Section>

      <Section n={4} title="Pick the right window">
        <PracticeElement
          id="pick" label="Find a window by its title"
          goal="Open all three windows, switch to the one titled “Window B” and press its button."
          pass={['Pressing the button in Window B shows success']}
          fail={['Assuming handle order matches opening order', 'The button is disabled in Window A and Window C']}
          hint="Loop over every window handle, switch to it and check the title until it reads “Window B”."
          code={{
            playwright: "for (const w of ['a', 'b', 'c']) await page.locator(`#open-${w}`).click();\nawait expect.poll(() => page.context().pages().length).toBe(4);\nfor (const p of page.context().pages()) {\n  if (p === page) continue;\n  await expect(p).toHaveTitle(/^Window [ABC]$/); // a new window sets its title after it loads\n  if ((await p.title()) === 'Window B') await p.locator('#pick-me').click();\n}",
            seleniumJava: 'for (String w : List.of("a", "b", "c")) driver.findElement(By.id("open-" + w)).click();\nwait.until(ExpectedConditions.numberOfWindowsToBe(4));\nfor (String h : driver.getWindowHandles()) {\n  driver.switchTo().window(h);\n  if (driver.getTitle().equals("Window B")) { driver.findElement(By.tagName("button")).click(); break; }\n}',
            seleniumPython: 'for w in "abc":\n    driver.find_element(By.ID, f"open-{w}").click()\nwait.until(EC.number_of_windows_to_be(4))\nfor h in driver.window_handles:\n    driver.switch_to.window(h)\n    if driver.title == "Window B":\n        driver.find_element(By.TAG_NAME, "button").click()\n        break',
            cypress: "// Cypress cannot switch windows: check the URL, then visit it directly\ncy.window().then((win) => cy.stub(win, 'open').as('open'));\ncy.get('#open-b').click();\ncy.get('@open').should('have.been.calledWithMatch', 'popup/pick?w=B');\ncy.visit('/popup/pick?w=B');\ncy.title().should('eq', 'Window B');",
          }}
          done={pickResult === 'success'}
        >
          <div className="flex flex-wrap gap-3 mb-4">
            {(['A', 'B', 'C'] as const).map((w) => (
              <Button key={w} id={`open-${w.toLowerCase()}`} data-testid={`open-${w.toLowerCase()}`} variant="outline" onClick={() => window.open(`${import.meta.env.BASE_URL}popup/pick?w=${w}`, '_blank')}>Open window {w}</Button>
            ))}
          </div>
          <ChallengeResult testId="result-pick" state={pickResult} message={pickResult === 'success' ? 'You picked Window B' : pickResult === 'failure' ? 'Wrong window' : 'Pick Window B'} />
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="windows" number={5} />
    </div>
  );
}
