/**
 * LocationLoadError Component
 * Displays error message when location data fails to load
 */

interface LocationLoadErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function LocationLoadError({ error, onRetry }: LocationLoadErrorProps) {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Failed to Load Locations
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationLoadError;
