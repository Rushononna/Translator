import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from './Icons';

interface DateRangePickerProps {
  onClose: () => void;
  onApply: (start: Date, end: Date) => void;
  initialStart?: Date;
  initialEnd?: Date;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onClose, onApply, initialStart, initialEnd }) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Initialize with passed props or default
  const [startDate, setStartDate] = useState<Date | null>(initialStart || new Date('2025-12-28'));
  const [endDate, setEndDate] = useState<Date | null>(initialEnd || new Date('2026-01-26'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDayClick = (year: number, month: number, day: number) => {
    const clickedDate = new Date(year, month, day);
    
    if (!startDate || (startDate && endDate)) {
      // Start new range
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Complete range
      if (clickedDate < startDate) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
    } else if (startDate) {
      onApply(startDate, startDate);
    }
    onClose();
  };

  const isSelected = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day).getTime();
    const start = startDate?.getTime();
    const end = endDate?.getTime();
    return d === start || d === end;
  };

  const isInRange = (year: number, month: number, day: number) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day).getTime();
    return d > startDate.getTime() && d < endDate.getTime();
  };

  // Helper to render calendar grid
  const renderCalendar = (year: number, month: number, label: string) => {
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty slots
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const selected = isSelected(year, month, d);
      const inRange = isInRange(year, month, d);
      
      let className = "w-8 h-8 flex items-center justify-center text-sm rounded-full relative z-10 transition-colors ";
      
      if (selected) {
        className += "bg-blue-600 text-white font-bold shadow-md";
      } else if (inRange) {
        className += "bg-blue-50 text-gray-700";
      } else {
        className += "text-gray-700 hover:bg-gray-100 font-medium";
      }

      // Range connector visuals
      const isStart = startDate && startDate.getDate() === d && startDate.getMonth() === month;
      const isEnd = endDate && endDate.getDate() === d && endDate.getMonth() === month;
      
      const rangeBg = (inRange || isStart || isEnd) && endDate ? (
         <div className={`absolute top-0 bottom-0 bg-blue-50 z-[-1] 
            ${isStart ? 'left-1/2 right-0 rounded-l-full' : ''}
            ${isEnd ? 'left-0 right-1/2 rounded-r-full' : ''}
            ${!isStart && !isEnd ? 'left-0 right-0' : ''}
         `}></div>
      ) : null;

      days.push(
        <button 
            key={d} 
            onClick={() => handleDayClick(year, month, d)}
            className="relative w-8 h-8 group"
        >
           {rangeBg}
           <div className={className}>{d}</div>
        </button>
      );
    }
    return days;
  };

  return (
    <div ref={pickerRef} className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-0 z-50 w-[640px] flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-[#1e3a8a] text-white rounded-t-xl">
         <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-transparent" />
            <span className="text-sm font-medium">Include today</span>
         </div>
         <div className="relative">
             <button className="flex items-center gap-2 px-3 py-1.5 bg-[#172554] rounded text-sm font-medium border border-[#3b82f6]/30 hover:bg-[#1e40af] transition-colors">
                 Custom
                 <ChevronDown size={14} />
             </button>
         </div>
      </div>

      {/* Calendars Container */}
      <div className="flex p-6 gap-8">
          {/* Left Calendar (Dec 2025) */}
          <div className="flex-1">
             <div className="flex flex-col items-center mb-4">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Start Date</span>
                 <div className="flex items-center justify-between w-full px-2">
                     <span className="text-base font-bold text-gray-800">DEC 2025</span>
                     <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-800"><ChevronLeft size={16}/></button>
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-800"><ChevronRight size={16}/></button>
                     </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-7 gap-y-3 text-center">
                 {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-semibold text-gray-400 w-8">{d}</div>)}
                 {renderCalendar(2025, 11, 'Dec')}
             </div>
          </div>

          {/* Right Calendar (Jan 2026) */}
          <div className="flex-1">
            <div className="flex flex-col items-center mb-4">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">End Date</span>
                 <div className="flex items-center justify-between w-full px-2">
                     <span className="text-base font-bold text-gray-800">JAN 2026</span>
                     <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-800"><ChevronLeft size={16}/></button>
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-800"><ChevronRight size={16}/></button>
                     </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-7 gap-y-3 text-center">
                 {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-semibold text-gray-400 w-8">{d}</div>)}
                 {renderCalendar(2026, 0, 'Jan')}
             </div>
          </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end p-4 border-t border-gray-100">
          <button 
            onClick={handleApply}
            className="px-8 py-2.5 bg-[#1e3a8a] text-white rounded-full font-semibold text-sm hover:bg-[#172554] active:transform active:scale-95 transition-all shadow-lg shadow-blue-900/20"
          >
              Apply
          </button>
      </div>
    </div>
  );
};
