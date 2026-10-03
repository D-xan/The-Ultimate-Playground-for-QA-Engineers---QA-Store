import React, { useEffect, useRef, useState } from 'react';
import { SolutionTabs } from '@/components/practice/SolutionTabs';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { ChallengeResult, type ResultState } from '@/components/ui/ChallengeResult';

const MOVE_MS = 2500;

export default function ClickTraps() {
  // 1. Overlapped element
  const [coverVisible, setCoverVisible] = useState(true);
  const [overlap, setOverlap] = useState<ResultState>('pending');

  // 2. Moving button
  const [moving, setMoving] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [movingResult, setMovingResult] = useState<ResultState>('pending');
  const [movingMsg, setMovingMsg] = useState('Start the animation, then click the button');

  // 3. Hidden layers
  const [blueVisible, setBlueVisible] = useState(false);
  const [layers, setLayers] = useState<ResultState>('pending');
  const [layersMsg, setLayersMsg] = useState('Click the green button');

  // 4. Disabled -> enabled
  const [enabled, setEnabled] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [delayedValue, setDelayedValue] = useState('');
  const [enabledResult, setEnabledResult] = useState<ResultState>('pending');
  const [enabledMsg, setEnabledMsg] = useState('Enable the input, type QA and submit');

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startAnimation = () => {
    if (moving) return;
    setMovingResult('pending');
    setMovingMsg('Wait for the button to stop, then click it');
    setAtEnd(prev => !prev);
    setMoving(true);
    timers.current.push(setTimeout(() => setMoving(false), MOVE_MS));
  };

  const clickMoving = () => {
    if (moving) {
      setMovingResult('failure');
      setMovingMsg('Clicked while moving');
    } else {
      setMovingResult('success');
      setMovingMsg('Clicked after it stopped');
    }
  };

  const resetLayers = () => {
    setBlueVisible(false);
    setLayers('pending');
    setLayersMsg('Click the green button');
  };

  const enableInput = () => {
    if (waiting) return;
    setWaiting(true);
    setEnabled(false);
    const delay = 2000 + Math.floor(Math.random() * 2001);
    timers.current.push(setTimeout(() => { setEnabled(true); setWaiting(false); }, delay));
  };

  const submitDelayed = () => {
    if (delayedValue === 'QA') {
      setEnabledResult('success');
      setEnabledMsg('Submitted "QA"');
    } else {
      setEnabledResult('failure');
      setEnabledMsg('Expected the value QA');
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Click Traps</h1>
        <p className="text-slate-500">Practice clicking elements that are covered, moving, stacked under other layers or not yet enabled.</p>
        <HintAccordion hints={[
          "<strong>Selenium:</strong> A covered element throws <code>ElementClickInterceptedException</code>. Dismiss the cover first, or wait with <code>ExpectedConditions.elementToBeClickable</code>.",
          "<strong>Playwright:</strong> <code>locator.click()</code> auto-waits for the element to be stable and not obscured; do not use <code>{ force: true }</code> to bypass the trap.",
          "<strong>Cypress:</strong> <code>cy.get('#moving-button').should('not.have.class', 'animating').click()</code> waits for the animation to end.",
          "Wait for the input to be enabled before typing: <code>cy.get('#delayed-input').should('be.enabled').type('QA')</code>."
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Overlapped Element</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="overlap" tasks={[
          {
            title: "Dismiss the cover, then click the button",
            description: "The Submit Order button is hidden under a banner. Dismiss the banner and then click the button.",
            positive: ["Clicking the button after dismissing the cover shows 'Order submitted'."],
            negative: ["The click is intercepted by the cover and the order is never submitted."]
          }
        ]} /></div>
        <div className="relative rounded-xl border border-border bg-slate-50 p-8 flex justify-center overflow-hidden">
          <Button id="overlapped-button" onClick={() => setOverlap('success')}>Submit Order</Button>
          {coverVisible && (
            <div
              id="overlap-cover"
              className="absolute inset-0 bg-slate-900/70 flex items-center justify-center pointer-events-auto"
            >
              <Button id="overlap-dismiss" variant="outline" onClick={() => setCoverVisible(false)}>Dismiss banner</Button>
            </div>
          )}
        </div>
        <div className="mt-4">
          <ChallengeResult
            testId="result-overlap"
            state={overlap}
            message={overlap === 'success' ? 'Order submitted' : 'The button is covered — get rid of the cover first'}
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Moving Button</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="moving" tasks={[
          {
            title: "Click the button after it stops",
            description: "Start the animation and click the moving button only once it has stopped sliding.",
            positive: ["The button no longer has the 'animating' class when clicked.", "The result reads 'Clicked after it stopped'."],
            negative: ["Clicking while the button slides reports 'Clicked while moving'."]
          }
        ]} /></div>
        <div className="space-y-4">
          <Button id="start-animation" onClick={startAnimation} disabled={moving}>Start animation</Button>
          <div className="rounded-xl border border-border bg-slate-50 p-4 overflow-hidden">
            <button
              id="moving-button"
              type="button"
              onClick={clickMoving}
              className={`rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white ${moving ? 'animating' : ''}`}
              style={{
                transform: atEnd ? 'translateX(min(240px, 40vw))' : 'translateX(0)',
                transition: `transform ${MOVE_MS}ms linear`,
              }}
            >
              Catch me
            </button>
          </div>
          <ChallengeResult testId="result-moving" state={movingResult} message={movingMsg} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Hidden Layers</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="layers" tasks={[
          {
            title: "Click the green button, then find what blocks it",
            description: "After the first click an identical blue button is stacked on top. Identify which element receives later clicks.",
            positive: ["The first click on the green button reports 'Green clicked once'."],
            negative: ["A second click on the green button is intercepted by the blue layer."]
          }
        ]} /></div>
        <div className="space-y-4">
          <div className="relative inline-block">
            <button
              id="green-button"
              type="button"
              onClick={() => { setLayers('success'); setLayersMsg('Green clicked once'); setBlueVisible(true); }}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
            >
              Layered button
            </button>
            {blueVisible && (
              <button
                id="blue-button"
                type="button"
                onClick={() => { setLayers('failure'); setLayersMsg('You clicked the blue layer — the green button is covered now'); }}
                className="absolute inset-0 z-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Layered button
              </button>
            )}
          </div>
          <div><Button id="reset-layers" variant="outline" onClick={resetLayers}>Reset</Button></div>
          <ChallengeResult testId="result-layers" state={layers} message={layersMsg} />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">4. Disabled → Enabled</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="enabled" tasks={[
          {
            title: "Type into the input once it is enabled",
            description: "Click 'Enable input', wait for the field to become enabled (2-4 seconds), type QA and submit.",
            positive: ["The script waits for the input to be enabled, then submits 'QA' and sees success."],
            negative: ["Typing into the disabled input fails or submits an empty value."]
          }
        ]} /></div>
        <div className="space-y-4 max-w-md">
          <Button id="enable-input" onClick={enableInput}>Enable input</Button>
          <Input
            id="delayed-input"
            aria-label="Delayed input"
            disabled={!enabled}
            value={delayedValue}
            onChange={e => setDelayedValue(e.target.value)}
            placeholder="Disabled until enabled"
          />
          <Button id="submit-delayed" onClick={submitDelayed}>Submit</Button>
          <ChallengeResult testId="result-enabled" state={enabledResult} message={enabledMsg} />
        </div>
      </section>

      <SolutionTabs challengeId="click-traps" number={5} />
    </div>
  );
}
