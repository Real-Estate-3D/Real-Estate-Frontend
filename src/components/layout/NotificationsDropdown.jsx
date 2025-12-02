import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle } from 'lucide-react';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'approval',
      title: 'Approval Required',
      message: 'New zoning application requires your review',
      time: '5 minutes ago',
      unread: true,
      icon: AlertCircle,
      iconColor: 'text-orange-500'
    },
    {
      id: 2,
      type: 'success',
      title: 'Project Approved',
      message: 'Residential development at 123 Main St has been approved',
      time: '1 hour ago',
      unread: true,
      icon: Check,
      iconColor: 'text-green-500'
    },
    {
      id: 3,
      type: 'info',
      title: 'Meeting Reminder',
      message: 'Planning commission meeting tomorrow at 2 PM',
      time: '3 hours ago',
      unread: false,
      icon: Clock,
      iconColor: 'text-blue-500'
    },
    {
      id: 4,
      type: 'approval',
      title: 'Document Submitted',
      message: 'Environmental impact report submitted for review',
      time: '1 day ago',
      unread: false,
      icon: AlertCircle,
      iconColor: 'text-purple-500'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 ${notification.iconColor}`}>
                      <notification.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;