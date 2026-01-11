// Simulation types

export type SimulationStatus = 'success' | 'warning' | 'failure';

export interface LogicError {
    id: string;
    nodeId?: string;
    edgeId?: string;
    title: string;
    message: string;
    severity: 'critical' | 'warning';
    fixSuggestion: string;
}

export interface SimulationResult {
    status: SimulationStatus;
    score: number; // 0-100 Logic Health Score
    errors: LogicError[];
}
