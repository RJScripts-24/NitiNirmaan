'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Node, Edge } from '@/types/canvas'; // You'll define these in types/canvas.ts
import { STAKEHOLDERS } from '@/lib/inventory/stakeholders'; // We will assume this exists

// --- TYPES ---
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

// --- CONSTANTS ---
const MAX_INTERVENTIONS_PER_TEACHER = 3; // Hard limit for "Burden" check
const MAX_INTERVENTIONS_PER_OFFICIAL = 2; // Officials have less time

// --- MAIN ACTION: RUN PRE-MORTEM ---
export async function runSimulation(
  projectId: string,
  nodes: Node[],
  edges: Edge[]
): Promise<SimulationResult> {
  
  const errors: LogicError[] = [];
  let score = 100;

  // --- 1. ORPHAN NODE CHECK ---
  // "Every actor must play a role."
  nodes.forEach(node => {
    const hasConnection = edges.some(
      e => e.source === node.id || e.target === node.id
    );

    if (!hasConnection) {
      score -= 10;
      errors.push({
        id: `orphan-${node.id}`,
        nodeId: node.id,
        title: 'Orphan Entity Detected',
        message: `The node "${node.data.label}" is disconnected from the system.`,
        severity: 'critical',
        fixSuggestion: 'Connect this node to an Intervention or Output.',
      });
    }
  });

  // --- 2. THE LFA CHAIN CHECK (Logic Jumps) ---
  // Rule: Activity -> Practice Change/Output -> Outcome
  // "You can't just train teachers and expect grades to go up immediately."
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (sourceNode?.type === 'intervention' && targetNode?.type === 'outcome') {
      score -= 15;
      errors.push({
        id: `logic-jump-${edge.id}`,
        edgeId: edge.id,
        title: 'Logic Break: The "Miracle Jump"',
        message: `You connected an Activity directly to an Outcome. Training alone doesn't change grades; changes in behavior do.`,
        severity: 'critical',
        fixSuggestion: 'Insert a "Practice Change" or "Output" node in between.',
      });
    }
  });

  // --- 3. BANDWIDTH SIMULATOR (The "Burden" Check) ---
  // "Teachers are busy. If you give them 10 tasks, the program fails."
  const teacherId = nodes.find(n => n.data.label.toLowerCase().includes('teacher'))?.id;
  
  if (teacherId) {
    // Count incoming interventions/tasks assigned to the teacher
    const taskCount = edges.filter(e => e.target === teacherId).length;
    
    if (taskCount > MAX_INTERVENTIONS_PER_TEACHER) {
      score -= 20;
      errors.push({
        id: `burden-teacher`,
        nodeId: teacherId,
        title: 'System Stress: Teacher Burnout',
        message: `You have assigned ${taskCount} distinct interventions to the Teacher. This exceeds realistic bandwidth.`,
        severity: 'critical',
        fixSuggestion: 'Remove low-priority interventions or add "Volunteer" support.',
      });
    }
  }

  // --- 4. HIERARCHY CHECK (Indian Education System) ---
  // "If you are working in 50 schools, you need a BEO."
  const projectScale = 50; // In a real app, fetch this from Project Settings
  const hasBEO = nodes.some(n => n.data.label.includes('BEO') || n.data.label.includes('Block Officer'));

  if (projectScale > 10 && !hasBEO) {
    score -= 10;
    errors.push({
      id: `missing-authority`,
      title: 'Missing Authority Node',
      message: 'Your program covers 50+ schools but lacks Block Level approval (BEO).',
      severity: 'warning',
      fixSuggestion: 'Drag a "BEO" node from the Stakeholder panel to ensure compliance.',
    });
  }

  // --- 5. INDICATOR CHECK ---
  // "If you can't measure it, you can't manage it."
  edges.forEach(edge => {
    // Only check edges that represent "Action" (Intervention -> Stakeholder)
    const isActionEdge = nodes.find(n => n.id === edge.source)?.type === 'intervention';
    
    if (isActionEdge && (!edge.data?.indicators || edge.data.indicators.length === 0)) {
      score -= 5;
      errors.push({
        id: `missing-indicator-${edge.id}`,
        edgeId: edge.id,
        title: 'Undefined Measurement',
        message: 'This intervention has no success indicators.',
        severity: 'warning',
        fixSuggestion: 'Click the link and select an Indicator (e.g., "% Attendance").',
      });
    }
  });

  // --- CALCULATE FINAL STATUS ---
  const status = score === 100 ? 'success' : (score > 60 ? 'warning' : 'failure');

  // --- UPDATE DATABASE (Gamification) ---
  // We silently update the health score in the background
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookies().get(n)?.value } }
  );

  await supabase
    .from('projects')
    .update({ logic_health_score: Math.max(0, score) })
    .eq('id', projectId);

  return {
    status,
    score: Math.max(0, score),
    errors,
  };
}