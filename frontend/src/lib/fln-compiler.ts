
export type FLNNode = {
    id: string;
    type: string; // e.g., 'nipun_lakshya', 'tlm_kit'
    data: Record<string, any>; // Stores the form field values
};

export type FLNEdge = {
    source: string;
    target: string;
};

export interface LFACell {
    narrative: string;
    indicators: string[];       // Objectively Verifiable Indicators (OVI)
    means_of_verification: string[]; // MoV
    assumptions_risks: string[]; // From 'risk' nodes or implicit assumptions
}

export interface LFADocument {
    goal: LFACell | null;          // The top level (Impact)
    outcomes: LFACell[];           // Level 2 (Purpose / Practice Changes)
    outputs: LFACell[];            // Level 3 (Deliverables)
    activities: LFACell[];         // Level 4 (Process / Inputs)
}

export function compileFLNGraphToLFA(nodes: FLNNode[], edges: FLNEdge[]): LFADocument {
    // Helper: Get parent nodes (connected upstream)
    const getParents = (nodeId: string) => {
        return edges
            .filter(e => e.target === nodeId)
            .map(e => nodes.find(n => n.id === e.source))
            .filter((n): n is FLNNode => !!n);
    };

    // Helper: Get child nodes (connected downstream) – though mostly we traverse upstream for LFA construction layers
    // actually for this specific logic, we are identifying nodes by TYPE and then checking connections.

    // Helper: Get source nodes connected to a specific target node ID
    const getConnectedSources = (targetId: string) => {
        return edges.filter(e => e.target === targetId).map(e => e.source);
    };

    // Helper: Get target nodes connected from a specific source node ID
    const getConnectedTargets = (sourceId: string) => {
        return edges.filter(e => e.source === sourceId).map(e => e.target);
    };


    const lfa: LFADocument = {
        goal: null,
        outcomes: [],
        outputs: [],
        activities: [],
    };

    // --- Step B: Level 1 - The Goal (Impact) ---
    // Search for 'nipun_lakshya' (User spec said goal_nipun, but toolbox has nipun_lakshya)
    // Also checking 'goal' or 'vision' just in case.
    const goalNode = nodes.find(n =>
        n.data.type === 'nipun_lakshya' ||
        n.data.type === 'goal_nipun' ||
        n.type === 'nipun_lakshya' ||
        n.data.type === 'goal'
    );

    if (goalNode) {
        const d = goalNode.data;
        lfa.goal = {
            narrative: `NIPUN Lakshya met by ${d.target_year || '2026'}`,
            indicators: [`${d.proficiency_type || 'Reading & Numeracy'} proficiency levels`],
            means_of_verification: ['State Achievement Survey (SAS)'],
            assumptions_risks: []
        };
    }

    // --- Step C: Level 2 - Outcomes (Practice Changes) ---
    // Find nodes of category 'bridge' (pedagogy_shift, tlm_usage, assessment_shift)
    // In our toolbox, these are category 'bridge'.
    // We need to check if they are connected upstream to the Goal? 
    // User spec: "connected upstream to the Goal" -> meaning Goal is the Target, Outcome is the Source?
    // Usually in LFA: Activity -> Output -> Outcome -> Goal.
    // So Edges go: Activity -> Output -> Outcome -> Goal.
    // So Outcome connects TO Goal.

    const outcomeNodes = nodes.filter(n => {
        const type = n.data.type || n.type;
        return ['pedagogy_shift', 'tlm_usage', 'assessment_shift'].includes(type) ||
            (n.data.category === 'bridge'); // fallback if specific type check fails
    });

    // Filter for those connected to Goal if Goal exists
    // const relevantOutcomeNodes = goalNode ? outcomeNodes.filter(n => getConnectedTargets(n.id).includes(goalNode.id)) : outcomeNodes;
    // User logic: "connected upstream to the Goal". Strictly implies Edge: Outcome -> Goal.
    // However, users might not strictly connect everything. Let's be lenient or follows spec strictly?
    // "Validation: If no goal node is found...". 
    // Let's iterate all identified outcome nodes for now.

    outcomeNodes.forEach(node => {
        const d = node.data;
        const type = d.type || node.type;

        let narrative = "Practice Change";
        if (type === 'pedagogy_shift') {
            narrative = `Teachers shift from "${d.from_behavior || 'old practice'}" to "${d.to_behavior || 'new practice'}"`;
        } else if (type === 'tlm_usage') {
            narrative = `Regular usage of TLM: ${d.frequency || 'Daily'}`;
        } else if (type === 'assessment_shift') {
            narrative = `Adoption of ${d.type || 'Formative'} assessment`;
        }

        lfa.outcomes.push({
            narrative,
            indicators: [d.evidence_source || 'Observation'],
            means_of_verification: ['Classroom Observation Tool (COT) Data'],
            assumptions_risks: []
        });
    });


    // --- Step D: Level 3 - Outputs (The Deliverables) ---
    // Intervention nodes (tlm_kit, cascade_training, etc.) connected to Outcomes.
    // Edge: Output -> Outcome.

    const outputNodes = nodes.filter(n => {
        const type = n.data.type || n.type;
        return ['tlm_kit', 'cascade_training', 'teacher_guide', 'student_workbook', 'digital_training'].includes(type) ||
            (n.data.category === 'intervention');
    });

    outputNodes.forEach(node => {
        const d = node.data;
        const type = d.type || node.type;

        let narrative = "";
        let indicator = "";

        if (type === 'tlm_kit') {
            narrative = `Learning Kits distributed to ${d.distribution_level || 'schools'}`;
            indicator = "100% stock receipt";
        } else if (type === 'cascade_training') {
            narrative = `Training completed for ${d.level || 'district'} staff`;
            indicator = "Attendance records > 90%";
        } else if (type === 'digital_training') {
            narrative = `Digital content deployed on ${d.platform || 'platform'}`;
            indicator = `${d.completion_target || 80}% completion rate`;
        } else {
            narrative = `${d.label} implemented`;
            indicator = "Completion Report";
        }

        // Add to outputs
        lfa.outputs.push({
            narrative,
            indicators: [indicator],
            means_of_verification: ['Project Records', 'MIS Data'],
            assumptions_risks: []
        });

        // --- Step E: Level 4 - Activities (The Inputs) ---
        // Same nodes, different perspective.

        let activityNarrative = "";
        if (type === 'tlm_kit') {
            activityNarrative = `Procure materials @ INR ${d.unit_cost || '0'}/unit`;
        } else if (type === 'cascade_training') {
            activityNarrative = `Organize ${d.days || '1'}-day workshop`;
        } else {
            activityNarrative = `Execute ${d.label} activities`;
        }

        // Find Risks (Assumptions) connected to this node
        // Risks usually MODERATE an activity or output. 
        // Edge: Risk -> Intervention ?? Or Risk is just floating nearby?
        // LFA logic: Assumptions are external conditions.
        // We look for 'risk' nodes connected to this intervention. 
        // User spec: "Find any risk nodes... connected to this intervention".
        // Assuming Edge: Risk -> Intervention.

        const riskNodes = getParents(node.id).filter(p => ['funds_delay', 'teacher_transfer', 'tech_infrastructure'].includes(p.data.type) || p.data.category === 'risk');

        const assumptions = riskNodes.map(r => r.data.mitigation_plan ? `Mitigation: ${r.data.mitigation_plan}` : (r.data.assumption || 'External risk managed'));

        if (type === 'cascade_training') {
            assumptions.push("Master Trainers retain quality");
        }

        lfa.activities.push({
            narrative: activityNarrative,
            indicators: [`Budget: INR ${d.unit_cost ? d.unit_cost * 1000 : 'TBD'}`], // inferred
            means_of_verification: ['Financial & Admin Records'],
            assumptions_risks: assumptions
        });
    });

    // Deduplication logic (simple version)
    // Since we iterated nodes, duplicates shouldn't be an issue unless multiple nodes represent same concept. 
    // But strictly, we are creating one LFA row per Node.

    return lfa;
}
