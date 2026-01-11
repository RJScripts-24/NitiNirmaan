// --- 1. THE PERSONAS ---

export const PERSONAS = {
    // Used in the Chat Widget (Bottom Right)
    // Friendly, Socratic, guiding.
    MENTOR: `You are the 'NitiNirmaan Architect Companion', an expert AI guide for education NGOs in India.
Your goal is to help Program Managers design robust logical frameworks (LFAs) using the Shikshagraha 'Common LFA' standard.

Style Guide:
- Be encouraging but Socratic. Don't give answers; ask guiding questions.
- Use Indian education terminology (CRP, BEO, DIET, FLN, Anganwadi).
- If the user is stuck, suggest a "Stakeholder" they might have missed.
- Keep responses short (under 3 sentences) unless asked for a deep dive.`,

    // Used in the Simulation Engine (The "Boss Battle")
    // Strict, analytical, finds logic gaps.
    CRITIC: `You are a strict, analytical 'Impact Evaluator' for a major grant funder.
You are reviewing a program design submission. Your job is to find FLAWS in the logic.
You do not care about good intentions; you care about feasibility, bandwidth, and causal links.

Core Rules to Enforce:
1. "The Miracle Jump": Activities (Training) do not cause Outcomes (Better Grades) directly. There must be a 'Practice Change' in between.
2. "Bandwidth": A single teacher cannot handle more than 3 distinct new interventions.
3. "Hierarchy": You cannot scale to 50+ schools without involving Block/District officials (BEO/DEO).`,
};

// --- 2. THEME-SPECIFIC KNOWLEDGE ---

export const THEME_PROMPTS = {
    FLN: `Context: Foundational Literacy and Numeracy (FLN).
Key Indicators: NIPUN Bharat goals, oral reading fluency, simple subtraction.
Key Interventions: Library kits, structured pedagogy, remedial classes.
Key Stakeholders: Anganwadi Worker, Primary Teacher, CRC.`,

    CAREER: `Context: School-to-Work Transition / Career Readiness.
Key Indicators: Student agency, exposure to careers, vocational skills, apprenticeship linkage.
Key Interventions: Career melas, role model interactions, industry visits.
Key Stakeholders: Headmaster (for permissions), Vocational Trainer, Local Business Owners.`,
};

// --- 3. DYNAMIC PROMPT BUILDERS ---

/**
 * Builds the prompt for the "Simulation Engine" to validate the graph.
 * This converts the visual node graph into a text story the AI can critique.
 */
export function buildSimulationPrompt(nodes: any[], edges: any[], theme: string) {
    // Convert the raw JSON graph into a readable story for the AI
    const graphStory = `
    Project Theme: ${theme}
    
    The System Design:
    - Stakeholders Involved: ${nodes.filter(n => n.type === 'stakeholder').map(n => n.data.label).join(', ')}
    - Interventions Planned: ${nodes.filter(n => n.type === 'intervention').map(n => n.data.label).join(', ')}
    - Intended Outcomes: ${nodes.filter(n => n.type === 'outcome').map(n => n.data.label).join(', ')}
    
    Connections:
    ${edges.map(e => {
        const source = nodes.find(n => n.id === e.source)?.data.label;
        const target = nodes.find(n => n.id === e.target)?.data.label;
        return `- ${source} interacts with ${target} (Method: ${e.data?.interactionType || 'Unknown'})`;
    }).join('\n')}
  `;

    return `${PERSONAS.CRITIC}

${theme === 'FLN' ? THEME_PROMPTS.FLN : THEME_PROMPTS.CAREER}

Analyse the following program design data.
Return a JSON object with a list of "Logic Errors".
Focus on: Disconnected nodes, overburdened stakeholders, and vague indicators.

Data:
${graphStory}`;
}
