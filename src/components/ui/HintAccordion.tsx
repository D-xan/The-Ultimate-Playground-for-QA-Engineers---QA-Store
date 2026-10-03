import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface HintProps {
  hints: string[];
}

export function HintAccordion({ hints }: HintProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!hints || hints.length === 0) return null;

  return (
    <div className="mt-8 border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-amber-800 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Need a Hint?
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-amber-200/50">
          <ul className="space-y-3 mt-3">
            {hints.map((hint, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-amber-900">
                <span className="font-bold text-amber-500">{idx + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: hint }} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
