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
    id: string; // Unique ID (e.g., 'stakeholder_brp')
    label: string; // Display name
    category: 'foundation' | 'stakeholder' | 'intervention' | 'bridge' | 'risk';
    description?: string; // Tooltip text
    fields: Field[]; // The form schema for the Inspector Panel
}

export const FLN_TOOLBOX: ToolNode[] = [
    // --- Category: 'foundation' ---
    {
        id: 'learning_crisis',
        label: 'Problem Statement',
        category: 'foundation',
        fields: [
            { name: 'baseline_value', label: 'Baseline Value', type: 'number', required: true, placeholder: 'e.g., 12' },
            { name: 'source', label: 'Source', type: 'select', options: ['ASER', 'NAS', 'Internal'], required: true },
        ],
    },
    {
        id: 'nipun_lakshya',
        label: 'Vision (NIPUN Lakshya)',
        category: 'foundation',
        fields: [
            { name: 'target_year', label: 'Target Year', type: 'select', options: ['2026', '2027'], required: true },
            { name: 'proficiency_type', label: 'Proficiency Type', type: 'select', options: ['Oral Reading', 'Numeracy', 'Both'], required: true },
        ],
    },

    // --- Category: 'stakeholder' ---
    // School Level
    {
        id: 'student_primary',
        label: 'Student (Primary)',
        category: 'stakeholder',
        fields: [
            { name: 'student_count', label: 'Count', type: 'number', required: true },
            { name: 'language', label: 'Language', type: 'text', required: true },
        ],
    },
    {
        id: 'teacher_govt',
        label: 'Teacher (Govt)',
        category: 'stakeholder',
        fields: [
            { name: 'ptr', label: 'PTR', type: 'number', required: true },
            { name: 'motivation', label: 'Motivation', type: 'select', options: ['High', 'Medium', 'Low'], required: false },
        ],
    },
    {
        id: 'headmaster',
        label: 'Headmaster',
        category: 'stakeholder',
        fields: [
            { name: 'role_focus', label: 'Role Focus', type: 'select', options: ['Admin', 'Academic'], required: true },
        ],
    },
    {
        id: 'smc_member',
        label: 'SMC Member',
        category: 'stakeholder',
        fields: [
            { name: 'active_status', label: 'Active Status', type: 'select', options: ['Active', 'Inactive'], required: true },
        ],
    },
    {
        id: 'gram_pradhan',
        label: 'Gram Pradhan',
        category: 'stakeholder',
        fields: [
            { name: 'influence_level', label: 'Influence Level', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
        ],
    },

    // Block Level
    {
        id: 'nodal_teacher',
        label: 'Nodal Teacher',
        category: 'stakeholder',
        fields: [
            { name: 'schools_per_mentor', label: 'Schools per Mentor', type: 'number', required: true },
        ],
    },
    {
        id: 'crcc',
        label: 'CRCC',
        category: 'stakeholder',
        fields: [
            { name: 'visits_per_month', label: 'Visits per Month', type: 'number', required: true },
            { name: 'transport_mode', label: 'Transport Mode', type: 'text', required: false },
        ],
    },
    {
        id: 'brp',
        label: 'BRP',
        category: 'stakeholder',
        fields: [
            { name: 'subject', label: 'Subject', type: 'select', options: ['Literacy', 'Numeracy'], required: true },
        ],
    },
    {
        id: 'beo',
        label: 'BEO',
        category: 'stakeholder',
        fields: [
            { name: 'election_duty_conflict', label: 'Election Duty Conflict?', type: 'boolean', required: true },
        ],
    },

    // District/State Level
    {
        id: 'diet_faculty',
        label: 'DIET Faculty',
        category: 'stakeholder',
        fields: [
            { name: 'role', label: 'Role', type: 'text', required: true },
        ],
    },
    {
        id: 'district_magistrate',
        label: 'District Magistrate',
        category: 'stakeholder',
        fields: [
            { name: 'priority_level', label: 'Priority Level', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
        ],
    },
    {
        id: 'scert_official',
        label: 'SCERT Official',
        category: 'stakeholder',
        fields: [
            { name: 'approvals', label: 'Approvals Needed', type: 'text', required: false },
        ],
    },

    // --- Category: 'intervention' ---
    // Materials
    {
        id: 'tlm_kit',
        label: 'TLM Kit',
        category: 'intervention',
        fields: [
            { name: 'unit_cost', label: 'Unit Cost', type: 'number', required: true },
            { name: 'components', label: 'Components', type: 'textarea', required: true },
            { name: 'distribution_level', label: 'Distribution Level', type: 'select', options: ['Student', 'Class', 'School'], required: true },
        ],
    },
    {
        id: 'student_workbook',
        label: 'Student Workbook',
        category: 'intervention',
        fields: [
            { name: 'frequency', label: 'Frequency', type: 'select', options: ['Annual', 'Quarterly'], required: true },
        ],
    },
    {
        id: 'teacher_guide',
        label: 'Teacher Guide',
        category: 'intervention',
        fields: [
            { name: 'format', label: 'Format', type: 'select', options: ['Daily Plan', 'Broad Guidelines'], required: true },
        ],
    },

    // Training
    {
        id: 'cascade_training',
        label: 'Cascade Training',
        category: 'intervention',
        fields: [
            { name: 'days', label: 'Days', type: 'number', required: true },
            { name: 'transmission_loss_risk', label: 'Transmission Loss Risk', type: 'text', required: false, readOnly: true, defaultValue: 'High' },
            { name: 'level', label: 'Level', type: 'select', options: ['State', 'District', 'Block'], required: true },
        ],
    },
    {
        id: 'cluster_meeting',
        label: 'Cluster Meeting',
        category: 'intervention',
        fields: [
            { name: 'frequency', label: 'Frequency', type: 'select', options: ['Monthly'], required: true, defaultValue: 'Monthly' },
            { name: 'agenda_type', label: 'Agenda Type', type: 'select', options: ['Admin', 'Academic'], required: true },
        ],
    },
    {
        id: 'digital_training',
        label: 'Digital Training',
        category: 'intervention',
        fields: [
            { name: 'platform', label: 'Platform', type: 'select', options: ['DIKSHA', 'YouTube'], required: true },
            { name: 'completion_target', label: 'Completion Target (%)', type: 'number', required: true },
        ],
    },

    // Monitoring
    {
        id: 'classroom_observation',
        label: 'Classroom Observation',
        category: 'intervention',
        fields: [
            { name: 'tool_used', label: 'Tool Used', type: 'select', options: ['Standard', 'Informal'], required: true },
            { name: 'feedback_type', label: 'Feedback Type', type: 'select', options: ['Written', 'Oral'], required: true },
        ],
    },

    // --- Category: 'bridge' --- (Practice Changes)
    {
        id: 'pedagogy_shift',
        label: 'Pedagogy Shift',
        category: 'bridge',
        fields: [
            { name: 'from_behavior', label: 'From Behavior', type: 'text', required: true },
            { name: 'to_behavior', label: 'To Behavior', type: 'text', required: true },
            { name: 'evidence_source', label: 'Evidence Source', type: 'select', options: ['Observation', 'Survey', 'Exam'], required: true },
        ],
    },
    {
        id: 'tlm_usage',
        label: 'TLM Usage',
        category: 'bridge',
        fields: [
            { name: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly'], required: true },
        ],
    },
    {
        id: 'assessment_shift',
        label: 'Assessment Shift',
        category: 'bridge',
        fields: [
            { name: 'type', label: 'Type', type: 'select', options: ['Formative', 'Summative'], required: true },
        ],
    },

    // --- Category: 'risk' ---
    {
        id: 'funds_delay',
        label: 'Funds Delay',
        category: 'risk',
        fields: [
            { name: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium'], required: true },
            { name: 'mitigation_plan', label: 'Mitigation Plan', type: 'text', required: true },
        ],
    },
    {
        id: 'teacher_transfer',
        label: 'Teacher Transfer',
        category: 'risk',
        fields: [
            { name: 'churn_rate', label: 'Churn Rate (%)', type: 'number', required: true },
        ],
    },
    {
        id: 'tech_infrastructure',
        label: 'Tech Infrastructure',
        category: 'risk',
        fields: [
            { name: 'device_penetration', label: 'Device Penetration (%)', type: 'number', required: true },
        ],
    },
];
