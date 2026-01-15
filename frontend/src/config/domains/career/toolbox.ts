export type FieldType = 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea';

export interface Field {
    name: string; // The key for the JSONB data (e.g., 'unit_cost')
    label: string; // The UI label (e.g., 'Cost Per Unit')
    type: FieldType;
    options?: string[]; // For 'select' type
    required: boolean;
    defaultValue?: any;
    placeholder?: string;
    readOnly?: boolean;
}

export interface ToolNode {
    id: string; // Unique ID
    label: string; // Display name
    category: 'foundation' | 'stakeholder' | 'intervention' | 'bridge' | 'risk';
    description?: string; // Tooltip text
    fields: Field[]; // The form schema for the Inspector Panel
}

export const CAREER_TOOLBOX: ToolNode[] = [
    // --- Category: 'foundation' ---
    {
        id: 'neet',
        label: 'Problem: NEET',
        category: 'foundation',
        fields: [
            { name: 'neet_rate', label: 'NEET Rate (%)', type: 'number', required: true },
            { name: 'demographic_focus', label: 'Demographic Focus', type: 'select', options: ['Women', 'PWD', 'General'], required: true },
        ],
    },
    {
        id: 'sustainable_income',
        label: 'Goal: Sustainable Income',
        category: 'foundation',
        fields: [
            { name: 'target_salary', label: 'Target Salary', type: 'number', required: true },
            { name: 'retention_period', label: 'Retention Period', type: 'select', options: ['3 Months', '6 Months', '1 Year'], required: true },
        ],
    },
    {
        id: 'self_employment',
        label: 'Goal: Self Employment',
        category: 'foundation',
        fields: [
            { name: 'business_type', label: 'Business Type', type: 'select', options: ['Service', 'Product'], required: true },
            { name: 'avg_monthly_profit', label: 'Avg Monthly Profit', type: 'number', required: true },
        ],
    },

    // --- Category: 'stakeholder' ---
    // Mobilization
    {
        id: 'youth_candidate',
        label: 'Youth Candidate',
        category: 'stakeholder',
        fields: [
            { name: 'edu_level', label: 'Education Level', type: 'text', required: true },
            { name: 'migration_intent', label: 'Migration Intent', type: 'text', required: true },
        ],
    },
    {
        id: 'parent_guardian',
        label: 'Parent/Guardian',
        category: 'stakeholder',
        fields: [
            { name: 'resistance_level', label: 'Resistance Level', type: 'text', required: true },
        ],
    },
    {
        id: 'field_mobilizer',
        label: 'Field Mobilizer',
        category: 'stakeholder',
        fields: [
            { name: 'targets', label: 'Targets', type: 'text', required: true },
        ],
    },
    // Delivery
    {
        id: 'vocational_trainer',
        label: 'Vocational Trainer',
        category: 'stakeholder',
        fields: [
            { name: 'domain', label: 'Domain', type: 'text', required: true },
            { name: 'certification', label: 'Certification', type: 'text', required: true },
        ],
    },
    {
        id: 'soft_skills_trainer',
        label: 'Soft Skills Trainer',
        category: 'stakeholder',
        fields: [],
    },
    {
        id: 'center_manager',
        label: 'Center Manager',
        category: 'stakeholder',
        fields: [],
    },
    // Market
    {
        id: 'hr_manager',
        label: 'HR Manager',
        category: 'stakeholder',
        fields: [
            { name: 'hiring_volume', label: 'Hiring Volume', type: 'text', required: true },
            { name: 'sector', label: 'Sector', type: 'text', required: true },
        ],
    },
    {
        id: 'industry_mentor',
        label: 'Industry Mentor',
        category: 'stakeholder',
        fields: [],
    },
    {
        id: 'alumni',
        label: 'Alumni',
        category: 'stakeholder',
        fields: [
            { name: 'placement_year', label: 'Placement Year', type: 'text', required: true },
        ],
    },

    // --- Category: 'intervention' ---
    // Skilling
    {
        id: 'tech_bootcamp',
        label: 'Tech Bootcamp',
        category: 'intervention',
        fields: [
            { name: 'hours', label: 'Hours', type: 'number', required: true },
            { name: 'curriculum_standard', label: 'Curriculum Standard', type: 'select', options: ['NSDC', 'Custom'], required: true },
        ],
    },
    {
        id: 'career_counseling',
        label: 'Career Counseling',
        category: 'intervention',
        fields: [
            { name: 'tool_used', label: 'Tool Used', type: 'select', options: ['Psychometric', 'Interview'], required: true },
            { name: 'sessions_per_student', label: 'Sessions Per Student', type: 'number', required: true },
        ],
    },
    {
        id: 'mock_interview',
        label: 'Mock Interview',
        category: 'intervention',
        fields: [
            { name: 'panel_type', label: 'Panel Type', type: 'select', options: ['Internal', 'Corporate'], required: true },
        ],
    },
    // Linkage
    {
        id: 'internship_ojt',
        label: 'Internship / OJT',
        category: 'intervention',
        fields: [
            { name: 'stipend_amount', label: 'Stipend Amount', type: 'number', required: true },
            { name: 'duration_weeks', label: 'Duration (Weeks)', type: 'number', required: true },
        ],
    },
    {
        id: 'job_fair',
        label: 'Job Fair',
        category: 'intervention',
        fields: [
            { name: 'employer_count', label: 'Employer Count', type: 'number', required: true },
        ],
    },
    // Post-Placement
    {
        id: 'migration_support',
        label: 'Migration Support',
        category: 'intervention',
        fields: [
            { name: 'includes_housing', label: 'Includes Housing?', type: 'boolean', required: true },
        ],
    },
    {
        id: 'tracking_call',
        label: 'Tracking Call',
        category: 'intervention',
        fields: [
            { name: 'frequency', label: 'Frequency', type: 'select', options: ['Weekly', 'Monthly'], required: true },
        ],
    },

    // --- Category: 'bridge' ---
    {
        id: 'aspiration_alignment',
        label: 'Aspiration Alignment',
        category: 'bridge',
        fields: [
            { name: 'initial_interest', label: 'Initial Interest', type: 'text', required: true },
            { name: 'final_match', label: 'Final Match', type: 'text', required: true },
        ],
    },
    {
        id: 'interview_readiness',
        label: 'Interview Readiness',
        category: 'bridge',
        fields: [
            { name: 'mock_score_avg', label: 'Mock Score Avg', type: 'number', required: true },
        ],
    },
    {
        id: 'family_consent',
        label: 'Family Consent',
        category: 'bridge',
        fields: [
            { name: 'consent_obtained', label: 'Consent Obtained?', type: 'boolean', required: true },
        ],
    },

    // --- Category: 'risk' ---
    {
        id: 'market_slump',
        label: 'Market Slump',
        category: 'risk',
        fields: [
            { name: 'affected_sector', label: 'Affected Sector', type: 'select', options: ['IT', 'Retail', 'Logistics'], required: true },
        ],
    },
    {
        id: 'migration_shock',
        label: 'Migration Shock',
        category: 'risk',
        fields: [
            { name: 'drop_out_probability', label: 'Drop Out Probability', type: 'select', options: ['High', 'Med', 'Low'], required: true },
        ],
    },
    {
        id: 'wage_mismatch',
        label: 'Wage Mismatch',
        category: 'risk',
        fields: [
            { name: 'living_cost_gap', label: 'Living Cost Gap', type: 'number', required: true },
        ],
    },
];
