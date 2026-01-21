import { Router } from 'express';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import type { Node, Edge } from '../types/canvas.js';
import type { LogicError, SimulationResult, SimulationStatus } from '../types/simulation.js';
import { compileCareerGraphToLFA } from '../services/careerCompiler.js';
import { generateJSON } from '../lib/ai/groq.js';

export const simulationRouter = Router();

// --- CONSTANTS ---
const MAX_INTERVENTIONS_PER_TEACHER = 3; // Hard limit for "Burden" check

// --- RUN SIMULATION ---
// Using optionalAuthMiddleware to allow guest mode simulations
simulationRouter.post('/:projectId', optionalAuthMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient; // May be undefined in guest mode
        const projectId = req.params.projectId;
        const { nodes, edges, domain } = req.body as { nodes: Node[], edges: Edge[], domain?: string };

        if (!nodes || !edges) {
            return res.status(400).json({ error: 'Missing nodes or edges' });
        }

        // --- CAREER READINESS LOGIC ---
        if (domain === 'Career Readiness') {
            console.log('📊 [Simulation] Career Readiness mode detected');
            console.log('📊 [Simulation] ProjectId:', projectId);

            // DEBUG: Log full nodes to see structure
            console.log('🔍 [DEBUG] Nodes Payload:', JSON.stringify(nodes, null, 2));

            try {
                // 1. Compile Graph to LFA
                console.log('🔧 [Simulation] Compiling graph to LFA...');
                const lfa = compileCareerGraphToLFA(nodes, edges);
                console.log('✅ [Simulation] LFA compiled successfully:', JSON.stringify(lfa, null, 2));

                // 2. AI Analysis via Groq
                console.log('🤖 [Simulation] Calling Groq AI for analysis...');
                const systemPrompt = `You are an implementation expert for "School-to-Work" transition programs in India.
Analyze the provided Logical Framework Analysis (LFA) document.
Return a JSON object with:
- "shortcomings": string[] (Critical logic gaps, e.g., missing market linkages, unrealistic assumptions)
- "suggestions": string[] (Actionable improvements)
- "overallAssessment": string (Brief summary)
If the plan is solid, return empty arrays.`;

                const userPrompt = JSON.stringify(lfa, null, 2);
                const aiResult = await generateJSON(systemPrompt, userPrompt);
                console.log('✅ [Simulation] AI analysis result:', JSON.stringify(aiResult, null, 2));

                // 3. Construct Result
                const result = {
                    status: (aiResult?.shortcomings?.length || 0) > 0 ? 'warning' : 'success',
                    score: Math.max(0, 100 - ((aiResult?.shortcomings?.length || 0) * 10)),
                    lfa,
                    shortcomings: aiResult?.shortcomings || [],
                    suggestions: aiResult?.suggestions || [],
                    overallAssessment: aiResult?.overallAssessment || 'Analysis complete.',
                    errors: [] // Standard simulation errors (legacy format)
                };

                console.log('✅ [Simulation] Sending response with status:', result.status);
                return res.json(result);

            } catch (compilerError: any) {
                console.error('❌ [Simulation] Career Readiness error:', compilerError);
                console.error('❌ [Simulation] Error stack:', compilerError.stack);

                // Return structured error response instead of 400, so frontend can show it in the modal
                return res.json({
                    status: 'failure',
                    score: 0,
                    lfa: { goal: null, outcomes: [], outputs: [], activities: [] },
                    shortcomings: [compilerError.message],
                    suggestions: ["Place a 'Sustainable Income' or 'Self Employment' node to define your goal."],
                    overallAssessment: "Simulation cannot proceed due to critical logic gaps.",
                    errors: []
                });
            }
        }

        // --- FLN / DEFAULT LOGIC ---

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
        const teacherNode = nodes.find(n => n.data.label.toLowerCase().includes('teacher'));

        if (teacherNode) {
            // Count incoming interventions/tasks assigned to the teacher
            const taskCount = edges.filter(e => e.target === teacherNode.id).length;

            if (taskCount > MAX_INTERVENTIONS_PER_TEACHER) {
                score -= 20;
                errors.push({
                    id: `burden-teacher`,
                    nodeId: teacherNode.id,
                    title: 'System Stress: Teacher Burnout',
                    message: `You have assigned ${taskCount} distinct interventions to the Teacher. This exceeds realistic bandwidth.`,
                    severity: 'critical',
                    fixSuggestion: 'Remove low-priority interventions or add "Volunteer" support.',
                });
            }
        }

        // --- 4. HIERARCHY CHECK (Indian Education System) ---
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
        edges.forEach(edge => {
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
        const status: SimulationStatus = score === 100 ? 'success' : (score > 60 ? 'warning' : 'failure');

        // --- UPDATE DATABASE (Gamification) - only if authenticated ---
        if (supabase && projectId !== 'guest') {
            await supabase
                .from('projects')
                // @ts-ignore
                .update({ logic_health_score: Math.max(0, score) } as any)
                .eq('id', projectId);
        }

        const result: SimulationResult = {
            status,
            score: Math.max(0, score),
            errors,
        };

        res.json(result);

    } catch (error) {
        console.error('Simulation Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
