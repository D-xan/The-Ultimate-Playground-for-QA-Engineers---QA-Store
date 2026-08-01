import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';

export default function Interactions() {
  const [doubleClickStatus, setDoubleClickStatus] = useState('Not double-clicked yet');
  const [rightClickStatus, setRightClickStatus] = useState('Not right-clicked yet');
  const [hoverStatus, setHoverStatus] = useState('Hover over me');
  const [dragged, setDragged] = useState(false);

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mouse & Keyboard Interactions</h1>
        <p className="text-slate-500">Practice complex interactions like double click, right click, drag-and-drop, and key presses.</p>
        
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">20. Mouse Actions</h2>
        <div className="mb-4 mt-2"><TaskQuestions tasks={[
  {
    "title": "Drag the draggable item into the drop zone",
    "description": "Perform a drag-and-drop action. Click and hold the draggable element, move it to the drop zone, and release.",
    "positive": [
      "The item is successfully dropped.",
      "The drop zone updates its UI to show success."
    ],
    "negative": [
      "The drag action fails to pick up the item.",
      "Dropping outside the zone causes the item to get stuck."
    ]
  },
  {
    "title": "Hover over the element to reveal the hidden button, then click it",
    "description": "Trigger a mouse hover event on the target element. Wait for the hidden button to become visible, and click it.",
    "positive": [
      "The hidden button becomes visible on hover.",
      "The button is successfully clicked."
    ],
    "negative": [
      "The hover event doesn't trigger visibility.",
      "The button disappears before it can be clicked."
    ]
  },
  {
    "title": "Double click the target box to change its state",
    "description": "Perform a double-click action on the specific target box.",
    "positive": [
      "The box changes color or state.",
      "A success message or visual indicator appears."
    ],
    "negative": [
      "A single click triggers the double-click action.",
      "The double-click action is not registered."
    ]
  },
  {
    "title": "Right-click to open the custom context menu",
    "description": "Perform a context-click (right-click) on the target area to open a custom, non-native context menu.",
    "positive": [
      "The custom context menu opens.",
      "The native browser context menu is suppressed."
    ],
    "negative": [
      "The native browser context menu opens instead.",
      "The custom context menu fails to appear."
    ]
  }
]} /></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Double Click</h3>
            <div 
              className="p-6 bg-slate-100 rounded-lg text-center cursor-pointer select-none border-2 border-dashed border-slate-300"
              onDoubleClick={() => setDoubleClickStatus('Double Click Successful!')}
              id="box-double-click"
            >
              {doubleClickStatus}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Right Click (Context Menu)</h3>
            <div 
              className="p-6 bg-slate-100 rounded-lg text-center cursor-context-menu select-none border-2 border-dashed border-slate-300"
              onContextMenu={(e) => {
                e.preventDefault();
                setRightClickStatus('Right Click Successful!');
              }}
              id="box-right-click"
            >
              {rightClickStatus}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Hover</h3>
            <div 
              className="p-6 bg-slate-100 rounded-lg text-center cursor-pointer border-2 border-dashed border-slate-300 transition-colors hover:bg-primary hover:text-white"
              onMouseEnter={() => setHoverStatus('Hovering!')}
              onMouseLeave={() => setHoverStatus('Hover over me')}
              id="box-hover"
            >
              {hoverStatus}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Drag & Drop (Simple)</h3>
            <div className="flex gap-4">
              <div 
                className="w-24 h-24 bg-primary text-white flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', 'dragged')}
                id="draggable-item"
              >
                Drag Me
              </div>
              <div 
                className={`w-32 h-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${dragged ? 'bg-success/20 border-success' : 'border-slate-300 bg-slate-50'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.getData('text/plain') === 'dragged') {
                    setDragged(true);
                  }
                }}
                id="droppable-zone"
              >
                {dragged ? 'Dropped!' : 'Drop Here'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">21. Keyboard Actions</h2>
        <div>
          <h3 className="font-semibold mb-3">Key Event Logger</h3>
          <p className="text-sm text-slate-500 mb-4">Focus the input below and press any key to see the event captured.</p>
          <input 
            type="text" 
            placeholder="Type here..." 
            className="w-full border border-border rounded-md p-4 text-lg font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            onKeyDown={(e) => {
              const el = document.getElementById('key-output');
              if (el) el.innerText = `Key Pressed: ${e.key} | Code: ${e.code}`;
            }}
            id="keyboard-input"
          />
          <div className="mt-4 p-4 bg-slate-900 text-green-400 font-mono rounded-lg" id="key-output">
            Awaiting keypress...
          </div>
        </div>
      </section>

    </div>
  );
}
