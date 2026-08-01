import React, { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
  options: string[];
  placeholder?: string;
  id?: string;
}

export function SearchableDropdown({ options, placeholder = "Search...", id }: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center justify-between border border-border rounded-md p-2 bg-white cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <input 
          type="text"
          id={id}
          className="w-full outline-none bg-transparent"
          placeholder={selectedValue || placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedValue(""); // Clear selected if typing
          }}
          onFocus={() => setIsOpen(true)}
        />
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li 
                  key={index}
                  className="px-3 py-2 hover:bg-primary/10 cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedValue(option);
                    setSearchTerm(option);
                    setIsOpen(false);
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-sm text-slate-500 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
