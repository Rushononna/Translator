import React, { useState, useMemo } from 'react';
import { 
  Megaphone, 
  TrendingUp, 
  Gauge,
  ChevronDown,
  CalendarDays,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Info
} from './Icons';
import { MOCK_ADS_DATA } from '../data/adsData';
import { AdsPerformanceChart, CostBreakdownChart, CampaignBarChart } from './Charts';
import { FilterBar, FILTER_OPTIONS } from './FilterBar';
import { DateRangePicker } from './DateRangePicker';

// High-fidelity SVG World Map
const WorldMap = () => (
  <svg viewBox="0 0 1000 500" className="w-full h-full text-gray-200 fill-current">
    <g transform="scale(1)">
        {/* Simplified high quality paths for world map */}
        <path d="M260,70 L280,60 L300,70 L320,100 L350,90 L400,110 L380,140 L340,160 L290,130 L250,110 Z" className="text-gray-100 stroke-white stroke-[2]" /> 
        {/* North America */}
        <path d="M50,80 L150,50 L250,60 L280,150 L220,200 L180,250 L120,220 L80,150 Z" className="text-gray-100 stroke-white stroke-[2]" />
        {/* South America */}
        <path d="M220,260 L280,260 L320,350 L280,450 L240,400 L200,320 Z" className="text-gray-100 stroke-white stroke-[2]" />
        {/* Europe */}
        <path d="M420,80 L500,70 L550,120 L520,150 L480,140 L450,160 L420,130 Z" className="text-gray-100 stroke-white stroke-[2]" />
        {/* Africa */}
        <path d="M420,180 L520,180 L550,250 L520,350 L450,320 L400,250 Z" className="text-gray-100 stroke-white stroke-[2]" />
        {/* Asia */}
        <path d="M550,80 L700,60 L850,100 L880,180 L800,250 L700,220 L620,200 L580,150 Z" className="text-gray-100 stroke-white stroke-[2]" />
        {/* Australia */}
        <path d="M750,300 L850,290 L880,360 L800,400 L740,360 Z" className="text-gray-100 stroke-white stroke-[2]" />
        {/* Greece Highlight (Approximate) */}
        <path d="M485,135 L495,135 L495,145 L485,145 Z" className="text-blue-500 fill-current" />
    </g>
  </svg>
);

const DetailedWorldMap = () => {
    return (
        <svg viewBox="0 0 1010 650" className="w-full h-full text-gray-100 fill-current">
             {/* Base Map */}
             <path d="M 230 400 L 290 390 L 330 460 L 290 560 L 250 510 L 230 400 z" className="stroke-white stroke-[2]" /> {/* S. America */}
             <path d="M 100 120 L 200 80 L 300 100 L 280 250 L 220 300 L 150 250 L 100 120 z" className="stroke-white stroke-[2]" /> {/* N. America */}
             <path d="M 450 200 L 550 200 L 580 300 L 530 400 L 450 350 L 450 200 z" className="stroke-white stroke-[2]" /> {/* Africa */}
             <path d="M 450 100 L 550 80 L 600 150 L 550 180 L 450 150 L 450 100 z" className="stroke-white stroke-[2]" /> {/* Europe */}
             <path d="M 600 80 L 800 60 L 900 150 L 850 250 L 700 220 L 600 180 z" className="stroke-white stroke-[2]" /> {/* Asia */}
             <path d="M 750 350 L 880 350 L 880 450 L 750 420 z" className="stroke-white stroke-[2]" /> {/* Australia */}
             
             {/* Highlighted Country: Greece (Approximate location) */}
             <path d="M 525 145 L 535 145 L 532 155 L 522 152 z" className="text-blue-500 fill-current" />
        </svg>
    )
}

