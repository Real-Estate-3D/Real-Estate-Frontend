// File: src/components/layout/Sidebar.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  ProjectsIcon,
  WorkflowsIcon,
  ChangeEventsIcon,
  SubmittalsIcon,
  MappingAndZoningIcon,
  MapToolsIcon,
  LegislationIcon,
  ApprovalsIcon,
  MuncipalHubIcon,
  EstimatesandTakeoffIcon,
  AccountingIcon,
  DataManagementIcon,
  FileManagerIcon,
  ThirdPartyIntegrationsIcon,
  ProjectOrganizationManagementIconsIcon,
  SettingsIcon
} from '../../utils/icons';

const Logo = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8C0 3.58172 3.58172 0 8 0H36C40.4183 0 44 3.58172 44 8V36C44 40.4183 40.4183 44 36 44H8C3.58172 44 0 40.4183 0 36V8Z" fill="#0073FC" fillOpacity="0.05"/>
    <g clipPath="url(#clip0_40000001_18456)">
      <path d="M27.2186 21.6561V32.3388H24.1849V23.6412L21.5757 22.3917L21.5023 22.3563L18.916 21.1161V17.6763L24.1849 20.2014L25.1671 20.6729L27.2186 21.6561Z" fill="#0073FC"/>
      <path d="M33.3022 10.6997V32.3386H30.2684V15.5919L23.2119 19.0342V15.5943L33.3022 10.6997Z" fill="#0073FC"/>
      <path d="M22.0005 24.4097V32.3387H18.9668V26.3949L13.6956 23.7024L9.95508 25.4919V22.0567L10.1065 21.9837L13.6956 20.2649L18.9668 22.955L21.0665 23.9665H21.0688L22.0005 24.4097Z" fill="#0073FC"/>
    </g>
    <defs>
      <clipPath id="clip0_40000001_18456">
        <rect width="24" height="24" fill="white" transform="translate(10 10)"/>
      </clipPath>
    </defs>
  </svg>
);

// Move menu items outside component to prevent recreation on every render
const MENU_ITEMS = [
  { icon: DashboardIcon, path: '/', label: 'Dashboard' },

  { type: 'group', label: 'Projects & Delivery' },
  { icon: ProjectsIcon, path: '/projects', label: 'Projects' },
  { icon: WorkflowsIcon, path: '/workflows', label: 'Workflows' },
  { icon: ChangeEventsIcon, path: '/change-events', label: 'Change Events' },
  { icon: SubmittalsIcon, path: '/submittals', label: 'Submittals' },

  { type: 'group', label: 'Mapping, Zoning & Legislation' },
  { icon: MappingAndZoningIcon, path: '/mapping', label: 'Mapping and Zoning' },
  { icon: MapToolsIcon, path: '/map-tools', label: 'Map Tools' },
  { icon: LegislationIcon, path: '/legislation', label: 'Legislation' },

  { type: 'group', label: 'Requests & Municipal Hub' },
  { icon: ApprovalsIcon, path: '/approvals', label: 'Approvals' },
  { icon: MuncipalHubIcon, path: '/municipal', label: 'Municipal Hub' },

  { type: 'group', label: 'Financial and Estimates' },
  { icon: EstimatesandTakeoffIcon, path: '/estimates', label: 'Estimates and TakeOffs' },
  { icon: AccountingIcon, path: '/accounting', label: 'Accounting' },

  { type: 'group', label: 'Data, Files and Integration' },
  { icon: DataManagementIcon, path: '/data-management', label: 'Data Management' },
  { icon: FileManagerIcon, path: '/file-manager', label: 'File Manager' },
  { icon: ThirdPartyIntegrationsIcon, path: '/integrations', label: 'Third-Party Integrations' },
  { icon: ProjectOrganizationManagementIconsIcon, path: '/organization', label: 'Organization Management' },
];

