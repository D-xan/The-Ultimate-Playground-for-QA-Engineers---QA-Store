import React, { useEffect, useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';
import { defineClosedShadowWidget, CLOSED_SHADOW_TAG } from '@/components/practice/ClosedShadowWidget';

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

const COUNTDOWN_DOC = wrap(
  `<p>Countdown: <span id="countdown">5</span></p>
   <script>
     var n = 5;
     var el = document.getElementById('countdown');
     var timer = setInterval(function () {
       n -= 1;
       el.textContent = String(n);
       if (n <= 0) {
         clearInterval(timer);
         document.body.innerHTML = '<p id="countdown-done">Liftoff!</p>';
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
    defineClosedShadowWidget();
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
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Deep DOM</h1>
        <p className="text-slate-500">Practice reaching elements buried in nested iframes, closed shadow roots and shadow DOM inside iframes.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> Use <code>driver.switchTo().frame(...)</code> once per level and <code>switchTo().defaultContent()</code> to return. A closed shadow root cannot be queried: use keyboard input (Actions) instead.",
          "<strong>Playwright:</strong> Chain <code>frameLocator('#a').frameLocator('#b')</code>. Open shadow roots are pierced automatically, closed ones are not; use <code>keyboard.press('Tab')</code> and <code>keyboard.type()</code>.",
          "<strong>Cypress:</strong> Iframes need a helper to read <code>contentDocument.body</code>; use <code>{ includeShadowDom: true }</code> for open shadow roots.",
          "A closed shadow root hides its children from <code>element.shadowRoot</code>. Focus the element before it and use Tab."
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Nested Iframes</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="nested-frames" tasks={[
          {
            title: "Click the button three frames deep",
            description: "Switch into frame-level-1, then frame-level-2, then frame-level-3 and click the button.",
            positive: ["Entering each frame in order and clicking the button shows success."],
            negative: ["Looking for the button from the top-level page finds nothing."]
          }
        ]} /></div>
        <div className="space-y-4">
          <iframe id="frame-level-1" title="Frame level 1" className="w-full h-[170px] border border-dashed border-slate-400 rounded-lg" srcDoc={LEVEL_1} />
          <ChallengeResult testId="result-nested-frames" state={nestedResult} message={nestedResult === 'success' ? 'Clicked the deep button' : 'Click the button inside the innermost frame'} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Changing Iframe</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="countdown" tasks={[
          {
            title: "Wait for the iframe to change",
            description: "The frame counts down from 5 and then replaces its content with 'Liftoff!'.",
            positive: ["Waiting for #countdown-done inside the frame to appear passes."],
            negative: ["Reading #countdown once and expecting it to stay put fails."]
          }
        ]} /></div>
        <div className="space-y-4">
          <iframe key={countdownKey} id="countdown-frame" title="Countdown frame" className="w-full h-24 border border-dashed border-slate-400 rounded-lg" srcDoc={COUNTDOWN_DOC} />
          <Button id="restart-countdown" variant="outline" onClick={() => setCountdownKey(k => k + 1)}>Restart countdown</Button>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Closed Shadow DOM</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="closed-shadow" tasks={[
          {
            title: "Submit 'shadow' through a closed shadow root",
            description: "The input and Submit button live in a closed shadow root that selectors cannot reach. Focus 'Start here', then use the keyboard.",
            positive: ["Tab into the input, type 'shadow', Tab to Submit and press Enter to show success."],
            negative: ["Any other value shows failure, and querying the input directly finds nothing."]
          }
        ]} /></div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button id="before-shadow" type="button" className="rounded-lg border border-border bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">Start here</button>
            {React.createElement(CLOSED_SHADOW_TAG, { ref: widgetRef })}
          </div>
          <ChallengeResult testId="result-closed-shadow" state={closedResult} message={closedMsg} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">4. Shadow DOM Inside an Iframe</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="shadow-frame" tasks={[
          {
            title: "Click the button in the shadow root inside the frame",
            description: "Enter the iframe, then pierce the open shadow root under #shadow-host.",
            positive: ["Clicking #shadow-frame-button inside the frame shows success and updates its status text."],
            negative: ["Searching for the button without switching into the iframe finds nothing."]
          }
        ]} /></div>
        <div className="space-y-4">
          <iframe id="shadow-frame" title="Shadow frame" className="w-full h-32 border border-dashed border-slate-400 rounded-lg" srcDoc={SHADOW_FRAME_DOC} />
          <ChallengeResult testId="result-shadow-frame" state={shadowFrameResult} message={shadowFrameResult === 'success' ? 'Clicked the button inside the shadow root' : 'Click the button inside the frame'} />
        </div>
      </section>

      <SolutionTabs challengeId="deep-dom" number={5} />
    </div>
  );
}
