import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Search, Check, Minus } from './Icons';

export const FILTER_OPTIONS = {
  conversions: [
    { id: 'purchases', label: 'Purchases' },
    { id: 'website_purchases', label: 'Website Purchases' },
    { id: 'leads', label: 'Leads' },
    { id: 'page_engagement', label: 'Page Engagement' },
    { id: 'page_likes', label: 'Page Likes' },
    { id: 'content_views', label: 'Content Views' },
    { id: 'add_to_cart', label: 'Add to Cart' },
    { id: 'checkouts', label: 'Checkouts' },
    { id: 'donations', label: 'Donations' },
    { id: 'landing_page_views', label: 'Landing Page Views' },
    { id: 'registrations', label: 'Registrations' },
    { id: 'searches', label: 'Searches' },
    { id: 'add_to_wishlist', label: 'Add to Wishlist' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'video_views', label: 'Video Views' },
    { id: 'trials_started', label: 'Trials Started' },
  ],
  countries: [
    { id: 'GR', label: 'GR' },
    { id: 'BR', label: 'BR' },
    { id: 'US', label: 'US' },
    { id: 'unknown', label: 'unknown' },
  ],
  devices: [
    { id: 'mobile_app', label: 'mobile_app' },
    { id: 'desktop', label: 'desktop' },
    { id: 'mobile_web', label: 'mobile_web' },
    { id: 'unknown', label: 'unknown' },
  ],
  platforms: [
    { id: 'Facebook', label: 'Facebook' },
    { id: 'Instagram', label: 'Instagram' },
    { id: 'Messenger', label: 'Messenger' },
    { id: 'unknown', label: 'unknown' },
  ]
};

type FilterType = keyof typeof FILTER_OPTIONS;

interface DropdownProps {
  label: string;
  options: { id: string; label: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  hasSearch?: boolean;
  isActive?: boolean;
}

const FilterDropdown: React.FC<DropdownProps> = ({ 
  label, 
  options, 
  selectedIds = [], 
  onToggle, 
  hasSearch = true, 
  isActive = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = selectedIds.length;
  
  // Logic to show count in label similar to "Conversions (1)" in screenshot
  const headerLabel = selectedCount > 0 && selectedCount < options.length 
    ? `${label.split(':')[0]} (${selectedCount})` 
    : label;

  return (
    <div className="relative font-sans w-full" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all border shadow-sm ${
          isActive || (selectedCount > 0 && selectedCount < options.length)
            ? 'bg-gray-100 text-gray-900 border-gray-200' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}
      >
        <span className="truncate mr-2">{headerLabel}</span>
        <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
           {/* Header / Search */}
           <div className="p-3 border-b border-gray-100 bg-gray-50/50">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">{label.split(':')[0]}</span>
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{selectedCount}</span>
                 </div>
             </div>
             
             {hasSearch && (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Type to search" 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-xs text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
             )}
           </div>
           
           {/* Options List */}
           <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
             {filteredOptions.map((opt) => {
               const isChecked = selectedIds.includes(opt.id);
               return (
                 <label 
                    key={opt.id} 
                    onClick={() => onToggle(opt.id)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer group select-none transition-colors"
                 >
                   <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isChecked ? 'bg-gray-600 border-gray-600' : 'border-gray-400 group-hover:border-gray-500 bg-white'}`}>
                      {isChecked && <Check size={10} className="text-white" strokeWidth={4} />}
                   </div>
                   <span className="text-sm text-gray-600 font-normal truncate">{opt.label}</span>
                 </label>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
};

interface FilterBarProps {
  onToggleFilterPanel?: () => void;
  selectedFilters?: Record<FilterType, string[]>;
  onFilterChange?: (type: FilterType, id: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  onToggleFilterPanel, 
  selectedFilters, 
  onFilterChange 
}) => {
  // Default fallbacks if not controlled (for CampaignsView compatibility)
  const defaultFilters = {
    conversions: [],
    countries: FILTER_OPTIONS.countries.map(o => o.id),
    devices: FILTER_OPTIONS.devices.map(o => o.id),
    platforms: FILTER_OPTIONS.platforms.map(o => o.id),
  };

  const filters = selectedFilters || defaultFilters;
  const handleToggle = (type: FilterType) => (id: string) => {
    if (onFilterChange) {
      onFilterChange(type, id);
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <button 
          onClick={onToggleFilterPanel}
          className="flex items-center justify-center gap-2 text-gray-500 font-bold px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 border-dashed transition-colors"
        >
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm">Filters</span>
        </button>
        
        <FilterDropdown 
          label="Conversions" 
          options={FILTER_OPTIONS.conversions} 
          selectedIds={filters.conversions}
          onToggle={handleToggle('conversions')}
          isActive={filters.conversions.length > 0} 
        />
        
        <FilterDropdown 
          label="Country" 
          options={FILTER_OPTIONS.countries} 
          selectedIds={filters.countries}
          onToggle={handleToggle('countries')}
        />
        
        <FilterDropdown 
          label="Device" 
          options={FILTER_OPTIONS.devices} 
          selectedIds={filters.devices}
          onToggle={handleToggle('devices')}
        />
        
        <FilterDropdown 
          label="Platform" 
          options={FILTER_OPTIONS.platforms} 
          selectedIds={filters.platforms}
          onToggle={handleToggle('platforms')}
        />
    </div>
  );
};
