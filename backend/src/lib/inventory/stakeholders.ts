// --- TYPES ---

export type HierarchyLevel = 'SCHOOL' | 'CLUSTER' | 'BLOCK' | 'DISTRICT' | 'STATE';

export interface Stakeholder {
    id: string;
    label: string; // Display Name (e.g. "Headmaster")
    level: HierarchyLevel;
    role_description: string;

    // Gamification & Simulation Props
    bandwidth: number; // Max number of concurrent interventions they can handle
    influence: number; // 1-10 Scale (Used for "Approval" logic checks)

    // Logic Constraints
    required_for_scale?: number; // e.g., If scale > 50 schools, this stakeholder is mandatory
}

// --- THE MASTER INVENTORY ---

export const STAKEHOLDER_LIBRARY: Stakeholder[] = [
    // =================================================
    // 1. SCHOOL LEVEL (The Execution Layer)
    // =================================================
    {
        id: 'sh_student',
        label: 'Student',
        level: 'SCHOOL',
        role_description: 'The ultimate beneficiary. All logic chains must terminate here.',
        bandwidth: 99, // Infinite, as they are recipients
        influence: 1,
    },
    {
        id: 'sh_teacher',
        label: 'Teacher',
        level: 'SCHOOL',
        role_description: 'The primary executor. Delivers the pedagogy or intervention.',
        bandwidth: 3, // CRITICAL: Teachers are busy. Max 3 new tasks.
        influence: 3,
    },
    {
        id: 'sh_hm',
        label: 'Headmaster (HM)',
        level: 'SCHOOL',
        role_description: 'School leader. Must allow/monitor the teacher.',
        bandwidth: 4,
        influence: 5,
    },
    {
        id: 'sh_smc',
        label: 'SMC Member',
        level: 'SCHOOL',
        role_description: 'School Management Committee (Parents/Community).',
        bandwidth: 2, // Volunteers have low bandwidth
        influence: 4,
    },

    // =================================================
    // 2. CLUSTER LEVEL (The Support Layer)
    // =================================================
    {
        id: 'sh_crp',
        label: 'Cluster Resource Person (CRP)',
        level: 'CLUSTER',
        role_description: 'Academic mentor visiting 10-15 schools.',
        bandwidth: 5, // Can handle monitoring ~5 distinct programs
        influence: 4,
    },

    // =================================================
    // 3. BLOCK LEVEL (The Admin Layer)
    // =================================================
    {
        id: 'sh_beo',
        label: 'Block Education Officer (BEO)',
        level: 'BLOCK',
        role_description: 'Administrative head. Reviews data and approves leave.',
        bandwidth: 2, // Very busy with admin work. Low capacity for new programs.
        influence: 7,
        required_for_scale: 10, // Mandatory if > 10 schools
    },
    {
        id: 'sh_brp',
        label: 'Block Resource Person (BRP)',
        level: 'BLOCK',
        role_description: 'Subject matter expert at block level.',
        bandwidth: 4,
        influence: 5,
    },

    // =================================================
    // 4. DISTRICT LEVEL (The Strategy Layer)
    // =================================================
    {
        id: 'sh_deo',
        label: 'District Education Officer (DEO)',
        level: 'DISTRICT',
        role_description: 'Key decision maker. Grants permission for district rollouts.',
        bandwidth: 1, // Extremely limited bandwidth. Only strategic approvals.
        influence: 9,
        required_for_scale: 50, // Mandatory if > 50 schools
    },
    {
        id: 'sh_diet',
        label: 'DIET Faculty',
        level: 'DISTRICT',
        role_description: 'District Institute of Ed & Training. Owns academic content.',
        bandwidth: 3,
        influence: 8,
    },
    {
        id: 'sh_dm',
        label: 'District Magistrate (DM)',
        level: 'DISTRICT',
        role_description: 'The District Boss. Reviews high-level impact dashboard.',
        bandwidth: 1, // Only involves for high-priority reviews
        influence: 10,
    },
];

// Alias for backwards compatibility
export const STAKEHOLDERS = STAKEHOLDER_LIBRARY;

// --- HELPERS ---

export function getStakeholderById(id: string): Stakeholder | undefined {
    return STAKEHOLDER_LIBRARY.find(s => s.id === id);
}

/**
 * Returns available stakeholders for the Palette, sorted by hierarchy.
 */
export function getGroupedStakeholders() {
    return {
        School: STAKEHOLDER_LIBRARY.filter(s => s.level === 'SCHOOL'),
        Cluster: STAKEHOLDER_LIBRARY.filter(s => s.level === 'CLUSTER'),
        Block: STAKEHOLDER_LIBRARY.filter(s => s.level === 'BLOCK'),
        District: STAKEHOLDER_LIBRARY.filter(s => s.level === 'DISTRICT'),
    };
}
