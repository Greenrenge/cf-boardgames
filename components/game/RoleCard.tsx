'use client';

import { Card } from '../ui/Card';
import { LocationImage } from './LocationImage';
import { SpyLocationBrowser } from './SpyLocationBrowser';
import { useLocationTranslations } from '@/lib/useLocationTranslations';
import { useTranslations } from 'next-intl';
import type { Location } from '@/lib/types';

interface RoleCardProps {
  role: string;
  location: string | null;
  isSpy: boolean;
  locations?: Location[]; // NEW: Optional locations data for image display
  isDuplicateRole?: boolean; // NEW: Indicates if this role is duplicated in large groups
}

export function RoleCard({
  role,
  location,
  isSpy,
  locations,
  isDuplicateRole = false,
}: RoleCardProps) {
  const t = useTranslations('common');
  const { getLocationName } = useLocationTranslations();

  // Find the location object to get the imageUrl and ID
  const locationData = locations?.find((loc) => loc.nameTh === location);
  const translatedLocationName = locationData ? getLocationName(locationData.id) : location;

  return (
    <Card
      className={
        isSpy
          ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 dark:from-red-900 dark:to-pink-900 dark:border-red-700'
          : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 dark:from-blue-900 dark:to-cyan-900 dark:border-blue-700'
      }
    >
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
            {t('game.yourRole')}
          </p>
          <h2
            className={`text-3xl font-bold ${isSpy ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'}`}
          >
            {role}
          </h2>
          {/* NEW: Duplicate role indicator */}
          {!isSpy && isDuplicateRole && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full dark:bg-amber-900 dark:border-amber-700">
              <span className="text-amber-700 dark:text-amber-200 text-xs font-medium">
                {t('game.duplicateRoleWarning')}
              </span>
            </div>
          )}
        </div>

        {isSpy ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-100 rounded-lg dark:bg-red-900">
              <p className="text-red-900 dark:text-red-100 font-medium">{t('game.youAreTheSpy')}</p>
              <p className="text-sm text-red-800 dark:text-red-200">{t('game.spyObjective')}</p>
              <p className="text-xs text-red-700 dark:text-red-300">{t('game.spyTip')}</p>
            </div>

            {/* NEW: Spy location browser */}
            {locations && locations.length > 0 && <SpyLocationBrowser locations={locations} />}
          </div>
        ) : (
          <div className="space-y-3">
            {/* NEW: Location image display */}
            {locationData && translatedLocationName && (
              <LocationImage
                imageUrl={locationData.imageUrl}
                locationName={translatedLocationName}
              />
            )}

            <div className="p-4 bg-blue-100 rounded-lg dark:bg-blue-900">
              <p className="text-blue-900 dark:text-blue-100 font-medium">{t('game.location')}</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                {translatedLocationName}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{t('game.findSpyTip')}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-300 italic">
          {isSpy ? t('game.dontTellSpy') : t('game.dontRevealLocation')}
        </div>
      </div>
    </Card>
  );
}
