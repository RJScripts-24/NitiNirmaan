// Canvas types for graph representation (ReactFlow-compatible)

export interface NodeData {
    label: string;
    [key: string]: any;
}

export interface Node {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: NodeData;
}

export interface EdgeData {
    interactionType?: string;
    indicators?: Array<{ label: string; unit: string }>;
    [key: string]: any;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    data?: EdgeData;
}
