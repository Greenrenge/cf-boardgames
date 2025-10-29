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
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 border-2 rounded-xl
          bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed
          transition-all duration-200
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
