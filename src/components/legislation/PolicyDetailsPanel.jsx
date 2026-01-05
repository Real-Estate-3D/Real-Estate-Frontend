// File: src/components/legislation/PolicyDetailsPanel.jsx

import React, { useState, useCallback } from 'react';
import { X, Maximize2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PolicyFullTextModal from './PolicyFullTextModal';

const PolicyDetailsPanel = ({ 
  policy, 
  onClose,
  isOpen = true,
}) => {
  const navigate = useNavigate();
  const [isFullTextModalOpen, setIsFullTextModalOpen] = useState(false);

  const handlePageView = useCallback(() => {
    if (policy) {
      navigate(`/legislation/policy/${policy.id}`);
    }
  }, [policy, navigate]);

  const handleViewFullText = useCallback(() => {
    setIsFullTextModalOpen(true);
  }, []);

  if (!isOpen || !policy) return null;

  // Mock data for the policy details
  const policyDetails = {
    ...policy,
    source: 'linkaddress.com/askjfn',
    policyRules: [
      { label: 'Max Height', value: '34m' },
      { label: 'Setbacks', value: '10m' },
      { label: 'Max Height', value: '34m' },
      { label: 'Setbacks', value: '10m' },
    ],
    violatingLaws: [
      { id: 1, name: 'Residential Zone R1' },
      { id: 2, name: 'Residential Zone R2' },
    ],
    violatingProcesses: [
      { id: 1, name: 'Zoning By-Law Amendment Process XJD89' },
      { id: 2, name: 'Zoning By-Law Amendment Process IDG483' },
    ],
    policyText: `1. All state contracts and all documents soliciting bids or proposals for state contracts shall contain or make reference to the following provisions:

(a) The contractor will not discriminate against employees or applicants for employment because of race, creed, color, national origin, sex, age, disability or marital status, and will undertake or continue existing programs of affirmative action to ensure that minority group members and women are afforded equal employment opportunities without discrimination. For purposes of this article affirmative action shall mean recruitment, employment, job assignment, promotion, upgradings, demotion, transfer, layoff, or termination and rates of pay or other forms of compensation.`,
  };

  return (
    <>
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Policy Details</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePageView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Page View
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* General Section */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">General</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Policy Name</p>
                <p className="text-sm font-medium text-gray-900">{policyDetails.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Category</p>
                  <p className="text-sm text-gray-900">{policyDetails.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Source</p>
                  <a 
                    href={`https://${policyDetails.source}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    {policyDetails.source}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Policy Rules Section */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Policy Rules</h3>
            <div className="grid grid-cols-2 gap-3">
              {policyDetails.policyRules.map((rule, index) => (
                <div key={index}>
                  <p className="text-xs text-blue-600 mb-0.5">{rule.label}</p>
                  <p className="text-sm font-medium text-gray-900">{rule.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Laws that violate policy */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Laws that violate policy</h3>
            <div className="space-y-1">
              {policyDetails.violatingLaws.map((law) => (
                <a 
                  key={law.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/legislation/${law.id}`);
                  }}
                  className="block text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {law.name}
                </a>
              ))}
            </div>
          </section>

          {/* Processes that violate policy */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Processes that violate policy</h3>
            <div className="space-y-1">
              {policyDetails.violatingProcesses.map((process) => (
                <a 
                  key={process.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to process details
                  }}
                  className="block text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {process.name}
                </a>
              ))}
            </div>
          </section>

          {/* Policy Text Section */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Policy Text</h3>
            <div className="text-sm text-gray-600 leading-relaxed line-clamp-6 mb-3">
              {policyDetails.policyText}
            </div>
            <button
              onClick={handleViewFullText}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Full Text
            </button>
          </section>
        </div>
      </div>

      {/* Full Text Modal */}
      <PolicyFullTextModal
        isOpen={isFullTextModalOpen}
        onClose={() => setIsFullTextModalOpen(false)}
        policy={policyDetails}
      />
    </>
  );
};

export default PolicyDetailsPanel;
