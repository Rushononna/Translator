import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import { 
  ArrowUp, 
  ArrowDown, 
  MoreVertical, 
  BarChart2, 
  Filter, 
  Settings,
  Check,
  Square
} from './Icons';
import { DailyMetric, DeviceMetric, AdsDailyMetric, AdsPlatformMetric, AdsCampaignMetric, PlatformDailyMetric } from '../types';

interface MainChartProps {
  data: DailyMetric[];
}

export const PerformanceChart: React.FC<MainChartProps> = ({ data }) => {
  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance Over Time</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4285F4" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorImps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5f6368" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#5f6368" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              const date = new Date(str);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            tick={{fill: '#9aa0a6', fontSize: 12}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            tick={{fill: '#9aa0a6', fontSize: 12}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{fill: '#9aa0a6', fontSize: 12}}
            axisLine={false}
            tickLine={false}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="clicks" 
            name="Total Clicks"
            stroke="#4285F4" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClicks)" 
            activeDot={{ r: 6 }}
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="impressions" 
            name="Total Impressions"
            stroke="#5f6368" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorImps)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DeviceChartProps {
  data: DeviceMetric[];
}

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];

export const DeviceBreakdownChart: React.FC<DeviceChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Devices</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="clicks"
            nameKey="device"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


// ADS CHARTS

interface AdsPerformanceChartProps {
  data: AdsDailyMetric[];
}

type MetricKey = keyof AdsDailyMetric;

interface MetricOption {
  key: MetricKey;
  label: string;
  color: string;
  yAxisId: 'left' | 'right';
}

const AVAILABLE_METRICS: MetricOption[] = [
  { key: 'conversions', label: 'Conversions', color: '#3b82f6', yAxisId: 'left' },
  { key: 'impressions', label: 'Impressions', color: '#8b5cf6', yAxisId: 'left' },
  { key: 'clicks', label: 'Link Clicks', color: '#10b981', yAxisId: 'left' },
  { key: 'ctr', label: 'CTR (Link Clicks)', color: '#ec4899', yAxisId: 'right' },
  { key: 'cost', label: 'Amount Spent', color: '#f59e0b', yAxisId: 'left' },
  { key: 'conversionRate', label: 'Conversion Rate %', color: '#6366f1', yAxisId: 'right' },
  { key: 'costPerConversion', label: 'Cost per Conversion', color: '#ef4444', yAxisId: 'right' },
  { key: 'frequency', label: 'Frequency', color: '#14b8a6', yAxisId: 'right' },
  { key: 'roas', label: 'Conversion ROAS', color: '#f97316', yAxisId: 'right' },
];

