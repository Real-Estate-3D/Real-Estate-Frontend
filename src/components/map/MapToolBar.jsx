import React from 'react';
import { 
  Search, 
  Home, 
  Layers, 
  Ruler,
  FileText, 
  MousePointer2, 
  Pencil, 
  Settings 
} from 'lucide-react';

const MapToolbar = ({ onLayersClick }) => {
  const tools = [
    { icon: Search, label: 'Search', onClick: () => console.log('Search') },
    { icon: Ruler, label: 'Measure', onClick: () => console.log('Measure') },
    { icon: Home, label: 'Home', onClick: () => console.log('Home') },
    { icon: Layers, label: 'Layers', onClick: onLayersClick },
    { icon: FileText, label: 'Documents', onClick: () => console.log('Documents') },
    { icon: MousePointer2, label: 'Select', onClick: () => console.log('Select') },
    { icon: Pencil, label: 'Draw', onClick: () => console.log('Draw') },
    { icon: Settings, label: 'Settings', onClick: () => console.log('Settings') },
  ];

  return (
    <>
      {tools.map((tool, i) => (
        <button
          key={i}
          onClick={tool.onClick}
          className="p-2.5 hover:bg-gray-200/70 rounded-lg transition-all duration-200 text-gray-700"
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
        </button>
      ))}
    </>
  );
};

export default MapToolbar;