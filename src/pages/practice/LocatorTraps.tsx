import { useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { Button } from '@/components/ui/Button';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const randomId = () => {
  let suffix = '';
  while (suffix.length < 6) suffix += Math.random().toString(36).slice(2);
  return `btn-${suffix.slice(0, 6)}`;
};

type ClassButton = { label: string; variant: string };
const CLASS_BUTTONS: ClassButton[] = [
  { label: 'Primary', variant: 'btn-primary' },
  { label: 'Secondary', variant: 'btn-secondary' },
  { label: 'Warning', variant: 'btn-warning' },
];
const MENU_ITEMS = ['Home', 'About', 'Gallery', 'Contact', 'Portfolio'];

const variantStyle: Record<string, string> = {
  'btn-primary': 'bg-primary text-stone-900',
  'btn-secondary': 'bg-slate-600 text-white',
  'btn-warning': 'bg-amber-500 text-stone-900',
};

const buildClassButtons = () =>
  shuffle(CLASS_BUTTONS).map(b => ({ ...b, classes: shuffle(['btn', 'btn-test', b.variant]).join(' ') }));

export default function LocatorTraps() {
  // 1. Dynamic ID
  const [dynamicId, setDynamicId] = useState(randomId);
  const [dynamicResult, setDynamicResult] = useState<ResultState>('pending');

  // 2. Class attribute
  const [classButtons, setClassButtons] = useState(buildClassButtons);
  const [classResult, setClassResult] = useState<ResultState>('pending');
  const [classMsg, setClassMsg] = useState('Click the button with the btn-primary class');

  // 3. Non-breaking space
  const [nbspResult, setNbspResult] = useState<ResultState>('pending');

  // 4. Shifting content
  const [menu, setMenu] = useState(() => shuffle(MENU_ITEMS));
  const [margin, setMargin] = useState(() => Math.floor(Math.random() * 121));
  const [shiftResult, setShiftResult] = useState<ResultState>('pending');
  const [shiftMsg, setShiftMsg] = useState('Click the Gallery item');

  const clickDynamic = () => {
    setDynamicResult('success');
    setDynamicId(randomId());
  };

  const clickClass = (variant: string) => {
    if (variant === 'btn-primary') {
      setClassResult('success');
      setClassMsg('Found the button by its class');
    } else {
      setClassResult('failure');
      setClassMsg('Wrong button — match the class, not its position');
    }
    setClassButtons(buildClassButtons());
  };

  const shift = () => {
    setMenu(shuffle(MENU_ITEMS));
    setMargin(Math.floor(Math.random() * 121));
  };

  const clickMenu = (item: string) => {
    if (item === 'Gallery') {
      setShiftResult('success');
      setShiftMsg('Clicked Gallery by name');
    } else {
      setShiftResult('failure');
      setShiftMsg(`Wrong item (${item}) — locate by name, not position`);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Locator Traps</h1>
        <p className="text-slate-500">Locators that survive generated ids, shuffled class lists, invisible characters and shifting layouts. Each task ticks itself when its result box turns green.</p>
      </div>

      <Section n={1} title="Dynamic ID">
        <PracticeElement
          id="dynamic-id" label="Generated id"
          goal="Click the button without using its id. The id changes on every load and after every click."
          pass={['Locating by text or by the dynamic-id-btn class clicks it']}
          fail={['A locator copied from DevTools, such as #btn-x7k2pq: it breaks on the next load']}
          hint="Pick an attribute that stays put: the visible text, the role, or the dynamic-id-btn class."
          code={{
            playwright: "await page.getByRole('button', { name: 'Dynamic ID Button' }).click();",
            seleniumJava: 'driver.findElement(By.cssSelector(".dynamic-id-btn")).click();',
            seleniumPython: 'driver.find_element(By.CSS_SELECTOR, ".dynamic-id-btn").click()',
            cypress: "cy.contains('button', 'Dynamic ID Button').click();",
          }}
          done={dynamicResult === 'success'}
        >
          <button id={dynamicId} type="button" className="dynamic-id-btn rounded-lg bg-primary px-4 py-2 text-sm font-medium text-stone-900" onClick={clickDynamic}>Dynamic ID Button</button>
          <div className="mt-4"><ChallengeResult testId="result-dynamic-id" state={dynamicResult} message={dynamicResult === 'success' ? 'Clicked without relying on the ID' : 'The ID of this button changes every time'} /></div>
        </PracticeElement>
      </Section>

      <Section n={2} title="Class attribute">
        <PracticeElement
          id="class-attr" label="Shuffled classes"
          goal="Click the button that has the btn-primary class. Button order and class order are shuffled after every click."
          pass={['A class selector such as .btn-primary picks the right button every time']}
          fail={['[class="btn btn-primary btn-test"]: the order of classes changes', 'Picking the first button: the order changes too']}
          hint="CSS class selectors ignore class order. XPath needs contains(concat(' ', @class, ' '), ' btn-primary ')."
          code={{
            playwright: "await page.locator('#class-trap .btn-primary').click();",
            seleniumJava: 'driver.findElement(By.cssSelector("#class-trap .btn-primary")).click();',
            seleniumPython: 'driver.find_element(By.CSS_SELECTOR, "#class-trap .btn-primary").click()',
            cypress: "cy.get('#class-trap .btn-primary').click();",
          }}
          done={classResult === 'success'}
        >
          <div id="class-trap" className="flex flex-wrap gap-3">
            {classButtons.map(b => (
              <button key={b.variant} type="button" className={`${b.classes} rounded-lg px-4 py-2 text-sm font-medium ${variantStyle[b.variant]}`} onClick={() => clickClass(b.variant)}>{b.label}</button>
            ))}
          </div>
          <div className="mt-4"><ChallengeResult testId="result-class-attr" state={classResult} message={classMsg} /></div>
        </PracticeElement>
      </Section>

      <Section n={3} title="Non-breaking space">
        <PracticeElement
          id="nbsp" label="Hidden space in the text"
          goal="Click the “Click Me” button. The space in its label is a non-breaking space (U+00A0)."
          pass={['normalize-space(), contains() or a \\s+ regex finds it']}
          fail={['XPath text()=\'Click Me\' with a normal space finds nothing']}
          hint="A non-breaking space is not the same character as a space. Match around it, or normalise it away."
          code={{
            playwright: "await page.locator('#nbsp-section button', { hasText: /Click\\s+Me/ }).click();",
            seleniumJava: '// XPath 1.0 normalize-space() keeps U+00A0, so translate() swaps it for a plain space first\ndriver.findElement(By.xpath("//div[@id=\'nbsp-section\']//button[normalize-space(translate(., \'\\u00A0\', \' \'))=\'Click Me\']")).click();',
            seleniumPython: 'driver.find_element(By.XPATH, "//div[@id=\'nbsp-section\']//button[contains(., \'Click\') and contains(., \'Me\')]").click()',
            cypress: "cy.contains('#nbsp-section button', /Click\\s+Me/).click();",
          }}
          done={nbspResult === 'success'}
        >
          <div id="nbsp-section" className="space-y-4">
            <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-stone-900" onClick={() => setNbspResult('success')}>{'Click\u00A0Me'}</button>
            <ChallengeResult testId="result-nbsp" state={nbspResult} message={nbspResult === 'success' ? 'Matched the non-breaking space' : 'Click the button above'} />
          </div>
        </PracticeElement>
      </Section>

      <Section n={4} title="Shifting content">
        <PracticeElement
          id="shifting" label="Menu that moves"
          goal="Click “Shift layout” to reshuffle the menu and its offset, then click Gallery."
          pass={['Locating by name clicks Gallery wherever it is']}
          fail={['nth-child or index locators hit another item', 'Clicking by coordinates']}
          hint="Scope to the menu and find the button by its name."
          code={{
            playwright: "await page.locator('#shift-button').click();\nawait page.locator('#shifting-menu').getByRole('button', { name: 'Gallery' }).click();",
            seleniumJava: 'driver.findElement(By.id("shift-button")).click();\ndriver.findElement(By.xpath("//div[@id=\'shifting-menu\']/button[.=\'Gallery\']")).click();',
            seleniumPython: 'driver.find_element(By.ID, "shift-button").click()\ndriver.find_element(By.XPATH, "//div[@id=\'shifting-menu\']/button[.=\'Gallery\']").click()',
            cypress: "cy.get('#shift-button').click();\ncy.contains('#shifting-menu button', 'Gallery').click();",
          }}
          done={shiftResult === 'success'}
        >
          <div className="space-y-4">
            <Button id="shift-button" variant="outline" onClick={shift}>Shift layout</Button>
            <div className="overflow-hidden">
              <div id="shifting-menu" className="flex flex-wrap gap-2" style={{ marginLeft: `${margin}px` }}>
                {menu.map(item => (
                  <button key={item} type="button" className="rounded-lg border border-border bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => clickMenu(item)}>{item}</button>
                ))}
              </div>
            </div>
            <ChallengeResult testId="result-shifting" state={shiftResult} message={shiftMsg} />
          </div>
        </PracticeElement>
      </Section>

      <SolutionTabs challengeId="locator-traps" number={5} />
    </div>
  );
}
