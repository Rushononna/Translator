import React from 'react';
import { 
  ChevronDown,
  CalendarDays
} from './Icons';
import { MOCK_CAMPAIGNS_DATA } from '../data/campaignsData';
import { PlatformStackedChart } from './Charts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FilterBar } from './FilterBar';

// Reusing style constants
const COLORS = ['#0ea5e9', '#3b82f6', '#1e3a8a', '#93c5fd']; // facebook (sky/blue mix), instagram, messenger, unknown

export const CampaignsView: React.FC = () => {
  const { timeline, platformStats } = MOCK_CAMPAIGNS_DATA;

  // Pie Data derived from stats
  const pieData = platformStats.map(s => ({
    name: s.platform,
    value: s.amountSpentPercent,
    color: s.platform === 'facebook' ? '#0ea5e9' : 
           s.platform === 'instagram' ? '#3b82f6' : 
           s.platform === 'messenger' ? '#1e3a8a' : '#93c5fd'
  })).filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header with Title and Date/Source */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Platforms Overview</h1>
        
        <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-200">
                 <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>
                 <span className="text-sm font-medium text-gray-700">Account 123</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded">
                 <CalendarDays size={16} className="text-gray-500" />
                 <span className="text-sm text-gray-600">Dec 28, 2025 - Jan 26, 2026</span>
                 <ChevronDown size={14} className="text-gray-400" />
             </div>
        </div>
      </div>

      {/* Filters Bar */}
      <FilterBar />

      {/* Top Section: Comparison Card & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left: Platform Breakdown Card */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-blue-400 text-white shadow-sm">Overview</button>
                <button className="flex-1 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md">Facebook</button>
                <button className="flex-1 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md">Instagram</button>
            </div>

            <div className="space-y-4 mb-8">
                 <div className="flex justify-between text-xs font-bold text-gray-400 uppercase border-b border-gray-100 pb-2">
                     <span>Publisher Platform</span>
                     <span>% of Conversions</span>
                     <span>% of Amount Spent</span>
                 </div>
                 {platformStats.slice(0, 2).map((p, i) => (
                     <div key={i} className="flex justify-between text-sm text-gray-600">
                         <span className="capitalize">{p.platform}</span>
                         <span className="text-center">{p.conversionPercent}%</span>
                         <span className="text-right">{p.amountSpentPercent}%</span>
                     </div>
                 ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                 <h4 className="text-xs font-medium text-gray-500 mb-2">Spent By Platform</h4>
                 <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Donut Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         {/* Empty center */}
                    </div>
                 </div>
                 {/* Legend */}
                 <div className="flex flex-wrap gap-4 mt-4 justify-center">
                     {pieData.map((d, i) => (
                         <div key={i} className="flex items-center gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                             <span className="text-xs text-gray-500 capitalize">{d.name}</span>
                         </div>
                     ))}
                 </div>
            </div>
         </div>

         {/* Right: Stacked Chart */}
         <div className="lg:col-span-2">
            <PlatformStackedChart data={timeline} />
         </div>
      </div>

      {/* Bottom Section: Platform Analysis Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-gray-800">Platform Analysis</h3>
             <div className="flex gap-4">
                 <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600">
                     <span>Campaign Name</span>
                     <ChevronDown size={14} />
                 </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600">
                     <span>Adset Name</span>
                     <ChevronDown size={14} />
                 </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600">
                     <span>Ad Name</span>
                     <ChevronDown size={14} />
                 </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                      <tr>
                          <th className="px-6 py-4">Publisher Platform</th>
                          <th className="px-6 py-4">Conversions</th>
                          <th className="px-2 py-4">% Δ</th>
                          <th className="px-6 py-4">Conversion Rate %</th>
                          <th className="px-2 py-4">% Δ</th>
                          <th className="px-6 py-4">Cost per Conversion</th>
                          <th className="px-2 py-4">Δ</th>
                          <th className="px-6 py-4">Amount Spent</th>
                          <th className="px-2 py-4">% Δ</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {platformStats.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-gray-600 font-medium capitalize">{p.platform}</td>
                              
                              {/* Conversions */}
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 justify-end">
                                      <span>{p.conversions.toLocaleString()}</span>
                                      {p.conversions > 0 && (
                                        <div className="h-2 bg-sky-300 rounded-sm" style={{ width: `${Math.min(100, (p.conversions / 2000) * 100)}px` }}></div>
                                      )}
                                      {p.conversions === 0 && <div className="w-px h-3 bg-sky-300"></div>}
                                  </div>
                              </td>
                              <td className={`px-2 py-4 text-xs font-medium ${p.changeConversions > 0 ? 'text-green-600' : p.changeConversions < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {p.changeConversions !== 0 ? `${p.changeConversions > 0 ? '' : ''}${p.changeConversions}% ${p.changeConversions > 0 ? '↑' : '↓'}` : '-'}
                              </td>

                              {/* Conversion Rate */}
                              <td className="px-6 py-4">
                                  {p.conversionRate > 0 ? (
                                    <div className="bg-sky-200 text-sky-800 text-xs font-bold px-2 py-1 text-center rounded relative overflow-hidden">
                                        <div className="absolute inset-0 bg-sky-300 opacity-50" style={{ width: `${p.conversionRate}%` }}></div>
                                        <span className="relative z-10">{p.conversionRate}%</span>
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 text-center">null</div>
                                  )}
                              </td>
                              <td className={`px-2 py-4 text-xs font-medium ${p.changeConversionRate > 0 ? 'text-green-600' : p.changeConversionRate < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                   {p.changeConversionRate !== 0 ? `${p.changeConversionRate}% ${p.changeConversionRate > 0 ? '↑' : '↓'}` : '-'}
                              </td>

                              {/* Cost per Conversion */}
                              <td className="px-6 py-4 text-center">
                                  {p.cpa > 0 || p.amountSpent > 0 ? (
                                     <div className={`text-xs font-bold px-2 py-1 rounded text-center ${p.cpa > 0 ? 'bg-sky-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {p.cpa} €
                                     </div>
                                  ) : <span className="text-gray-400">null</span>}
                              </td>
                              <td className={`px-2 py-4 text-xs font-medium ${p.changeCpa > 0 ? 'text-green-600' : p.changeCpa < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                   {p.changeCpa !== 0 ? `${p.changeCpa} € ${p.changeCpa > 0 ? '↑' : '↓'}` : '-'}
                              </td>

                              {/* Amount Spent */}
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 justify-end">
                                      <span>{p.amountSpent} €</span>
                                      {p.amountSpent > 0 && (
                                        <div className="h-2 bg-blue-400 rounded-sm" style={{ width: `${Math.min(100, (p.amountSpent / 400) * 100)}px` }}></div>
                                      )}
                                       {p.amountSpent === 0 && <div className="w-px h-3 bg-blue-200"></div>}
                                  </div>
                              </td>
                              <td className={`px-2 py-4 text-xs font-medium ${p.changeAmountSpent > 0 ? 'text-green-600' : p.changeAmountSpent < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                   {p.changeAmountSpent !== 0 ? `${p.changeAmountSpent}% ${p.changeAmountSpent > 0 ? '↑' : '↓'}` : '-'}
                              </td>
                          </tr>
                      ))}
                      
                      {/* Grand Total Row */}
                      <tr className="bg-gray-50 font-bold text-gray-800">
                          <td className="px-6 py-4">Grand total</td>
                          <td className="px-6 py-4 text-right">2,259</td>
                          <td className="px-2 py-4 text-xs text-red-500">-2.0% ↓</td>
                          <td className="px-6 py-4 text-center">81%</td>
                          <td className="px-2 py-4 text-xs text-green-600">13.6% ↑</td>
                          <td className="px-6 py-4 text-center">0.22 €</td>
                          <td className="px-2 py-4 text-xs text-red-500">-0.03 € ↓</td>
                          <td className="px-6 py-4 text-right">490.3 €</td>
                          <td className="px-2 py-4 text-xs text-red-500">-14.9% ↓</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
};