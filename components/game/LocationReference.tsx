'use client';

import { Card } from '../ui/Card';

interface LocationReferenceProps {
  location: string;
  roles: string[];
}

export function LocationReference({ location, roles }: LocationReferenceProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 dark:from-purple-900 dark:to-indigo-900 dark:border-purple-700">
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
            บทบาทที่ {location}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            ใช้เป็นข้อมูลอ้างอิงในการสนทนา
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {roles.map((role, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-white rounded-lg shadow-sm border border-purple-200 dark:bg-gray-800 dark:border-purple-700"
            >
              <p className="text-sm text-center text-gray-800 dark:text-gray-100">{role}</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-300 text-center italic">
          หนึ่งในบทบาทเหล่านี้เป็นของคุณ
        </div>
      </div>
    </Card>
  );
}
