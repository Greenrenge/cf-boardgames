'use client';

/**
 * SelectionValidationError Component
 *
 * Displays validation errors when selection requirements are not met.
 * Typically used to prevent game start when no locations are selected.
 */

import React from 'react';

interface SelectionValidationErrorProps {
  message: string;
  className?: string;
}

export function SelectionValidationError({
  message,
  className = '',
}: SelectionValidationErrorProps) {
  return (
    <div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md p-4 flex items-start gap-3 ${className}`}
      role="alert"
    >
      {/* Warning icon */}
      <svg
        className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      {/* Error message */}
      <div className="flex-1">
        <div className="font-semibold text-red-800 dark:text-red-200">Validation Error</div>
        <div className="text-sm text-red-700 dark:text-red-300 mt-1">{message}</div>
      </div>
    </div>
  );
}
