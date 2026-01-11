import { Node, Edge } from 'reactflow';
import { LogicError } from '@/types/simulation'; // Assumes you defined this in simulation.ts

/**
 * Performs structural graph theory checks on the LFA.
 * Unlike the "Simulation Engine" which checks *semantic* meaning (burnout),
 * this checks *syntactic* correctness (loops, islands, broken links).
 */
export function validateGraphStructure(nodes: Node[], edges: Edge[]): LogicError[] {
  const errors: LogicError[] = [];

  // 1. CYCLE DETECTION (The "Infinite Loop" Check)
  // LFA logic is directed and acyclic (DAG). Loops imply bad logic.
  if (hasCycle(nodes, edges)) {
    errors.push({
      id: 'structure-cycle',
      title: 'Infinite Loop Detected',
      message: 'Your logic flows in a circle (A leads to B, which leads back to A). Impact logic must flow forward from Activity to Goal.',
      severity: 'critical',
      fixSuggestion: 'Trace your arrows and remove the backward connection.',
    });
  }

  // 2. ISOLATED ISLANDS (The "Fragmentation" Check)
  // All nodes (except maybe explicit Comments) should be connected to the main graph.
  // We use a Union-Find or BFS approach to count connected components.
  if (isFragmented(nodes, edges)) {
    errors.push({
      id: 'structure-fragment',
      title: 'Disconnected Logic Islands',
      message: 'You have clusters of nodes that are completely separate from each other.',
      severity: 'warning',
      fixSuggestion: 'Ensure all parts of your project connect to the main Goal or Outcome.',
    });
  }

  // 3. INVALID CONNECTIONS (The "Grammar" Check)
  // Rules for edge direction based on Node Types
  edges.forEach(edge => {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);

    if (!source || !target) return;

    // Rule: Outcomes cannot lead to Activities (Backward flow)
    if (source.type === 'outcome' && target.type === 'intervention') {
      errors.push({
        id: `inv-edge-${edge.id}`,
        edgeId: edge.id,
        title: 'Backward Logic Flow',
        message: 'An Outcome cannot lead to an Activity. Outcomes are results.',
        severity: 'critical',
        fixSuggestion: 'Reverse the direction of the arrow.',
      });
    }

    // Rule: Goals cannot lead to anything (They are the end)
    if (source.type === 'goal') {
      errors.push({
        id: `inv-edge-goal-${edge.id}`,
        edgeId: edge.id,
        title: 'Goal has Outgoing Connection',
        message: 'The Goal is the final destination. It should not lead to other nodes.',
        severity: 'warning',
        fixSuggestion: 'Remove the arrow pointing away from the Goal.',
      });
    }
  });

  return errors;
}

// --- HELPER: CYCLE DETECTION (DFS) ---
function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  
  // Build Adjacency List
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (adj.has(e.source)) {
      adj.get(e.source)?.push(e.target);
    }
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();

  for (const node of nodes) {
    if (detectCycleUtil(node.id, adj, visited, recStack)) {
      return true;
    }
  }
  return false;
}

function detectCycleUtil(
  nodeId: string, 
  adj: Map<string, string[]>, 
  visited: Set<string>, 
  recStack: Set<string>
): boolean {
  if (recStack.has(nodeId)) return true;
  if (visited.has(nodeId)) return false;

  visited.add(nodeId);
  recStack.add(nodeId);

  const children = adj.get(nodeId) || [];
  for (const child of children) {
    if (detectCycleUtil(child, adj, visited, recStack)) {
      return true;
    }
  }

  recStack.delete(nodeId);
  return false;
}

// --- HELPER: FRAGMENTATION CHECK (BFS/Flood Fill) ---
function isFragmented(nodes: Node[], edges: Edge[]): boolean {
  if (nodes.length <= 1) return false;

  const adj = new Map<string, string[]>();
  // Undirected graph for connectivity check
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    adj.get(e.target)?.push(e.source);
  });

  const visited = new Set<string>();
  
  // Start BFS from the first node
  const queue = [nodes[0].id];
  visited.add(nodes[0].id);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj.get(curr) || [];
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // If visited count != total nodes, we have islands
  return visited.size !== nodes.length;
}