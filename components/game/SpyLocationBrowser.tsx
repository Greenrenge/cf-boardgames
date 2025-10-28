'use client';

import { useState } from 'react';
import { Location } from '@/lib/types';
import { LocationImage } from './LocationImage';

interface SpyLocationBrowserProps {
  locations: Location[];
}

interface ModalState {
  isOpen: boolean;
  location: Location | null;
}

export function SpyLocationBrowser({ locations }: SpyLocationBrowserProps) {
  const [modal, setModal] = useState<ModalState>({ isOpen: false, location: null });

  // Sort locations alphabetically by Thai name
  const sortedLocations = [...locations].sort((a, b) => {
    return a.nameTh.localeCompare(b.nameTh, 'th');
  });

  const openModal = (location: Location) => {
    setModal({ isOpen: true, location });
  };

  const closeModal = () => {
    setModal({ isOpen: false, location: null });
  };

  // Handle ESC key to close modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">All Locations ({locations.length})</h2>
        <p className="text-sm text-gray-600 mt-1">
          Browse all possible locations to help you blend in
        </p>
      </div>

      {/* Grid of location images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {sortedLocations.map((location) => (
          <button
            key={location.id}
            onClick={() => openModal(location)}
            className="group relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-transform hover:scale-105"
            type="button"
            aria-label={`View ${location.nameTh} in detail`}
          >
            <div className="overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow">
              <LocationImage imageUrl={location.imageUrl} locationName={location.nameTh} />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{location.nameTh}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal for enlarged view */}
      {modal.isOpen && modal.location && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Modal content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 id="modal-title" className="text-2xl font-bold text-gray-900">
                  {modal.location.nameTh}
                </h3>
              </div>

              {/* Enlarged image */}
              <div className="rounded-lg overflow-hidden shadow-lg">
                <LocationImage
                  imageUrl={modal.location.imageUrl}
                  locationName={modal.location.nameTh}
                />
              </div>

              {/* Roles list */}
              {modal.location.roles && modal.location.roles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Available Roles ({modal.location.roles.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {modal.location.roles.map((role, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-700"
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
