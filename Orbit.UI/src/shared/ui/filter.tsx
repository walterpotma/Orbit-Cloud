import React from 'react';

type FilterProps = {
  options: string[];
  activeFilter: number;
  onFilterChange: (index: number) => void;
};

export default function Filter({ options, activeFilter, onFilterChange }: FilterProps) {
  return (
    <nav className="flex justify-center items-center space-x-2 md:space-x-4">
      {options.map((option, index) => (
        <button
          key={option}
          onClick={() => onFilterChange(index)}
          className={`px-3 py-2 rounded-lg text-sm md:text-base ${
            activeFilter === index
              ? "bg-slate-800 text-blue-400"
              : "text-slate-300"
          } cursor-pointer transition ease-in-out duration-200 hover:bg-slate-800 hover:text-blue-400`}
        >
          {option}
        </button>
      ))}
    </nav>
  );
}