// Memoized menu item component for better performance
const MenuItem = React.memo(({ item, isActive, isExpanded, prevItemIsGroup }) => {
  return (
    <Link
      to={item.path}
      aria-label={item.label}
      className="relative flex items-center"
      style={{
        height: 'clamp(36px, 44px, 48px)', // Responsive height: 36px for small screens, 44px default
        marginTop: prevItemIsGroup && !isExpanded ? '6px' : '0px',
        contain: 'layout style paint',
      }}
    >
      <div
        className={`absolute inset-0 flex items-center rounded-lg ${
          isExpanded ? 'gap-2 px-3' : 'justify-center'
        } ${
          isActive
            ? 'text-[#0073FC]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        style={{
          width: isExpanded ? '240px' : '44px',
          marginLeft: 'auto',
          marginRight: 'auto',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isActive && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(116.61deg, rgba(90, 178, 255, 0.1875) 5%, rgba(88, 172, 255, 0.125) 50.49%, rgba(78, 169, 255, 0.175) 95.97%)',
              boxShadow: '0px 2px 4px rgba(1, 77, 254, 0.08)',
            }}
          />
        )}
        <div className="shrink-0 flex items-center justify-center z-10" style={{ width: 'clamp(18px, 20px, 20px)', height: 'clamp(18px, 20px, 20px)' }}>
          <item.icon style={{ width: '100%', height: '100%' }} />
        </div>
        <span
          className="whitespace-nowrap font-medium z-10 overflow-hidden"
          style={{
            fontSize: 'clamp(12px, 14px, 14px)', // Responsive font size
            width: isExpanded ? 'auto' : '0px',
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {item.label}
        </span>
      </div>
    </Link>
  );
});

MenuItem.displayName = 'MenuItem';

const Sidebar = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handlers with useCallback to prevent recreation
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const handleBackdropClick = useCallback(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [isMobile, onClose]);

  // Mobile: show as drawer overlay, Desktop: show inline
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? 'fixed left-0 top-0 bottom-0 z-50'
            : 'h-full relative z-10'
        } bg-white flex flex-col shrink-0 rounded-xl overflow-hidden text-slate-900 border border-slate-200 shadow-lg`}
        style={{
          width: isMobile ? '256px' : isExpanded ? '256px' : '60px',
          transform: isMobile && !isOpen ? 'translateX(-256px)' : 'translateX(0)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width, transform',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo Area - Responsive height */}
        <div
          className="flex items-center border-b border-slate-200 bg-white px-2 gap-2 shrink-0"
          style={{ height: 'clamp(48px, 56px, 64px)' }} // Responsive: 48px on small screens, 56px default
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 'clamp(36px, 44px, 44px)',
              height: 'clamp(36px, 44px, 44px)'
            }}
          >
            <Logo />
          </div>
          <div
            className="overflow-hidden whitespace-nowrap"
            style={{
              width: isExpanded || isMobile ? '99px' : '0px',
              opacity: isExpanded || isMobile ? 1 : 0,
              transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <span
              className="text-[#0073FC] font-semibold leading-tight"
              style={{ fontSize: 'clamp(16px, 18px, 18px)' }} // Responsive font
            >
              Blueprint
            </span>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="ml-auto flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              style={{
                width: 'clamp(32px, 36px, 36px)',
                height: 'clamp(32px, 36px, 36px)'
              }}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Menu Items - Enhanced scrollbar and better spacing */}
        <nav
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-2 min-h-0"
          data-onboard="sidebar"
          style={{
            paddingTop: 'clamp(8px, 12px, 16px)',
            paddingBottom: 'clamp(8px, 12px, 16px)',
            gap: 'clamp(1px, 2px, 2px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 #F8FAFC',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          }}
        >
          {MENU_ITEMS.map((item, idx) => {
            // Group Title
            if (item.type === 'group') {
              return (
                <div
                  key={idx}
                  className="overflow-hidden"
                  style={{
                    width: isExpanded || isMobile ? '240px' : '0px',
                    height: isExpanded || isMobile ? 'auto' : '0px',
                    opacity: isExpanded || isMobile ? 1 : 0,
                    marginTop: 'clamp(4px, 6px, 8px)',
                    marginBottom: isExpanded || isMobile ? 'clamp(2px, 3px, 4px)' : '0px',
                    transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    contain: 'layout style',
                  }}
                >
                  <div
                    className="px-3 font-semibold uppercase whitespace-nowrap tracking-tighter"
                    style={{
                      fontSize: 'clamp(10px, 11px, 12px)', // Responsive font size
                      color: '#BFBFBF'
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            }

            // Regular Menu Item - Use memoized component
            const isActive = location.pathname === item.path;
            const prevItemIsGroup = idx > 0 && MENU_ITEMS[idx - 1].type === 'group';

            return (
              <MenuItem
                key={item.path}
                item={item}
                isActive={isActive}
                isExpanded={isExpanded || isMobile}
                prevItemIsGroup={prevItemIsGroup}
              />
            );
          })}
        </nav>

        {/* Bottom Item - Settings */}
        <div className="px-2 shrink-0" style={{ paddingBottom: 'clamp(8px, 12px, 16px)' }}>
          <MenuItem
            item={{ icon: SettingsIcon, path: '/settings', label: 'Settings' }}
            isActive={location.pathname === '/settings'}
            isExpanded={isExpanded || isMobile}
            prevItemIsGroup={false}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;