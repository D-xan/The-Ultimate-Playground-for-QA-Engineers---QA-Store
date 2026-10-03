import React, { useEffect, useRef, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { PLANTED } from '@/data/a11yRules';

const SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border';
const H2 = 'text-xl font-bold mb-6 border-b border-border pb-2';
const FIELD = 'w-full max-w-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';
const IMAGE = `${import.meta.env.BASE_URL}og-image.jpg`;

const CHECKLIST: { id: string; text: string }[] = [
  { id: 'label', text: 'Form field without a label' },
  { id: 'heading-order', text: 'Heading levels skip a level' },
  { id: 'image-alt', text: 'Image without alternative text' },
  { id: 'list', text: 'List with invalid children' },
  { id: 'button-name', text: 'Button without an accessible name' },
  { id: 'color-contrast', text: 'Text with too little contrast' },
  { id: 'aria-allowed-attr', text: 'ARIA attribute not allowed on its role' },
  { id: 'link-name', text: 'Link without an accessible name' },
];
const TOOLS = ['Playwright', 'Selenium', 'Cypress', 'WebdriverIO'];

const preventNav = (e: React.MouseEvent) => e.preventDefault();

export default function AccessibilityLab() {
  const [checked, setChecked] = useState<string[]>([]);
  const [axeResult, setAxeResult] = useState<ResultState>('pending');

  const [name, setName] = useState('');
  const [tool, setTool] = useState(0);
  const [terms, setTerms] = useState(false);
  const [kbError, setKbError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mouseUsed, setMouseUsed] = useState(false);
  const [kbResult, setKbResult] = useState<ResultState>('pending');
  const submitRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dialogOpen) confirmRef.current?.focus();
  }, [dialogOpen]);

  const toggleRule = (id: string) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const checkRules = () => {
    if (axeResult === 'success') return;
    const exact = checked.length === PLANTED.length && PLANTED.every((id) => checked.includes(id));
    setAxeResult(exact ? 'success' : 'failure');
  };

  const onListboxKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setTool((t) => Math.min(TOOLS.length - 1, t + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setTool((t) => Math.max(0, t - 1)); }
    if (e.key === 'Home') { e.preventDefault(); setTool(0); }
    if (e.key === 'End') { e.preventDefault(); setTool(TOOLS.length - 1); }
  };

  const submit = () => {
    if (!name.trim()) return setKbError('Enter your name');
    if (!terms) return setKbError('Accept the terms');
    setKbError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    submitRef.current?.focus();
  };

  /** Focus trap: Tab and Shift+Tab move between the dialog's two buttons only. */
  const onDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      (document.activeElement === confirmRef.current ? cancelRef : confirmRef).current?.focus();
    }
  };

  const confirm = () => {
    setDialogOpen(false);
    setKbResult((prev) => (prev === 'success' ? prev : mouseUsed ? 'failure' : 'success'));
  };

  const resetKeyboard = () => {
    setName('');
    setTool(0);
    setTerms(false);
    setKbError('');
    setDialogOpen(false);
    setKbResult('pending');
    setMouseUsed(false); // runs after this click's own pointerdown, so Reset itself does not count
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Accessibility Lab</h1>
        <p className="text-slate-500">Practice automated accessibility checks: find the problems planted in a form with axe-core, prove the fixed form is clean, and complete a form using only the keyboard.</p>
        <HintAccordion hints={[
          "<strong>Playwright:</strong> <code>npm i -D @axe-core/playwright</code>, then <code>new AxeBuilder({ page }).include('#a11y-broken').withTags(['wcag2a', 'wcag2aa']).analyze()</code> and read <code>violations[].id</code>.",
          "<strong>Selenium:</strong> Java uses <code>com.deque.html.axe-core:selenium</code>; Python can inject <code>axe.min.js</code> and call <code>axe.run</code> through <code>execute_async_script</code>. <strong>Cypress:</strong> <code>cypress-axe</code> with <code>cy.injectAxe()</code> and <code>cy.checkA11y('#a11y-fixed')</code>.",
          "Scope the scan with <code>include</code> so problems elsewhere on the page do not hide the ones you care about. Scroll the region into view first: axe skips the contrast check for text that is off screen or covered.",
          "For the keyboard task, focus the first field and use only Tab, arrow keys, Space, Enter and Escape. Cypress's <code>type</code> cannot press Tab; use the <code>cypress-real-events</code> plugin's <code>realPress('Tab')</code>."
        ]} />
      </div>

      <section className={SECTION}>
        <h2 className={H2}>1. Find the Planted Problems</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="axe" tasks={[
          {
            title: "Name every axe violation",
            description: "Scan the form below with axe-core, then tick exactly the rules it reports and press Check.",
            positive: ["Ticking exactly the reported rules turns the result green."],
            negative: ["Ticking a rule the form does not break, or missing one, fails."]
          }
        ]} /></div>
        <div id="a11y-broken" data-testid="a11y-broken" className="rounded-xl border border-dashed border-red-300 p-4 space-y-4 mb-6">
          <img src={IMAGE} width={240} height={126} className="rounded-lg max-w-full h-auto" />
          <div>
            <input id="broken-email" type="email" className={FIELD} />
          </div>
          <p id="broken-low-contrast" style={{ color: '#b0b0b0' }}>We will never share your email.</p>
          <div className="flex items-center gap-4">
            <button type="button" className="rounded-lg border border-border p-2"><Search className="h-4 w-4" aria-hidden="true" /></button>
            <a href="#" onClick={preventNav} className="text-primary"><ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
        <fieldset id="a11y-checklist" data-testid="a11y-checklist" className="space-y-2 mb-4">
          <legend className="mb-2 text-sm font-semibold text-slate-700">Which axe rules does the form break?</legend>
          {CHECKLIST.map((rule) => (
            <label key={rule.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input id={`rule-${rule.id}`} data-testid={`rule-${rule.id}`} type="checkbox" checked={checked.includes(rule.id)} onChange={() => toggleRule(rule.id)} />
              <code>{rule.id}</code> <span className="text-slate-500">{rule.text}</span>
            </label>
          ))}
        </fieldset>
        <div className="space-y-4">
          <Button id="check-a11y" data-testid="check-a11y" onClick={checkRules}>Check</Button>
          <ChallengeResult testId="result-axe" state={axeResult} message={axeResult === 'success' ? 'You found every planted problem' : axeResult === 'failure' ? 'Not quite: compare your ticks with the axe report' : 'Tick the rules axe reports'} />
        </div>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>2. The Fixed Version</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="fixed" tasks={[
          {
            title: "Assert there are no violations",
            description: "Scan this form the same way. A clean scan returns an empty violations list, which is the assertion to put in your own test suites.",
            positive: ["axe reports no violations for this form."],
            negative: ["Scanning the whole page instead of this form mixes in other sections."]
          }
        ]} /></div>
        <div id="a11y-fixed" data-testid="a11y-fixed" className="rounded-xl border border-dashed border-green-300 p-4 space-y-4">
          <img src={IMAGE} alt="QA Playground banner" width={240} height={126} className="rounded-lg max-w-full h-auto" />
          <div>
            <label htmlFor="fixed-email" className="block mb-1 text-sm font-medium text-slate-700">Email</label>
            <input id="fixed-email" type="email" className={FIELD} />
          </div>
          <p style={{ color: '#475569' }}>We will never share your email.</p>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Search" className="rounded-lg border border-border p-2"><Search className="h-4 w-4" aria-hidden="true" /></button>
            <a href="#" onClick={preventNav} aria-label="Open the docs" className="text-primary"><ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>3. Keyboard Only</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="keyboard" tasks={[
          {
            title: "Submit without a mouse",
            description: "Fill in the form, pick Cypress, accept the terms and submit, using only the keyboard. The confirm dialog traps focus: Tab stays inside it and Escape closes it.",
            positive: ["Confirming with the keyboard turns the result green."],
            negative: ["Any mouse click or tap in this section fails the task until you press Reset."]
          }
        ]} /></div>
        <div id="keyboard-form" data-testid="keyboard-form" data-mouse-used={mouseUsed} onPointerDownCapture={() => setMouseUsed(true)} className="space-y-4">
          <div>
            <label htmlFor="kb-name" className="block mb-1 text-sm font-medium text-slate-700">Name</label>
            <input id="kb-name" data-testid="kb-name" value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
          </div>
          <div>
            <p id="kb-tool-label" className="mb-1 text-sm font-medium text-slate-700">Favourite tool</p>
            <ul
              id="kb-tool"
              data-testid="kb-tool"
              role="listbox"
              tabIndex={0}
              aria-labelledby="kb-tool-label"
              aria-activedescendant={`kb-tool-${tool}`}
              onKeyDown={onListboxKey}
              className="max-w-sm rounded-lg border border-border p-1 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {TOOLS.map((t, i) => (
                <li key={t} id={`kb-tool-${i}`} role="option" aria-selected={tool === i} onClick={() => setTool(i)} className={`rounded-md px-3 py-1.5 text-sm ${tool === i ? 'bg-primary text-white' : 'text-slate-700'}`}>{t}</li>
              ))}
            </ul>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input id="kb-terms" data-testid="kb-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            I accept the terms
          </label>
          {kbError && <p id="kb-error" data-testid="kb-error" role="alert" className="text-sm text-red-600">{kbError}</p>}
          <div className="flex flex-wrap gap-3">
            <Button ref={submitRef} id="kb-submit" data-testid="kb-submit" type="button" onClick={submit}>Submit</Button>
            <Button id="kb-reset" data-testid="kb-reset" type="button" variant="outline" onClick={resetKeyboard}>Reset</Button>
          </div>
          {dialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div id="kb-dialog" data-testid="kb-dialog" role="dialog" aria-modal="true" aria-labelledby="kb-dialog-title" onKeyDown={onDialogKey} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
                <h3 id="kb-dialog-title" className="text-lg font-bold">Send the form?</h3>
                <p className="text-sm text-slate-600">{name.trim()} · {TOOLS[tool]}</p>
                <div className="flex gap-3">
                  <Button ref={cancelRef} id="kb-cancel" data-testid="kb-cancel" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button ref={confirmRef} id="kb-confirm" data-testid="kb-confirm" onClick={confirm}>Confirm</Button>
                </div>
              </div>
            </div>
          )}
          <ChallengeResult testId="result-keyboard" state={kbResult} message={kbResult === 'success' ? 'Submitted with the keyboard only' : kbResult === 'failure' ? 'Mouse used — reset and try again with only the keyboard' : 'Submit the form using only the keyboard'} />
        </div>
      </section>

      <SolutionTabs challengeId="a11y" number={4} />
    </div>
  );
}
