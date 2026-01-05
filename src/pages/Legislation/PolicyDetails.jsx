// File: src/pages/Legislation/PolicyDetails.jsx

import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft,
  Columns2,
  FileText,
} from 'lucide-react';
import PolicyFullTextModal from '../../components/legislation/PolicyFullTextModal';

// Mock policy data (in a real app, this would be fetched from an API)
const mockPolicyData = {
  id: 1,
  name: 'Provincial Policy 101',
  category: 'Environmental',
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

const PolicyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFullTextModalOpen, setIsFullTextModalOpen] = useState(false);

  // In a real app, fetch data based on id
  const policy = mockPolicyData;

  const handleBackClick = useCallback(() => {
    navigate('/legislation');
  }, [navigate]);

  const handleSidebarView = useCallback(() => {
    navigate('/legislation', { state: { openPolicyId: policy.id } });
  }, [navigate, policy]);

  const handleViewFullText = useCallback(() => {
    setIsFullTextModalOpen(true);
  }, []);

  const handleLawClick = useCallback((lawId) => {
    navigate(`/legislation/${lawId}`);
  }, [navigate]);

  if (!policy) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Policy not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Back Navigation */}
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Legislation
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Policy Details</h1>
            <button
              onClick={handleSidebarView}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Columns2 className="w-4 h-4" />
              Sidebar View
            </button>
          </div>

          {/* General Section */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Policy Name</p>
                <p className="text-sm font-medium text-gray-900">{policy.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm text-gray-900">{policy.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Source</p>
                  <a 
                    href={`https://${policy.source}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    {policy.source}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Policy Rules Section */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Policy Rules</h2>
            <div className="grid grid-cols-2 gap-4">
              {policy.policyRules.map((rule, index) => (
                <div key={index}>
                  <p className="text-xs text-blue-600 mb-1">{rule.label}</p>
                  <p className="text-sm font-medium text-gray-900">{rule.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Laws that violate policy */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Laws that violate policy</h2>
            <div className="space-y-2">
              {policy.violatingLaws.map((law) => (
                <a 
                  key={law.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLawClick(law.id);
                  }}
                  className="block text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {law.name}
                </a>
              ))}
            </div>
          </section>

          {/* Processes that violate policy */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Processes that violate policy</h2>
            <div className="space-y-2">
              {policy.violatingProcesses.map((process) => (
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
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Policy Text</h2>
            <div className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
              {policy.policyText}
            </div>
            <button
              onClick={handleViewFullText}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        policy={policy}
      />
    </div>
  );
};

export default PolicyDetails;
