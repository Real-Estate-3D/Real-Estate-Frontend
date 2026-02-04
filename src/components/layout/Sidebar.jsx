// File: src/components/layout/Sidebar.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
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

  return (
    <motion.div
      className="h-full bg-white flex flex-col shrink-0 z-50 rounded-xl overflow-hidden relative text-slate-900 border border-slate-200"
      animate={{ width: isExpanded ? '256px' : '60px' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Area */}
      <div className="h-14 flex items-center border-b border-slate-200 bg-white px-2 gap-3">
        <div className="w-11 h-11 flex items-center justify-center shrink-0">
          <Logo />
        </div>
        <motion.div
          className="overflow-hidden whitespace-nowrap"
          animate={{
            width: isExpanded ? '99px' : '0px',
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="text-[#0073FC] font-semibold text-lg leading-7">
            Blueprint
          </span>
        </motion.div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col py-3 gap-0.5 overflow-y-auto overflow-x-hidden p-2" data-onboard="sidebar">
        {menuItems.map((item, idx) => {
          // Group Title
          if (item.type === 'group') {
            return (
              <motion.div
                key={idx}
                className="overflow-hidden"
                animate={{
                  width: isExpanded ? '240px' : '0px',
                  height: isExpanded ? 'auto' : '0px',
                  opacity: isExpanded ? 1 : 0,
                  marginTop: '8px',
                  marginBottom: isExpanded ? '4px' : '0px',
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="px-3 text-xs font-semibold uppercase whitespace-nowrap tracking-tighter" style={{ color: '#BFBFBF' }}>
                  {item.label}
                </div>
              </motion.div>
            );
          }

          // Regular Menu Item
          const isActive = location.pathname === item.path;
          // Check if previous item was a group heading
          const prevItemIsGroup = idx > 0 && menuItems[idx - 1].type === 'group';

          return (
            <Link
              key={idx}
              to={item.path}
              aria-label={item.label}
              className="relative h-11 flex items-center"
              style={{ marginTop: prevItemIsGroup && !isExpanded ? '8px' : '0px' }}
            >
              <motion.div
                className={`absolute inset-0 flex items-center ${
                  isExpanded ? 'gap-2 px-3' : 'justify-center'
                } ${
                  isActive
                    ? 'text-[#0073FC]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                animate={{
                  width: isExpanded ? '240px' : '44px',
                  marginLeft: isExpanded ? '0px' : 'auto',
                  marginRight: isExpanded ? '0px' : 'auto',
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(116.61deg, rgba(90, 178, 255, 0.1875) 5%, rgba(88, 172, 255, 0.125) 50.49%, rgba(78, 169, 255, 0.175) 95.97%)',
                      boxShadow: '0px 4px 9px rgba(1, 77, 254, 0.02), 0px 4px 8px rgba(1, 77, 254, 0.08), 0px 6px 6px rgba(1, 77, 254, 0.04), 0px 1px 3px rgba(1, 77, 254, 0.02)',
                      backdropFilter: 'blur(6px)',
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 rounded opacity-0 hover:opacity-100 bg-slate-100"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <motion.div
                  className="w-5 h-5 shrink-0 flex items-center justify-center z-10"
                  layoutId={`icon-${item.path}`}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <motion.span
                  className="overflow-hidden whitespace-nowrap text-sm font-medium z-10"
                  animate={{
                    width: isExpanded ? 'auto' : '0px',
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Item - Settings */}
      <div className="pb-3 px-2">
        <Link
          to="/settings"
          className="relative h-11 flex items-center"
          aria-label="Settings"
        >
          <motion.div
            className={`absolute inset-0 flex items-center ${
              isExpanded ? 'gap-2 px-3' : 'justify-center'
            } ${
              location.pathname === '/settings'
                ? 'text-[#0073FC]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            animate={{
              width: isExpanded ? '240px' : '44px',
              marginLeft: isExpanded ? '0px' : 'auto',
              marginRight: isExpanded ? '0px' : 'auto',
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {location.pathname === '/settings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(116.61deg, rgba(90, 178, 255, 0.1875) 5%, rgba(88, 172, 255, 0.125) 50.49%, rgba(78, 169, 255, 0.175) 95.97%)',
                  boxShadow: '0px 4px 9px rgba(1, 77, 254, 0.02), 0px 4px 8px rgba(1, 77, 254, 0.08), 0px 6px 6px rgba(1, 77, 254, 0.04), 0px 1px 3px rgba(1, 77, 254, 0.02)',
                  backdropFilter: 'blur(6px)',
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            {location.pathname !== '/settings' && (
              <motion.div
                className="absolute inset-0 rounded opacity-0 hover:opacity-100 bg-slate-100"
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              className="w-5 h-5 shrink-0 flex items-center justify-center z-10"
              layoutId="icon-/settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </motion.div>
            <motion.span
              className="overflow-hidden whitespace-nowrap text-sm font-medium z-10"
              animate={{
                width: isExpanded ? 'auto' : '0px',
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              Settings
            </motion.span>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

export default Sidebar;