import React from 'react';
import { StatementView } from './components/StatementView';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <main className="w-full h-full">
          <StatementView />
      </main>
    </div>
  );
}