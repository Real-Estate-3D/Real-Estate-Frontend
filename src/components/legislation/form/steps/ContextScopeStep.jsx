// File: src/components/legislation/form/steps/ContextScopeStep.jsx

import { TextInput, SelectInput, DateInput, TextArea } from '../FormField';

const jurisdictionOptions = [
  { value: 'toronto', label: 'City of Toronto' },
  { value: 'mississauga', label: 'City of Mississauga' },
  { value: 'brampton', label: 'City of Brampton' },
  { value: 'markham', label: 'City of Markham' },
  { value: 'vaughan', label: 'City of Vaughan' },
  { value: 'oakville', label: 'Town of Oakville' },
  { value: 'richmond_hill', label: 'City of Richmond Hill' },
  { value: 'burlington', label: 'City of Burlington' },
];

const legislationTypeOptions = [
  { value: 'zoning_bylaw', label: 'Zoning By-law' },
  { value: 'official_plan', label: 'Official Plan' },
  { value: 'site_specific_zoning', label: 'Site-Specific Zoning' },
  { value: 'subdivision_control', label: 'Subdivision Control' },
];

const baseTemplateOptions = [
  { value: 'template_1', label: 'Base Template 1' },
  { value: 'template_2', label: 'Base Template 2' },
  { value: 'template_123', label: 'Base Template 123' },
  { value: 'custom', label: 'Custom Template' },
];



const ContextScopeStep = ({ formData, onChange, errors }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Title, Jurisdiction, Legislation Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Title"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Enter Title"
          error={errors.title}
          required
        />

        <SelectInput
          label="Jurisdiction"
          name="jurisdiction"
          value={formData.jurisdiction}
          onChange={onChange}
          options={jurisdictionOptions}
          placeholder="Select Jurisdiction"
          error={errors.jurisdiction}
          required
        />

        <SelectInput
          label="Legislation Type"
          name="legislationType"
          value={formData.legislationType}
          onChange={onChange}
          options={legislationTypeOptions}
          placeholder="Select Legislation Type"
          error={errors.legislationType}
          required
        />
      </div>

      {/* Row 2: Effective From, Effective To, Base Template */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DateInput
          label="Effective From"
          name="effectiveFrom"
          value={formData.effectiveFrom}
          onChange={onChange}
          placeholder="Select Effective From"
          error={errors.effectiveFrom}
          required
        />

        <DateInput
          label="Effective To"
          name="effectiveTo"
          value={formData.effectiveTo}
          onChange={onChange}
          placeholder="Select Effective To"
          min={formData.effectiveFrom}
        />

        <SelectInput
          label="Base Template"
          name="baseTemplate"
          value={formData.baseTemplate}
          onChange={onChange}
          options={baseTemplateOptions}
          placeholder="Select Base Template"
        />
      </div>

      {/* Row 3: Note (Full Width) */}
      <TextArea
        label="Note"
        name="note"
        value={formData.note}
        onChange={onChange}
        placeholder="Enter Note"
        rows={4}
      />
    </div>
  );
};

export default ContextScopeStep;