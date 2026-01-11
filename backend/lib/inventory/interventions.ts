// --- TYPES ---

export type InterventionCategory = 'TRAINING' | 'MATERIAL' | 'TECH' | 'COMMUNITY' | 'PROCESS';

export interface Intervention {
  id: string;
  label: string;
  category: InterventionCategory;
  description: string;
  
  // Gamification & Simulation Props
  cost_level: 'LOW' | 'MEDIUM' | 'HIGH'; // For Budget Estimation
  complexity: number; // 1 (Easy) to 5 (Hard) - For Bandwidth Logic
  
  // Logic Constraints
  theme: 'FLN' | 'CAREER' | 'GENERAL';
  recommended_stakeholder_role?: string; // Who usually does this?
}

// --- THE MASTER INVENTORY ---

export const INTERVENTION_LIBRARY: Intervention[] = [
  // =================================================
  // 1. GENERAL (System Strengthening)
  // =================================================
  {
    id: 'int_gen_training_3day',
    label: 'Teacher Training (3 Days)',
    category: 'TRAINING',
    description: 'Residential or block-level training workshop.',
    cost_level: 'HIGH',
    complexity: 3,
    theme: 'GENERAL',
    recommended_stakeholder_role: 'Teacher',
  },
  {
    id: 'int_gen_crp_visit',
    label: 'Academic Monitoring Visit',
    category: 'PROCESS',
    description: 'CRP or BRP visits school to observe class.',
    cost_level: 'MEDIUM',
    complexity: 2,
    theme: 'GENERAL',
    recommended_stakeholder_role: 'CRP',
  },
  {
    id: 'int_gen_smc_meeting',
    label: 'SMC/Community Meeting',
    category: 'COMMUNITY',
    description: 'Meeting with parents to discuss school issues.',
    cost_level: 'LOW',
    complexity: 2,
    theme: 'GENERAL',
    recommended_stakeholder_role: 'Headmaster',
  },
  {
    id: 'int_gen_data_review',
    label: 'Block Data Review Meeting',
    category: 'PROCESS',
    description: 'Monthly review of school KPIs by BEO.',
    cost_level: 'LOW',
    complexity: 4,
    theme: 'GENERAL',
    recommended_stakeholder_role: 'BEO',
  },

  // =================================================
  // 2. FLN (Foundational Literacy & Numeracy)
  // =================================================
  {
    id: 'int_fln_kit_distribution',
    label: 'FLN Kit Distribution',
    category: 'MATERIAL',
    description: 'Providing workbooks, counters, and charts.',
    cost_level: 'HIGH',
    complexity: 1,
    theme: 'FLN',
    recommended_stakeholder_role: 'Teacher',
  },
  {
    id: 'int_fln_remedial',
    label: 'Remedial Class / CAMaL',
    category: 'PROCESS',
    description: 'Teaching at the right level (TaRL) grouping.',
    cost_level: 'LOW',
    complexity: 4, // High pedagogical complexity
    theme: 'FLN',
    recommended_stakeholder_role: 'Teacher',
  },
  {
    id: 'int_fln_library_hour',
    label: 'Library / Reading Hour',
    category: 'PROCESS',
    description: 'Dedicated time for storybook reading.',
    cost_level: 'LOW',
    complexity: 2,
    theme: 'FLN',
    recommended_stakeholder_role: 'Teacher',
  },

  // =================================================
  // 3. CAREER READINESS
  // =================================================
  {
    id: 'int_car_career_mela',
    label: 'Career Mela / Fair',
    category: 'COMMUNITY',
    description: 'Event showcasing different career paths.',
    cost_level: 'MEDIUM',
    complexity: 3,
    theme: 'CAREER',
    recommended_stakeholder_role: 'Headmaster',
  },
  {
    id: 'int_car_industry_visit',
    label: 'Industry / Exposure Visit',
    category: 'PROCESS',
    description: 'Taking students to local businesses/factories.',
    cost_level: 'MEDIUM',
    complexity: 3,
    theme: 'CAREER',
    recommended_stakeholder_role: 'Teacher',
  },
  {
    id: 'int_car_role_model',
    label: 'Role Model Interaction',
    category: 'COMMUNITY',
    description: 'Guest lecture by a professional or alumni.',
    cost_level: 'LOW',
    complexity: 2,
    theme: 'CAREER',
    recommended_stakeholder_role: 'Headmaster',
  },
  {
    id: 'int_car_psychometric',
    label: 'Aptitude Testing',
    category: 'TECH',
    description: 'Digital or paper-based interest assessment.',
    cost_level: 'MEDIUM',
    complexity: 2,
    theme: 'CAREER',
    recommended_stakeholder_role: 'Teacher',
  },
];

// --- HELPERS ---

export function getInterventionsByTheme(theme: string): Intervention[] {
  const targetTheme = theme.toUpperCase() === 'CAREER' ? 'CAREER' : 'FLN';
  return INTERVENTION_LIBRARY.filter(
    (i) => i.theme === 'GENERAL' || i.theme === targetTheme
  );
}

export function getInterventionById(id: string): Intervention | undefined {
  return INTERVENTION_LIBRARY.find(i => i.id === id);
}