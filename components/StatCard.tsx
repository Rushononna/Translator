import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from './Icons';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  color: 'blue' | 'red' | 'green' | 'yellow' | 'purple';
  icon?: React.ReactNode;
}

const colorMap = {
  blue: 'text-google-blue border-l-google-blue',
  red: 'text-google-red border-l-google-red',
  green: 'text-google-green border-l-google-green',
  yellow: 'text-google-yellow border-l-google-yellow',
  purple: 'text-purple-600 border-l-purple-600',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, color, icon }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 ${colorMap[color]} flex flex-col justify-between h-full transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-gray-400 opacity-50">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs mt-3 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : trend < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
          <span className="ml-1 font-medium">{Math.abs(trend)}% vs previous 30 days</span>
        </div>
      )}
    </div>
  );
};