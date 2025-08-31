
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { XIcon } from '../icons/XIcon';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
     onChange(selected.filter(item => item !== option));
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <div className="flex flex-col items-center relative">
        <div onClick={() => setIsOpen(!isOpen)} className="w-full">
            <div className="p-2.5 flex border border-border bg-secondary rounded-lg transition-colors duration-200 focus-within:ring-2 focus-within:ring-accent focus-within:border-primary">
                <div className="flex flex-auto flex-wrap">
                    {selected.map(option => (
                        <div key={option} className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-primary/20 rounded-full text-accent border border-primary/30">
                           <div className="text-xs font-normal leading-none max-w-full flex-initial">{option}</div>
                           <div className="flex flex-auto flex-row-reverse">
                                <div onClick={(e) => { e.stopPropagation(); removeOption(option); }}>
                                    <XIcon className="cursor-pointer hover:text-red-400 ml-2" />
                                </div>
                           </div>
                        </div>
                    ))}
                    {selected.length === 0 && <div className="text-text-secondary">Select hooks...</div>}
                </div>
                <div className="text-text-secondary w-8 py-1 pl-2 pr-1 border-l-2 border-border flex items-center">
                    <button type="button" className="cursor-pointer w-6 h-6 outline-none focus:outline-none">
                       <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
        {isOpen && (
           <div className="absolute shadow top-full bg-card z-40 w-full lef-0 rounded-lg max-h-60 overflow-y-auto mt-1 border border-border">
               <div className="flex flex-col w-full">
                   {options.map((option) => (
                       <div key={option} onClick={() => handleSelect(option)} className={`cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-secondary ${selected.includes(option) ? 'bg-primary/30' : ''}`}>
                           <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-primary">
                               <div className="w-full items-center flex">
                                   <div className="mx-2 leading-6 text-text-primary">{option}</div>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;