const MetricGroup = ({ children }: { children?: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center h-full transition-shadow hover:shadow-md">
    {children}
  </div>
);

const MetricItem = ({ 
  label, 
  value, 
  trend, 
  isFirst = false
}: { 
  label: string, 
  value: string | number, 
  trend?: number,
  isFirst?: boolean
}) => (
  <div className={`flex flex-col min-w-0 ${!isFirst ? 'border-l border-gray-100 pl-3 md:pl-4' : ''}`}>
    <span className="text-gray-500 text-[10px] font-medium mb-0.5 truncate uppercase tracking-tight">{label}</span>
    <span className="text-lg font-bold text-gray-800 mb-0.5 tracking-tight truncate leading-tight">{value}</span>
    {trend !== undefined && (
      <div className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend > 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
        <span className="ml-0.5">{Math.abs(trend)}%</span>
      </div>
    )}
  </div>
);

const IconBox = ({ icon, colorClass }: { icon: React.ReactNode, colorClass: string }) => (
  <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-500/20 flex-shrink-0`}>
    {icon}
  </div>
);

export const AdsView: React.FC = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // --- Filter State ---
  const [dateRange, setDateRange] = useState({
    start: new Date('2025-12-28'),
    end: new Date('2026-01-26')
  });

  const [filters, setFilters] = useState({
    conversions: [] as string[],
    countries: FILTER_OPTIONS.countries.map(c => c.id),
    devices: FILTER_OPTIONS.devices.map(d => d.id),
    platforms: FILTER_OPTIONS.platforms.map(p => p.id),
  });

  const handleFilterChange = (type: keyof typeof filters, id: string) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(id) 
        ? current.filter(item => item !== id) 
        : [...current, id];
      return { ...prev, [type]: updated };
    });
  };

  const handleDateApply = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  // --- Derived Data Calculation ---
  const filteredData = useMemo(() => {
    // 1. Filter Timeline by Date
    const timelineInDate = MOCK_ADS_DATA.timeline.filter(item => {
      const d = new Date(item.date);
      return d >= dateRange.start && d <= dateRange.end;
    });

    // 2. Simulate Filter Effects (Category filtering)
    // Since mock data is pre-aggregated, we simulate reduction by active filters ratio.
    // In a real app, this would be a backend query or more granular filtering.
    const getFilterFactor = (type: 'countries' | 'devices' | 'platforms') => {
      const total = FILTER_OPTIONS[type].length;
      const selected = filters[type].length;
      return total > 0 ? selected / total : 1;
    };
    
    // Combine factors (simplified simulation)
    const factor = getFilterFactor('countries') * getFilterFactor('devices') * getFilterFactor('platforms');

    // Apply factor to numerical values in timeline
    const adjustedTimeline = timelineInDate.map(item => ({
      ...item,
      conversions: Math.round(item.conversions * factor),
      impressions: Math.round(item.impressions * factor),
      clicks: Math.round(item.clicks * factor),
      cost: Number((item.cost * factor).toFixed(2)),
      // Rates technically stay similar but let's leave them for simplicity or slightly jitter
      // Previous metrics also scaled
      previousConversions: Math.round(item.previousConversions * factor),
      previousImpressions: Math.round(item.previousImpressions * factor),
      previousClicks: Math.round(item.previousClicks * factor),
      previousCost: Number((item.previousCost * factor).toFixed(2)),
    }));

    // Re-calculate Overview totals based on adjusted timeline
    const totalImps = adjustedTimeline.reduce((sum, i) => sum + i.impressions, 0);
    const totalClicks = adjustedTimeline.reduce((sum, i) => sum + i.clicks, 0);
    const totalConversions = adjustedTimeline.reduce((sum, i) => sum + i.conversions, 0);
    const totalCost = adjustedTimeline.reduce((sum, i) => sum + i.cost, 0);
    
    const overview = {
      impressions: totalImps,
      clicks: totalClicks,
      conversions: totalConversions,
      amountSpent: Number(totalCost.toFixed(2)),
      ctr: totalImps > 0 ? Number(((totalClicks / totalImps) * 100).toFixed(2)) : 0,
      conversionRate: totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0,
      costPerConversion: totalConversions > 0 ? Number((totalCost / totalConversions).toFixed(2)) : 0,
      cpc: totalClicks > 0 ? Number((totalCost / totalClicks).toFixed(2)) : 0,
      cpm: totalImps > 0 ? Number(((totalCost / totalImps) * 1000).toFixed(2)) : 0,
      frequency: 2.62, // Static for mock
    };

    // Filter Breakdown Charts
    const platformData = MOCK_ADS_DATA.platforms.filter(p => filters.platforms.includes(p.platform));
    const countryData = MOCK_ADS_DATA.countries.filter(c => filters.countries.includes(c.country));

    return {
      timeline: adjustedTimeline,
      overview,
      platforms: platformData,
      campaigns: MOCK_ADS_DATA.campaigns, // Campaigns usually depend on ID, leaving as is for now
      countries: countryData
    };
  }, [dateRange, filters]);

  const ov = filteredData.overview;
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-row w-full min-h-screen">
        {/* Main Dashboard Content */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
            
            {/* Header with Date Picker */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ads Overview</h1>
                
                <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm relative">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-200">
                        <div className="w-6 h-6 bg-[#1877F2] rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>
                        <span className="text-sm font-semibold text-gray-700">Facebook Ads</span>
                    </div>
                    
                    <button 
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                        <CalendarDays size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-medium text-gray-700">
                            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    {isDatePickerOpen && (
                        <DateRangePicker 
                          initialStart={dateRange.start}
                          initialEnd={dateRange.end}
                          onClose={() => setIsDatePickerOpen(false)} 
                          onApply={handleDateApply}
                        />
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <FilterBar 
              onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)} 
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
            />

            {/* Top Metrics Rows - 2 Large Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                
                {/* Left Card: Impressions... */}
                <MetricGroup>
                    <IconBox icon={<Megaphone size={22} strokeWidth={2.5} />} colorClass="bg-gradient-to-br from-[#29b6f6] to-[#0288d1]" />
                    <div className="grid grid-cols-4 gap-1 flex-1 min-w-0">
                        <MetricItem label="Impressions" value={ov.impressions.toLocaleString()} trend={-2.1} isFirst />
                        <MetricItem label="Frequency" value={ov.frequency} trend={-5.0} />
                        <MetricItem label="Link Clicks" value={ov.clicks.toLocaleString()} trend={-13.8} />
                        <MetricItem label="CTR (Links)" value={ov.ctr} trend={-13} />
                    </div>
                </MetricGroup>

                {/* Right Card: Conversions... */}
                <MetricGroup>
                    <IconBox icon={<Gauge size={22} strokeWidth={2.5} />} colorClass="bg-gradient-to-br from-[#4fc3f7] to-[#039be5]" />
                    <div className="grid grid-cols-4 gap-1 flex-1 min-w-0">
                        <MetricItem label="Conversions" value={ov.conversions.toLocaleString()} trend={-2.1} isFirst />
                        <MetricItem label="Conv. Rate" value={`${ov.conversionRate}%`} trend={13.5} />
                        <MetricItem label="Amt. Spent" value={`${ov.amountSpent} €`} trend={-14.9} />
                        <MetricItem label="Cost/Conv." value={`${ov.costPerConversion} €`} trend={-13} />
                    </div>
                </MetricGroup>
            </div>

            {/* Performance Chart */}
            <AdsPerformanceChart data={filteredData.timeline} />

            {/* Bottom Row - 3 Columns with Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
                
                {/* Column 1: Cost Breakdown (Combined Card) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
                    <div className="p-5 pb-0">
                        <h3 className="text-lg font-semibold text-gray-700">Cost Breakdown</h3>
                    </div>
                    
                    {/* Donut Chart */}
                    <div className="flex-1 min-h-0 relative">
                        <CostBreakdownChart data={filteredData.platforms} />
                    </div>

                    {/* Metrics Footer */}
                    <div className="p-5 pt-0">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#f9fafb] rounded-xl p-3">
                                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">CPC</div>
                                <div className="text-xl font-bold text-gray-800 mb-0.5">{ov.cpc} €</div>
                                <div className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                                    <ArrowDownRight size={12} strokeWidth={3}/> 13.8%
                                </div>
                            </div>
                            <div className="bg-[#f9fafb] rounded-xl p-3">
                                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">CPM</div>
                                <div className="text-xl font-bold text-gray-800 mb-0.5">{ov.cpm} €</div>
                                <div className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                                    <ArrowDownRight size={12} strokeWidth={3}/> 19.0%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Campaign Performance */}
                <div className="h-full">
                    <CampaignBarChart data={filteredData.campaigns} />
                </div>

                {/* Column 3: Country Performance */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Performance By Country</h3>
                    
                    {/* Map Area - Top */}
                    <div className="h-40 w-full mb-4 flex items-center justify-center">
                        <DetailedWorldMap />
                    </div>

                    {/* Country List - Bottom */}
                    <div className="bg-[#f9fafb] rounded-xl p-3 flex-1 flex flex-col gap-2 overflow-y-auto">
                        {filteredData.countries.map((c, i) => (
                            <div key={i} className="flex items-center justify-between py-1">
                                {/* Left: Code */}
                                <div className="w-12">
                                    <span className="text-gray-600 font-bold text-xs uppercase">{c.country}</span>
                                </div>

                                {/* Middle: Value + Bar */}
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-xs font-bold text-gray-700 w-10 text-right">{c.conversions.toLocaleString()}</span>
                                    {c.conversions > 0 ? (
                                        <div className="h-3 bg-sky-300 flex-1 rounded-sm" style={{ width: `${Math.min(100, (c.conversions / 2500) * 100)}%`, maxWidth: '100px' }}></div>
                                    ) : (
                                        <div className="h-3 w-px bg-sky-300"></div>
                                    )}
                                </div>

                                {/* Right: Change */}
                                <div className="w-14 text-right">
                                    {c.change !== 0 ? (
                                        <div className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${c.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {c.change}% <ArrowDownRight size={10} strokeWidth={3} className={c.change > 0 ? 'rotate-180' : ''}/>
                                        </div>
                                    ) : <span className="text-gray-400 text-[10px]">-</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            </div>
        </div>

        {/* Applied Filters Right Panel */}
        {showFilterPanel && (
            <div className="w-80 bg-white border-l border-gray-200 h-screen sticky top-0 flex-shrink-0 flex flex-col shadow-xl z-50 animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-gray-800">Applied filters</h2>
                    <div className="flex items-center gap-2">
                         <Info size={20} className="text-gray-400" />
                         <button onClick={() => setShowFilterPanel(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                         </button>
                    </div>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto flex-1">
                    {/* Active Filter Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                             <div className="w-8 h-8 rounded border border-gray-100 flex items-center justify-center">
                                 <TrendingUp size={16} className="text-blue-500" />
                             </div>
                             <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <p className="font-bold text-gray-800">"Conversions ...</p>
                    </div>

                    {/* Active Controls Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Active controls (1)</h3>
                            <ChevronDown size={16} className="text-gray-400 rotate-180" />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-2">Report-level</p>
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                 <CalendarDays size={20} className="text-gray-500" />
                                 <div className="overflow-hidden">
                                     <p className="text-sm font-medium text-gray-700 truncate">
                                        Date : {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                                     </p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
