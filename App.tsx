import React, { useState } from 'react';
import { FileText, AlignLeft } from 'lucide-react';
import { StatementView } from './components/StatementView';
import { SimpleTextFormatView } from './components/SimpleTextFormatView';

type ViewType = 'statement' | 'simple';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('statement');

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 print:hidden">
        <div className="p-6 border-b border-gray-100">
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
            onClick={() => setActiveView('simple')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'simple'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <AlignLeft size={18} />
            Simple Text Format
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 print:ml-0">
        {activeView === 'statement' ? <StatementView /> : <SimpleTextFormatView />}
      </main>
    </div>
  );
}