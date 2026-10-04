import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { PracticeElement } from '@/components/practice/PracticeElement';
import countries from '@/data/countries.json';

const STATES: Record<string, { value: string; label: string }[]> = {
  us: [{ value: 'ny', label: 'New York' }, { value: 'ca', label: 'California' }, { value: 'tx', label: 'Texas' }],
  ca: [{ value: 'on', label: 'Ontario' }, { value: 'qc', label: 'Quebec' }, { value: 'bc', label: 'British Columbia' }],
};
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const FRUIT = ['apple', 'banana', 'orange', 'grape'];

/** A one-page PDF with a line of text; offsets are computed so any reader accepts it. */
function tinyPdf(text: string) {
  const stream = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => { const at = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return at; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  return out + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
}

function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const Section = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
    <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">{n}. {title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

const select = 'w-full border border-border rounded-md p-2 bg-white';

export default function AdvancedInputs() {
  // Values a script can only know by reading the page, so a correct answer proves it did.
  const [lockCode] = useState(() => `LOCK-${Math.floor(1000 + Math.random() * 9000)}`);
  const [orderTotal] = useState(() => (100 + Math.random() * 900).toFixed(2));

  const [standard, setStandard] = useState('');
  const [country, setCountry] = useState('');
  const [fruit, setFruit] = useState<string[]>([]);
  const [region, setRegion] = useState('us');
  const [state, setState] = useState('ny');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [single, setSingle] = useState<{ name: string; ok: boolean } | null>(null);
  const [multiple, setMultiple] = useState<string[]>([]);
  const [color, setColor] = useState('#3b82f6');

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Inputs</h1>
        <p className="text-slate-500">Dropdowns, date pickers, file uploads, downloads and pickers. Each element shows its goal beside it. A task ticks itself the moment your script gets it right. Read tasks have an answer box: your script types in what it read.</p>
      </div>

      <Section n={1} title="Dropdowns">
        <PracticeElement
          id="dropdown-standard" label="Standard HTML select"
          goal="Select “Option 2” by its value, not by clicking."
          pass={['The select shows Option 2', 'Works the same in every browser']}
          fail={['Clicking the option text by coordinates', 'Selecting by index when the order can change']}
          hint="Native <select> elements have a dedicated API in every tool. Use it rather than clicking the option."
          code={{
            playwright: "await page.locator('#dropdown-standard').selectOption('option2');",
            seleniumJava: 'new Select(driver.findElement(By.id("dropdown-standard"))).selectByValue("option2");',
            seleniumPython: 'Select(driver.find_element(By.ID, "dropdown-standard")).select_by_value("option2")',
            cypress: "cy.get('#dropdown-standard').select('option2');",
          }}
          done={standard === 'option2'}
        >
          <select className={select} id="dropdown-standard" value={standard} onChange={(e) => setStandard(e.target.value)}>
            <option value="">Choose an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </PracticeElement>

        <PracticeElement
          id="dropdown-searchable" label="Searchable autocomplete"
          goal="Type “Ind”, wait for suggestions, and pick India."
          pass={['The list filters to India and Indonesia', 'Clicking India fills the input and closes the list']}
          fail={['Clicking before the suggestions render', 'Picking Indonesia because it matched first']}
          hint="This is not a <select>. Type into the input, wait for the option element with the exact text, then click it."
          code={{
            playwright: "await page.locator('#dropdown-searchable').fill('Ind');\nawait page.getByText('India', { exact: true }).click();",
            seleniumJava: 'driver.findElement(By.id("dropdown-searchable")).sendKeys("Ind");\nnew WebDriverWait(driver, Duration.ofSeconds(5))\n  .until(ExpectedConditions.elementToBeClickable(By.xpath("//li[normalize-space()=\'India\']"))).click();',
            seleniumPython: 'driver.find_element(By.ID, "dropdown-searchable").send_keys("Ind")\nWebDriverWait(driver, 5).until(\n    EC.element_to_be_clickable((By.XPATH, "//li[normalize-space()=\'India\']"))).click()',
            cypress: "cy.get('#dropdown-searchable').type('Ind');\ncy.contains('li', /^India$/).click();",
          }}
          done={country === 'India'}
        >
          <SearchableDropdown options={countries} id="dropdown-searchable" placeholder="Search countries..." onChange={setCountry} />
        </PracticeElement>

        <PracticeElement
          id="dropdown-multiple" label="Multi-select"
          goal="Select exactly Banana and Grape, nothing else."
          pass={['Both stay selected together', 'Apple and Orange stay unselected']}
          fail={['A plain click on Grape drops Banana', 'Selecting all four']}
          hint="Multi-selects keep earlier picks only when you add to the selection. The select APIs accept several values at once."
          code={{
            playwright: "await page.locator('#dropdown-multiple').selectOption(['banana', 'grape']);",
            seleniumJava: 'Select s = new Select(driver.findElement(By.id("dropdown-multiple")));\ns.deselectAll();\ns.selectByValue("banana");\ns.selectByValue("grape");',
            seleniumPython: 's = Select(driver.find_element(By.ID, "dropdown-multiple"))\ns.deselect_all()\ns.select_by_value("banana")\ns.select_by_value("grape")',
            cypress: "cy.get('#dropdown-multiple').select(['banana', 'grape']);",
          }}
          done={fruit.length === 2 && fruit.includes('banana') && fruit.includes('grape')}
        >
          <select multiple className={`${select} h-24`} id="dropdown-multiple" value={fruit}
            onChange={(e) => setFruit([...e.target.selectedOptions].map((o) => o.value))}>
            {FRUIT.map((f) => <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)}</option>)}
          </select>
        </PracticeElement>

        <PracticeElement
          id="dropdown-disabled" label="Disabled dropdown"
          goal="Assert the dropdown is disabled, then read its locked code and type it in the answer box."
          pass={['The script asserts the disabled state before reading', 'The answer matches the code shown']}
          fail={['Trying to select an option (it must throw or be refused)', 'Reading a hardcoded code: it changes on every visit']}
          hint="Check the disabled property or attribute first. The code is the text of the selected option."
          code={{
            playwright: "await expect(page.locator('#dropdown-disabled')).toBeDisabled();\nconst code = await page.locator('#dropdown-disabled option').textContent();\nawait page.getByTestId('answer-dropdown-disabled').fill(code!);",
            seleniumJava: 'WebElement dd = driver.findElement(By.id("dropdown-disabled"));\nassertFalse(dd.isEnabled());\nString code = new Select(dd).getFirstSelectedOption().getText();\ndriver.findElement(By.cssSelector("[data-testid=answer-dropdown-disabled]")).sendKeys(code);',
            seleniumPython: 'dd = driver.find_element(By.ID, "dropdown-disabled")\nassert not dd.is_enabled()\ncode = Select(dd).first_selected_option.text\ndriver.find_element(By.CSS_SELECTOR, "[data-testid=answer-dropdown-disabled]").send_keys(code)',
            cypress: "cy.get('#dropdown-disabled').should('be.disabled')\n  .find('option').invoke('text')\n  .then((code) => cy.get('[data-testid=answer-dropdown-disabled]').type(code));",
          }}
          answer={{ prompt: 'Locked code:', expected: lockCode }}
        >
          <select disabled className={`${select} bg-slate-100`} id="dropdown-disabled">
            <option>{lockCode}</option>
          </select>
        </PracticeElement>

        <PracticeElement
          id="dropdown-cascading" label="Cascading dropdown (country, then state)"
          goal="Choose Canada, wait for the state list to change, then choose British Columbia."
          pass={['The second list shows Canadian provinces after Canada is chosen', 'British Columbia is selected']}
          fail={['Selecting the state before the list refreshes', 'Assuming US states are still there']}
          hint="The second list is rebuilt when the first one changes. Wait for the new option to exist before selecting it."
          code={{
            playwright: "await page.locator('#dropdown-country').selectOption('ca');\nawait page.locator('#dropdown-state').selectOption('bc'); // auto-waits for the option",
            seleniumJava: 'new Select(driver.findElement(By.id("dropdown-country"))).selectByValue("ca");\nnew WebDriverWait(driver, Duration.ofSeconds(5)).until(\n  ExpectedConditions.presenceOfElementLocated(By.cssSelector("#dropdown-state option[value=bc]")));\nnew Select(driver.findElement(By.id("dropdown-state"))).selectByValue("bc");',
            seleniumPython: 'Select(driver.find_element(By.ID, "dropdown-country")).select_by_value("ca")\nWebDriverWait(driver, 5).until(EC.presence_of_element_located(\n    (By.CSS_SELECTOR, "#dropdown-state option[value=bc]")))\nSelect(driver.find_element(By.ID, "dropdown-state")).select_by_value("bc")',
            cypress: "cy.get('#dropdown-country').select('ca');\ncy.get('#dropdown-state').select('bc');",
          }}
          done={region === 'ca' && state === 'bc'}
        >
          <div className="flex gap-2">
            <select className={`${select} flex-1`} id="dropdown-country" value={region}
              onChange={(e) => { setRegion(e.target.value); setState(STATES[e.target.value][0].value); }}>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
            </select>
            <select className={`${select} flex-1`} id="dropdown-state" value={state} onChange={(e) => setState(e.target.value)}>
              {STATES[region].map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Date & Time">
        <PracticeElement
          id="date-picker" label="Date picker"
          goal="Set the date to 15 August 2030."
          pass={['The input holds 2030-08-15', 'Works without opening the calendar popup']}
          fail={['Typing 15/08/2030: the value must be in ISO format', 'Clicking through months in the popup (slow and flaky)']}
          hint="A native date input stores yyyy-mm-dd no matter how the browser displays it. Fill it with that format."
          code={{
            playwright: "await page.locator('#date-picker').fill('2030-08-15');",
            seleniumJava: '// sendKeys follows the browser locale, so set the value directly\n((JavascriptExecutor) driver).executeScript(\n  "const el = arguments[0]; el.value = \'2030-08-15\'; el.dispatchEvent(new Event(\'input\', {bubbles: true}));",\n  driver.findElement(By.id("date-picker")));',
            seleniumPython: 'driver.execute_script(\n    "arguments[0].value = \'2030-08-15\'; arguments[0].dispatchEvent(new Event(\'input\', {bubbles: true}))",\n    driver.find_element(By.ID, "date-picker"))',
            cypress: "cy.get('#date-picker').type('2030-08-15');",
          }}
          done={date === '2030-08-15'}
        >
          <input type="date" className={select} id="date-picker" value={date} onChange={(e) => setDate(e.target.value)} />
        </PracticeElement>

        <PracticeElement
          id="time-picker" label="Time picker"
          goal="Set the time to 2:30 PM."
          pass={['The input holds 14:30']}
          fail={['Filling 2:30 PM: the stored value is 24-hour']}
          hint="Time inputs store HH:mm in 24-hour form, whatever the display shows."
          code={{
            playwright: "await page.locator('#time-picker').fill('14:30');",
            seleniumJava: '((JavascriptExecutor) driver).executeScript(\n  "arguments[0].value=\'14:30\'; arguments[0].dispatchEvent(new Event(\'input\',{bubbles:true}))",\n  driver.findElement(By.id("time-picker")));',
            seleniumPython: 'driver.execute_script(\n    "arguments[0].value=\'14:30\'; arguments[0].dispatchEvent(new Event(\'input\',{bubbles:true}))",\n    driver.find_element(By.ID, "time-picker"))',
            cypress: "cy.get('#time-picker').type('14:30');",
          }}
          done={time === '14:30'}
        >
          <input type="time" className={select} id="time-picker" value={time} onChange={(e) => setTime(e.target.value)} />
        </PracticeElement>

        <PracticeElement
          id="datetime-picker" label="Date-time picker"
          goal="Set 31 December 2030, 11:59 PM."
          pass={['The input holds 2030-12-31T23:59']}
          fail={['Leaving out the T between date and time', 'Using a 12-hour clock']}
          hint="datetime-local values look like yyyy-mm-ddTHH:mm."
          code={{
            playwright: "await page.locator('#datetime-picker').fill('2030-12-31T23:59');",
            seleniumJava: '((JavascriptExecutor) driver).executeScript(\n  "arguments[0].value=\'2030-12-31T23:59\'; arguments[0].dispatchEvent(new Event(\'input\',{bubbles:true}))",\n  driver.findElement(By.id("datetime-picker")));',
            seleniumPython: 'driver.execute_script(\n    "arguments[0].value=\'2030-12-31T23:59\'; arguments[0].dispatchEvent(new Event(\'input\',{bubbles:true}))",\n    driver.find_element(By.ID, "datetime-picker"))',
            cypress: "cy.get('#datetime-picker').type('2030-12-31T23:59');",
          }}
          done={dateTime === '2030-12-31T23:59'}
        >
          <input type="datetime-local" className={select} id="datetime-picker" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
        </PracticeElement>
      </Section>

      <Section n={3} title="File uploads">
        <PracticeElement
          id="file-upload-single" label="Single image upload"
          goal="Upload a PNG or JPG. Then try a .txt file and check the error."
          pass={['An image shows “Selected: <name>”', 'A non-image shows an error message']}
          fail={['Clicking the input to open the OS dialog: automation cannot drive it', 'Ignoring the error case']}
          hint="Never click a file input. Send the file path straight to the input element."
          code={{
            playwright: "await page.locator('#file-upload-single').setInputFiles('fixtures/photo.png');",
            seleniumJava: 'driver.findElement(By.id("file-upload-single"))\n  .sendKeys(new File("fixtures/photo.png").getAbsolutePath());',
            seleniumPython: 'driver.find_element(By.ID, "file-upload-single").send_keys(os.path.abspath("fixtures/photo.png"))',
            cypress: "cy.get('#file-upload-single').selectFile('cypress/fixtures/photo.png');",
          }}
          done={!!single?.ok}
        >
          <input type="file" accept="image/*" className="w-full border border-border rounded-md p-2 text-sm" id="file-upload-single"
            onChange={(e) => { const f = e.target.files?.[0]; setSingle(f ? { name: f.name, ok: IMAGE_TYPES.includes(f.type) } : null); }} />
          {single && (single.ok
            ? <p className="text-xs text-green-700 mt-2" data-testid="upload-single-result">Selected: {single.name}</p>
            : <p className="text-xs text-red-600 mt-2" role="alert" data-testid="upload-single-error">“{single.name}” is not an image. Choose a PNG, JPG, GIF or WebP.</p>)}
        </PracticeElement>

        <PracticeElement
          id="file-upload-multiple" label="Multiple file upload"
          goal="Upload two or more files in one go."
          pass={['Every file name appears in the list']}
          fail={['Uploading one file at a time: the second replaces the first']}
          hint="Pass all the paths in a single call."
          code={{
            playwright: "await page.locator('#file-upload-multiple').setInputFiles(['a.txt', 'b.txt']);",
            seleniumJava: '// Separate absolute paths with a newline\ndriver.findElement(By.id("file-upload-multiple")).sendKeys(pathA + "\\n" + pathB);',
            seleniumPython: 'driver.find_element(By.ID, "file-upload-multiple").send_keys(path_a + "\\n" + path_b)',
            cypress: "cy.get('#file-upload-multiple').selectFile(['cypress/fixtures/a.txt', 'cypress/fixtures/b.txt']);",
          }}
          done={multiple.length >= 2}
        >
          <input type="file" multiple className="w-full border border-border rounded-md p-2 text-sm" id="file-upload-multiple"
            onChange={(e) => setMultiple([...(e.target.files ?? [])].map((f) => f.name))} />
          {multiple.length > 0 && (
            <ul className="mt-2 text-xs text-slate-600 list-disc pl-5" data-testid="upload-multiple-list">{multiple.map((n) => <li key={n}>{n}</li>)}</ul>
          )}
        </PracticeElement>
      </Section>

      <Section n={4} title="Downloads">
        <PracticeElement
          id="download-csv" label="Downloads"
          goal="Download the CSV, read the order total from inside the file, and type it in the answer box."
          pass={['The file is saved with a .csv name', 'The answer matches the total inside the file']}
          fail={['Asserting only that a click happened', 'Hardcoding the total: it changes on every visit']}
          hint="Wait for the download event, save the file, then parse it. The total is on the last line."
          code={{
            playwright: "const [dl] = await Promise.all([\n  page.waitForEvent('download'),\n  page.locator('#download-csv').click(),\n]);\nconst csv = fs.readFileSync(await dl.path(), 'utf8');\nconst total = csv.trim().split('\\n').pop()!.split(',')[1];\nawait page.getByTestId('answer-download-csv').fill(total);",
            seleniumJava: '// Set the browser download directory in ChromeOptions prefs, click, then wait for the file\ndriver.findElement(By.id("download-csv")).click();\nPath csv = waitForFile(downloadDir.resolve("order.csv"));\nString[] lines = Files.readAllLines(csv).toArray(new String[0]);\nString total = lines[lines.length - 1].split(",")[1];',
            seleniumPython: 'driver.find_element(By.ID, "download-csv").click()\ncsv = wait_for_file(download_dir / "order.csv")\ntotal = csv.read_text().strip().splitlines()[-1].split(",")[1]',
            cypress: "cy.get('#download-csv').click();\ncy.readFile('cypress/downloads/order.csv').then((csv) => {\n  const total = csv.trim().split('\\n').pop().split(',')[1];\n  cy.get('[data-testid=answer-download-csv]').type(total);\n});",
          }}
          answer={{ prompt: 'Order total:', expected: orderTotal }}
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" id="download-pdf" onClick={() => download('invoice.pdf', 'application/pdf', tinyPdf(`QA Playground invoice - total ${orderTotal}`))}>Download PDF</Button>
            <Button variant="outline" id="download-csv" onClick={() => download('order.csv', 'text/csv', `item,price\nWidget,${(+orderTotal * 0.6).toFixed(2)}\nGadget,${(+orderTotal * 0.4).toFixed(2)}\nTotal,${orderTotal}\n`)}>Download CSV</Button>
            <Button variant="outline" id="download-json" onClick={() => download('order.json', 'application/json', JSON.stringify({ items: ['Widget', 'Gadget'], total: +orderTotal }, null, 2))}>Download JSON</Button>
          </div>
        </PracticeElement>
      </Section>

      <Section n={5} title="Pickers">
        <PracticeElement
          id="color-picker" label="Color picker"
          goal="Set the colour to #22c55e (green)."
          pass={['The swatch turns green', 'The value is lowercase hex']}
          fail={['Opening the OS colour dialog', 'Setting an rgb() string: colour inputs only take #rrggbb']}
          hint="Colour inputs accept a #rrggbb value directly. Set it and fire an input event."
          code={{
            playwright: "await page.locator('#color-picker').fill('#22c55e');",
            seleniumJava: '((JavascriptExecutor) driver).executeScript(\n  "arguments[0].value=\'#22c55e\'; arguments[0].dispatchEvent(new Event(\'input\',{bubbles:true}))",\n  driver.findElement(By.id("color-picker")));',
            seleniumPython: 'driver.execute_script(\n    "arguments[0].value=\'#22c55e\'; arguments[0].dispatchEvent(new Event(\'input\',{bubbles:true}))",\n    driver.find_element(By.ID, "color-picker"))',
            cypress: "cy.get('#color-picker').invoke('val', '#22c55e').trigger('input');",
          }}
          done={color.toLowerCase() === '#22c55e'}
        >
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 cursor-pointer" id="color-picker" />
            <code className="text-sm text-slate-600" data-testid="color-value">{color}</code>
          </div>
        </PracticeElement>
      </Section>
    </div>
  );
}
