'use client';

import { useState } from 'react';

interface LocationImageProps {
  imageUrl: string;
  locationName: string;
  className?: string;
}

export function LocationImage({ imageUrl, locationName, className = '' }: LocationImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative w-full aspect-[3/2] ${className}`}>
      {/* Loading skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}

      {/* Error fallback */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-300">
          <p className="text-gray-600 font-medium text-center px-4">{locationName}</p>
        </div>
      )}

      {/* Image */}
      <img
        src={imageUrl}
        alt={locationName}
        loading="lazy"
        className={`
          w-full h-full object-cover rounded-lg shadow-md
          transition-opacity duration-300
          ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
        `}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
