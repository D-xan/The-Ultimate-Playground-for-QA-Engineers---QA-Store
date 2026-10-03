import { useEffect, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { parseWindowMessage, SECRET_KEY } from '@/utils/windowMessages';

const SECTION = 'bg-white p-6 rounded-2xl shadow-sm border border-border';
const H2 = 'text-xl font-bold mb-6 border-b border-border pb-2';
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
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Windows &amp; Tabs</h1>
        <p className="text-slate-500">Practice switching between tabs and popup windows: read data from a new tab, approve in a popup that closes itself, wait for a slow popup and pick the right window by its title.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> Save <code>driver.getWindowHandle()</code> first. After a click, wait until <code>getWindowHandles().size()</code> grows, then <code>switchTo().window(handle)</code>. Always switch back to the original handle, especially after a popup closes itself.",
          "<strong>Playwright:</strong> Start waiting before you click: <code>const popup = page.waitForEvent('popup')</code>, then click, then <code>await popup</code>. Every window is just another <code>Page</code>.",
          "<strong>Cypress:</strong> Cypress runs in one tab. Remove the <code>target</code> attribute or stub <code>window.open</code>, then <code>cy.visit</code> the child URL yourself.",
          "Never rely on the order of window handles. Find the window by its title or URL instead."
        ]} />
      </div>

      <section className={SECTION}>
        <h2 className={H2}>1. New Tab</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="tab" tasks={[
          {
            title: "Read a secret from a new tab",
            description: "Open the link in a new tab, read the secret word, close the tab, then type the word here.",
            positive: ["The new tab shows a secret word.", "Typing it and pressing Check shows success."],
            negative: ["A wrong word shows a failure."],
            hint: "Wait for the new window to exist before switching: compare the window handles from before and after the click."
          }
        ]} /></div>
        <a id="open-tab" data-testid="open-tab" href="#/popup/secret" target="_blank" rel="noopener" className="text-primary font-semibold underline">Open the secret in a new tab</a>
        <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
          <input
            id="tab-secret-input"
            data-testid="tab-secret-input"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="Secret word"
            aria-label="Secret word"
            className="w-full max-w-xs px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button id="check-secret" data-testid="check-secret" onClick={checkSecret}>Check</Button>
        </div>
        <ChallengeResult testId="result-tab" state={tabResult} message={tabResult === 'success' ? 'Secret matched' : tabResult === 'failure' ? 'That is not the secret' : 'Read the secret from the new tab'} />
      </section>

      <section className={SECTION}>
        <h2 className={H2}>2. Popup That Reports Back</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="popup" tasks={[
          {
            title: "Approve in a popup",
            description: "Open the popup and press Approve. The popup sends a code back to this page and closes itself.",
            positive: ["After Approve, the code appears here and the popup is gone."],
            negative: ["Your driver must not keep using the closed window."],
            hint: "After Approve the popup closes itself. Switch back to the main window straight away; any command on the closed window throws."
          }
        ]} /></div>
        <Button id="open-popup" data-testid="open-popup" onClick={() => window.open('#/popup/approve', 'approve', POPUP_FEATURES)}>Open approval popup</Button>
        <p className="mt-4 mb-4 text-slate-600">Approval code: <strong id="approval-code" data-testid="approval-code">{approvalCode}</strong></p>
        <ChallengeResult testId="result-popup" state={approvalCode ? 'success' : 'pending'} message={approvalCode ? 'Approved in the popup' : 'Waiting for approval'} />
      </section>

      <section className={SECTION}>
        <h2 className={H2}>3. Slow Popup</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="delayed" tasks={[
          {
            title: "Wait for a slow popup",
            description: "The popup opens at once but its Confirm button appears after 1 to 3 seconds.",
            positive: ["Waiting for the button and clicking Confirm shows success here."],
            negative: ["A fixed sleep is either too short or wastes time."],
            hint: "Wait for the Confirm button to be clickable inside the popup instead of sleeping for a fixed time."
          }
        ]} /></div>
        <Button id="open-delayed" data-testid="open-delayed" onClick={() => window.open('#/popup/delayed', 'delayed', POPUP_FEATURES)}>Open slow popup</Button>
        <div className="mt-4"><ChallengeResult testId="result-delayed" state={delayedDone ? 'success' : 'pending'} message={delayedDone ? 'Confirmed in the slow popup' : 'Waiting for confirmation'} /></div>
      </section>

      <section className={SECTION}>
        <h2 className={H2}>4. Pick the Right Window</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="pick" tasks={[
          {
            title: "Find a window by its title",
            description: "Open all three windows, switch to the one titled 'Window B' and press its button.",
            positive: ["Pressing the button in Window B shows success."],
            negative: ["The button is disabled in Window A and Window C."],
            hint: "Loop over every window handle, switch to it and check the title until it reads 'Window B'."
          }
        ]} /></div>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['A', 'B', 'C'] as const).map((w) => (
            <Button key={w} id={`open-${w.toLowerCase()}`} data-testid={`open-${w.toLowerCase()}`} variant="outline" onClick={() => window.open(`#/popup/pick?w=${w}`, '_blank')}>Open window {w}</Button>
          ))}
        </div>
        <ChallengeResult testId="result-pick" state={pickResult} message={pickResult === 'success' ? 'You picked Window B' : pickResult === 'failure' ? 'Wrong window' : 'Pick Window B'} />
      </section>

      <SolutionTabs challengeId="windows" number={5} />
    </div>
  );
}
