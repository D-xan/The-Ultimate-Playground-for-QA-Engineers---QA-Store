import React, { useState, useEffect } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';

export default function DynamicWaiting() {
  const [delayedElement, setDelayedElement] = useState(false);
  const [disappearingElement, setDisappearingElement] = useState(true);
  const [dynamicId, setDynamicId] = useState('dynamic-btn-initial');
  const [progress, setProgress] = useState(0);

  const startProgressBar = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 500);
  };

  useEffect(() => {
    // Reveal an element after 4 seconds
    const timer1 = setTimeout(() => setDelayedElement(true), 4000);
    // Hide an element after 6 seconds
    const timer2 = setTimeout(() => setDisappearingElement(false), 6000);
    // Change ID every 3 seconds
    const timer3 = setInterval(() => {
      setDynamicId(`dynamic-btn-${Math.floor(Math.random() * 10000)}`);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(timer3);
    };
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dynamic Elements & Waits</h1>
        <p className="text-slate-500">Practice Explicit and Implicit waits. Elements here change, appear, and disappear unpredictably.</p>
        
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">35. Dynamic Elements</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Wait for the dynamic element to appear and verify its text",
    "description": "Trigger the action that creates an element after a delay. Use an explicit wait to wait for the element to be present in the DOM, then verify its text.",
    "positive": [
      "The element appears within the expected timeframe.",
      "The text matches the expected value."
    ],
    "negative": [
      "The script times out before the element appears.",
      "The element appears but contains incorrect text."
    ]
  }
]} /></div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Elements appearing later</h3>
              <div className="h-12 border-2 border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50">
                {delayedElement ? (
                  <Button id="btn-delayed" className="bg-success text-white hover:bg-success/90">I am here now!</Button>
                ) : (
                  <span className="text-sm text-slate-400 animate-pulse">Wait 4 seconds...</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Elements disappearing</h3>
              <div className="h-12 border-2 border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50">
                {disappearingElement ? (
                  <Button id="btn-disappearing" variant="outline" className="border-warning text-warning hover:bg-warning hover:text-white">I will disappear in 6s</Button>
                ) : (
                  <span className="text-sm text-slate-400">Gone!</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Dynamic IDs</h3>
              <p className="text-xs text-slate-500 mb-2">Current ID: {dynamicId}</p>
              <Button id={dynamicId}>My ID changes every 3s</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">26. Loading States</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Click the 'Start Process' button and wait for the progress bar to reach 100%",
    "description": "Initiate the process and monitor the progress bar. Wait until its value or style indicates it has reached 100%.",
    "positive": [
      "The progress bar steadily increases to 100%.",
      "A completion message is shown at 100%."
    ],
    "negative": [
      "The progress bar gets stuck before 100%.",
      "The completion message appears before 100%."
    ]
  },
  {
    "title": "Assert that the success message appears after loading",
    "description": "Wait for the loading process to complete and explicitly assert the visibility and text of the success message.",
    "positive": [
      "The success message is visible.",
      "The success message has the correct text."
    ],
    "negative": [
      "The success message never appears.",
      "The success message is hidden behind other elements."
    ]
  }
]} /></div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Progress Bar</h3>
              <Button onClick={startProgressBar} size="sm" className="mb-4" id="btn-start-progress">Start Task</Button>
              <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-primary h-4 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                  id="progress-bar-fill"
                ></div>
              </div>
              <p className="text-sm font-medium" id="progress-text">{progress}% Complete</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Skeleton Loader</h3>
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
