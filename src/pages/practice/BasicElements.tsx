import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

type Field = 'text' | 'password' | 'email' | 'number' | 'phone' | 'url' | 'search';
const EMPTY: Record<Field, string> = { text: '', password: '', email: '', number: '', phone: '', url: '', search: '' };
const FORMAT_FIELDS: { name: Field; label: string; type: string }[] = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'number', label: 'Number (10-100)', type: 'number' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'search', label: 'Search', type: 'search' },
];
const BUTTONS = ['Normal Button', 'Submit Button', 'Reset Button', 'FAB (+)'];

function validate(name: Field, value: string) {
  if (!value) return '';
  switch (name) {
    case 'text': return value.length < 3 ? 'Text must be at least 3 characters' : '';
    case 'password':
      if (value.length < 8) return 'Password must be at least 8 characters';
      return /[A-Z]/.test(value) ? '' : 'Password must contain an uppercase letter';
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format (e.g. name@domain.com)';
    case 'number': return isNaN(Number(value)) || Number(value) < 10 || Number(value) > 100 ? 'Number must be between 10 and 100' : '';
    case 'phone': return /^\+?[\d\s-]{10,15}$/.test(value) ? '' : 'Invalid phone number format (10-15 digits)';
    case 'url': return /^(https?:\/\/)?[\da-z.-]+\.[a-z.]{2,6}[/\w .-]*\/?$/.test(value) ? '' : 'Invalid URL format (e.g. https://example.com)';
    case 'search': return /[^a-zA-Z0-9\s]/.test(value) ? 'Search cannot contain special characters' : '';
  }
}

const errClass = (err: string) => (err ? 'border-red-500 focus-visible:ring-red-500' : '');

