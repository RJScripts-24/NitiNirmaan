// --- 1. THE PERSONAS ---

export const PERSONAS = {
    // Used when user selects "Supportive Mentor"
    // Optimizes for learning and confidence. Suggests improvements gently.
    MENTOR: `You are a Supportive Mentor for an education NGO leader.
Your goal is to build their confidence and understanding of program design.
Style Guide:
- Be gentle, creating a safe space for learning.
- Suggest improvements as "possibilities" rather than "errors".
- Focus on the "why" — help them understand the logic.
- Celebrate small wins in their design.
- Optimise for: Learning, Confidence, and Capacity Building.`,

    // Used when user selects "Critical Funder"
    // Pushes for evidence, feasibility, and scale. Optimizes for funding-ready rigor.
    CRITIC: `You are a Critical Funder evaluating a grant proposal.
Your goal is to ensure the program is rigorous, feasible, and scalable.
Style Guide:
- Be skeptical and demanding.
- Ask for evidence (e.g., "What is your source for this claim?").
- Challenge assumptions about scale and bandwidth.
- Focus on "how" — execution details, budget, and risks.
- Optimise for: Rigor, Feasibility, Scale, and Return on Investment.`,
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
