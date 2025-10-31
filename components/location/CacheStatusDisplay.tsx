'use client';

import { useEffect, useState } from 'react';
import { getCacheStatus } from '@/lib/api/apiCache';

interface CacheStatus {
  exists: boolean;
  age?: string;
  expiresIn?: string;
  isExpired?: boolean;
}

interface CacheStatusDisplayProps {
  cacheKey: string;
  refreshInterval?: number; // milliseconds
  className?: string;
}

/**
 * Format milliseconds into human-readable duration
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function CacheStatusDisplay({
  cacheKey,
  refreshInterval = 5000,
  className = '',
}: CacheStatusDisplayProps) {
  const [status, setStatus] = useState<CacheStatus | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateStatus = () => {
      const rawStatus = getCacheStatus(cacheKey);

      if (!rawStatus) {
        setStatus(null);
        return;
      }

      // Format the raw milliseconds into readable strings
      const formattedStatus: CacheStatus = {
        exists: rawStatus.exists,
        age: rawStatus.exists ? formatDuration(rawStatus.age) : undefined,
        expiresIn:
          rawStatus.exists && !rawStatus.isExpired
            ? formatDuration(rawStatus.expiresIn)
            : undefined,
        isExpired: rawStatus.isExpired,
      };

      setStatus(formattedStatus);
    };

    // Initial update
    updateStatus();

    // Set up interval for updates
    const interval = setInterval(updateStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [cacheKey, refreshInterval, mounted]);

  if (!mounted || !status) {
    return null;
  }

  if (!status.exists) {
    return (
      <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>No cache data</div>
    );
  }

  return (
    <div className={`text-xs space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            status.isExpired ? 'bg-red-500' : 'bg-green-500'
          }`}
        />
        <span className="text-gray-700 dark:text-gray-300">
          {status.isExpired ? 'Cache expired' : 'Cache active'}
        </span>
      </div>

      {status.age && <div className="text-gray-600 dark:text-gray-400">Age: {status.age}</div>}

      {status.expiresIn && !status.isExpired && (
        <div className="text-gray-600 dark:text-gray-400">Expires in: {status.expiresIn}</div>
      )}
    </div>
  );
}
