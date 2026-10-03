import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import countries from '@/data/countries.json';
import { HintAccordion } from '@/components/ui/HintAccordion';

export default function AdvancedInputs() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Inputs</h1>
        <p className="text-slate-500">Practice interacting with dropdowns, file uploads, date pickers, and more complex inputs.</p>
        <HintAccordion hints={[
          "<strong>Date Pickers:</strong> In Playwright, use <code>await page.fill('input[type=\"date\"]', '2025-01-01')</code>.",
          "<strong>File Uploads:</strong> In Cypress, use <code>cy.get('input[type=\"file\"]').selectFile('path/to/file.png')</code>.",
          "<strong>Custom Dropdowns:</strong> You often need to click the dropdown container, then wait for the list items to appear, and then click the specific list item."
        ]} />
      </div>

      {/* Dropdowns */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Dropdowns</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="dropdowns" tasks={[
  {
    "title": "Search for and select 'India' from the searchable dropdown",
    "description": "Type 'Ind' into the searchable dropdown, wait for the suggestions to appear, and select 'India' from the list of 195 countries.",
    "positive": [
      "The suggestion list appears and filters down to matches like 'India' and 'Indonesia'.",
      "Clicking 'India' populates the input field and closes the dropdown."
    ],
    "negative": [
      "The suggestion list doesn't filter correctly.",
      "Typing gibberish still shows suggestions instead of 'No results found'."
    ]
  }
]} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Standard HTML Select</label>
            <select className="w-full border border-border rounded-md p-2 bg-white" id="dropdown-standard">
              <option value="">Choose an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Searchable Autocomplete Dropdown</label>
            <SearchableDropdown options={countries} id="dropdown-searchable" placeholder="Search countries..." />
          </div>
          <div>
            <label className="block text-sm mb-1">Multi-select Dropdown</label>
            <select multiple className="w-full border border-border rounded-md p-2 bg-white h-24" id="dropdown-multiple">
              <option value="apple">Apple</option>
              <option value="banana">Banana</option>
              <option value="orange">Orange</option>
              <option value="grape">Grape</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Disabled Dropdown</label>
            <select disabled className="w-full border border-border rounded-md p-2 bg-slate-100" id="dropdown-disabled">
              <option>Cannot select me</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Cascading Dropdown (Country &gt; State)</label>
            <div className="flex gap-2">
              <select className="flex-1 border border-border rounded-md p-2 bg-white" id="dropdown-country">
                <option value="us">United States</option>
                <option value="ca">Canada</option>
              </select>
              <select className="flex-1 border border-border rounded-md p-2 bg-white" id="dropdown-state">
                <option value="ny">New York</option>
                <option value="ca">California</option>
                <option value="tx">Texas</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Date & Time */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Date & Time</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="datetime" tasks={[
  {
    "title": "Select a specific date from the date picker",
    "description": "Open the date picker calendar and select a specific target date, or directly input a valid date string.",
    "positive": [
      "The date is successfully selected and displayed.",
      "The internal state updates to reflect the selected date."
    ],
    "negative": [
      "Selecting a past date is allowed when it shouldn't be (if validation exists).",
      "Invalid date formats crash the picker."
    ]
  }
]} /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm mb-1">Date Picker</label>
            <input type="date" className="w-full border border-border rounded-md p-2" id="date-picker" />
          </div>
          <div>
            <label className="block text-sm mb-1">Time Picker</label>
            <input type="time" className="w-full border border-border rounded-md p-2" id="time-picker" />
          </div>
          <div>
            <label className="block text-sm mb-1">Date-Time Picker</label>
            <input type="datetime-local" className="w-full border border-border rounded-md p-2" id="datetime-picker" />
          </div>
        </div>
      </section>

      {/* File Handling */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. File Uploads</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="uploads" tasks={[
  {
    "title": "Upload a dummy file",
    "description": "Use your automation tool's file upload mechanism to attach a dummy file to the file input.",
    "positive": [
      "The file name is displayed after selection.",
      "The file is successfully attached to the input element."
    ],
    "negative": [
      "Uploading an unsupported file type doesn't show an error.",
      "The file upload fails silently."
    ]
  }
]} /></div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Single File Upload</label>
              <input type="file" className="w-full border border-border rounded-md p-2 text-sm" onChange={handleFileUpload} id="file-upload-single" />
              {selectedFile && <p className="text-xs text-success mt-2">Selected: {selectedFile.name}</p>}
            </div>
            <div>
              <label className="block text-sm mb-2">Multiple File Upload</label>
              <input type="file" multiple className="w-full border border-border rounded-md p-2 text-sm" id="file-upload-multiple" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">4. Downloads</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => alert('Download triggered')} id="download-pdf">Download PDF</Button>
            <Button variant="outline" onClick={() => alert('Download triggered')} id="download-csv">Download CSV</Button>
            <Button variant="outline" onClick={() => alert('Download triggered')} id="download-excel">Download Excel</Button>
          </div>
        </div>
      </section>

      {/* Color & Color Picker */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">5. Advanced Pickers</h2>
        <div className="mb-4 mt-2"><TaskQuestions groupId="pickers" tasks={[
  {
    "title": "Pick a custom color from the color picker",
    "description": "Interact with the color input type to set a specific hex color code.",
    "positive": [
      "The color picker updates to the specified hex code.",
      "The UI reflects the chosen color."
    ],
    "negative": [
      "An invalid hex code is accepted without error.",
      "The color picker fails to open."
    ]
  }
]} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Color Picker</label>
            <input type="color" defaultValue="#3b82f6" className="w-16 h-10 cursor-pointer" id="color-picker" />
          </div>
        </div>
      </section>

    </div>
  );
}
