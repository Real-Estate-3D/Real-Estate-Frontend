import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ExportPopup from '../map/ExportPopup';
import { useExportWorker } from '../../hooks/useExportWorker';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const { exports, exportLayer, clearExport, clearAllExports } = useExportWorker();

  const activeExports = exports.filter(exp => exp.status === 'processing');

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onExportClick={() => setShowExportPopup(!showExportPopup)}
          exportCount={activeExports.length}
        />
        
        <main className="flex-1 overflow-hidden">
          <Outlet context={{ exportLayer, exports }} />
        </main>

        {showExportPopup && (
          <ExportPopup
            exports={exports}
            onClose={() => setShowExportPopup(false)}
            onClearExport={clearExport}
            onClearAll={clearAllExports}
          />
        )}
      </div>
    </div>
  );
};

export const useExportContext = () => {
  return useOutletContext();
};

export default Layout;