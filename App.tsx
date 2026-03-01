import React, { useState } from 'react';
import { FileText, AlignLeft, Menu, X } from 'lucide-react';
import { StatementView } from './components/StatementView';
import { TestimonialView } from './components/TestimonialView';

type ViewType = 'statement' | 'testimonial';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('statement');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans relative">
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-50 print:hidden"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ease-in-out print:hidden w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100 mt-12">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            PDF Translator
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('statement')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'statement'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileText size={18} />
            Statement Format
          </button>
          
          <button
            onClick={() => setActiveView('testimonial')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'testimonial'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <AlignLeft size={18} />
            Testimonial
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 print:ml-0 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {activeView === 'statement' ? <StatementView /> : <TestimonialView />}
      </main>
    </div>
  );
}