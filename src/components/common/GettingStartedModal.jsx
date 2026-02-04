// File: src/components/common/GettingStartedModal.jsx

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  CheckCircle,
  Grid,
  Map,
  Layers,
  Ruler,
  GitBranch,
  Building2,
  FileText,
  Database,
  BarChart3,
  RefreshCw,
  Palette,
  Calculator,
  Link2,
  Settings,
} from 'lucide-react';
import Button from './Button';

const moduleIcons = {
  dashboard: LayoutGrid,
  approvals: CheckCircle,
  project: Grid,
  mappingZoning: Map,
  layers: Layers,
  measurement: Ruler,
  workflows: GitBranch,
  municipalHub: Building2,
  legislation: FileText,
  dataManagement: Database,
  analysis: BarChart3,
  conversion: RefreshCw,
  cartography: Palette,
  accounting: Calculator,
  thirdParty: Link2,
  settings: Settings,
};

const defaultModules = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'How to work with Dashboard',
    icon: 'dashboard',
  },
  {
    id: 'approvals',
    title: 'Approvals',
    description: 'How to work with Approvals',
    icon: 'approvals',
  },
  {
    id: 'project',
    title: 'Project',
    description: 'How to work with Project',
    icon: 'project',
  },
  {
    id: 'mappingZoning',
    title: 'Mapping & Zoning',
    description: 'How to work with Mapping & Zoning',
    icon: 'mappingZoning',
    expanded: true,
    subModules: [
      { id: 'layers', title: 'Layers', description: 'How to work with Layers', icon: 'layers' },
      { id: 'measurement', title: 'Measurement', description: 'How to work with Measurement', icon: 'measurement' },
    ],
  },
  {
    id: 'workflows',
    title: 'Workflows',
    description: 'How to work with Workflows',
    icon: 'workflows',
  },
  {
    id: 'municipalHub',
    title: 'Municipal Hub',
    description: 'How to work with Municipal Hub',
    icon: 'municipalHub',
  },
  {
    id: 'legislation',
    title: 'Legislation',
    description: 'How to work with Legislation',
    icon: 'legislation',
  },
  {
    id: 'dataManagement',
    title: 'Data Management Map Tools',
    description: 'How to work with Map Tools',
    icon: 'dataManagement',
  },
  {
    id: 'analysis',
    title: 'Analysis Map Tools',
    description: 'How to work with Map Tools',
    icon: 'analysis',
  },
  {
    id: 'conversion',
    title: 'Conversion Map Tools',
    description: 'How to work with Map Tools',
    icon: 'conversion',
  },
  {
    id: 'cartography',
    title: 'Cartography Map Tools',
    description: 'How to work with Map Tools',
    icon: 'cartography',
  },
  {
    id: 'accounting',
    title: 'Accounting',
    description: 'How to work with Accounting',
    icon: 'accounting',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'How to work with Settings',
    icon: 'settings',
  },
];

const ModuleItem = ({ module, onStart, onToggle, isExpanded }) => {
  const Icon = moduleIcons[module.icon] || LayoutGrid;
  const hasSubModules = module.subModules && module.subModules.length > 0;

  return (
    <div>
      <div className="flex items-center gap-3 py-2 group">
        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => hasSubModules && onToggle(module.id)}
          className={`p-0.5 ${hasSubModules ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {hasSubModules ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{module.title}</h4>
          <p className="text-xs text-gray-500 truncate">{module.description}</p>
        </div>

        {/* Start Button */}
        <Button size="sm" onClick={() => onStart(module.id)}>
          Start
        </Button>
      </div>

      {/* Sub Modules */}
      {hasSubModules && isExpanded && (
        <div className="ml-8 pl-4 border-l border-gray-100">
          {module.subModules.map((subModule) => (
            <ModuleItem
              key={subModule.id}
              module={subModule}
              onStart={onStart}
              onToggle={onToggle}
              isExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GettingStartedModal = ({
  isOpen,
  onClose,
  onStartModule,
  modules = defaultModules,
  title = 'Getting Started',
}) => {
  const [expandedModules, setExpandedModules] = useState(['mappingZoning']);

  const handleToggle = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleStart = (moduleId) => {
    if (onStartModule) {
      onStartModule(moduleId);
    }
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] bg-white rounded-xl shadow-2xl animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="space-y-1">
            {modules.map((module) => (
              <ModuleItem
                key={module.id}
                module={module}
                onStart={handleStart}
                onToggle={handleToggle}
                isExpanded={expandedModules.includes(module.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GettingStartedModal;
