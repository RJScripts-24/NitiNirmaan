import type { Node, Edge } from '../types/canvas.js'; // Assuming we can reuse these or similar types

// --- Types ---

export interface LFACell {
    narrative: string;
    indicators: string[];       // Objectively Verifiable Indicators (OVI)
    means_of_verification: string[]; // MoV
    assumptions_risks: string[]; // From 'risk' nodes or implicit assumptions
}

export interface LFADocument {
    goal: LFACell | null;              // The top level (Impact)
    outcomes: LFACell[];        // Level 2 (Purpose / Behavioral Shifts)
    outputs: LFACell[];         // Level 3 (Deliverables / Trained Numbers)
    activities: LFACell[];      // Level 4 (Process / Logistics)
}

// --- Helper Functions ---

const getConnectedParent = (nodeId: string, nodes: Node[], edges: Edge[]): Node | undefined => {
    // Find edge where target is nodeId (upstream is source)
    // Note: The prompt implies a hierarchy where Goal is top? 
    // Usually in LFA: Goal (Top) <- Outcome <- Output <- Activity (Bottom)
    // The prompt says "Find nodes of category bridge connected upstream to the Goal."
    // If Goal is Top, then "upstream" usually means "feeding into it".
    // Let's assume standard React Flow direction: Activity -> Output -> Outcome -> Goal
    // So "upstream" of Goal (sources pointing to Goal) are Outcomes.
    const edge = edges.find(e => e.target === nodeId);
    if (!edge) return undefined;
    return nodes.find(n => n.id === edge.source);
};

// Helper: Get all nodes connected to this node's input (Source -> Node)
const getUpstreamNodes = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
    const parentEdges = edges.filter(e => e.target === nodeId);
    return parentEdges.map(e => nodes.find(n => n.id === e.source)).filter((n): n is Node => !!n);
};

// Helper: Get all nodes connected to this node's output (Node -> Target)
const getDownstreamNodes = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
    const childEdges = edges.filter(e => e.source === nodeId);
    return childEdges.map(e => nodes.find(n => n.id === e.target)).filter((n): n is Node => !!n);
};

// --- Helper to get effective node type (handles React Flow custom nodes) ---
const getNodeType = (node: Node): string => {
    // React Flow stores all custom nodes as type: 'customNode'
    // The actual type is in node.data.type
    return node.data?.type || node.type || node.id || '';
};

// --- Main Compiler ---

