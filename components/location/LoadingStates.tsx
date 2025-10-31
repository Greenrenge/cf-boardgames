/**
 * Enhanced Loading States for Location Components
 *
 * Provides skeleton loading screens, progress indicators, and smooth transitions
 * for better UX during data fetching and API calls.
 */

'use client';

import React from 'react';

interface LocationListSkeletonProps {
  count?: number;
  showBulkActions?: boolean;
}

export const LocationListSkeleton = React.memo(function LocationListSkeleton({
  count = 6,
  showBulkActions = true,
}: LocationListSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading locations">
      {/* Header skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Count skeleton */}
        <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded-md w-48"></div>

        {/* Bulk actions skeleton */}
        {showBulkActions && (
          <div className="flex gap-2 flex-wrap">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-md w-20"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-md w-24"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-md w-28"></div>
          </div>
        )}
      </div>

      {/* Location items skeleton */}
      <div className="space-y-2">
        {Array.from({ length: count }, (_, i) => (
          <LocationItemSkeleton key={i} />
        ))}
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading location selection interface</span>
    </div>
  );
});

export const LocationItemSkeleton = React.memo(function LocationItemSkeleton() {
  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox skeleton */}
        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-md w-32"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-24"></div>
        </div>

        {/* Expand button skeleton */}
        <div className="w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
      </div>
    </div>
  );
});

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray';
  className?: string;
}

export const LoadingSpinner = React.memo(function LoadingSpinner({
  size = 'md',
  color = 'blue',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-600',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
});

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple';
  className?: string;
}

export const ProgressBar = React.memo(function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  color = 'blue',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  return (
    <div
      className={`space-y-2 ${className}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && (
            <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
          )}
        </div>
      )}

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <span className="sr-only">
        {label ? `${label}: ` : ''}Progress {current} of {total} ({percentage}%)
      </span>
    </div>
  );
});

interface ApiLoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  retry?: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const ApiLoadingState = React.memo(function ApiLoadingState({
  isLoading,
  error,
  retry,
  children,
  loadingComponent,
}: ApiLoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        {loadingComponent || (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">Loading locations...</p>
          </>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-md p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Failed to Load
        </h3>

        <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>

        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
});
