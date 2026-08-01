import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function BasicElements() {
  const [loading, setLoading] = useState(false);
  
  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Basic Elements</h1>
        <p className="text-slate-500">Practice interacting with standard HTML inputs, buttons, checkboxes, and sliders.</p>
        
      </div>

      {/* Inputs */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Input Fields</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Fill out all text and password fields",
    "description": "Locate the text and password input fields using their ID or standard selectors, and enter some mock data into them.",
    "positive": [
      "Data is correctly typed into the input fields.",
      "The typed data matches the expected input value."
    ],
    "negative": [
      "Fields remain empty after the test script runs.",
      "Inputting special characters causes validation errors (if any)."
    ]
  }
]} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm mb-1">Textbox</label><Input type="text" placeholder="Standard text input" id="basic-text" /></div>
          <div><label className="block text-sm mb-1">Password</label><Input type="password" placeholder="Password input" id="basic-password" /></div>
          <div><label className="block text-sm mb-1">Email</label><Input type="email" placeholder="Email input" id="basic-email" /></div>
          <div><label className="block text-sm mb-1">Number</label><Input type="number" placeholder="Number input" id="basic-number" /></div>
          <div><label className="block text-sm mb-1">Phone</label><Input type="tel" placeholder="Phone input" id="basic-phone" /></div>
          <div><label className="block text-sm mb-1">URL</label><Input type="url" placeholder="URL input" id="basic-url" /></div>
          <div><label className="block text-sm mb-1">Search</label><Input type="search" placeholder="Search input" id="basic-search" /></div>
          <div><label className="block text-sm mb-1">Hidden Input (inspect DOM)</label><input type="hidden" value="secret-qa-value" id="basic-hidden" /></div>
          <div><label className="block text-sm mb-1">Readonly Input</label><Input type="text" value="You cannot edit me" readOnly id="basic-readonly" /></div>
          <div><label className="block text-sm mb-1">Disabled Input</label><Input type="text" placeholder="I am disabled" disabled id="basic-disabled" /></div>
        </div>
      </section>

      {/* Textareas */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">Text Areas</h2>
        <div>
          <label className="block text-sm mb-1">Multi-line textarea</label>
          <textarea className="w-full border border-border rounded-md p-2" rows={4} placeholder="Type a long message here..." id="basic-textarea"></textarea>
        </div>
      </section>

      {/* Buttons */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Buttons</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Click the loading button and wait for it to finish",
    "description": "Click the button that triggers a loading state. Wait until the loading indicator disappears and the button becomes clickable again.",
    "positive": [
      "The button enters a disabled/loading state upon click.",
      "The button returns to its normal state after 3 seconds."
    ],
    "negative": [
      "The script fails because it doesn't wait for the loading to finish.",
      "The button remains stuck in the loading state."
    ]
  }
]} /></div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button id="btn-normal">Normal Button</Button>
          <Button type="submit" variant="outline" id="btn-submit">Submit Button</Button>
          <Button type="reset" variant="outline" id="btn-reset">Reset Button</Button>
          <Button disabled id="btn-disabled">Disabled Button</Button>
          <Button onClick={handleLoadingClick} disabled={loading} id="btn-loading">
            {loading ? 'Loading...' : 'AJAX/Loading Button'}
          </Button>
          
          <button className="h-12 w-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform" id="btn-fab">
            +
          </button>
        </div>
      </section>

      {/* Checkboxes & Radios */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Checkboxes</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Check the 'Accept Terms' checkbox",
    "description": "Find the checkbox for accepting terms and conditions and perform a click action to check it.",
    "positive": [
      "The checkbox state changes to checked.",
      "Submitting the form with the checkbox checked succeeds."
    ],
    "negative": [
      "The checkbox remains unchecked.",
      "Clicking the label does not check the box (if label isn't linked correctly)."
    ]
  }
]} /></div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4" id="chk-single" /> Single Checkbox
            </label>
            <div className="pt-2">
              <p className="text-sm text-slate-500 mb-2">Multiple Checkboxes</p>
              <label className="flex items-center gap-2 cursor-pointer mb-1"><input type="checkbox" className="h-4 w-4" id="chk-multi-1" /> Option A</label>
              <label className="flex items-center gap-2 cursor-pointer mb-1"><input type="checkbox" className="h-4 w-4" id="chk-multi-2" /> Option B</label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">4. Radio Buttons</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Select a radio button option",
    "description": "Identify the radio button group and click one of the options (e.g., 'Option 2').",
    "positive": [
      "The selected radio button becomes active.",
      "Other radio buttons in the same group become inactive."
    ],
    "negative": [
      "Multiple radio buttons in the group are selected simultaneously (bug).",
      "No radio button is selected after the click."
    ]
  }
]} /></div>
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-2">Single-choice radio group</p>
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="radio" name="radio-group-1" value="yes" id="radio-yes" /> Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="radio" name="radio-group-1" value="no" id="radio-no" /> No
            </label>
          </div>
        </div>
      </section>

      {/* Sliders & Toggles */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">7. Sliders</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Move the slider to 75",
    "description": "Interact with the range slider element. Use automation to set its value to exactly 75.",
    "positive": [
      "The slider value updates to 75.",
      "The UI reflects the new slider position."
    ],
    "negative": [
      "The slider value exceeds the maximum limit.",
      "The slider remains at its default value."
    ]
  }
]} /></div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Range Slider (Volume)</label>
              <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-primary" id="slider-volume" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">8. Toggle Controls</h2>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" id="toggle-switch-1" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-medium text-slate-900">On/Off Switch</span>
            </label>
          </div>
        </div>
      </section>
      
      {/* Links */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">11. Links</h2>
        <div className="flex gap-4">
          <a href="#" className="text-primary hover:underline" id="link-internal">Internal Anchor Link</a>
          <a href="https://example.com" target="_blank" rel="noreferrer" className="text-primary hover:underline" id="link-external">External Link (New Tab)</a>
        </div>
      </section>

    </div>
  );
}
