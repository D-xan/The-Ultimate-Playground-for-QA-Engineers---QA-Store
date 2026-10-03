import React, { useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';

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
  'btn-primary': 'bg-primary text-white',
  'btn-secondary': 'bg-slate-600 text-white',
  'btn-warning': 'bg-amber-500 text-white',
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
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Locator Traps</h1>
        <p className="text-slate-500">Practice writing locators that survive dynamic IDs, shuffled class lists, invisible characters and shifting layouts.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> Avoid <code>By.id</code> for generated IDs. Use <code>By.cssSelector(\"#class-trap .btn-primary\")</code> or XPath <code>contains(@class, 'btn-primary')</code>; use <code>normalize-space()</code> or <code>contains(., 'Me')</code> for text with odd spaces.",
          "<strong>Playwright:</strong> Prefer <code>getByRole('button', { name })</code> and <code>locator('.btn-primary')</code>. A regex like <code>/Click\\s+Me/</code> matches a non-breaking space.",
          "<strong>Cypress:</strong> <code>cy.contains('button', /Click\\s+Me/)</code> and <code>cy.get('#class-trap .btn-primary')</code> are order-independent.",
          "Never rely on position (<code>nth-child</code>, <code>index</code>) when the order or layout can change."
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Dynamic ID</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="dynamic-id" tasks={[
          {
            title: "Click the button without using its ID",
            description: "The button's id changes on every load and after every click. Locate it by its text or class.",
            positive: ["Locating by text or the 'dynamic-id-btn' class clicks it and shows success."],
            negative: ["A locator hard-coded to the current id breaks after a reload or a click."]
          }
        ]} /></div>
        <div className="space-y-4">
          <button
            id={dynamicId}
            type="button"
            className="dynamic-id-btn rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={clickDynamic}
          >
            Dynamic ID Button
          </button>
          <ChallengeResult testId="result-dynamic-id" state={dynamicResult} message={dynamicResult === 'success' ? 'Clicked without relying on the ID' : 'The ID of this button changes every time'} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Class Attribute</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="class-attr" tasks={[
          {
            title: "Click the btn-primary button",
            description: "Class order and button order are shuffled. Match the class, not the position or the full class string.",
            positive: ["A CSS class selector like '.btn-primary' clicks the right button."],
            negative: ["An exact class string match or an index-based locator picks the wrong button."]
          }
        ]} /></div>
        <div className="space-y-4">
          <div id="class-trap" className="flex flex-wrap gap-3">
            {classButtons.map(b => (
              <button
                key={b.variant}
                type="button"
                className={`${b.classes} rounded-lg px-4 py-2 text-sm font-medium ${variantStyle[b.variant]}`}
                onClick={() => clickClass(b.variant)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <ChallengeResult testId="result-class-attr" state={classResult} message={classMsg} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Non-breaking Space</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="nbsp" tasks={[
          {
            title: "Click the button whose text has a hidden space",
            description: "The label looks like 'Click Me' but the space is a non-breaking space (U+00A0).",
            positive: ["Using contains(), normalize-space() or a \\s+ regex finds the button."],
            negative: ["An exact XPath text()='Click Me' with a normal space finds nothing."]
          }
        ]} /></div>
        <div id="nbsp-section" className="space-y-4">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={() => setNbspResult('success')}
          >
            {'Click\u00A0Me'}
          </button>
          <ChallengeResult testId="result-nbsp" state={nbspResult} message={nbspResult === 'success' ? 'Matched the non-breaking space' : 'Click the button above'} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">4. Shifting Content</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="shifting" tasks={[
          {
            title: "Click Gallery wherever it moves",
            description: "Use 'Shift layout' to reshuffle the menu and change its left margin, then click Gallery.",
            positive: ["Locating by name clicks Gallery regardless of order or offset."],
            negative: ["Position or coordinate based clicks hit a different item."]
          }
        ]} /></div>
        <div className="space-y-4">
          <Button id="shift-button" variant="outline" onClick={shift}>Shift layout</Button>
          <div className="overflow-hidden">
            <div id="shifting-menu" className="flex flex-wrap gap-2" style={{ marginLeft: `${margin}px` }}>
              {menu.map(item => (
                <button
                  key={item}
                  type="button"
                  className="rounded-lg border border-border bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => clickMenu(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <ChallengeResult testId="result-shifting" state={shiftResult} message={shiftMsg} />
        </div>
      </section>

      <SolutionTabs challengeId="locator-traps" number={5} />
    </div>
  );
}
