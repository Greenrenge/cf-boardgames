'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Message } from '@/lib/types';

interface ChatPanelProps {
  messages: Message[];
  currentPlayerId: string;
  onSendMessage: (content: string, isTurnIndicator: boolean) => void;
  disabled?: boolean;
}

export function ChatPanel({
  messages,
  currentPlayerId,
  onSendMessage,
  disabled = false,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim(), false);
      setInputValue('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-gray-200 pb-3 mb-3">
        <h3 className="text-lg font-medium text-gray-900">การสนทนา</h3>
        <p className="text-xs text-gray-500">ถามคำถามและค้นหาสปาย</p>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>ยังไม่มีข้อความ</p>
            <p className="text-xs mt-1">เริ่มสนทนากันเถอะ!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.playerId === currentPlayerId;
            const isTurnIndicator = message.isTurnIndicator;

            return (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  isTurnIndicator
                    ? 'bg-yellow-100 border-2 border-yellow-400'
                    : isOwnMessage
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                }`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isOwnMessage ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {message.playerName}
                    {isOwnMessage && ' (คุณ)'}
                  </span>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-800 break-words">{message.content}</p>
                {isTurnIndicator && (
                  <span className="text-xs text-yellow-800 font-medium">👉 ถึงคิวแล้ว</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          disabled={disabled}
          maxLength={500}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <Button type="submit" disabled={!inputValue.trim() || disabled}>
          ส่ง
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-2">{inputValue.length}/500 ตัวอักษร</p>
    </Card>
  );
}
