// --- ENUMS ---

export type SimulationStatus = 'success' | 'warning' | 'failure';

export type ErrorSeverity = 'critical' | 'warning' | 'info';

// --- THE ERROR OBJECT ---
// This is what the user sees in the "Diagnostics Panel"

export interface LogicError {
  id: string; // Unique ID for the error instance
  
  // Location of the error
  nodeId?: string; // If the error is specific to a node (e.g., "Teacher Overloaded")
  edgeId?: string; // If the error is a connection issue (e.g., "Logic Jump")
  
  // The content
  title: string;       // Short header (e.g., "Bandwidth Exceeded")
  message: string;     // Detailed explanation
  severity: ErrorSeverity;
  
  // The Gamified Feedback
  fixSuggestion: string; // Actionable advice (e.g., "Add a Volunteer node")
  impactScore: number;   // How much this error hurts the total score (e.g., -10)
}

// --- THE REPORT CARD ---
// This is the full response returned by actions/simulation-actions.ts

export interface SimulationResult {
  projectId: string;
  timestamp: string;
  
  // High-level Status
  status: SimulationStatus;
  overallScore: number; // 0 to 100
  
  // Detailed Breakdown
  errors: LogicError[];
  
  // Gamification Stats
  metrics: {
    totalCost: 'LOW' | 'MEDIUM' | 'HIGH';
    complexityScore: number; // Average complexity of interventions
    stakeholderLoad: Record<string, number>; // Map of "Teacher": 120% load
  };
}