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
    // User Requirement: "Youth achieve sustainable livelihoods."
    // Trigger: Presence of 'sustainable_income' or 'self_employment' node.
    const goalNode = nodes.find(n => {
        const nodeType = getNodeType(n);
        return nodeType === 'sustainable_income' || nodeType === 'self_employment';
    });

    if (!goalNode) {
        // Fallback for simulation safety, but ideally should throw or warn.
        // We will return a partial LFA so the frontend doesn't crash, but with a warning in indicators.
        lfa.goal = {
            narrative: "Youth achieve sustainable livelihoods.",
            indicators: ["Warning: Add 'Sustainable Income' node to define targets."],
            means_of_verification: ["Salary Slips / Bank Statements"],
            assumptions_risks: ["Assumption: Local industry demand exists."]
        };
    } else {
        const goalData = goalNode.data;
        lfa.goal = {
            narrative: "Youth achieve sustainable livelihoods.",
            indicators: [
                "Target youth secure and retain formal employment or sustainable self-employment.",
                "% of youth placed in jobs retaining them for >6 months.",
                `Avg. Monthly Income increase (Pre vs Post).`
            ],
            means_of_verification: ["Salary Slips / Bank Statements", "6-Month Tracking Call Log"],
            assumptions_risks: ["Risk: Economic recession reduces hiring.", "Assumption: Local industry demand exists."]
        };
    }

    // --- Step C: Level 2 - Outcomes (Practice) ---
    // User Requirement: "Youth demonstrate workplace readiness."
    // Trigger: Any bridge nodes (aspiration, interview, etc.) or just default for this mode.
    // We will verify if relevant nodes exist to make it dynamic.
    const hasReadinessNodes = nodes.some(n =>
        ['interview_readiness', 'soft_skills', 'tech_bootcamp'].includes(getNodeType(n))
    );

    if (hasReadinessNodes) {
        lfa.outcomes.push({
            narrative: "Youth demonstrate workplace readiness.",
            indicators: [
                "Youth acquire technical skills AND professional soft skills (communication/punctuality).",
                "% of youth passing Mock Interviews.",
                "% of youth with 90% attendance in training."
            ],
            means_of_verification: ["Mock Interview Scorecards", "Training Center Biometrics"],
            assumptions_risks: ["Risk: Youth drop out due to migration/family pressure.", "Assumption: Families support female employment."]
        });
    }

    // --- Step D: Level 3 - Outputs (Deliverables) ---
    // User Requirement: 
    // 1. Skilling: Training Batches completed.
    // 2. Linkages: Job Fairs organized.
    // 3. Counseling: Career goals mapped.

    // 1. Skilling
    const skillingNode = nodes.find(n => getNodeType(n) === 'tech_bootcamp');
    if (skillingNode) {
        lfa.outputs.push({
            narrative: "1. Skilling: Training Batches completed.",
            indicators: ["# of Youth Certified (NSDC)."],
            means_of_verification: ["Certification Database"],
            assumptions_risks: ["Assumption: Training centers meet infrastructure norms."]
        });
    }

    // 2. Linkages
    const linkageNode = nodes.find(n => ['job_fair', 'internship_ojt'].includes(getNodeType(n)));
    if (linkageNode) {
        lfa.outputs.push({
            narrative: "2. Linkages: Job Fairs organized.",
            indicators: ["# of Offer Letters generated."],
            means_of_verification: ["Offer Letter Copies"],
            assumptions_risks: []
        });
    }

    // 3. Counseling
    const counselingNode = nodes.find(n => ['career_counseling', 'aspiration_alignment'].includes(getNodeType(n)));
    if (counselingNode) {
        lfa.outputs.push({
            narrative: "3. Counseling: Career goals mapped.",
            indicators: ["# of Counseling sessions held."],
            means_of_verification: ["Counselor Logs"],
            assumptions_risks: []
        });
    }

    // --- Step E: Level 4 - Activities (Inputs) ---
    // User Requirement:
    // • Mobilize youth (Door-to-door).
    // • Conduct 300-hour Bootcamp.
    // • Organize Industry Exposure Visits.

    // Mobilization (Always added if we have any inputs, or check for mobilization node)
    lfa.activities.push({
        narrative: "• Mobilize youth (Door-to-door).",
        indicators: ["Mobilization Reports"],
        means_of_verification: ["Mobilization Database"],
        assumptions_risks: ["Risk: Mobilizers face community resistance."]
    });

    if (skillingNode) {
        lfa.activities.push({
            narrative: `• Conduct ${skillingNode.data.hours || '300'}-hour Bootcamp.`,
            indicators: ["Budget: INR [Amount]", "Timeline: [Dates]"],
            means_of_verification: ["Transport/Event Vouchers"],
            assumptions_risks: []
        });
    }

    if (linkageNode) {
        lfa.activities.push({
            narrative: "• Organize Industry Exposure Visits.",
            indicators: ["Budget: INR [Amount]"],
            means_of_verification: ["Transport Vouchers"],
            assumptions_risks: []
        });
    }

    return lfa;
};