export const compileCareerGraphToLFA = (nodes: Node[], edges: Edge[]): LFADocument => {
    const lfa: LFADocument = {
        goal: null,
        outcomes: [],
        outputs: [],
        activities: [],
    };

    // --- Step B: Level 1 - The Goal (Impact) ---
    // Search: Find node of type sustainable_income OR self_employment
    const goalNode = nodes.find(n => {
        const nodeType = getNodeType(n);
        return nodeType === 'sustainable_income' || nodeType === 'self_employment';
    });

    if (!goalNode) {
        throw new Error("Graph must have a Goal node (Sustainable Income or Self Employment).");
    }

    const goalData = goalNode.data;
    let goalNarrative = '';
    let goalIndicators: string[] = [];
    let goalMoV: string[] = [];

    const goalType = getNodeType(goalNode);
    if (goalType === 'sustainable_income') {
        const salary = goalData.target_salary || '[TARGET_SALARY]';
        const retention = goalData.retention_period || '[PERIOD]';
        goalNarrative = `Youth achieve sustainable income > INR ${salary}`;
        goalIndicators.push(`Retention rate at ${retention} > 70%`);
        goalMoV.push('Salary Slips / Bank Statements / Tracking Call Logs');

    } else if (goalType === 'self_employment') {
        goalNarrative = "Youth establish viable micro-enterprises";
        // Prompt didn't specify indicators for Self-Emp but let's infer reasonable defaults or use generic
        goalIndicators.push(`Average Monthly Profit > INR ${goalData.avg_monthly_profit || 0}`);
        goalMoV.push('Business Ledgers / Bank Statements');
    }

    lfa.goal = {
        narrative: goalNarrative,
        indicators: goalIndicators,
        means_of_verification: goalMoV,
        assumptions_risks: []
    };

    // --- Step C: Level 2 - Outcomes (Readiness & Linkages) ---
    // Search: Find nodes of category 'bridge' connected upstream to the Goal.
    // Logic: Node -> Goal
    const bridgeTypes = ['aspiration_alignment', 'family_consent', 'interview_readiness'];
    const outcomeNodes = getUpstreamNodes(goalNode.id, nodes, edges).filter(n => {
        const nodeType = getNodeType(n);
        return n.data?.category === 'bridge' || bridgeTypes.includes(nodeType);
    });

    outcomeNodes.forEach(node => {
        const data = node.data;
        const cell: LFACell = {
            narrative: '',
            indicators: [],
            means_of_verification: [],
            assumptions_risks: []
        };

        const nodeType = getNodeType(node);
        if (nodeType === 'aspiration_alignment') {
            cell.narrative = `Youth aspirations aligned with market reality (${data?.final_match || 'Matched'})`;
            cell.indicators.push('Aspiration Match Score > 80%'); // Default added
            cell.means_of_verification.push('Counseling Records');
        } else if (nodeType === 'family_consent') {
            cell.narrative = "Families approve migration for work";
            cell.indicators.push("100% Consent Forms Signed");
            cell.means_of_verification.push('Signed Consent Forms');
        } else if (nodeType === 'interview_readiness') {
            cell.narrative = "Youth demonstrate workplace professionalism";
            cell.indicators.push(`Mock Interview Score > ${data?.mock_score_avg || 0}`);
            cell.means_of_verification.push('Mock Interview Rubrics');
        }

        if (cell.narrative) {
            lfa.outcomes.push(cell);
        }
    });


    // --- Step D: Level 3 - Outputs (The Deliverables) ---
    // Search: Find nodes of category 'intervention' connected upstream to Outcomes.
    // Logic: Intervention -> Outcome
    // We need to look at all outcome nodes we found, and find their parents.
    // OR we can iterate all interventions and see if they connect to an outcome.

    // Let's iterate all Intervention nodes to build unique Outputs/Activities
    const interventionTypes = ['tech_bootcamp', 'job_fair', 'internship_ojt', 'career_counseling', 'mock_interview', 'migration_support', 'tracking_call'];
    const interventionNodes = nodes.filter(n => {
        const nodeType = getNodeType(n);
        return n.data?.category === 'intervention' || interventionTypes.includes(nodeType);
    });

    interventionNodes.forEach(node => {
        const data = node.data;
        const nodeType = getNodeType(node);

        // --- OUTPUTS ---
        const outputCell: LFACell = {
            narrative: '',
            indicators: [],
            means_of_verification: [],
            assumptions_risks: []
        };

        let isOutput = false;

        if (nodeType === 'tech_bootcamp') {
            outputCell.narrative = `Youth certified in ${data.curriculum_standard || 'Standard'} curriculum`;
            outputCell.indicators.push("# of certificates issued");
            outputCell.means_of_verification.push("Training Certificates");
            isOutput = true;
        } else if (nodeType === 'job_fair') {
            outputCell.narrative = `Market linkages established with ${data.employer_count || 0} employers`;
            outputCell.indicators.push("# of offer letters generated");
            outputCell.means_of_verification.push("Event Report");
            isOutput = true;
        } else if (nodeType === 'internship_ojt') {
            outputCell.narrative = `Apprenticeships completed (${data.duration_weeks || 0} weeks)`;
            outputCell.indicators.push("% Completion of OJT");
            outputCell.means_of_verification.push("OJT Completion Log");
            isOutput = true;
        }

        if (isOutput) {
            lfa.outputs.push(outputCell);
        }

        // --- ACTIVITIES ---
        // Same nodes map to activities too
        const activityCell: LFACell = {
            narrative: '',
            indicators: [], // Activities usually process indicators like "Hours conducted"
            means_of_verification: [],
            assumptions_risks: []
        };

        if (nodeType === 'tech_bootcamp') {
            activityCell.narrative = `Conduct ${data.hours || 0} hours of technical training`;
        } else if (nodeType === 'job_fair') {
            activityCell.narrative = "Organize placement drives";
        } else if (nodeType === 'migration_support') {
            activityCell.narrative = "Provide housing/travel support";
        } else if (nodeType === 'internship_ojt') {
            activityCell.narrative = "Facilitate OJT placements"; // Added for consistency
        }

        if (activityCell.narrative) {
            // Map Assumptions (step E)
            // Find risk nodes connected to this intervention. 
            // Warning: Prompt says "Risk nodes connected to this intervention". 
            // In graph: Risk -> Intervention (Risk affects Intervention) or Intervention -> Risk?
            // Usually Risk is a floater or points to the node it modifies. Let's assume Risk -> Intervention.
            const riskTypes = ['market_slump', 'migration_shock', 'wage_mismatch'];
            const riskNodes = getUpstreamNodes(node.id, nodes, edges).filter(n => {
                const riskNodeType = getNodeType(n);
                return n.data?.category === 'risk' || riskTypes.includes(riskNodeType);
            });

            riskNodes.forEach(risk => {
                activityCell.assumptions_risks.push(`Assumption: ${risk.data.mitigation_plan || 'Mitigated'} (Risk: ${risk.id})`);
            });

            // Implicit Assumption
            if (nodeType === 'job_fair') {
                activityCell.assumptions_risks.push("Local employers willing to hire freshers");
            }

            // Warning Check
            if (nodeType === 'tech_bootcamp') {
                // Check if job_fair or internship exists in the whole graph
                const hasLinkage = nodes.some(n => {
                    const t = getNodeType(n);
                    return t === 'job_fair' || t === 'internship_ojt';
                });
                if (!hasLinkage) {
                    activityCell.narrative += " [WARNING: Training exists without Market Linkage]";
                }
            }

            lfa.activities.push(activityCell);
        }
    });

    return lfa;
};
