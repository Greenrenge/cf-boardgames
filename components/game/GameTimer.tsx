'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';

interface GameTimerProps {
  remainingSeconds: number;
  timerEndsAt: number;
  onTimerExpired?: () => void;
}

export function GameTimer({ remainingSeconds, timerEndsAt, onTimerExpired }: GameTimerProps) {
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    // Check if timer is expiring (last 10 seconds)
    if (remainingSeconds <= 10 && remainingSeconds > 0) {
      setIsExpiring(true);
    } else {
      setIsExpiring(false);
    }

    // Check if timer expired
    if (remainingSeconds === 0 && onTimerExpired) {
      onTimerExpired();
    }
  }, [remainingSeconds, onTimerExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!timerEndsAt) return 100;
    const totalSeconds = Math.floor((timerEndsAt - Date.now() + remainingSeconds * 1000) / 1000);
    return (remainingSeconds / totalSeconds) * 100;
  };

  const getTimerColor = () => {
    if (remainingSeconds <= 10) return 'text-red-600';
    if (remainingSeconds <= 60) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getProgressColor = () => {
    if (remainingSeconds <= 10) return 'bg-red-500';
    if (remainingSeconds <= 60) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <Card className={`${isExpiring ? 'animate-pulse border-2 border-red-500' : ''}`}>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">เวลาที่เหลือ</p>
          <div className={`text-5xl font-bold tabular-nums ${getTimerColor()}`}>
            {formatTime(remainingSeconds)}
          </div>
          {isExpiring && (
            <p className="text-sm text-red-600 font-medium mt-2 animate-bounce">⏰ เวลาใกล้หมด!</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        <div className="text-center text-xs text-gray-500">
          {remainingSeconds <= 60 ? 'เตรียมลงคะแนน!' : 'สนทนาและค้นหาสปาย'}
        </div>
      </div>
    </Card>
  );
}
