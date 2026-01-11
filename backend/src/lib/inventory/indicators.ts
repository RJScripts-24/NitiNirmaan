// --- TYPES ---

export type IndicatorType = 'process' | 'output' | 'outcome';
export type IndicatorTheme = 'FLN' | 'CAREER' | 'GENERAL';

export interface Indicator {
    id: string;
    label: string;
    type: IndicatorType;
    theme: IndicatorTheme;
    unit: string; // e.g., '%', 'Count', 'Score'
}

// --- THE MASTER INVENTORY ---

export const INDICATOR_LIBRARY: Indicator[] = [
    // =================================================
    // 1. GENERAL / SYSTEM INDICATORS (Apply to all)
    // =================================================
    {
        id: 'gen_output_training',
        label: 'Number of Teachers/Officials Trained',
        type: 'output',
        theme: 'GENERAL',
        unit: 'Count',
    },
    {
        id: 'gen_process_attendance',
        label: 'Average Attendance Rate',
        type: 'process',
        theme: 'GENERAL',
        unit: '%',
    },
    {
        id: 'gen_process_crp_visit',
        label: '% of CRPs completing 10 visits/month',
        type: 'process',
        theme: 'GENERAL',
        unit: '%',
    },
    {
        id: 'gen_process_smc_meeting',
        label: 'Number of SMC meetings held',
        type: 'process',
        theme: 'GENERAL',
        unit: 'Count',
    },

    // =================================================
    // 2. FLN (Foundational Literacy & Numeracy)
    // =================================================
    {
        id: 'fln_outcome_reading_lvl',
        label: '% of students reading at Grade 2 level',
        type: 'outcome',
        theme: 'FLN',
        unit: '%',
    },
    {
        id: 'fln_outcome_nipun',
        label: '% of students achieving NIPUN Bharat targets',
        type: 'outcome',
        theme: 'FLN',
        unit: '%',
    },
    {
        id: 'fln_process_tlm_usage',
        label: 'Frequency of TLM/Kit usage in class',
        type: 'process',
        theme: 'FLN',
        unit: 'Days/Week',
    },
    {
        id: 'fln_output_library',
        label: 'Number of books issued to students',
        type: 'output',
        theme: 'FLN',
        unit: 'Count',
    },

    // =================================================
    // 3. CAREER READINESS / SCHOOL-TO-WORK
    // =================================================
    {
        id: 'car_outcome_pathways',
        label: '% of students with clear career pathways identified',
        type: 'outcome',
        theme: 'CAREER',
        unit: '%',
    },
    {
        id: 'car_process_rolemodel',
        label: 'Number of Role Model interactions conducted',
        type: 'process',
        theme: 'CAREER',
        unit: 'Count',
    },
    {
        id: 'car_output_internship',
        label: 'Number of students placed in internships/apprenticeships',
        type: 'output',
        theme: 'CAREER',
        unit: 'Count',
    },
    {
        id: 'car_outcome_agency',
        label: 'Student Agency Score (Self-Reported)',
        type: 'outcome',
        theme: 'CAREER',
        unit: 'Scale 1-10',
    },
];

// --- HELPER FUNCTIONS ---

/**
 * Returns a filtered list of indicators based on the project's theme.
 * Always includes GENERAL indicators + Specific Theme indicators.
 */
export function getIndicatorsByTheme(theme: string): Indicator[] {
    // Normalize theme string
    const targetTheme = theme.toUpperCase() === 'CAREER' ? 'CAREER' : 'FLN';

    return INDICATOR_LIBRARY.filter(
        (ind) => ind.theme === 'GENERAL' || ind.theme === targetTheme
    );
}

/**
 * Returns indicators relevant to a specific connection type.
 * e.g., If connecting Activity -> Output, show Output indicators.
 */
export function getIndicatorsByEdgeType(sourceType: string, targetType: string): Indicator[] {
    // Logic: 
    // Intervention -> Stakeholder = Process Indicator (Measuring the action)
    // Stakeholder -> Outcome = Outcome Indicator (Measuring the result)

    if (targetType === 'outcome') {
        return INDICATOR_LIBRARY.filter(ind => ind.type === 'outcome');
    }

    if (sourceType === 'intervention') {
        return INDICATOR_LIBRARY.filter(ind => ind.type === 'process' || ind.type === 'output');
    }

    return INDICATOR_LIBRARY;
}
