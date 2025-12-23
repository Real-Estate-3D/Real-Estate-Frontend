// File: src/components/layout/Sidebar.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  LayoutGrid, 
  Grid, 
  List, 
  Map as MapIcon, 
  Building2, 
  Calculator, 
  FileText, 
  Settings,
  BarChart3
} from 'lucide-react';

const Tooltip = ({ children, label, isVisible, position }) => {
  if (!isVisible || !position) return null;
  
  return createPortal(
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-50%)',
      }}
      className="pointer-events-none z-9999 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-left-2 duration-200"
    >
      {label}
    </div>,
    document.body
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const menuItems = [
    { icon: LayoutGrid, path: '/', label: 'Dashboard' },
    { icon: Grid, path: '/projects', label: 'Projects' },
    { icon: List, path: '/approvals', label: 'Approvals' },
    { icon: BarChart3, path: '/workflows', label: 'Workflows' },
    { icon: MapIcon, path: '/mapping', label: 'Mapping' },
    { icon: Building2, path: '/municipal', label: 'Municipal Hub' },
    { icon: Calculator, path: '/accounting', label: 'Accounting' },
    { icon: FileText, path: '/legislation', label: 'Legislation' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  const handleMouseEnter = (e, label) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 12,
      y: rect.top + rect.height / 2,
    });
    setHoveredItem(label);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTooltipPosition(null);
  };

  return (
    <div className="w-14 h-full bg-white flex flex-col shrink-0 z-50 rounded-xl overflow-hidden relative">
      {/* Logo Area */}
      <div className="h-14 flex items-center justify-center border-b border-slate-700/50">
        <div className="w-9 h-9 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6 text-blue-400"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col items-center py-3 gap-0.5 overflow-y-auto overflow-x-visible">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              aria-label={item.label}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
            </Link>
          );
        })}
      </nav>
      
      <Tooltip 
        label={hoveredItem} 
        isVisible={!!hoveredItem} 
        position={tooltipPosition}
      />
      
      {/* Bottom Item */}
      <div className="pb-3 flex justify-center">
         <button
           className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
           aria-label="App menu"
           onMouseEnter={(e) => handleMouseEnter(e, 'App menu')}
           onMouseLeave={handleMouseLeave}
           type="button"
         >
            <LayoutGrid className="w-[18px] h-[18px]" /> 
         </button>
      </div>
    </div>
  );
};

export default Sidebar;