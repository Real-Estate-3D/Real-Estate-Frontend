// Centralized Onboarding Configuration
// Manage all onboarding flows for pages and features in one place

export const ONBOARDING_FLOWS = {
  // ====================
  // PAGE ONBOARDING
  // ====================
  pages: {
    dashboard: {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Learn how to navigate your dashboard',
      storageKey: 'onboarding_dashboard_completed',
      autoStart: true, // Auto-start on first visit
      steps: [
        {
          id: 'dashboard-intro',
          title: 'Welcome to Dashboard',
          description: 'Get a high-level view of all your projects, recent activity, and quick statistics.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'dashboard-projects',
          title: 'Your Projects',
          description: 'View and manage all your real estate and municipal planning projects here.',
          selector: '[data-onboard="dashboard-projects"]',
          requiresAction: false,
          showTargetLine: true,
        },
        {
          id: 'dashboard-activity',
          title: 'Recent Activity',
          description: 'Track recent changes and updates across all your projects.',
          selector: '[data-onboard="dashboard-activity"]',
          requiresAction: false,
          showTargetLine: true,
        },
      ],
    },

    mapping: {
      id: 'mapping',
      title: 'Mapping & Zoning',
      description: 'Learn how to use the mapping and zoning features',
      storageKey: 'onboarding_mapping_completed',
      autoStart: true,
      steps: [
        {
          id: 'mapping-intro',
          title: 'Mapping & Zoning',
          description: 'This module helps you manage the city\'s zoning maps, land-use layers, and spatial data.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'mapping-search',
          title: 'Search Location',
          description: 'Type the name of a city, region, or address, the map will automatically zoom to that area. Enter the name of any city to continue.',
          selector: '[data-onboard="global-search"]',
          actionType: 'input-focus',
          requiresAction: true,
          showTargetLine: true,
        },
        {
          id: 'mapping-legend',
          title: 'Map Legend',
          description: 'The legend shows all turned on map layers and their color codes.',
          selector: '[data-onboard="map-legend"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'top',
        },
        {
          id: 'mapping-parcel-click',
          title: 'Select Parcel',
          description: 'Zoom and Press on any parcel to see detailed information and continue',
          selector: '[data-onboard="map-canvas"]',
          actionType: 'parcel-click',
          requiresAction: true,
          showTargetLine: true,
          tooltipPosition: 'center',
          targetPosition: { x: 0, y: 100 },
        },
      ],
    },

    legislation: {
      id: 'legislation',
      title: 'Legislation & Zoning',
      description: 'Learn how to manage zoning laws and policies',
      storageKey: 'onboarding_legislation_completed',
      autoStart: true,
      steps: [
        {
          id: 'legislation-intro',
          title: 'Legislation',
          description: 'Here you can view and manage all legislative documents, including Legislations, Zoning Laws, and Policies, serving as the foundation for compliance and decision-making across the system.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'legislation-table',
          title: 'Legislation Table',
          description: 'Here you can view, edit, or delete any Legislation.',
          selector: '[data-onboard="legislation-table"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'top',
        },
        {
          id: 'legislation-create',
          title: 'Create Legislation',
          description: 'Click New Legislation button to continue',
          selector: '[data-onboard="create-legislation"]',
          actionType: 'button-click',
          requiresAction: true,
          showTargetLine: true,
        },
      ],
    },

    settings: {
      id: 'settings',
      title: 'Settings & Preferences',
      description: 'Customize your experience',
      storageKey: 'onboarding_settings_completed',
      autoStart: false,
      steps: [
        {
          id: 'settings-intro',
          title: 'Personalize Your Workspace',
          description: 'Adjust settings to match your workflow and preferences.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'settings-profile',
          title: 'Profile Settings',
          description: 'Update your profile information and preferences.',
          selector: '[data-onboard="settings-profile"]',
          requiresAction: false,
        },
      ],
    },
  },

  // ====================
  // FEATURE ONBOARDING
  // ====================
  features: {
    measurement: {
      id: 'measurement',
      title: 'Measurement Tools',
      description: 'Learn how to measure distance and area',
      storageKey: 'onboarding_feature_measurement_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'measurement-intro',
          title: 'Measurements',
          description: 'Measure distances and areas directly on the 3D map.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'measurement-open',
          title: 'Open Measurement Tools',
          description: 'Click the ruler icon to open measurement options.',
          selector: '[data-tool="measurement"]',
          actionType: 'button-click',
          requiresAction: true,
        },
        {
          id: 'measurement-type',
          title: 'Select Measurement Type',
          description: 'Choose between distance or area measurement.',
          selector: '[data-onboard="measurement-type-selector"]',
          requiresAction: false,
        },
        {
          id: 'measurement-draw',
          title: 'Draw on Map',
          description: 'Click on the map to create points. Double-click to finish.',
          selector: '[data-onboard="map-canvas"]',
          requiresAction: false,
        },
        {
          id: 'measurement-panel',
          title: 'View Results',
          description: 'See all your measurements in the measurement panel.',
          selector: '[data-onboard="measurement-panel"]',
          requiresAction: false,
        },
      ],
    },

    layers: {
      id: 'layers',
      title: 'Layer Management',
      description: 'Control map layers',
      storageKey: 'onboarding_feature_layers_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'layers-intro',
          title: 'Map Layers',
          description: 'Toggle different data layers to customize your map view.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'layers-panel',
          title: 'Open Layer Panel',
          description: 'Click to open the layer control panel.',
          selector: '[data-onboard="layers-panel"]',
          actionType: 'panel-open',
          requiresAction: true,
        },
        {
          id: 'layers-toggle',
          title: 'Toggle Layers',
          description: 'Turn layers on or off to see different types of data.',
          selector: '[data-onboard="layers-list"]',
          requiresAction: false,
        },
      ],
    },

    search: {
      id: 'search',
      title: 'Global Search',
      description: 'Search across your workspace',
      storageKey: 'onboarding_feature_search_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'search-intro',
          title: 'Smart Search',
          description: 'Quickly find parcels, municipalities, locations, and more.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'search-input',
          title: 'Start Typing',
          description: 'Type to search across all your data.',
          selector: '[data-onboard="global-search"]',
          actionType: 'input-focus',
          requiresAction: true,
        },
        {
          id: 'search-results',
          title: 'View Results',
          description: 'Click any result to jump directly to that location on the map.',
          selector: '[data-onboard="search-results"]',
          requiresAction: false,
        },
      ],
    },

    'toolbar-3d': {
      id: 'toolbar-3d',
      title: '3D Navigation',
      description: 'Navigate the 3D map',
      storageKey: 'onboarding_feature_toolbar_3d_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: '3d-intro',
          title: '3D Navigation Tools',
          description: 'Use these tools to control your 3D view.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: '3d-zoom',
          title: 'Zoom Controls',
          description: 'Zoom in and out to see more or less detail.',
          selector: '[data-tool="zoom-in"]',
          requiresAction: false,
        },
        {
          id: '3d-rotate',
          title: 'Rotate View',
          description: 'Click and drag to rotate your view around the map.',
          selector: '[data-tool="rotate"]',
          requiresAction: false,
        },
        {
          id: '3d-reset',
          title: 'Reset View',
          description: 'Click to reset to the default view.',
          selector: '[data-tool="reset-view"]',
          requiresAction: false,
        },
      ],
    },

    'parcel-info': {
      id: 'parcel-info',
      title: 'Parcel Information',
      description: 'View detailed parcel information',
      storageKey: 'onboarding_feature_parcel_info_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'parcel-info-intro',
          title: 'Parcel Details',
          description: 'View parcel details like zoning, area, and ownership. You can also adjust the layer\'s color and opacity here.',
          selector: '[data-onboard="parcel-info-box"]',
          requiresAction: false,
          showTargetLine: true,
        },
      ],
    },

    // Create Legislation Form - Step 1: Context & Scope
    'create-legislation-step1': {
      id: 'create-legislation-step1',
      title: 'Context & Scope',
      description: 'Step 1 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step1_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step1-intro',
          title: 'Context & Scope',
          description: 'To create a new Legislation, start by filling out the basic information. Fill the form, then press Next to continue.',
          selector: '[data-onboard="legislation-form-step1"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'center',
        },
      ],
    },

    // Create Legislation Form - Step 2: GIS Schedules
    'create-legislation-step2': {
      id: 'create-legislation-step2',
      title: 'GIS Schedules',
      description: 'Step 2 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step2_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step2-intro',
          title: 'GIS Schedules',
          description: 'At this step, you can select the areas and zones that will be subject to the selected law.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'create-legislation-gis-panel',
          title: 'GIS Schedules Panel',
          description: 'Use this panel to manage zoning and planning schedules linked to the map. Switch between GIS Schedules for parcel-specific schedules and Municipal Level for municipality-wide schedules. Click "Add GIS Schedule" to create a new schedule and link it to the appropriate area or layer.',
          selector: '[data-onboard="gis-schedules-panel"]',
          requiresAction: false,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-add-gis',
          title: 'Add GIS Schedule',
          description: 'Choose how you want to add it — manually or by uploading a GIS file. Once the required fields are filled in, click "Add" to save the schedule and make it available for use on the map.',
          selector: '[data-onboard="add-gis-schedule-btn"]',
          actionType: 'button-click',
          requiresAction: true,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-schedule-card',
          title: 'Schedule Details',
          description: 'Here, you can add and manage polygons, adjust their properties, and link them to existing map geometry.',
          selector: '[data-onboard="gis-schedule-card"]',
          requiresAction: false,
          showTargetLine: true,
        },
      ],
    },

    // Create Legislation Form - Step 3: Subdivision
    'create-legislation-step3': {
      id: 'create-legislation-step3',
      title: 'Subdivision',
      description: 'Step 3 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step3_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step3-intro',
          title: 'Subdivision',
          description: 'Here you can split or merge parcels to define new land subdivisions. Use the drawing tools on the map to adjust parcel boundaries and prepare the areas where specific zoning rules will apply later.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'create-legislation-layers-panel',
          title: 'Layers Panel',
          description: 'In the right panel, you can toggle the visibility of map layers. Turn on any two layers to continue.',
          selector: '[data-onboard="legislation-layers-panel"]',
          requiresAction: false,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-subdivision-panel',
          title: 'Subdivision Panel',
          description: 'In the left panel, you can select the operation you want to perform on the layers. Select Merge operation to continue.',
          selector: '[data-onboard="subdivision-panel"]',
          requiresAction: false,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-input-layer',
          title: 'Input Layer',
          description: 'In the Input Layer section, you can choose an existing layer.',
          selector: '[data-onboard="subdivision-input"]',
          requiresAction: false,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-output-layer',
          title: 'Output Layer',
          description: 'In the Output Layer section, you can choose an existing layer or create a new one.',
          selector: '[data-onboard="subdivision-output"]',
          requiresAction: false,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-merge',
          title: 'Merge Layers',
          description: 'Now select any merge option and click "Merge" to continue.',
          selector: '[data-onboard="subdivision-merge"]',
          actionType: 'button-click',
          requiresAction: true,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-branches-btn',
          title: 'Branches',
          description: 'Click "Branches" to view and manage different versions of the zoning amendment.',
          selector: '[data-onboard="branches-btn"]',
          actionType: 'button-click',
          requiresAction: true,
          showTargetLine: true,
        },
        {
          id: 'create-legislation-branching',
          title: 'Branch Management',
          description: 'This screen allows you to manage branches and track version history for zoning amendments. Here you can create new branches, view how changes evolve over time, apply a selected branch, merge it into the main version, or delete it if no longer needed.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'create-legislation-merge-success',
          title: 'Merge Complete',
          description: 'Great! Now selected layers have been successfully merged. Click "Next" to continue.',
          isIntroStep: true,
          requiresAction: false,
        },
      ],
    },

    // Create Legislation Form - Step 4: Parameters
    'create-legislation-step4': {
      id: 'create-legislation-step4',
      title: 'Parameters',
      description: 'Step 4 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step4_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step4-intro',
          title: 'Parameters',
          description: 'Here you can set zoning parameters like height, setbacks, and FAR for each zone or parcel. Add at least one parameter and click Next to continue.',
          selector: '[data-onboard="legislation-form-step4"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'center',
        },
      ],
    },

    // Create Legislation Form - Step 5: Workflows
    'create-legislation-step5': {
      id: 'create-legislation-step5',
      title: 'Required Workflows',
      description: 'Step 5 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step5_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step5-intro',
          title: 'Required Workflows',
          description: 'In this step, you create the workflow yourself, step by step. Click "Add Workflow" to start defining the required steps. Include at least two basic steps (submission and approval) and add additional steps as needed for your process.',
          selector: '[data-onboard="legislation-form-step5"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'center',
        },
      ],
    },

    // Create Legislation Form - Step 6: Massing Simulation
    'create-legislation-step6': {
      id: 'create-legislation-step6',
      title: 'Massing Simulation',
      description: 'Step 6 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step6_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step6-intro',
          title: 'Massing Simulation',
          description: 'Here you can visualize how your zoning parameters shape future buildings and urban form. Try to set any parameters, then click Next to continue.',
          selector: '[data-onboard="legislation-form-step6"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'center',
        },
      ],
    },

    // Create Legislation Form - Step 7: Review & Publish
    'create-legislation-step7': {
      id: 'create-legislation-step7',
      title: 'Review & Publish',
      description: 'Step 7 of Create Legislation',
      storageKey: 'onboarding_feature_create_legislation_step7_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-step7-intro',
          title: 'Review & Publish',
          description: 'Here you can review all details, validate your data, and publish the final version of the legislation. Review details and click Create Legislation to continue.',
          selector: '[data-onboard="legislation-form-step7"]',
          requiresAction: false,
          showTargetLine: true,
          tooltipPosition: 'center',
        },
      ],
    },

    // Create Legislation Form - Success
    'create-legislation-success': {
      id: 'create-legislation-success',
      title: 'Legislation Created',
      description: 'Legislation creation complete',
      storageKey: 'onboarding_feature_create_legislation_success_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'create-legislation-success-intro',
          title: 'Congratulations!',
          description: 'Great job! You\'ve just created your first Legislation.',
          isIntroStep: true,
          requiresAction: false,
        },
      ],
    },

    // Zoning Laws Feature Onboarding
    'zoning-laws': {
      id: 'zoning-laws',
      title: 'Zoning Laws',
      description: 'View and manage zoning laws',
      storageKey: 'onboarding_feature_zoning_laws_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'zoning-laws-intro',
          title: 'Zoning Laws',
          description: 'Here you can view, edit, or create zoning laws that define land use, building height, and density across different areas.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'zoning-laws-table',
          title: 'Zoning Laws Table',
          description: 'Click on any zoning law to view its details.',
          selector: '[data-onboard="zoning-laws-table"]',
          actionType: 'row-click',
          requiresAction: true,
          showTargetLine: true,
        },
      ],
    },

    // Zoning Law Details Feature Onboarding
    'zoning-law-details': {
      id: 'zoning-law-details',
      title: 'Zoning Law Details',
      description: 'View zoning law details',
      storageKey: 'onboarding_feature_zoning_law_details_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'zoning-law-details-intro',
          title: 'Zoning Law Details',
          description: 'In this drawer, you can review all details of the selected zoning by-law amendment.',
          selector: '[data-onboard="zoning-law-details-panel"]',
          requiresAction: false,
          showTargetLine: true,
        },
      ],
    },

    // Policies Feature Onboarding
    'policies': {
      id: 'policies',
      title: 'Policies',
      description: 'Manage policies',
      storageKey: 'onboarding_feature_policies_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'policies-intro',
          title: 'Policies',
          description: 'Here you can manage policies that guide urban planning, development standards, and community regulations.',
          isIntroStep: true,
          requiresAction: false,
        },
        {
          id: 'policies-table',
          title: 'Policies Table',
          description: 'You can view all details related to each policy. Click on any policy to continue.',
          selector: '[data-onboard="policies-table"]',
          actionType: 'row-click',
          requiresAction: true,
          showTargetLine: true,
        },
      ],
    },

    // Policy Details Feature Onboarding
    'policy-details': {
      id: 'policy-details',
      title: 'Policy Details',
      description: 'View policy details',
      storageKey: 'onboarding_feature_policy_details_completed',
      triggerOn: 'first-use',
      steps: [
        {
          id: 'policy-details-intro',
          title: 'Policy Details',
          description: 'In this window, you can see all key information about the policy, the documents supporting it, and the laws that violate this policy.',
          selector: '[data-onboard="policy-details-panel"]',
          requiresAction: false,
          showTargetLine: true,
        },
      ],
    },
  },

  // ====================
  // COMBINED FLOWS
  // ====================
  combined: {
    'first-time-user': {
      id: 'first-time-user',
      title: 'Complete Getting Started Guide',
      description: 'Multi-page onboarding for new users',
      storageKey: 'onboarding_first_time_completed',
      parts: [
        {
          id: 'dashboard-part',
          title: 'Dashboard Overview',
          pageId: 'dashboard',
          steps: 'pages.dashboard.steps',
        },
        {
          id: 'mapping-part',
          title: 'Mapping Basics',
          pageId: 'mapping',
          steps: 'pages.mapping.steps',
        },
        {
          id: 'measurement-part',
          title: 'Measurement Tools',
          featureId: 'measurement',
          steps: 'features.measurement.steps',
        },
      ],
    },
  },
};

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Get onboarding flow by ID
 * @param {string} category - 'pages', 'features', or 'combined'
 * @param {string} flowId - The flow identifier
 * @returns {Object|null} The flow configuration or null
 */
