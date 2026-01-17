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

    // --- Level 1 - The Goal (Impact) ---
    // Derived from 'sustainable_income' or 'self_employment' node.
    const goalNode = nodes.find(n => {
        const nodeType = getNodeType(n);
        return nodeType === 'sustainable_income' || nodeType === 'self_employment';
    });

    if (goalNode) {
        const goalData = goalNode.data;
        lfa.goal = {
            narrative: goalData.label || '',
            indicators: goalData.indicators ? [goalData.indicators] : [],
            means_of_verification: goalData.mov ? [goalData.mov] : [],
            assumptions_risks: goalData.assumptions ? [goalData.assumptions] : []
        };
    } else {
        // No goal node, return empty goal
        lfa.goal = {
            narrative: '',
            indicators: [],
            means_of_verification: [],
            assumptions_risks: []
        };
    }

    // --- Level 2 - Outcomes (Practice) ---
    // Derived from bridge nodes like 'aspiration_alignment', 'interview_readiness', 'family_consent'
    const bridgeTypes = ['aspiration_alignment', 'family_consent', 'interview_readiness', 'soft_skills'];
    const outcomeNodes = nodes.filter(n => bridgeTypes.includes(getNodeType(n)));

    outcomeNodes.forEach(node => {
        const data = node.data;
        lfa.outcomes.push({
            narrative: data.label || '',
            indicators: data.indicators ? [data.indicators] : [],
            means_of_verification: data.mov ? [data.mov] : [],
            assumptions_risks: data.assumptions ? [data.assumptions] : []
        });
    });

    // --- Level 3 - Outputs (Deliverables) ---
    // Derived from intervention nodes like 'tech_bootcamp', 'job_fair', 'career_counseling'
    const interventionTypes = ['tech_bootcamp', 'job_fair', 'internship_ojt', 'career_counseling'];
    const outputNodes = nodes.filter(n => interventionTypes.includes(getNodeType(n)));

    outputNodes.forEach(node => {
        const data = node.data;
        lfa.outputs.push({
            narrative: data.label || '',
            indicators: data.indicators ? [data.indicators] : [],
            means_of_verification: data.mov ? [data.mov] : [],
            assumptions_risks: data.assumptions ? [data.assumptions] : []
        });
    });

    // --- Level 4 - Activities (Inputs) ---
    // Derive from same intervention nodes
    outputNodes.forEach(node => {
        const data = node.data;
        lfa.activities.push({
            narrative: data.activity_description || data.label || '',
            indicators: data.budget ? [`Budget: INR ${data.budget}`] : [],
            means_of_verification: data.activity_mov ? [data.activity_mov] : [],
            assumptions_risks: data.activity_risks ? [data.activity_risks] : []
        });
    });

    return lfa;
};
