'use client';

import { useTranslations } from 'next-intl';
import { useLocationTranslations } from '@/lib/useLocationTranslations';
import { useRoleTranslations } from '@/lib/useRoleTranslations';
import { thaiRolesToSlugs } from '@/lib/roleUtils';
import { Card } from '../ui/Card';

interface LocationReferenceProps {
  location: string;
  roles: string[];
}

export function LocationReference({ location, roles }: LocationReferenceProps) {
  const t = useTranslations('common');
  const { getLocationName } = useLocationTranslations();
  const { getRoleName } = useRoleTranslations();

  // Get translated location name
  const translatedLocationName = getLocationName(location);

  // Convert Thai role names to slugs and translate
  const roleSlugs = thaiRolesToSlugs(roles);
  const translatedRoles = roleSlugs.map((slug) => getRoleName(slug));

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 dark:from-purple-900 dark:to-indigo-900 dark:border-purple-700">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
            {t('game.rolesAt')} {translatedLocationName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            {t('game.useAsReference')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {translatedRoles.map((role, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-white rounded-lg shadow-sm border border-purple-200 dark:bg-gray-800 dark:border-purple-700"
            >
              <p className="text-sm text-center text-gray-800 dark:text-gray-100">{role}</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-300 text-center italic">
          {t('game.oneOfTheseRoles')}
        </div>
      </div>
    </Card>
  );
}
