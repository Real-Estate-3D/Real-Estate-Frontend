// File: src/components/layout/Navbar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const Navbar = ({ onExportClick, exportCount = 0 }) => {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white rounded-xl flex items-center justify-between px-4 sm:px-5 flex-shrink-0 z-40 shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, submissions, or zoning..."
            className="w-full pl-9 pr-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Add Button */}
        <button className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
          <Plus className="w-4 h-4 text-gray-500" />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1"></div>

        {/* User Profile Area */}
        <div className="flex items-center gap-2 py-1 pl-1 pr-2.5 bg-gray-50 border border-gray-100 rounded-xl">
           <div className="w-7 h-7 rounded-lg overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="User"
                    className="w-full h-full object-cover" 
                />
           </div>
           
           <span className="text-sm font-medium text-gray-800">John Doe</span>
           
           <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[11px] font-medium rounded">
             City Official
           </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;