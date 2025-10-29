import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 border-2 rounded-xl
          bg-white/50 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          placeholder:text-gray-400
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-blue-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