export default function BasicElements() {
  // Values a script can only know by reading the page, so a correct answer proves it did.
  const [hiddenValue] = useState(() => `secret-${Math.random().toString(36).slice(2, 8)}`);
  const [readonlyValue] = useState(() => `RO-${Math.floor(1000 + Math.random() * 9000)}`);

  const [values, setValues] = useState(EMPTY);
  // Validation tasks need the error seen once, then cleared.
  const [sawError, setSawError] = useState<Partial<Record<Field, boolean>>>({});
  const errors = Object.fromEntries((Object.keys(EMPTY) as Field[]).map((f) => [f, validate(f, values[f])])) as Record<Field, string>;
  const [textarea, setTextarea] = useState('');
  const [clicked, setClicked] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingClicks, setLoadingClicks] = useState(0);
  const [checks, setChecks] = useState({ single: false, a: false, b: false });
  const [radio, setRadio] = useState('');
  const [slider, setSlider] = useState(50);
  const [toggle, setToggle] = useState(false);
  const [internalLink, setInternalLink] = useState(false);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as Field;
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (validate(name, e.target.value)) setSawError((s) => ({ ...s, [name]: true }));
  };

  const click = (name: string) => {
    setClicked((c) => (c.includes(name) ? c : [...c, name]));
    setMessage(name);
    // Each click restarts the timer, so an earlier click cannot hide a newer message.
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 3000);
  };

  const clickLoading = () => {
    setLoadingClicks((n) => n + 1);
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const fixedAfterError = (f: Field) => !!sawError[f] && values[f] !== '' && !errors[f];

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Basic Elements</h1>
        <p className="text-slate-500">Text inputs, buttons, checkboxes, radios, sliders, toggles and links. Each element shows its goal beside it, and its task ticks itself the moment your script gets it right. Read tasks have an answer box: your script types in what it read.</p>
      </div>

      <Section n={1} title="Input fields">
        <PracticeElement
          id="basic-text" label="Textbox with validation"
          goal="Type “ab” to trigger the error, check the message, then type “QA Tester” so the error clears."
          pass={['“ab” shows “Text must be at least 3 characters”', 'A 3+ character value removes the error']}
          fail={['Typing only the valid value: the error path is never tested', 'Appending to “ab” instead of clearing first']}
          hint="fill() replaces the value. sendKeys() and type() append, so clear the field before the second value."
          code={{
            playwright: "const box = page.locator('#basic-text');\nawait box.fill('ab');\nawait expect(page.locator('#basic-text-error')).toHaveText('Text must be at least 3 characters');\nawait box.fill('QA Tester');\nawait expect(page.locator('#basic-text-error')).toHaveCount(0);",
            seleniumJava: 'WebElement box = driver.findElement(By.id("basic-text"));\nbox.sendKeys("ab");\nassertEquals("Text must be at least 3 characters", driver.findElement(By.id("basic-text-error")).getText());\nbox.clear();\nbox.sendKeys("QA Tester");\nassertTrue(driver.findElements(By.id("basic-text-error")).isEmpty());',
            seleniumPython: 'box = driver.find_element(By.ID, "basic-text")\nbox.send_keys("ab")\nassert driver.find_element(By.ID, "basic-text-error").text == "Text must be at least 3 characters"\nbox.clear()\nbox.send_keys("QA Tester")\nassert not driver.find_elements(By.ID, "basic-text-error")',
            cypress: "cy.get('#basic-text').type('ab');\ncy.get('#basic-text-error').should('have.text', 'Text must be at least 3 characters');\ncy.get('#basic-text').clear().type('QA Tester');\ncy.get('#basic-text-error').should('not.exist');",
          }}
          done={fixedAfterError('text')}
        >
          <Input type="text" name="text" value={values.text} onChange={onInput} placeholder="Standard text input" id="basic-text" aria-label="Textbox" className={errClass(errors.text)} />
          {errors.text && <p className="text-xs text-red-500 mt-1" id="basic-text-error">{errors.text}</p>}
        </PracticeElement>

        <PracticeElement
          id="basic-password" label="Password rules"
          goal="Trigger both password errors (too short, then no uppercase letter), then enter a valid password."
          pass={['“abc” says at least 8 characters', '“abcdefgh” says it needs an uppercase letter', '“Abcdefgh” clears the error']}
          fail={['Asserting on the typed value: password inputs hide it on screen, not in the DOM', 'Checking only the happy path']}
          hint="Each rule has its own message. Assert the exact text after each value."
          code={{
            playwright: "const pw = page.locator('#basic-password');\nconst err = page.locator('#basic-password-error');\nawait pw.fill('abc');\nawait expect(err).toContainText('8 characters');\nawait pw.fill('abcdefgh');\nawait expect(err).toContainText('uppercase');\nawait pw.fill('Abcdefgh');\nawait expect(err).toHaveCount(0);",
            seleniumJava: 'WebElement pw = driver.findElement(By.id("basic-password"));\npw.sendKeys("abc");\nassertTrue(driver.findElement(By.id("basic-password-error")).getText().contains("8 characters"));\npw.clear(); pw.sendKeys("abcdefgh");\nassertTrue(driver.findElement(By.id("basic-password-error")).getText().contains("uppercase"));\npw.clear(); pw.sendKeys("Abcdefgh");\nassertTrue(driver.findElements(By.id("basic-password-error")).isEmpty());',
            seleniumPython: 'pw = driver.find_element(By.ID, "basic-password")\npw.send_keys("abc")\nassert "8 characters" in driver.find_element(By.ID, "basic-password-error").text\npw.clear(); pw.send_keys("abcdefgh")\nassert "uppercase" in driver.find_element(By.ID, "basic-password-error").text\npw.clear(); pw.send_keys("Abcdefgh")\nassert not driver.find_elements(By.ID, "basic-password-error")',
            cypress: "cy.get('#basic-password').type('abc');\ncy.get('#basic-password-error').should('contain', '8 characters');\ncy.get('#basic-password').clear().type('abcdefgh');\ncy.get('#basic-password-error').should('contain', 'uppercase');\ncy.get('#basic-password').clear().type('Abcdefgh');\ncy.get('#basic-password-error').should('not.exist');",
          }}
          done={fixedAfterError('password')}
        >
          <Input type="password" name="password" value={values.password} onChange={onInput} placeholder="Password input" id="basic-password" aria-label="Password" className={errClass(errors.password)} />
          {errors.password && <p className="text-xs text-red-500 mt-1" id="basic-password-error">{errors.password}</p>}
        </PracticeElement>

        <PracticeElement
          id="basic-formats" label="Format-checked fields"
          goal="Fill email, number, phone, URL and search with valid values so no field shows an error."
          pass={['All five hold a value', 'No error message is on the page', 'The number is between 10 and 100 (try the edges)']}
          fail={['A number like 101 or 9', 'A search term with symbols such as “qa!”']}
          hint="Drive it from a data table: one row per field with a valid value. Then assert no element ending in -error exists."
          code={{
            playwright: "const valid = { email: 'qa@example.com', number: '100', phone: '+1 555 123 4567', url: 'https://example.com', search: 'selenium tips' };\nfor (const [field, value] of Object.entries(valid)) await page.locator(`#basic-${field}`).fill(value);\nawait expect(page.locator('[id$=\"-error\"]')).toHaveCount(0);",
            seleniumJava: 'Map<String, String> valid = Map.of("email", "qa@example.com", "number", "100",\n  "phone", "+1 555 123 4567", "url", "https://example.com", "search", "selenium tips");\nvalid.forEach((f, v) -> driver.findElement(By.id("basic-" + f)).sendKeys(v));\nassertTrue(driver.findElements(By.cssSelector("[id$=\'-error\']")).isEmpty());',
            seleniumPython: 'valid = {"email": "qa@example.com", "number": "100", "phone": "+1 555 123 4567",\n         "url": "https://example.com", "search": "selenium tips"}\nfor field, value in valid.items():\n    driver.find_element(By.ID, f"basic-{field}").send_keys(value)\nassert not driver.find_elements(By.CSS_SELECTOR, "[id$=\'-error\']")',
            cypress: "const valid = { email: 'qa@example.com', number: '100', phone: '+1 555 123 4567', url: 'https://example.com', search: 'selenium tips' };\nObject.entries(valid).forEach(([f, v]) => cy.get(`#basic-${f}`).type(v));\ncy.get('[id$=\"-error\"]').should('not.exist');",
          }}
          done={FORMAT_FIELDS.every((f) => values[f.name] !== '' && !errors[f.name])}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FORMAT_FIELDS.map((f) => (
              <div key={f.name}>
                <label htmlFor={`basic-${f.name}`} className="block text-sm mb-1">{f.label}</label>
                <Input type={f.type} name={f.name} value={values[f.name]} onChange={onInput} placeholder={`${f.label} input`} id={`basic-${f.name}`} className={errClass(errors[f.name])} />
                {errors[f.name] && <p className="text-xs text-red-500 mt-1" id={`basic-${f.name}-error`}>{errors[f.name]}</p>}
              </div>
            ))}
          </div>
        </PracticeElement>

        <PracticeElement
          id="basic-hidden" label="Hidden input"
          goal="Read the value of the hidden input and type it in the answer box."
          pass={['The answer matches the hidden value']}
          fail={['Waiting for it to be visible: it never will be', 'Hardcoding the value: it changes on every visit']}
          hint="Hidden inputs have no visible text. Read the value attribute instead of the text."
          code={{
            playwright: "const secret = await page.locator('#basic-hidden').inputValue();\nawait page.getByTestId('answer-basic-hidden').fill(secret);",
            seleniumJava: 'String secret = driver.findElement(By.id("basic-hidden")).getAttribute("value");\ndriver.findElement(By.cssSelector("[data-testid=answer-basic-hidden]")).sendKeys(secret);',
            seleniumPython: 'secret = driver.find_element(By.ID, "basic-hidden").get_attribute("value")\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-basic-hidden]").send_keys(secret)',
            cypress: "cy.get('#basic-hidden').invoke('val')\n  .then((secret) => cy.get('[data-testid=answer-basic-hidden]').type(String(secret)));",
          }}
          answer={{ prompt: 'Hidden value:', expected: hiddenValue }}
        >
          <p className="text-sm text-slate-500">There is an input here. You just can't see it.</p>
          <input type="hidden" value={hiddenValue} id="basic-hidden" />
        </PracticeElement>

        <PracticeElement
          id="basic-readonly" label="Read-only and disabled inputs"
          goal="Assert the first input is read-only and the second is disabled, then type the read-only value in the answer box."
          pass={['The read-only check passes and the disabled check passes', 'The answer matches the read-only value']}
          fail={['Treating read-only as disabled: a read-only field is still focusable and submitted with the form', 'Typing into either field']}
          hint="Read-only is an attribute; disabled has its own state check in every tool."
          code={{
            playwright: "await expect(page.locator('#basic-readonly')).not.toBeEditable();\nawait expect(page.locator('#basic-disabled')).toBeDisabled();\nawait page.getByTestId('answer-basic-readonly').fill(await page.locator('#basic-readonly').inputValue());",
            seleniumJava: 'WebElement ro = driver.findElement(By.id("basic-readonly"));\nassertNotNull(ro.getAttribute("readonly"));\nassertFalse(driver.findElement(By.id("basic-disabled")).isEnabled());\ndriver.findElement(By.cssSelector("[data-testid=answer-basic-readonly]")).sendKeys(ro.getAttribute("value"));',
            seleniumPython: 'ro = driver.find_element(By.ID, "basic-readonly")\nassert ro.get_attribute("readonly") is not None\nassert not driver.find_element(By.ID, "basic-disabled").is_enabled()\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-basic-readonly]").send_keys(ro.get_attribute("value"))',
            cypress: "cy.get('#basic-readonly').should('have.attr', 'readonly');\ncy.get('#basic-disabled').should('be.disabled');\ncy.get('#basic-readonly').invoke('val')\n  .then((v) => cy.get('[data-testid=answer-basic-readonly]').type(String(v)));",
          }}
          answer={{ prompt: 'Read-only value:', expected: readonlyValue }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label htmlFor="basic-readonly" className="block text-sm mb-1">Read-only input</label><Input type="text" value={readonlyValue} readOnly id="basic-readonly" /></div>
            <div><label htmlFor="basic-disabled" className="block text-sm mb-1">Disabled input</label><Input type="text" placeholder="I am disabled" disabled id="basic-disabled" /></div>
          </div>
        </PracticeElement>

        <PracticeElement
          id="basic-textarea" label="Multi-line textarea"
          goal="Type a message of at least three lines."
          pass={['The textarea holds three or more lines', 'Line breaks are real newlines']}
          fail={['Pressing Enter in a single-line input', 'Typing a literal “\\n” as two characters']}
          hint="Put newline characters inside the string you send. Every tool turns them into line breaks in a textarea."
          code={{
            playwright: "await page.locator('#basic-textarea').fill('Line one\\nLine two\\nLine three');",
            seleniumJava: 'driver.findElement(By.id("basic-textarea")).sendKeys("Line one\\nLine two\\nLine three");',
            seleniumPython: 'driver.find_element(By.ID, "basic-textarea").send_keys("Line one\\nLine two\\nLine three")',
            cypress: "cy.get('#basic-textarea').type('Line one{enter}Line two{enter}Line three');",
          }}
          done={textarea.split('\n').filter((l) => l.trim()).length >= 3}
        >
          <textarea className="w-full border border-border rounded-md p-2" rows={4} placeholder="Type a long message here..." id="basic-textarea" aria-label="Multi-line textarea" value={textarea} onChange={(e) => setTextarea(e.target.value)} />
        </PracticeElement>
      </Section>

      <Section n={2} title="Buttons">
        <PracticeElement
          id="basic-buttons" label="Button types"
          goal="Click the Normal, Submit, Reset and round (+) buttons, and assert the disabled button cannot be clicked."
          pass={['Each click shows “Successfully clicked: <name>”', 'The disabled button reports disabled']}
          fail={['Forcing a click on the disabled button', 'Finding the round button by its “+” text alone: prefer the id']}
          hint="Assert the confirmation message after each click. It disappears after three seconds."
          code={{
            playwright: "for (const id of ['btn-normal', 'btn-submit', 'btn-reset', 'btn-fab']) {\n  await page.locator(`#${id}`).click();\n  await expect(page.locator('#button-message')).toBeVisible();\n}\nawait expect(page.locator('#btn-disabled')).toBeDisabled();",
            seleniumJava: 'for (String id : List.of("btn-normal", "btn-submit", "btn-reset", "btn-fab")) {\n  driver.findElement(By.id(id)).click();\n  wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("button-message")));\n}\nassertFalse(driver.findElement(By.id("btn-disabled")).isEnabled());',
            seleniumPython: 'for id in ["btn-normal", "btn-submit", "btn-reset", "btn-fab"]:\n    driver.find_element(By.ID, id).click()\n    wait.until(EC.visibility_of_element_located((By.ID, "button-message")))\nassert not driver.find_element(By.ID, "btn-disabled").is_enabled()',
            cypress: "['btn-normal', 'btn-submit', 'btn-reset', 'btn-fab'].forEach((id) => {\n  cy.get(`#${id}`).click();\n  cy.get('#button-message').should('be.visible');\n});\ncy.get('#btn-disabled').should('be.disabled');",
          }}
          done={BUTTONS.every((b) => clicked.includes(b))}
        >
          <div className="flex flex-wrap gap-4 items-center">
            <Button id="btn-normal" onClick={() => click('Normal Button')}>Normal Button</Button>
            <Button type="submit" variant="outline" id="btn-submit" onClick={() => click('Submit Button')}>Submit Button</Button>
            <Button type="reset" variant="outline" id="btn-reset" onClick={() => click('Reset Button')}>Reset Button</Button>
            <Button disabled id="btn-disabled">Disabled Button</Button>
            <button type="button" aria-label="Add" className="h-12 w-12 rounded-full bg-primary text-stone-900 shadow-lg flex items-center justify-center hover:scale-105 transition-transform" id="btn-fab" onClick={() => click('FAB (+)')}>+</button>
          </div>
          {message && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200" id="button-message" role="status">
              Successfully clicked: <strong>{message}</strong>
            </div>
          )}
        </PracticeElement>

        <PracticeElement
          id="btn-loading" label="Loading button"
          goal="Click the loading button, wait until it is enabled again, then click it a second time."
          pass={['The button shows “Loading...” and is disabled after the first click', 'The second click lands after it re-enables']}
          fail={['A fixed sleep: it either wastes time or is too short', 'Clicking while it is still disabled']}
          hint="The button re-enables after about three seconds. Wait for its enabled state, not for a set time."
          code={{
            playwright: "const btn = page.locator('#btn-loading');\nawait btn.click();\nawait expect(btn).toBeDisabled();\nawait expect(btn).toBeEnabled({ timeout: 5000 });\nawait btn.click();",
            seleniumJava: 'WebElement btn = driver.findElement(By.id("btn-loading"));\nbtn.click();\nnew WebDriverWait(driver, Duration.ofSeconds(5)).until(ExpectedConditions.elementToBeClickable(btn)).click();',
            seleniumPython: 'btn = driver.find_element(By.ID, "btn-loading")\nbtn.click()\nWebDriverWait(driver, 5).until(EC.element_to_be_clickable(btn)).click()',
            cypress: "cy.get('#btn-loading').click().should('be.disabled');\ncy.get('#btn-loading', { timeout: 5000 }).should('be.enabled').click();",
          }}
          done={loadingClicks >= 2}
        >
          <Button onClick={clickLoading} disabled={loading} id="btn-loading">
            {loading ? 'Loading...' : 'AJAX/Loading Button'}
          </Button>
        </PracticeElement>
      </Section>

      <Section n={3} title="Checkboxes and radios">
        <PracticeElement
          id="basic-checkboxes" label="Checkboxes"
          goal="Check “Single Checkbox” and “Option B”. Leave “Option A” unchecked."
          pass={['Exactly those two are checked', 'Running the script twice gives the same result']}
          fail={['click() on an already checked box unchecks it', 'Checking Option A by mistake']}
          hint="Use a check() style call that only checks when the box is unchecked, or test isSelected() before clicking."
          code={{
            playwright: "await page.locator('#chk-single').check();\nawait page.locator('#chk-multi-2').check();\nawait expect(page.locator('#chk-multi-1')).not.toBeChecked();",
            seleniumJava: 'for (String id : List.of("chk-single", "chk-multi-2")) {\n  WebElement box = driver.findElement(By.id(id));\n  if (!box.isSelected()) box.click();\n}\nassertFalse(driver.findElement(By.id("chk-multi-1")).isSelected());',
            seleniumPython: 'for id in ["chk-single", "chk-multi-2"]:\n    box = driver.find_element(By.ID, id)\n    if not box.is_selected():\n        box.click()\nassert not driver.find_element(By.ID, "chk-multi-1").is_selected()',
            cypress: "cy.get('#chk-single').check();\ncy.get('#chk-multi-2').check();\ncy.get('#chk-multi-1').should('not.be.checked');",
          }}
          done={checks.single && !checks.a && checks.b}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="h-4 w-4" id="chk-single" checked={checks.single} onChange={(e) => setChecks((c) => ({ ...c, single: e.target.checked }))} /> Single Checkbox</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="h-4 w-4" id="chk-multi-1" checked={checks.a} onChange={(e) => setChecks((c) => ({ ...c, a: e.target.checked }))} /> Option A</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="h-4 w-4" id="chk-multi-2" checked={checks.b} onChange={(e) => setChecks((c) => ({ ...c, b: e.target.checked }))} /> Option B</label>
          </div>
        </PracticeElement>

        <PracticeElement
          id="basic-radio" label="Radio group"
          goal="Select “No” and assert that “Yes” is not selected."
          pass={['“No” is checked', 'Only one radio in the group is checked']}
          fail={['Expecting uncheck() to work on a radio: only another option clears it']}
          hint="Radios in the same name group are exclusive. Select one and assert the other."
          code={{
            playwright: "await page.locator('#radio-no').check();\nawait expect(page.locator('#radio-yes')).not.toBeChecked();",
            seleniumJava: 'driver.findElement(By.id("radio-no")).click();\nassertFalse(driver.findElement(By.id("radio-yes")).isSelected());',
            seleniumPython: 'driver.find_element(By.ID, "radio-no").click()\nassert not driver.find_element(By.ID, "radio-yes").is_selected()',
            cypress: "cy.get('#radio-no').check();\ncy.get('#radio-yes').should('not.be.checked');",
          }}
          done={radio === 'no'}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="radio-group-1" value="yes" id="radio-yes" checked={radio === 'yes'} onChange={() => setRadio('yes')} /> Yes</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="radio-group-1" value="no" id="radio-no" checked={radio === 'no'} onChange={() => setRadio('no')} /> No</label>
          </div>
        </PracticeElement>
      </Section>

      <Section n={4} title="Sliders and toggles">
        <PracticeElement
          id="slider-volume" label="Range slider"
          goal="Set the volume slider to exactly 75."
          pass={['The number beside the slider reads 75']}
          fail={['Dragging by pixels: the result depends on the slider width', 'Setting the value without firing an event, so the number never updates']}
          hint="Arrow keys move a range input one step at a time. Or set the value and dispatch an input event."
          code={{
            playwright: "await page.locator('#slider-volume').fill('75');\nawait expect(page.locator('#slider-value-display')).toHaveText('75');",
            seleniumJava: 'WebElement s = driver.findElement(By.id("slider-volume"));\nfor (int i = 50; i < 75; i++) s.sendKeys(Keys.ARROW_RIGHT);\nassertEquals("75", driver.findElement(By.id("slider-value-display")).getText());',
            seleniumPython: 's = driver.find_element(By.ID, "slider-volume")\nfor _ in range(25):\n    s.send_keys(Keys.ARROW_RIGHT)\nassert driver.find_element(By.ID, "slider-value-display").text == "75"',
            cypress: "cy.get('#slider-volume').invoke('val', 75).trigger('input');\ncy.get('#slider-value-display').should('have.text', '75');",
          }}
          done={slider === 75}
        >
          <div className="flex justify-between mb-2">
            <label htmlFor="slider-volume" className="block text-sm font-medium">Range Slider (Volume)</label>
            <span className="text-sm font-bold text-primary" id="slider-value-display">{slider}</span>
          </div>
          <input type="range" min="0" max="100" value={slider} onChange={(e) => setSlider(Number(e.target.value))} className="w-full accent-primary cursor-pointer" id="slider-volume" />
        </PracticeElement>

        <PracticeElement
          id="toggle-switch-1" label="Toggle switch"
          goal="Turn the switch on."
          pass={['The hidden checkbox behind the switch is checked']}
          fail={['Clicking the checkbox itself: it is visually hidden, so a real click is refused', 'Forcing the click instead of clicking what a user sees']}
          hint="The real checkbox is hidden behind a styled label. Click the label text, then assert the checkbox."
          code={{
            playwright: "await page.getByText('On/Off Switch', { exact: true }).click();\nawait expect(page.locator('#toggle-switch-1')).toBeChecked();",
            seleniumJava: 'driver.findElement(By.xpath("//span[text()=\'On/Off Switch\']")).click();\nassertTrue(driver.findElement(By.id("toggle-switch-1")).isSelected());',
            seleniumPython: 'driver.find_element(By.XPATH, "//span[text()=\'On/Off Switch\']").click()\nassert driver.find_element(By.ID, "toggle-switch-1").is_selected()',
            cypress: "cy.contains('span', 'On/Off Switch').click();\ncy.get('#toggle-switch-1').should('be.checked');",
          }}
          done={toggle}
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" id="toggle-switch-1" checked={toggle} onChange={(e) => setToggle(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            <span className="ml-3 text-sm font-medium text-slate-900">On/Off Switch</span>
          </label>
        </PracticeElement>
      </Section>

      <Section n={5} title="Links">
        <PracticeElement
          id="basic-links" label="Links"
          goal="Assert the external link opens in a new tab, then click the internal link."
          pass={['The external link has target="_blank" and an https href', 'Clicking the internal link moves to its anchor']}
          fail={['Clicking the external link without handling the new tab', 'Asserting on link text only']}
          hint="Check link attributes without clicking. Clicking a target=_blank link opens a second window you would have to switch to."
          code={{
            playwright: "await expect(page.locator('#link-external')).toHaveAttribute('target', '_blank');\nawait page.locator('#link-internal').click();\nawait expect(page).toHaveURL(/#basic-links-target$/);",
            seleniumJava: 'assertEquals("_blank", driver.findElement(By.id("link-external")).getAttribute("target"));\ndriver.findElement(By.id("link-internal")).click();\nassertTrue(driver.getCurrentUrl().endsWith("#basic-links-target"));',
            seleniumPython: 'assert driver.find_element(By.ID, "link-external").get_attribute("target") == "_blank"\ndriver.find_element(By.ID, "link-internal").click()\nassert driver.current_url.endswith("#basic-links-target")',
            cypress: "cy.get('#link-external').should('have.attr', 'target', '_blank');\ncy.get('#link-internal').click();\ncy.location('hash').should('eq', '#basic-links-target');",
          }}
          done={internalLink}
        >
          <div className="flex flex-wrap gap-4" id="basic-links-target">
            <a href="#basic-links-target" className="text-primary hover:underline" id="link-internal" onClick={() => setInternalLink(true)}>Internal Anchor Link</a>
            <a href="https://example.com" target="_blank" rel="noreferrer" className="text-primary hover:underline" id="link-external">External Link (New Tab)</a>
          </div>
        </PracticeElement>
      </Section>
    </div>
  );
}
