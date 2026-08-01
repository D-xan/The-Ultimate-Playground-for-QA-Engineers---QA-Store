import React, { useEffect, useRef } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';

export default function FramesDOM() {
  const shadowHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shadowHostRef.current && !shadowHostRef.current.shadowRoot) {
      const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <style>
          .shadow-box {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            font-family: system-ui, sans-serif;
          }
          button {
            background: #0f172a;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 12px;
          }
        </style>
        <div class="shadow-box">
          <h3 id="shadow-title">I live inside a Shadow DOM!</h3>
          <p>Standard locators won't find me easily.</p>
          <button id="shadow-btn">Click me if you can</button>
        </div>
      `;
      shadow.appendChild(wrapper);

      const btn = shadow.querySelector('#shadow-btn');
      btn?.addEventListener('click', () => {
        alert('You clicked the shadow button!');
      });
    }
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Frames & Shadow DOM</h1>
        <p className="text-slate-500">Practice interacting with isolated contexts like iframes, shadow DOMs, and new windows.</p>
        
      </div>

      {/* Browser Windows */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">22. Browser Windows</h2>
        <div className="flex gap-4">
          <Button 
            onClick={() => window.open('https://example.com', '_blank')} 
            id="btn-new-tab"
          >
            Open New Tab
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://example.com', 'Popup', 'width=600,height=400')} 
            id="btn-popup-window"
          >
            Open Popup Window
          </Button>
        </div>
      </section>

      {/* Iframes */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">23. Frames (iframe)</h2>
        <div className="-mx-1 mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Switch context to the iframe and interact with its button",
    "description": "Tell your automation tool to switch its context into the iframe. Find the button inside and click it.",
    "positive": [
      "The context switches successfully.",
      "The button inside the iframe is clicked."
    ],
    "negative": [
      "The script fails to find the iframe.",
      "The button inside the iframe cannot be located from the main context."
    ]
  },
  {
    "title": "Navigate back to the main document context",
    "description": "After interacting with the iframe, switch your automation context back to the default/main document.",
    "positive": [
      "The context switches back to the main document.",
      "Elements in the main document are accessible again."
    ],
    "negative": [
      "The script gets stuck in the iframe context.",
      "Elements in the main document cannot be found."
    ]
  }
]} /></div>
        <div className="border border-border rounded-lg overflow-hidden h-64 bg-slate-50">
          <iframe 
            src="https://example.com" 
            className="w-full h-full border-none" 
            title="Practice iframe"
            id="practice-iframe"
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">To interact with elements inside, you must switch context to the frame first.</p>
      </section>

      {/* Shadow DOM */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">24. Shadow DOM</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Retrieve text from inside the Shadow DOM component",
    "description": "Access the open shadow root of the web component and retrieve the text content from one of its inner elements.",
    "positive": [
      "The shadow root is successfully accessed.",
      "The text content is correctly retrieved."
    ],
    "negative": [
      "The shadow root is closed and inaccessible.",
      "Standard selectors fail to find the element inside the shadow DOM."
    ]
  }
]} /></div>
        <div ref={shadowHostRef} id="shadow-host"></div>
      </section>
    </div>
  );
}
