import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};
