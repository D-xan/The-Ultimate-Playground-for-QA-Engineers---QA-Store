import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';

export default function PopupsDialogs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dialogResult, setDialogResult] = useState('');
  const [modalResult, setModalResult] = useState('');

  const triggerAlert = () => {
    window.alert('This is a native alert dialog!');
    setDialogResult('Alert was triggered and accepted');
  };

  const triggerConfirm = () => {
    const res = window.confirm('Are you sure you want to proceed?');
    const msg = res ? 'Confirm accepted' : 'Confirm cancelled';
    setDialogResult(msg);
    setToastMessage(res ? 'You clicked OK!' : 'You clicked Cancel!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const triggerPrompt = () => {
    const res = window.prompt('Please enter your name:');
    if (res !== null) {
      setDialogResult(`Prompt returned: ${res}`);
      setToastMessage(`Hello, ${res}!`);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setDialogResult('Prompt cancelled');
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Popups & Dialogs</h1>
        <p className="text-slate-500">Practice automating native browser dialogs, custom modals, and toasts.</p>
        
      </div>

      {toastMessage && (
        <div className="fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-4" id="toast-message">
          {toastMessage}
        </div>
      )}

      {/* JavaScript Dialogs */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">16. JavaScript Dialogs</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Click 'Trigger Alert' and accept the native alert",
    "description": "Click the button to open a native browser alert, then instruct your automation tool to switch to the alert and accept (click OK) it.",
    "positive": [
      "The alert opens.",
      "The automation tool successfully dismisses it.",
      "A success message appears on the page indicating acceptance."
    ],
    "negative": [
      "The script hangs because it doesn't handle the alert.",
      "The success message is not displayed."
    ]
  },
  {
    "title": "Click 'Trigger Confirm' and dismiss it",
    "description": "Click the confirm button, switch to the native confirm dialog, and dismiss it (click Cancel).",
    "positive": [
      "The confirm dialog opens.",
      "The dialog is successfully cancelled.",
      "A success message shows 'Confirm cancelled'."
    ],
    "negative": [
      "Accepting instead of dismissing.",
      "The script crashes due to unhandled dialog."
    ]
  },
  {
    "title": "Click 'Trigger Prompt', enter a string, and submit",
    "description": "Click the prompt button, type a specific string into the native prompt dialog using your tool, and accept it.",
    "positive": [
      "The prompt accepts the text.",
      "The page displays the entered text in its success message."
    ],
    "negative": [
      "Sending keys to the prompt fails.",
      "The prompt is submitted empty when it requires text."
    ]
  }
]} /></div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button onClick={triggerAlert} id="btn-alert">Trigger Alert</Button>
            <Button onClick={triggerConfirm} id="btn-confirm" variant="outline">Trigger Confirm</Button>
            <Button onClick={triggerPrompt} id="btn-prompt" variant="outline">Trigger Prompt</Button>
          </div>
          {dialogResult && <p id="dialog-result" className="text-sm text-green-600 font-medium">{dialogResult}</p>}
        </div>
      </section>

      {/* Custom Modals */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">15. Custom Popups / Modals</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Open the custom modal and click confirm",
    "description": "Click to open the HTML-based custom modal, wait for it to be visible, and click its internal Confirm button.",
    "positive": [
      "The custom modal overlay appears.",
      "Clicking confirm closes the modal.",
      "The success text updates."
    ],
    "negative": [
      "The modal is hidden behind other elements.",
      "Clicking outside the modal doesn't close it (if it should)."
    ]
  }
]} /></div>
        <div className="flex flex-col items-start gap-4">
          <Button onClick={() => { setModalOpen(true); setModalResult(''); }} id="btn-open-modal">Open Custom Modal</Button>
          {modalResult && <p id="modal-result" className="text-sm text-green-600 font-medium">{modalResult}</p>}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" id="custom-modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" id="custom-modal">
              <h3 className="text-xl font-bold mb-4">Confirmation Modal</h3>
              <p className="text-slate-600 mb-8">This is a custom React modal. You must click close to dismiss it.</p>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => { setModalOpen(false); setModalResult('Custom modal cancelled'); }} id="btn-modal-cancel">Cancel</Button>
                <Button onClick={() => { setModalOpen(false); setModalResult('Custom modal confirmed'); }} id="btn-modal-confirm">Confirm</Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Tooltips */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">18. Tooltips</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Hover the tooltip button and assert the tooltip text",
    "description": "Hover over the designated button, wait for the tooltip to appear, and verify its text content.",
    "positive": [
      "The tooltip becomes visible.",
      "The text matches exactly."
    ],
    "negative": [
      "The tooltip flashes and disappears too quickly.",
      "The text is truncated."
    ]
  }
]} /></div>
        <div className="pt-4 pb-12 flex gap-8">
          <div className="relative group inline-block">
            <Button variant="outline" id="btn-hover-tooltip">Hover Me</Button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" id="tooltip-text">
              I am a hover tooltip!
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
