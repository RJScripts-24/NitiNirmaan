import { Node, Edge } from 'reactflow'; // Using standard ReactFlow types
import { STAKEHOLDER_LIBRARY } from '@/lib/inventory/stakeholders';
import { INTERVENTION_LIBRARY } from '@/lib/inventory/interventions';

// --- TYPES FOR THE LFA DOCUMENT ---

export interface LFAItem {
  id: string;
  statement: string; // The text label
  indicators: string[]; // How it's measured
  assumptions?: string; // Risks (e.g., "SMC members attend meetings")
}

export interface LFADocument {
  projectTitle: string;
  goal: LFAItem | null;
  outcomes: LFAItem[];
  outputs: LFAItem[];
  activities: {
    id: string;
    action: string;
    assignedTo: string; // Stakeholder Name
    inputs: string[]; // Budget, Time, Materials
  }[];
  risks: string[];
}

// --- THE TRANSFORMER LOGIC ---

export function transformGraphToLFA(
  projectTitle: string,
  nodes: Node[],
  edges: Edge[]
): LFADocument {
  
  const doc: LFADocument = {
    projectTitle,
    goal: null,
    outcomes: [],
    outputs: [],
    activities: [],
    risks: [],
  };

  // 1. Identify the GOAL (The "Root" of the tree)
  // Logic: The Outcome node with NO outgoing edges (nothing leads *from* it)
  // Or explicitly labeled "Goal"
  const goalNode = nodes.find(n => n.type === 'goal') || 
                   nodes.find(n => n.type === 'outcome' && !edges.some(e => e.source === n.id));

  if (goalNode) {
    doc.goal = {
      id: goalNode.id,
      statement: goalNode.data.label,
      indicators: getIndicatorsForNode(goalNode.id, edges, 'incoming'), // Indicators define success
    };
  }

  // 2. Identify OUTCOMES (Results)
  // Logic: Nodes of type 'outcome' (excluding the Goal)
  nodes
    .filter(n => n.type === 'outcome' && n.id !== doc.goal?.id)
    .forEach(node => {
      doc.outcomes.push({
        id: node.id,
        statement: node.data.label,
        indicators: getIndicatorsForNode(node.id, edges, 'incoming'),
      });
    });

  // 3. Identify OUTPUTS (Direct Deliverables)
  // Logic: Nodes of type 'output' OR inferred from connection types
  nodes
    .filter(n => n.type === 'output')
    .forEach(node => {
      doc.outputs.push({
        id: node.id,
        statement: node.data.label,
        indicators: getIndicatorsForNode(node.id, edges, 'incoming'),
      });
    });

  // 4. Identify ACTIVITIES (Interventions) & INPUTS (Resources)
  // Logic: Determine who does what and what it costs
  nodes
    .filter(n => n.type === 'intervention')
    .forEach(node => {
      // Find the Stakeholder responsible (Source of the edge leading TO this intervention)
      // OR Target of the edge leading FROM this intervention (depending on drawing style)
      // Standard Flow: Stakeholder -> Intervention -> Output
      
      const stakeholderEdge = edges.find(e => e.target === node.id); // Who drives this?
      const stakeholderNode = stakeholderEdge 
        ? nodes.find(n => n.id === stakeholderEdge.source) 
        : null;

      // Lookup Metadata from Master Inventory
      // (We assume node.data.inventoryId stores the ID from interventions.ts)
      const inventoryItem = INTERVENTION_LIBRARY.find(i => i.label === node.data.label) || null;
      
      const inputs = [];
      if (inventoryItem) {
        inputs.push(`Cost Level: ${inventoryItem.cost_level}`);
        inputs.push(`Complexity: ${inventoryItem.complexity}/5`);
      }
      if (stakeholderNode) {
        inputs.push(`Time: ${stakeholderNode.data.label}'s Bandwidth`);
      }

      doc.activities.push({
        id: node.id,
        action: node.data.label,
        assignedTo: stakeholderNode ? stakeholderNode.data.label : 'Unassigned',
        inputs: inputs,
      });
    });

  // 5. Identify RISKS (Assumptions)
  // Logic: Nodes specifically marked as 'risk' or 'assumption'
  // Or inferred from low-bandwidth stakeholders
  nodes
    .filter(n => n.type === 'risk')
    .forEach(node => {
      doc.risks.push(node.data.label);
    });

  return doc;
}

// --- HELPER: Extract Indicators from Edges ---
// In our Canvas, "Indicators" are properties of the connection line.
// e.g., Connection between "Training" and "Score" has property "Indicator: % Attendance"
function getIndicatorsForNode(nodeId: string, edges: Edge[], direction: 'incoming' | 'outgoing'): string[] {
  const relevantEdges = direction === 'incoming'
    ? edges.filter(e => e.target === nodeId)
    : edges.filter(e => e.source === nodeId);

  const indicators: string[] = [];

  relevantEdges.forEach(edge => {
    if (edge.data && edge.data.indicators) {
      // edge.data.indicators is an array of objects { label: string, unit: string }
      // We map it to a readable string
      if (Array.isArray(edge.data.indicators)) {
        edge.data.indicators.forEach((ind: any) => indicators.push(`${ind.label}`));
      }
    }
  });

  return indicators;
}