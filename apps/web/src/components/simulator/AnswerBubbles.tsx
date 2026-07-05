import React from 'react';

interface AnswerOption {
  id: string;
  label?: string;
}

interface AnswerBubblesProps {
  questionNumber: number;
  options: AnswerOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export const AnswerBubbles = ({
  questionNumber,
  options,
  selectedOptionId,
  onSelect,
}: AnswerBubblesProps) => (
  <div className="bg-white px-6 py-5 flex items-center gap-5 justify-center pb-safe">
    <span className="text-[#ef4444] font-black text-2xl tracking-tighter">
      {questionNumber.toString().padStart(3, '0')}.
    </span>
    <div className="flex gap-3 flex-wrap justify-center">
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const label = option.label ?? option.id.toUpperCase();
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`min-w-[2.75rem] h-11 px-3 rounded-full flex items-center justify-center font-black text-lg transition-all active:scale-90
              ${
                isSelected
                  ? 'bg-slate-800 text-white border-2 border-slate-800'
                  : 'bg-white text-[#ef4444] border-2 border-[#ef4444] hover:bg-red-50'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  </div>
);
