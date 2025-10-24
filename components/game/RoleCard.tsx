'use client';

import { Card } from '../ui/Card';

interface RoleCardProps {
  role: string;
  location: string | null;
  isSpy: boolean;
}

export function RoleCard({ role, location, isSpy }: RoleCardProps) {
  return (
    <Card
      className={
        isSpy
          ? 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
          : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300'
      }
    >
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">บทบาทของคุณ</p>
          <h2 className={`text-3xl font-bold ${isSpy ? 'text-red-600' : 'text-blue-600'}`}>
            {role}
          </h2>
        </div>

        {isSpy ? (
          <div className="space-y-2 p-4 bg-red-100 rounded-lg">
            <p className="text-red-900 font-medium">🕵️ คุณคือสปาย!</p>
            <p className="text-sm text-red-800">คุณต้องเดาสถานที่โดยไม่ให้ใครรู้ว่าคุณเป็นสปาย</p>
            <p className="text-xs text-red-700">ถามคำถามอย่างฉลาดและพยายามเดาสถานที่ก่อนหมดเวลา</p>
          </div>
        ) : (
          <div className="space-y-2 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-900 font-medium">📍 สถานที่</p>
            <p className="text-xl font-bold text-blue-900">{location}</p>
            <p className="text-sm text-blue-800">พยายามหาสปายโดยไม่เปิดเผยสถานที่</p>
          </div>
        )}

        <div className="text-xs text-gray-500 italic">
          {isSpy ? 'อย่าบอกใครว่าคุณเป็นสปาย!' : 'อย่าบอกสถานที่โดยตรง!'}
        </div>
      </div>
    </Card>
  );
}
