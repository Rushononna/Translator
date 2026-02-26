import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Globe, 
  TrendingUp, 
  Search, 
  Calendar, 
  Sparkles 
} from './Icons';
import { StatCard } from './StatCard';
import { PerformanceChart, DeviceBreakdownChart } from './Charts';
import { MOCK_DATA } from '../data/searchConsoleData';
import { generateDataInsights } from '../services/geminiService';
import { DashboardData } from '../types';

// Simple table component
const DataTable = ({ title, data, type }: { title: string, data: any[], type: 'query' | 'page' }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <button className="text-google-blue text-sm font-medium hover:underline">View All</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">{type === 'query' ? 'Top Query' : 'Top Page'}</th>
            <th className="px-6 py-3 text-right">Clicks</th>
            <th className="px-6 py-3 text-right">Impr.</th>
            <th className="px-6 py-3 text-right">CTR</th>
            <th className="px-6 py-3 text-right">Pos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]" title={type === 'query' ? item.query : item.page}>
                {type === 'query' ? item.query : item.page.replace('https://example.com', '')}
              </td>
              <td className="px-6 py-4 text-right">{item.clicks.toLocaleString()}</td>
              <td className="px-6 py-4 text-right">{item.impressions.toLocaleString()}</td>
              <td className="px-6 py-4 text-right">{item.ctr}%</td>
              <td className="px-6 py-4 text-right">{item.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const InsightModal = ({ isOpen, onClose, insight, isLoading }: { isOpen: boolean, onClose: () => void, insight: string, isLoading: boolean }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-google-blue/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-google-blue/10 rounded-full text-google-blue">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">AI Performance Analysis</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-google-blue border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Consulting Gemini...</p>
            </div>
          ) : (
            <div className="prose prose-blue max-w-none">
              <div className="whitespace-pre-line text-gray-700 text-lg leading-relaxed">
                {insight}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const SearchConsoleView: React.FC = () => {
  const [data] = useState<DashboardData>(MOCK_DATA);
  const [totals, setTotals] = useState({ clicks: 0, impressions: 0, avgCtr: 0, avgPos: 0 });
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightText, setInsightText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Calculate totals based on timeline
    const totalClicks = data.timeline.reduce((sum, item) => sum + item.clicks, 0);
    const totalImps = data.timeline.reduce((sum, item) => sum + item.impressions, 0);
    const avgCtr = (totalClicks / totalImps) * 100;
    const avgPos = data.timeline.reduce((sum, item) => sum + item.position, 0) / data.timeline.length;

    setTotals({
      clicks: totalClicks,
      impressions: totalImps,
      avgCtr: parseFloat(avgCtr.toFixed(2)),
      avgPos: parseFloat(avgPos.toFixed(1))
    });
  }, [data]);

  const handleGenerateInsights = async () => {
    setIsInsightOpen(true);
    if (!insightText) {
      setIsGenerating(true);
      const text = await generateDataInsights(data);
      setInsightText(text);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
       {/* Toolbar */}
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Search Performance</h1>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 shadow-sm">
            <Calendar size={16} />
            <span>Last 30 Days</span>
            </div>
            <button 
            onClick={handleGenerateInsights}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-google-blue to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full font-medium shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
            <Sparkles size={18} />
            <span>AI Analysis</span>
            </button>
        </div>
        </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Clicks" 
          value={totals.clicks.toLocaleString()} 
          trend={5.2} 
          color="blue" 
          icon={<Smartphone size={20} />}
        />
        <StatCard 
          title="Total Impressions" 
          value={totals.impressions.toLocaleString()} 
          trend={-2.1} 
          color="purple" 
          icon={<Globe size={20} />}
        />
        <StatCard 
          title="Average CTR" 
          value={`${totals.avgCtr}%`} 
          trend={0.4} 
          color="green" 
          icon={<TrendingUp size={20} />}
        />
        <StatCard 
          title="Average Position" 
          value={totals.avgPos} 
          trend={-0.8} 
          color="yellow" 
          icon={<Search size={20} />}
        />
      </div>

      {/* Main Chart */}
      <div>
        <PerformanceChart data={data.timeline} />
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px]">
          <DataTable title="Top Queries" data={data.queries} type="query" />
        </div>
        <div className="h-[400px] flex flex-col gap-6">
          <DeviceBreakdownChart data={data.devices} />
          
          {/* Country Mini Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Top Countries</h3>
              </div>
              <div className="overflow-y-auto flex-1">
                {data.countries.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{c.country}</span>
                    <span className="text-sm text-gray-500">{c.clicks.toLocaleString()} clicks</span>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>

      <div className="mt-8">
        <DataTable title="Top Pages" data={data.pages} type="page" />
      </div>

      <InsightModal 
        isOpen={isInsightOpen} 
        onClose={() => setIsInsightOpen(false)} 
        insight={insightText} 
        isLoading={isGenerating} 
      />
    </div>
  );
}