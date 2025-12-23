// File: src/components/layout/Layout.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ExportPopup from '../map/ExportPopup';
import { useExportWorker } from '../../hooks/useExportWorker';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const { exports, exportLayer, clearExport, clearAllExports } = useExportWorker();

  // Memoize active exports calculation
  const activeExports = useMemo(() => 
    exports.filter(exp => exp.status === 'processing'),
    [exports]
  );

  // Memoize handlers
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleExportClick = useCallback(() => {
    setShowExportPopup(prev => !prev);
  }, []);

  const handleCloseExportPopup = useCallback(() => {
    setShowExportPopup(false);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Memoize outlet context to prevent unnecessary re-renders
  const outletContext = useMemo(() => 
    ({ exportLayer, exports }),
    [exportLayer, exports]
  );

  return (
    <div className="flex h-screen bg-[#A0B0C8] text-gray-100 overflow-hidden p-3 gap-3">
      <div className="shrink-0 overflow-visible h-full">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden gap-3">
        <Navbar 
          onToggleSidebar={handleToggleSidebar}
          onExportClick={handleExportClick}
          exportCount={activeExports.length}
        />
        
        <main className="flex-1 overflow-hidden rounded-xl">
          <Outlet context={outletContext} />
        </main>

        {showExportPopup && (
          <ExportPopup
            exports={exports}
            onClose={handleCloseExportPopup}
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