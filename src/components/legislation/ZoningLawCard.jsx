// File: src/components/legislation/ZoningLawCard.jsx

import React from 'react';
import { Pencil, Trash2, Copy } from 'lucide-react';

const ZoningLawCard = ({ item, onEdit, onDelete, onDuplicate, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(item)}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all hover:border-gray-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 truncate" title={item.title}>
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{item.number}</p>
        </div>
        <span className="shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          {item.type}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Effective: </span>
          <span className="text-gray-700">{item.effectiveFrom}</span>
        </div>
        <div>
          <span className="text-gray-500">Status: </span>
          <span className="text-gray-700 capitalize">{item.status}</span>
        </div>
      </div>

      {(item.validationMessage || item.validityStatus) && (
        <div className="mt-2 text-sm">
          <span className="text-gray-500">Validation: </span>
          <span className="text-gray-600" title={item.validationMessage || item.validityStatus}>
            {item.validationMessage || item.validityStatus}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(item.id);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(item.id);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate?.(item);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Copy className="w-3 h-3" />
          Duplicate
        </button>
      </div>
    </div>
  );
};

export default ZoningLawCard;
