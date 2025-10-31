/**
 * LocationSkeleton Component
 * Displays loading placeholder while location data is being fetched
 */

export function LocationSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

        {/* Location cards skeleton */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
          >
            {/* Location name */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>

            {/* Roles */}
            <div className="space-y-2 pl-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LocationSkeleton;
