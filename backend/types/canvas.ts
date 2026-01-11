// Node & Edge Types
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

// --- ENUMS & UNIONS ---

export type NodeType = 
  | 'stakeholder'    // The Actors (Teacher, BEO)
  | 'intervention'   // The Actions (Training, Kits)
  | 'output'         // Immediate results (Books distributed)
  | 'outcome'        // Mid-term results (Reading improved)
  | 'goal'           // Long-term impact (NIPUN Bharat achieved)
  | 'risk'           // Assumption/Risk node
  | 'comment';       // Sticky note

export type NodeStatus = 'normal' | 'error' | 'success' | 'warning';

// --- DATA INTERFACES (The "Payload" inside each node) ---

export interface NodeData {
  // Visual Label
  label: string;
  
  // Logic Identity
  inventoryId?: string; // Links to the Master Inventory (e.g., 'sh_teacher')
  type: NodeType;
  
  // Game Mechanics (Populated from Inventory)
  bandwidth?: number;      // For Stakeholders (Max 3 tasks)
  currentLoad?: number;    // Calculated during Simulation
  cost_level?: 'LOW' | 'MEDIUM' | 'HIGH'; // For Interventions
  complexity?: number;     // 1-5 Scale
  
  // UI State
  status?: NodeStatus;     // e.g. Turns red if 'orphan' or 'overburdened'
  errorMessage?: string;   // Tooltip text if validation fails
  
  // Dynamic Content (Editable by user)
  notes?: string;
  customProps?: Record<string, any>; // Flexible bucket for future features
}

export interface EdgeData {
  // Interaction Logic
  interactionType?: 'delivers' | 'monitors' | 'leads_to' | 'requires';
  
  // Measurement (The "Indicator" lives on the line)
  indicators?: {
    id: string;
    label: string;
    unit: string;
    targetValue?: number; // e.g., Target: 80%
  }[];
  
  // UI State
  animated?: boolean; // True if data is flowing (Simulation running)
  strokeColor?: string;
}

// --- FINAL EXPORTED TYPES ---

// We extend the generic ReactFlow types to enforce our strict Data structure
export type Node = ReactFlowNode<NodeData>;
export type Edge = ReactFlowEdge<EdgeData>;

// A helper for the "Palette" items (the sidebar drag-and-drop items)
export interface PaletteItem {
  label: string;
  type: NodeType;
  inventoryId: string; // The ID to look up in lib/inventory/
  icon?: React.ComponentType<any>; // Icon component
  description?: string;
}