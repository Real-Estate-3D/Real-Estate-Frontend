import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  GitBranch, 
  Map, 
  Building2, 
  Calculator, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Approvals', path: '/approvals' },
    { icon: GitBranch, label: 'Workflows', path: '/workflows' },
    { icon: Map, label: 'Mapping & Zoning', path: '/mapping' },
    { icon: Building2, label: 'Municipal Hub', path: '/municipal' },
    { icon: Calculator, label: 'Accounting', path: '/accounting' },
    { icon: FileText, label: 'Legislation', path: '/legislation' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`transition-all duration-300 bg-white border-r border-gray-200 flex-shrink-0 ${
      isExpanded ? 'w-64' : 'w-20'
    }`}>
      <div className="h-full flex flex-col">
        {/* Logo & Collapse Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            {isExpanded && (
              <span className="text-lg font-semibold text-gray-900">BluePrint</span>
            )}
          </div>
          
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`w-full flex items-center gap-3 py-3 text-sm transition-colors cursor-pointer ${
                  isExpanded ? 'px-4' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={!isExpanded ? item.label : ''}
              >
                <div className={`flex items-center gap-3 ${!isExpanded && 'w-full justify-center'}`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span className="text-left">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;