export function getOnboardingFlow(category, flowId) {
  return ONBOARDING_FLOWS[category]?.[flowId] || null;
}

/**
 * Check if onboarding has been completed
 * @param {string} storageKey - The localStorage key for this flow
 * @returns {boolean}
 */
export function isOnboardingCompleted(storageKey) {
  try {
    return localStorage.getItem(storageKey) === 'true';
  } catch (error) {
    console.error('Failed to read onboarding state:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 * @param {string} storageKey - The localStorage key for this flow
 */
export function markOnboardingCompleted(storageKey) {
  try {
    localStorage.setItem(storageKey, 'true');
  } catch (error) {
    console.error('Failed to save onboarding state:', error);
  }
}

/**
 * Reset onboarding (for testing or user preference)
 * @param {string} storageKey - The localStorage key for this flow, or 'all' to reset everything
 */
export function resetOnboarding(storageKey) {
  try {
    if (storageKey === 'all') {
      Object.values(ONBOARDING_FLOWS.pages).forEach(flow => {
        localStorage.removeItem(flow.storageKey);
      });
      Object.values(ONBOARDING_FLOWS.features).forEach(flow => {
        localStorage.removeItem(flow.storageKey);
      });
      Object.values(ONBOARDING_FLOWS.combined).forEach(flow => {
        localStorage.removeItem(flow.storageKey);
      });
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error('Failed to reset onboarding state:', error);
  }
}

/**
 * Get all page flows
 * @returns {Object} All page onboarding flows
 */
export function getAllPageFlows() {
  return ONBOARDING_FLOWS.pages;
}

/**
 * Get all feature flows
 * @returns {Object} All feature onboarding flows
 */
export function getAllFeatureFlows() {
  return ONBOARDING_FLOWS.features;
}

/**
 * Check if a flow should auto-start
 * @param {Object} flow - The flow configuration
 * @returns {boolean}
 */
export function shouldAutoStart(flow) {
  if (!flow) return false;

  if (isOnboardingCompleted(flow.storageKey)) {
    return false;
  }

  if (flow.autoStart !== undefined) {
    return flow.autoStart;
  }

  if (flow.triggerOn === 'first-use') {
    return true;
  }

  return false;
}

export default ONBOARDING_FLOWS;
