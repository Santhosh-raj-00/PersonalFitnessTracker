import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface StepperInputProps {
  label?: string;
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  quickAddValues?: number[];
}

export const StepperInput: React.FC<StepperInputProps> = ({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  unit = '',
  quickAddValues = [],
}) => {
  const handleDecrement = () => {
    const nextVal = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(nextVal);
  };

  const handleIncrement = () => {
    const nextVal = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(nextVal);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-400">{label}</label>}
      <div className="flex items-center bg-gray-900/80 border border-gray-800 rounded-xl p-1 shadow-inner">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-200 rounded-lg font-bold text-lg transition-transform btn-press"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center justify-center px-2">
          <input
            type="number"
            value={value === 0 ? '' : value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full text-center bg-transparent text-white font-bold text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {unit && <span className="text-xs text-gray-400 ml-1 font-medium">{unit}</span>}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg font-bold text-lg transition-transform btn-press"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {quickAddValues.length > 0 && (
        <div className="flex items-center gap-1.5 mt-0.5 justify-center">
          {quickAddValues.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(Math.max(min, Math.round((value + v) * 10) / 10))}
              className="px-2 py-0.5 text-[10px] font-semibold bg-gray-800/80 hover:bg-gray-700 text-emerald-400 rounded-md border border-gray-700/50 btn-press"
            >
              +{v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
