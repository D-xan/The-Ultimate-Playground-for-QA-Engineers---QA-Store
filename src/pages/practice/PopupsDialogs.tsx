import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const code = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

export default function PopupsDialogs() {
  // Values a script can only know by reading the page, so a correct answer proves it did.
  const [promptCode] = useState(() => code('NAME'));
  const [toastCode] = useState(() => code('ORDER'));
  const [tooltipCode] = useState(() => code('TIP'));

  const [alertResult, setAlertResult] = useState('');
  const [confirmResult, setConfirmResult] = useState('');
  const [promptResult, setPromptResult] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResult, setModalResult] = useState('');
  const [escaped, setEscaped] = useState(false);
  const [toast, setToast] = useState('');
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    // Escape closes the modal without confirming, like most real dialogs.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setModalOpen(false); setEscaped(true); setModalResult('Custom modal closed with Escape'); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const showToast = (text: string, ms = 3000) => {
    setToast(text);
    setTimeout(() => setToast(''), ms);
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Popups & Dialogs</h1>
        <p className="text-slate-500">Native alerts, confirms and prompts, a custom modal, a toast that vanishes, and a tooltip. Each element shows its goal beside it, and its task ticks itself the moment your script gets it right. Read tasks have an answer box: your script types in what it read.</p>
      </div>

      {toast && (
        <div role="status" className="fixed top-20 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-4" id="toast-message">
          {toast}
        </div>
      )}

      <Section n={1} title="JavaScript dialogs">
        <PracticeElement
          id="btn-alert" label="Alert"
          goal="Click “Trigger Alert”, assert the alert text, and accept it."
          pass={['The alert says “This is a native alert dialog!”', 'The page then reads “Alert was triggered and accepted”']}
          fail={['Not handling the dialog: Selenium throws UnhandledAlertException on the next command', 'Registering the Playwright handler after the click']}
          hint="Native dialogs block the page. In Playwright, register the dialog handler before the click. In Selenium, switch to the alert after it."
          code={{
            playwright: "page.once('dialog', async (d) => {\n  expect(d.message()).toBe('This is a native alert dialog!');\n  await d.accept();\n});\nawait page.locator('#btn-alert').click();\nawait expect(page.locator('#alert-result')).toHaveText('Alert was triggered and accepted');",
            seleniumJava: 'driver.findElement(By.id("btn-alert")).click();\nAlert alert = wait.until(ExpectedConditions.alertIsPresent());\nassertEquals("This is a native alert dialog!", alert.getText());\nalert.accept();',
            seleniumPython: 'driver.find_element(By.ID, "btn-alert").click()\nalert = wait.until(EC.alert_is_present())\nassert alert.text == "This is a native alert dialog!"\nalert.accept()',
            cypress: "cy.on('window:alert', (text) => expect(text).to.eq('This is a native alert dialog!'));\ncy.get('#btn-alert').click();\ncy.get('#alert-result').should('have.text', 'Alert was triggered and accepted');",
          }}
          done={!!alertResult}
        >
          <Button id="btn-alert" onClick={() => { window.alert('This is a native alert dialog!'); setAlertResult('Alert was triggered and accepted'); }}>Trigger Alert</Button>
          {alertResult && <p id="alert-result" className="mt-3 text-sm text-green-600 font-medium">{alertResult}</p>}
        </PracticeElement>

        <PracticeElement
          id="btn-confirm" label="Confirm"
          goal="Click “Trigger Confirm” and press Cancel."
          pass={['The page reads “Confirm cancelled”', 'A toast says “You clicked Cancel!”']}
          fail={['Accepting instead of dismissing', 'Leaving the default handler on: Playwright dismisses by default, Cypress accepts by default']}
          hint="Tools differ on what they do with an unhandled confirm. Say what you want explicitly."
          code={{
            playwright: "page.once('dialog', (d) => d.dismiss());\nawait page.locator('#btn-confirm').click();\nawait expect(page.locator('#confirm-result')).toHaveText('Confirm cancelled');",
            seleniumJava: 'driver.findElement(By.id("btn-confirm")).click();\nwait.until(ExpectedConditions.alertIsPresent()).dismiss();\nassertEquals("Confirm cancelled", driver.findElement(By.id("confirm-result")).getText());',
            seleniumPython: 'driver.find_element(By.ID, "btn-confirm").click()\nwait.until(EC.alert_is_present()).dismiss()\nassert driver.find_element(By.ID, "confirm-result").text == "Confirm cancelled"',
            cypress: "cy.on('window:confirm', () => false);\ncy.get('#btn-confirm').click();\ncy.get('#confirm-result').should('have.text', 'Confirm cancelled');",
          }}
          done={confirmResult === 'Confirm cancelled'}
        >
          <Button id="btn-confirm" variant="outline" onClick={() => {
            const ok = window.confirm('Are you sure you want to proceed?');
            setConfirmResult(ok ? 'Confirm accepted' : 'Confirm cancelled');
            showToast(ok ? 'You clicked OK!' : 'You clicked Cancel!');
          }}>Trigger Confirm</Button>
          {confirmResult && <p id="confirm-result" className="mt-3 text-sm text-green-600 font-medium">{confirmResult}</p>}
        </PracticeElement>

        <PracticeElement
          id="btn-prompt" label="Prompt"
          goal="Click “Trigger Prompt” and answer it with the name code shown below the button."
          pass={['The page reads “Prompt returned: <code>”', 'The code matches the one on the page']}
          fail={['Submitting the prompt empty', 'Typing a hardcoded name: the code changes on every visit']}
          hint="Read the code from the page first. Then pass it as the prompt's answer when you accept the dialog."
          code={{
            playwright: "const name = await page.locator('#prompt-code').textContent();\npage.once('dialog', (d) => d.accept(name!));\nawait page.locator('#btn-prompt').click();\nawait expect(page.locator('#prompt-result')).toHaveText(`Prompt returned: ${name}`);",
            seleniumJava: 'String name = driver.findElement(By.id("prompt-code")).getText();\ndriver.findElement(By.id("btn-prompt")).click();\nAlert prompt = wait.until(ExpectedConditions.alertIsPresent());\nprompt.sendKeys(name);\nprompt.accept();',
            seleniumPython: 'name = driver.find_element(By.ID, "prompt-code").text\ndriver.find_element(By.ID, "btn-prompt").click()\nprompt = wait.until(EC.alert_is_present())\nprompt.send_keys(name)\nprompt.accept()',
            cypress: "cy.get('#prompt-code').invoke('text').then((name) => {\n  cy.window().then((win) => cy.stub(win, 'prompt').returns(name));\n  cy.get('#btn-prompt').click();\n  cy.get('#prompt-result').should('have.text', `Prompt returned: ${name}`);\n});",
          }}
          done={promptResult === promptCode}
        >
          <Button id="btn-prompt" variant="outline" onClick={() => {
            const res = window.prompt('Please enter your name code:');
            setPromptResult(res ?? '');
            if (res) showToast(`Hello, ${res}!`);
          }}>Trigger Prompt</Button>
          <p className="mt-3 text-sm text-slate-600">Your name code: <code id="prompt-code" className="font-semibold text-slate-900">{promptCode}</code></p>
          {promptResult && <p id="prompt-result" className="mt-1 text-sm text-green-600 font-medium">Prompt returned: {promptResult}</p>}
        </PracticeElement>
      </Section>

      <Section n={2} title="Custom modal">
        <PracticeElement
          id="custom-modal" label="Modal dialog"
          goal="Open the modal, close it once with Escape, then open it again and click Confirm."
          pass={['Escape closes it without confirming', 'Confirm closes it and the page reads “Custom modal confirmed”']}
          fail={['Treating it like a native alert: it is ordinary HTML', 'Clicking Confirm before the modal is visible']}
          hint="This modal is part of the page. Wait for it to be visible, then use normal locators and keyboard presses."
          code={{
            playwright: "await page.locator('#btn-open-modal').click();\nawait page.keyboard.press('Escape');\nawait expect(page.locator('#custom-modal')).toBeHidden();\nawait page.locator('#btn-open-modal').click();\nawait page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();\nawait expect(page.locator('#modal-result')).toHaveText('Custom modal confirmed');",
            seleniumJava: 'driver.findElement(By.id("btn-open-modal")).click();\nnew Actions(driver).sendKeys(Keys.ESCAPE).perform();\nwait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("custom-modal")));\ndriver.findElement(By.id("btn-open-modal")).click();\nwait.until(ExpectedConditions.elementToBeClickable(By.id("btn-modal-confirm"))).click();',
            seleniumPython: 'driver.find_element(By.ID, "btn-open-modal").click()\nActionChains(driver).send_keys(Keys.ESCAPE).perform()\nwait.until(EC.invisibility_of_element_located((By.ID, "custom-modal")))\ndriver.find_element(By.ID, "btn-open-modal").click()\nwait.until(EC.element_to_be_clickable((By.ID, "btn-modal-confirm"))).click()',
            cypress: "cy.get('#btn-open-modal').click();\ncy.get('body').type('{esc}');\ncy.get('#custom-modal').should('not.exist');\ncy.get('#btn-open-modal').click();\ncy.get('#btn-modal-confirm').click();\ncy.get('#modal-result').should('have.text', 'Custom modal confirmed');",
          }}
          done={escaped && modalResult === 'Custom modal confirmed'}
        >
          <div className="flex flex-col items-start gap-3">
            <Button onClick={() => { setModalOpen(true); setModalResult(''); }} id="btn-open-modal">Open Custom Modal</Button>
            {modalResult && <p id="modal-result" className="text-sm text-green-600 font-medium">{modalResult}</p>}
          </div>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" id="custom-modal-overlay">
              <div role="dialog" aria-modal="true" aria-labelledby="custom-modal-title" className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" id="custom-modal">
                <h3 id="custom-modal-title" className="text-xl font-bold mb-4">Confirmation Modal</h3>
                <p className="text-slate-600 mb-8">This is a custom modal built in HTML. Press Escape or use the buttons.</p>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => { setModalOpen(false); setModalResult('Custom modal cancelled'); }} id="btn-modal-cancel">Cancel</Button>
                  <Button onClick={() => { setModalOpen(false); setModalResult('Custom modal confirmed'); }} id="btn-modal-confirm">Confirm</Button>
                </div>
              </div>
            </div>
          )}
        </PracticeElement>
      </Section>

      <Section n={3} title="Toasts and tooltips">
        <PracticeElement
          id="toast" label="Disappearing toast"
          goal="Place the order, read the order number from the toast before it disappears, and type it in the answer box."
          pass={['The answer matches the number in the toast']}
          fail={['Sleeping before reading: the toast is gone after 3 seconds', 'Hardcoding the number: it changes on every visit']}
          hint="Wait for the toast to be visible and read it straight away. Pull the number out with a regular expression."
          code={{
            playwright: "await page.locator('#btn-show-toast').click();\nconst text = await page.locator('#toast-message').textContent();\nawait page.getByTestId('answer-toast').fill(text!.match(/ORDER-\\d+/)![0]);",
            seleniumJava: 'driver.findElement(By.id("btn-show-toast")).click();\nString text = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("toast-message"))).getText();\nMatcher m = Pattern.compile("ORDER-\\\\d+").matcher(text);\nm.find();\ndriver.findElement(By.cssSelector("[data-testid=answer-toast]")).sendKeys(m.group());',
            seleniumPython: 'driver.find_element(By.ID, "btn-show-toast").click()\ntext = wait.until(EC.visibility_of_element_located((By.ID, "toast-message"))).text\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-toast]").send_keys(re.search(r"ORDER-\\d+", text).group())',
            cypress: "cy.get('#btn-show-toast').click();\ncy.get('#toast-message').invoke('text').then((t) =>\n  cy.get('[data-testid=answer-toast]').type(t.match(/ORDER-\\d+/)[0]));",
          }}
          answer={{ prompt: 'Order number:', expected: toastCode }}
        >
          <Button id="btn-show-toast" variant="outline" onClick={() => showToast(`Order ${toastCode} placed`)}>Place order</Button>
        </PracticeElement>

        <PracticeElement
          id="btn-hover-tooltip" label="Tooltip"
          goal="Hover the button, read the tooltip, and type the tip code in the answer box."
          pass={['The tooltip appears on hover (and on keyboard focus)', 'The answer matches the code in the tooltip']}
          fail={['Reading the tooltip without hovering: it is not in the DOM until then', 'Using the title attribute: this tooltip is a real element']}
          hint="The tooltip is added on hover and linked to the button with aria-describedby. Hover, then read the element with role tooltip."
          code={{
            playwright: "await page.locator('#btn-hover-tooltip').hover();\nconst tip = await page.getByRole('tooltip').textContent();\nawait page.getByTestId('answer-btn-hover-tooltip').fill(tip!.match(/TIP-\\d+/)![0]);",
            seleniumJava: 'new Actions(driver).moveToElement(driver.findElement(By.id("btn-hover-tooltip"))).perform();\nString tip = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tooltip-text"))).getText();',
            seleniumPython: 'ActionChains(driver).move_to_element(driver.find_element(By.ID, "btn-hover-tooltip")).perform()\ntip = wait.until(EC.visibility_of_element_located((By.ID, "tooltip-text"))).text',
            cypress: "cy.get('#btn-hover-tooltip').trigger('mouseover');\ncy.get('#tooltip-text').invoke('text').then((t) =>\n  cy.get('[data-testid=answer-btn-hover-tooltip]').type(t.match(/TIP-\\d+/)[0]));",
          }}
          answer={{ prompt: 'Tip code:', expected: tooltipCode }}
        >
          <div className="relative inline-block pb-10">
            <Button variant="outline" id="btn-hover-tooltip" aria-describedby={tooltip ? 'tooltip-text' : undefined}
              onMouseOver={() => setTooltip(true)} onMouseLeave={() => setTooltip(false)} onFocus={() => setTooltip(true)} onBlur={() => setTooltip(false)}>
              Hover Me
            </Button>
            {tooltip && (
              <div role="tooltip" id="tooltip-text" className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                I am a hover tooltip! Code {tooltipCode}
              </div>
            )}
          </div>
        </PracticeElement>
      </Section>
    </div>
  );
}

