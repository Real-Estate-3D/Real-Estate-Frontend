// File: src/components/legislation/PolicyFullTextModal.jsx

import React from 'react';
import { X } from 'lucide-react';

const PolicyFullTextModal = ({ isOpen, onClose, policy }) => {
  if (!isOpen || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{policy.name}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="text-sm text-gray-700 leading-relaxed space-y-4">
            <p>
              1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:
            </p>
            
            <p>
              (a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.
            </p>
            
            <p>
              (b) At the request of the contracting agency, the contractor shall request each employment agency, labor union, or authorized representative of workers with which it has a collective bargaining or other agreement or understanding, to furnish a written statement that such employment agency, labor union or representative will not discriminate on the basis of race, creed, color, national origin, sex, age, disability or marital status and that such union or representative will affirmatively cooperate in the implementation of the contractor's obligations herein.
            </p>
            
            <p>
              (c) The contractor shall state, in all solicitations or advertisements for employees, that, in the performance of the state contract, all qualified applicants will be afforded equal employment opportunities without discrimination because of race, creed, color, national origin, sex, age, disability or marital status.
            </p>
            
            <p>
              2. The contractor will include the provisions of subdivision one of this section in every subcontract, except as provided in subdivision six of this section, in such a manner that the provisions will be binding upon each subcontractor as to work in connection with the state contract.
            </p>
            
            <p>
              3. The provisions of this section shall not be binding upon contractors or subcontractors in the performance of work or the provision of services or any other activity that are unrelated, separate or distinct from the state contract as expressed by its terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyFullTextModal;
