import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityInput({ 
  value, 
  onChange, 
  min = 1, 
  max = 9999,
  className = '' 
}: QuantityInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string for better UX while typing
    if (newValue === '') {
      setInputValue('');
      return;
    }
    
    // Only allow numbers
    if (!/^\d+$/.test(newValue)) {
      return;
    }
    
    setInputValue(newValue);
    const numValue = parseInt(newValue, 10);
    
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    // If empty or invalid, reset to current value
    if (inputValue === '' || parseInt(inputValue, 10) < min) {
      setInputValue(value.toString());
    } else if (parseInt(inputValue, 10) > max) {
      setInputValue(max.toString());
      onChange(max);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, min);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-16 text-center font-medium border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
      
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center border border-border rounded hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="button"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