const MetricsDropdown = ({ 
  selected, 
  onToggle 
}: { 
  selected: MetricKey[], 
  onToggle: (key: MetricKey) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : ''}`}
        title="Change chart metrics"
      >
        <div className="relative">
           <BarChart2 size={20} strokeWidth={2} />
           <div className="absolute -top-1 -right-1 bg-white rounded-full p-[1px]">
              <Settings size={10} className="text-current" strokeWidth={2.5} />
           </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Metrics</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {AVAILABLE_METRICS.map((metric) => {
              const isChecked = selected.includes(metric.key);
              return (
                <div 
                  key={metric.key} 
                  onClick={() => onToggle(metric.key)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-gray-800 border-gray-800' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                    {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomAdsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dateStr = label;
    
    // Attempt to calculate previous date roughly for visual reference
    const dateObj = new Date(dateStr);
    const prevDateObj = new Date(dateObj);
    prevDateObj.setDate(prevDateObj.getDate() - 30);
    const prevDateStr = isNaN(prevDateObj.getTime()) 
        ? 'Previous Period' 
        : prevDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const currentItems = payload.filter((p: any) => !p.dataKey.toString().toLowerCase().includes('previous'));
    const previousItems = payload.filter((p: any) => p.dataKey.toString().toLowerCase().includes('previous'));

    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-sm min-w-[200px] z-50 text-left">
        <div className="mb-3">
            <p className="font-bold text-gray-800 mb-1.5 text-sm">{dateStr}</p>
            {currentItems.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-gray-600 font-medium">{entry.name}:</span>
                    <span className="font-bold text-gray-900">{entry.value.toLocaleString()}</span>
                </div>
            ))}
        </div>

        {previousItems.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="font-bold text-gray-800 mb-1.5 text-sm">{prevDateStr}</p>
                 {previousItems.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-gray-600 font-medium">{entry.name.replace(' (previous 30 days)', '')}:</span>
                        <span className="font-bold text-gray-900">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  }
  return null;
};

export const AdsPerformanceChart: React.FC<AdsPerformanceChartProps> = ({ data }) => {
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['conversions']);

  // Handle drill down/up logic
  const handleDrillUp = () => {
    if (granularity === 'day') setGranularity('week');
    else if (granularity === 'week') setGranularity('month');
  };

  const handleDrillDown = () => {
    if (granularity === 'month') setGranularity('week');
    else if (granularity === 'week') setGranularity('day');
  };

  const handleToggleMetric = (key: MetricKey) => {
    if (activeMetrics.includes(key)) {
      if (activeMetrics.length > 1) { // Prevent unchecking the last one
        setActiveMetrics(activeMetrics.filter(k => k !== key));
      }
    } else {
      setActiveMetrics([...activeMetrics, key]);
    }
  };

  // Determine if we need the right Y axis based on selection
  const activeMetricConfigs = activeMetrics.map(key => AVAILABLE_METRICS.find(m => m.key === key));
  const hasLeftConfig = activeMetricConfigs.some(m => m?.yAxisId === 'left');
  const hasRightConfig = activeMetricConfigs.some(m => m?.yAxisId === 'right');
  
  // Only use dual axis if we have metrics that want left AND metrics that want right.
  // If we only have "right" metrics (like CTR), they should be displayed on the left axis (sole/primary).
  const useDualAxis = hasLeftConfig && hasRightConfig;

  // Aggregate Data based on granularity
  const aggregatedData = useMemo(() => {
    if (granularity === 'day') return data.map(item => ({
      ...item,
      // Ensure full date is available for tooltip
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    const grouped: Record<string, any> = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      let key = item.date;

      if (granularity === 'week') {
        // Group by Start of Week
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
        const weekStart = new Date(date);
        weekStart.setDate(diff);
        key = weekStart.toISOString().split('T')[0];
      } else if (granularity === 'month') {
        // Group by Month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          rawDate: key,
          count: 0,
          // Initialize sums
          conversions: 0, previousConversions: 0,
          impressions: 0, previousImpressions: 0,
          clicks: 0, previousClicks: 0,
          cost: 0, previousCost: 0,
          // Initialize sums for averaging
          ctr: 0, previousCtr: 0,
          conversionRate: 0, previousConversionRate: 0,
          costPerConversion: 0, previousCostPerConversion: 0,
          frequency: 0, previousFrequency: 0,
          roas: 0, previousRoas: 0
        };
      }
      
      const g = grouped[key];
      g.count++;
      
      // Sums
      g.conversions += item.conversions;
      g.previousConversions += item.previousConversions;
      g.impressions += item.impressions;
      g.previousImpressions += item.previousImpressions;
      g.clicks += item.clicks;
      g.previousClicks += item.previousClicks;
      g.cost += item.cost;
      g.previousCost += item.previousCost;
      
      // Sums for averages
      g.ctr += item.ctr;
      g.previousCtr += item.previousCtr;
      g.conversionRate += item.conversionRate;
      g.previousConversionRate += item.previousConversionRate;
      g.costPerConversion += item.costPerConversion;
      g.previousCostPerConversion += item.previousCostPerConversion;
      g.frequency += item.frequency;
      g.previousFrequency += item.previousFrequency;
      g.roas += item.roas;
      g.previousRoas += item.previousRoas;
    });

    return Object.values(grouped).map((g: any) => ({
      date: granularity === 'month' 
        ? new Date(g.rawDate).toLocaleString('default', { month: 'short', year: 'numeric' })
        : new Date(g.rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      
      conversions: g.conversions,
      previousConversions: g.previousConversions,
      impressions: g.impressions,
      previousImpressions: g.previousImpressions,
      clicks: g.clicks,
      previousClicks: g.previousClicks,
      cost: g.cost,
      previousCost: g.previousCost,
      
      // Calculate averages
      ctr: parseFloat((g.ctr / g.count).toFixed(2)),
      previousCtr: parseFloat((g.previousCtr / g.count).toFixed(2)),
      
      conversionRate: parseFloat((g.conversionRate / g.count).toFixed(2)),
      previousConversionRate: parseFloat((g.previousConversionRate / g.count).toFixed(2)),
      
      costPerConversion: parseFloat((g.costPerConversion / g.count).toFixed(2)),
      previousCostPerConversion: parseFloat((g.previousCostPerConversion / g.count).toFixed(2)),
      
      frequency: parseFloat((g.frequency / g.count).toFixed(2)),
      previousFrequency: parseFloat((g.previousFrequency / g.count).toFixed(2)),
      
      roas: parseFloat((g.roas / g.count).toFixed(2)),
      previousRoas: parseFloat((g.previousRoas / g.count).toFixed(2)),
    }));
  }, [data, granularity]);

  return (
    <div className="h-[400px] w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative z-0">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Performance Over Time</h3>
        
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">Drill down from month to week to day</span>
          <div className="flex items-center gap-3">
             {/* Drill Controls */}
             <div className="flex items-center bg-white rounded-full border border-gray-200 p-0.5 shadow-sm">
                <button 
                  onClick={handleDrillUp}
                  disabled={granularity === 'month'}
                  className={`p-1.5 rounded-full transition-colors ${granularity === 'month' ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50 text-blue-600'}`} 
                  title="Drill up"
                >
                   <ArrowUp size={16} strokeWidth={2.5} />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                <button 
                  onClick={handleDrillDown}
                  disabled={granularity === 'day'}
                  className={`p-1.5 rounded-full transition-colors ${granularity === 'day' ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50 text-blue-600'}`} 
                  title="Drill down"
                >
                   <ArrowDown size={16} strokeWidth={2.5} />
                </button>
             </div>

             {/* Metrics Settings */}
             <MetricsDropdown selected={activeMetrics} onToggle={handleToggleMetric} />

             {/* Filter */}
             <button className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors shadow-sm" title="View applied filters">
                <Filter size={16} strokeWidth={2.5} />
             </button>

             {/* More */}
             <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                <MoreVertical size={20} />
             </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={aggregatedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{fill: '#9aa0a6', fontSize: 11}}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            tickFormatter={(val) => {
                // Shorten labels for axis (e.g., "Jan 11, 2026" -> "Jan 11")
                if (!val) return '';
                return val.split(',')[0]; 
            }}
          />
          <YAxis 
            yAxisId="left"
            tick={{fill: '#9aa0a6', fontSize: 11}}
            tickLine={false}
            axisLine={false}
          />
          {/* Conditional Second Axis */}
          {useDualAxis && (
            <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{fill: '#9aa0a6', fontSize: 11}}
                tickLine={false}
                axisLine={false}
            />
          )}
          
          <Tooltip 
            content={<CustomAdsTooltip />}
            cursor={{ stroke: '#9ca3af', strokeDasharray: '4 4' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          
          {/* Render lines for active metrics + comparisons */}
          {activeMetrics.map((key) => {
            const metricConfig = AVAILABLE_METRICS.find(m => m.key === key) || { label: key, color: '#9ca3af', yAxisId: 'left' };
            const prevKey = `previous${key.charAt(0).toUpperCase() + key.slice(1)}`;

            // Determine Y-axis ID:
            // If dual axis is enabled, follow config (left vs right).
            // If NOT dual axis, force everything to 'left'.
            const renderAxisId = useDualAxis ? metricConfig.yAxisId : 'left';

            return (
              <React.Fragment key={key}>
                {/* Main Metric Line */}
                <Line 
                  yAxisId={renderAxisId}
                  type="monotone" 
                  dataKey={key} 
                  name={metricConfig.label}
                  stroke={metricConfig.color} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: metricConfig.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />

                {/* Previous Period Comparison Line */}
                <Line 
                  yAxisId={renderAxisId}
                  type="monotone" 
                  dataKey={prevKey} 
                  name={`${metricConfig.label} (previous 30 days)`}
                  stroke={metricConfig.color} 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  strokeOpacity={0.6}
                />
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CostBreakdownChartProps {
  data: AdsPlatformMetric[];
}

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="cost"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip 
             formatter={(value: number) => `${value} €`}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface CampaignBarChartProps {
  data: AdsCampaignMetric[];
}

export const CampaignBarChart: React.FC<CampaignBarChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Campaign Performance</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="campaign" 
              type="category" 
              width={100}
              tick={{fontSize: 10, fill: '#6b7280'}}
              tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
            />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface PlatformStackedChartProps {
  data: PlatformDailyMetric[];
}

export const PlatformStackedChart: React.FC<PlatformStackedChartProps> = ({ data }) => {
    return (
        <div className="h-[400px] w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-semibold text-gray-700">Conversions by Platform</h3>
             </div>
             <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorFb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInsta" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => {
                           const d = new Date(str);
                           return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                        }}
                        tick={{fill: '#9aa0a6', fontSize: 11}}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{fill: '#9aa0a6', fontSize: 11}}
                        axisLine={false}
                        tickLine={false}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="facebook" stackId="1" stroke="#0ea5e9" fill="url(#colorFb)" name="Facebook" />
                    <Area type="monotone" dataKey="instagram" stackId="1" stroke="#3b82f6" fill="url(#colorInsta)" name="Instagram" />
                    <Area type="monotone" dataKey="messenger" stackId="1" stroke="#1e3a8a" fill="url(#colorMsg)" name="Messenger" />
                    <Area type="monotone" dataKey="unknown" stackId="1" stroke="#93c5fd" fill="#93c5fd" name="Unknown" />
                </AreaChart>
             </ResponsiveContainer>
        </div>
    );
}
