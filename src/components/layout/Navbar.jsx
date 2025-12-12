import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Download } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = ({ onExportClick, exportCount = 0 }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <div className="flex-1 max-w-xl min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Export Manager Button */}
        {onExportClick && (
          <button 
            onClick={onExportClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Export Manager"
          >
            <Download className="w-5 h-5" />
            {exportCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {exportCount > 9 ? '9+' : exportCount}
              </span>
            )}
          </button>
        )}
        
        {/* Desktop Invite Button */}
        <button 
          onClick={() => navigate('/invite')}
          className="hidden md:flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          <span>Invite User</span>
        </button>
        
        {/* Mobile Invite Button */}
        <button 
          onClick={() => navigate('/invite')}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <Mail className="w-5 h-5" />
        </button>
        
        {/* Notifications Dropdown */}
        <NotificationsDropdown />
        
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
          <span className="hidden sm:inline px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded">
            City Official
          </span>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">John Doe</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
          </div>
          <div className="md:hidden w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;