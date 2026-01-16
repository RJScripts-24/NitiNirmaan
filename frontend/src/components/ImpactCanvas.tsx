import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FLN_TOOLBOX, ToolNode } from '../config/domains/fln/toolbox';
import { CAREER_TOOLBOX } from '../config/domains/career/toolbox';
import { compileFLNGraphToLFA, LFADocument } from '../lib/fln-compiler';
import {
  ArrowRight,
  User,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Play,
  Settings,
  X,
  ChevronDown,
  Menu,
  Bot,
  AlertTriangle,
  GraduationCap,
  Users,
  BookOpen,
  Package,
  Smartphone,
  MessageSquare,
  DollarSign,
  Tablet,
  BookMarked,
  Building2,
  ClipboardList,
  School,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Share,
  Flag,
  Target,
  Check,
  Home,
  Handshake,
  Briefcase,
  Scale,
  Megaphone,
  FileCheck,
  ArrowRightCircle,
  TrendingUp,
  BarChart3,
  Coins,
  Dice1,
  Lock,
  Save,
  Trash2,
  Maximize2,
  Minimize2,
  Move,
  GripHorizontal,
  Download,
} from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

import HexagonBackground from './HexagonBackground';

interface ImpactCanvasProps {
  projectName?: string;
  onBack?: () => void;
  onSimulationComplete?: (results: { lfa: LFADocument; nodes: Node[]; edges: Edge[]; shortcomings: string[] }) => void;
  onSettings?: () => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  readOnly?: boolean;
}

// Node type colors (Generic Fallback)
const NODE_COLORS: Record<string, string> = {
  problemStatement: '#EF4444',
  vision: '#EF4444',
  stakeholder: '#6366F1',
  intervention: '#D97706',
  output: '#0D9488',
  practiceChange: '#0D9488',
  intermediateOutcome: '#0D9488',
  indicator: '#0D9488',
  outcome: '#047857',
  resourceCost: '#8B5CF6',
  assumption: '#8B5CF6',
  risk: '#8B5CF6',
  resource: '#475569',
};

// Category Colors (Shared)
const CATEGORY_COLORS: Record<string, string> = {
  foundation: '#EF4444', // Red
  foundations: '#EF4444', // Red (Alias)
  stakeholder: '#6366F1', // Indigo/Blue
  stakeholders: '#6366F1', // Indigo/Blue (Alias)
  intervention: '#D97706', // Amber/Orange
  interventions: '#D97706', // Amber/Orange (Alias)
  bridge: '#0D9488', // Teal
  logicBridge: '#0D9488', // Teal (Alias)
  risk: '#8B5CF6', // Purple
  modifiers: '#8B5CF6', // Purple (Alias)
};

const getNodeColor = (type: string): string => {
  // 1. Check direct mapping (legacy)
  if (NODE_COLORS[type]) return NODE_COLORS[type];

  // 2. Check FLN Toolbox
  const flnNode = FLN_TOOLBOX.find(n => n.id === type);
  if (flnNode) {
    return CATEGORY_COLORS[flnNode.category] || '#6B7280';
  }

  // 3. Check Career Toolbox
  const careerNode = CAREER_TOOLBOX.find(n => n.id === type);
  if (careerNode) {
    return CATEGORY_COLORS[careerNode.category] || '#6B7280';
  }

  return '#6B7280'; // Default Gray
};

// Initial nodes - outcome and some stakeholders pre-seeded
const initialNodes: Node[] = [
  {
    id: 'outcome-1',
    type: 'customNode',
    data: { label: 'Students can read grade 3 texts', type: 'outcome' },
    position: { x: 600, y: 300 },
    draggable: true,
  },
  {
    id: 'stakeholder-1',
    type: 'customNode',
    data: { label: 'Teacher', type: 'stakeholder' },
    position: { x: 200, y: 200 },
    draggable: true,
  },
];

const initialEdges: Edge[] = [];

// Define nodeTypes OUTSIDE the component to prevent re-creation on every render
// This is critical for ReactFlow drag functionality to work properly
const nodeTypes = {
  customNode: CustomNode,
};

export default function ImpactCanvas({
  projectName = 'FLN Improvement – Bihar (2026)',
  onBack,
  onSimulationComplete,
  onSettings,
  initialNodes: propNodes,
  initialEdges: propEdges,
  readOnly = false
}: ImpactCanvasProps) {
  // Use propNodes if available, otherwise fallback to default initialNodes or empty array
  const [nodes, setNodes, onNodesChange] = useNodesState(propNodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(propEdges || initialEdges); // Assuming initialEdges exists or should be empty array

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showAICompanion, setShowAICompanion] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulationResult, setShowSimulationResult] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState(projectName);
  const [toolboxCollapsed, setToolboxCollapsed] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [domain, setDomain] = useState<string>('');
  const [simulationData, setSimulationData] = useState<{ lfa: LFADocument; shortcomings: string[] } | null>(null);

  // Sync state if props change (for template selection) or load from Storage/DB
  useEffect(() => {
    // Load domain from localStorage
    const savedData = localStorage.getItem('current_mission_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.domain) setDomain(parsed.domain);
      } catch (e) {
        console.error("Error parsing mission data for domain", e);
      }
    }
    // 1. If props provided (Preview Mode), use them
    if (propNodes) {
      setNodes(propNodes);
      if (propEdges) setEdges(propEdges);
      return;
    }

    // 2. Check for active project ID (Auth Mode - Builder)
    const activeProjectId = localStorage.getItem('active_project_id');
    if (activeProjectId) {
      async function loadProject() {
        const { data: project } = await supabase.from('projects').select('*').eq('id', activeProjectId).single();
        if (project) setCurrentProjectName(project.title);

        const { data: nodesData, error: nodesError } = await supabase.from('nodes').select('*').eq('project_id', activeProjectId);
        const { data: edgesData, error: edgesError } = await supabase.from('edges').select('*').eq('project_id', activeProjectId);

        console.log('Fetching Project:', activeProjectId);
        if (nodesError) console.error('Nodes Error:', nodesError);
        console.log('Nodes Data:', nodesData?.length);

        if (nodesData) {
          setNodes(nodesData.map((n: any) => ({
            ...n,
            data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
            position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position
          })));
        }
        if (edgesData) setEdges(edgesData);
      }
      loadProject();
      return;
    }

    // 3. Guest Mode Loading logic
    const guestProjectRaw = localStorage.getItem('guest_active_project');
    if (guestProjectRaw) {
      const guestProject = JSON.parse(guestProjectRaw);
      if (guestProject.nodes) setNodes(guestProject.nodes);
      if (guestProject.edges) setEdges(guestProject.edges);
      if (guestProject.title) setCurrentProjectName(guestProject.title);
    }
  }, [propNodes, propEdges, setNodes, setEdges]);

  // Check if Problem Statement has been placed on canvas
  const hasProblemStatement = nodes.some(node =>
    node.data.type === 'problemStatement' ||
    node.data.type === 'learning_crisis' ||
    node.data.type === 'problem-statement' ||
    node.data.type === 'neet'
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // Add edge with better styling
      setEdges((eds) =>
        addEdge({
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6B7280', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6B7280',
            width: 30,
            height: 30,
          },
        }, eds)
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onNodeDoubleClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setShowInspector(true);
  }, []);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
    setShowInspector(false);
  }, [setNodes, setEdges]);

  // Context Menu State
  const [menu, setMenu] = useState<{ id: string; top: number; left: number; type: 'node' | 'edge' } | null>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (pane) {
        setMenu({
          id: node.id,
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
          type: 'node',
        });
      }
    },
    [setMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if (pane) {
        setMenu({
          id: edge.id,
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
          type: 'edge',
        });
      }
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const deleteElement = useCallback(() => {
    if (!menu) return;
    if (menu.type === 'node') {
      deleteNode(menu.id);
    } else if (menu.type === 'edge') {
      setEdges((eds) => eds.filter((edge) => edge.id !== menu.id));
    }
    setMenu(null);
  }, [menu, deleteNode, setEdges]);


  const handleRunSimulation = async () => {
    setIsSimulating(true);
    console.log('🚀 [Simulation] Starting...');

    // Get project ID or use 'guest' fallback for guest mode
    const activeProjectId = localStorage.getItem('active_project_id') || 'guest';

    try {
      // Use the unified backend endpoint
      const response = await fetch(`/api/simulation/${activeProjectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth
        },
        body: JSON.stringify({
          nodes,
          edges,
          domain // 'Career Readiness' or 'FLN'
        })
      });

      if (!response.ok) {
        throw new Error(`Backend simulation failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [Simulation] Backend result:', result);

      // Handle the unified result (works for both FLN and Career Readiness)
      if (result.lfa) {
        setSimulationData({
          lfa: result.lfa,
          shortcomings: result.shortcomings || []
        });
        setShowSimulationResult(true);

        if (onSimulationComplete) {
          onSimulationComplete({
            lfa: result.lfa,
            nodes,
            edges,
            shortcomings: result.shortcomings || []
          });
        }
      } else if (result.status === 'success' || (result.score && (!result.errors || result.errors.length === 0))) {
        // Fallback: Backend validated (success) but didn't return LFA object (Legacy/FLN behavior)
        // We compile locally.
        console.log('⚠️ [Simulation] Backend verified logic but returned no LFA. Generating locally...');

        let localLfa: LFADocument | null = null;

        // Try local compilation for FLN (or default)
        try {
          localLfa = compileFLNGraphToLFA(nodes, edges);
        } catch (err) {
          console.error("Local compilation failed", err);
        }

        if (localLfa) {
          setSimulationData({
            lfa: localLfa,
            shortcomings: result.shortcomings || [] // Use backend shortcomings if ANY, mostly empty for now
          });
          setShowSimulationResult(true);

          if (onSimulationComplete) {
            onSimulationComplete({
              lfa: localLfa,
              nodes,
              edges,
              shortcomings: result.shortcomings || []
            });
          }
        } else {
          // If we really can't generate an LFA (e.g. unknown domain and no backend support), show error
          alert("Simulation passed backend checks, but LFA generation failed.");
        }

      } else if (result.errors && result.errors.length > 0) {
        console.warn('⚠️ [Simulation] Backend returned errors instead of LFA:', result.errors);
        alert(`Simulation Issues Found:\n${result.errors.map((e: any) => `- ${e.message}`).join('\n')}`);
      }

    } catch (e) {
      console.error("❌ [Simulation] Failed:", e);
      // Fallback for FLN if backend isn't ready for it (optional, but good for safety)
      if (domain === 'FLN' || !domain) { // Added !domain fallback
        console.log('⚠️ [Simulation] Falling back to local FLN compilation...');
        const lfa = compileFLNGraphToLFA(nodes, edges); // Keep this helper available?
        const shortcomings: string[] = [];
        // ... simplistic fallback
        if (lfa) {
          setSimulationData({ lfa, shortcomings });
          setShowSimulationResult(true);
          // Also trigger complete if we want to allow bypass on error? 
          // Maybe not, but let's at least show the modal.
          if (onSimulationComplete) {
            onSimulationComplete({
              lfa,
              nodes,
              edges,
              shortcomings
            });
          }
        }
      } else {
        alert('Simulation failed. See console.');
      }
    } finally {
      setIsSimulating(false);
      console.log('🏁 [Simulation] Finished.');
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const nodeType = event.dataTransfer.getData('application/reactflow-nodetype');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get position from ReactFlow instance, or use fallback
      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }) || { x: 100, y: 100 };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'customNode',
        position,
        data: { label, type: nodeType },
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div
      className="h-screen text-gray-200 flex flex-col"
      style={{
        backgroundColor: '#111111',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.6) 100%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px),
          repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)
        `
      }}
    >
      {/* Texture applied via inline styles above */}

      {/* Top Toolbar */}
      <header className="bg-[#171B21] border-b border-[#1F2937] px-6 py-4 flex items-center justify-between z-10 relative overflow-hidden">
        {/* Hexagon Background */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <HexagonBackground
            className="w-full h-full"
            hexagonSize={28}
            hexagonMargin={2}
            glowMode="hover"
          />
        </div>

        {/* Left - Project Name */}
        <div className="flex items-center gap-4 relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <img
            src="/logo-2.png"
            alt="NitiNirmaan"
            className="h-12 w-auto object-contain"
          />
          {editingProjectName ? (
            <input
              type="text"
              value={currentProjectName}
              onChange={(e) => setCurrentProjectName(e.target.value)}
              onBlur={() => setEditingProjectName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingProjectName(false)}
              autoFocus
              className="px-3 py-1 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706]"
              style={{ pointerEvents: 'auto' }}
            />
          ) : (
            <Button
              variant="ghost"
              onClick={() => setEditingProjectName(true)}
              className="px-3 py-1 text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors h-auto font-normal"
              style={{ pointerEvents: 'auto' }}
            >
              {currentProjectName}
            </Button>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2 relative" style={{ zIndex: 10, pointerEvents: 'auto' }}>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]">
            <Undo2 className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]">
            <Redo2 className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
          <div className="w-px h-8 bg-[#374151] mx-2"></div>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]">
            <ZoomOut className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
          <span className="text-[#9CA3AF] text-sm min-w-[60px] text-center">60%</span>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]">
            <ZoomIn className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
        </div>

        {/* Right - Collaborators & Actions */}
        <div className="flex items-center gap-4 relative" style={{ zIndex: 10, pointerEvents: 'auto' }}>
          {/* Collaborators */}
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#D97706] border-2 border-[#171B21] flex items-center justify-center">
              <span className="text-xs text-white">JD</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#047857] border-2 border-[#171B21] flex items-center justify-center">
              <span className="text-xs text-white">AS</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#6B7280] border-2 border-[#171B21] flex items-center justify-center">
              <span className="text-xs text-white">MK</span>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]" onClick={onSettings}>
            <Settings className="w-5 h-5 text-[#9CA3AF]" />
          </Button>

          {/* Share Button */}
          <Button
            className="px-4 py-2 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] rounded font-medium transition-colors flex items-center gap-2 h-auto border border-[#2D3340]"
          >
            <Share className="w-4 h-4" />
            Share
          </Button>

          {/* Run Simulation */}
          <Button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`px-6 py-2 rounded font-semibold transition-colors flex items-center gap-2 h-auto border-none shadow-none ${isSimulating
              ? 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
              : 'bg-[#D97706] text-[#0F1216] hover:bg-[#B45309]'
              }`}
          >
            <Play className="w-4 h-4" />
            {isSimulating ? 'Running...' : 'Run Simulation'}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Logic Toolbox */}
        <LogicToolbox
          collapsed={toolboxCollapsed}
          onToggleCollapse={() => setToolboxCollapsed(!toolboxCollapsed)}
          isUnlocked={hasProblemStatement}
          domain={domain}
        />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            connectionMode={ConnectionMode.Loose}
            nodesDraggable={true}
            nodesConnectable={true}
            selectNodesOnDrag={false}
            panOnDrag={true}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            onInit={setReactFlowInstance}
          >
            <Background
              color="#333"
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              className="opacity-20"
            />
            <Controls
              className="bg-[#171B21] border border-[#2D3340] rounded"
              showInteractive={false}
            />
            {menu && (
              <div
                style={{ top: menu.top, left: menu.left }}
                className="absolute z-50 bg-[#1F2937] border border-[#374151] rounded shadow-xl p-1 w-32"
              >
                <button
                  className="w-full text-left px-2 py-1 text-sm text-red-400 hover:bg-[#374151] hover:text-red-300 rounded flex items-center gap-2 transition-colors"
                  onClick={deleteElement}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </ReactFlow>

          {/* Simulation Overlay */}
          {isSimulating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#D97706] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#E5E7EB] text-lg">Running simulation...</p>
                <p className="text-[#9CA3AF] text-sm mt-2">Analyzing logic chains and stress points</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Inspector */}
        <InspectorPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          show={showInspector}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
            setShowInspector(false);
          }}
          onUpdateNode={updateNodeData}
          onDeleteNode={deleteNode}
          domain={domain}
        />

        {/* AI Companion */}
        <AICompanionWidget
          show={showAICompanion}
          onToggle={() => setShowAICompanion(!showAICompanion)}
          nodes={nodes}
          edges={edges}
        />
      </div>

      {/* Simulation Results Modal */}
      {showSimulationResult && (
        <SimulationResultsModal
          onClose={() => setShowSimulationResult(false)}
          data={simulationData}
          nodes={nodes}
          edges={edges}
        />
      )}
    </div>
  );
}

// Custom Node Component
function CustomNode({ data }: { data: any }) {
  const backgroundColor = getNodeColor(data.type);

  return (
    <div
      className="group px-4 py-3 rounded-lg border-2 border-transparent hover:border-[#D97706] transition-all shadow-lg min-w-[120px] relative cursor-grab active:cursor-grabbing"
      style={{ backgroundColor }}
    >
      {/* Connection Handles - smaller and visible on hover */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !bg-[#9CA3AF] !border !border-[#E5E7EB] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-[#9CA3AF] !border !border-[#E5E7EB] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-[#9CA3AF] !border !border-[#E5E7EB] opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-[#9CA3AF] !border !border-[#E5E7EB] opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="text-[#E5E7EB] text-sm font-medium text-center select-none">{data.label}</div>
    </div>
  );
}

// LogicToolbox Component
function LogicToolbox({
  collapsed,
  onToggleCollapse,
  isUnlocked,
  domain
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isUnlocked: boolean;
  domain?: string;
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['foundations']);
  const [expandedSubSections, setExpandedSubSections] = useState<string[]>(['school']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleSubSection = (subSection: string) => {
    setExpandedSubSections(prev =>
      prev.includes(subSection)
        ? prev.filter(s => s !== subSection)
        : [...prev, subSection]
    );
  };

  // --- FLN SPECIFIC LOGIC ---
  const getIconForNode = (id: string) => {
    const map: Record<string, any> = {
      learning_crisis: Flag,
      attendance_crisis: Users,
      nipun_lakshya: Target,
      student_primary: GraduationCap,
      teacher_govt: BookOpen,
      headmaster: Building2,
      smc_member: Home,
      gram_pradhan: Megaphone,
      nodal_teacher: BookOpen,
      crcc: Handshake,
      brp: BookMarked,
      beo: Briefcase,
      diet_faculty: School,
      district_magistrate: Scale,
      scert_official: Building2,
      tlm_kit: Package,
      student_workbook: BookOpen,
      teacher_guide: BookOpen,
      cascade_training: GraduationCap,
      cluster_meeting: Users,
      digital_training: Smartphone,
      classroom_observation: ClipboardList,
      pedagogy_shift: RefreshCw,
      tlm_usage: Package,
      assessment_shift: FileCheck,
      funds_delay: DollarSign,
      teacher_transfer: RefreshCw,
      tech_infrastructure: Smartphone,
    };
    return map[id] || HelpCircle;
  };

  const getFlnNodes = (category: string) => {
    return FLN_TOOLBOX.filter(node => node.category === category).map(node => ({
      id: node.id,
      label: node.label,
      Icon: getIconForNode(node.id),
      type: node.id
    }));
  };

  // --- CAREER SPECIFIC LOGIC ---
  const getCareerIconForNode = (id: string) => {
    const map: Record<string, any> = {
      neet: Flag,
      sustainable_income: Target,
      self_employment: Briefcase,
      youth_candidate: GraduationCap,
      parent_guardian: Home,
      field_mobilizer: Megaphone,
      vocational_trainer: BookOpen,
      soft_skills_trainer: Users,
      center_manager: Building2,
      hr_manager: Briefcase,
      industry_mentor: Handshake,
      alumni: GraduationCap,
      tech_bootcamp: BookOpen,
      career_counseling: MessageSquare,
      mock_interview: Users,
      internship_ojt: Briefcase,
      job_fair: Building2,
      migration_support: Home,
      tracking_call: Smartphone,
      aspiration_alignment: RefreshCw,
      interview_readiness: Check,
      family_consent: FileCheck,
      market_slump: TrendingUp,
      migration_shock: Home,
      wage_mismatch: DollarSign,
    };
    return map[id] || HelpCircle;
  };

  const getCareerNodes = (category: string) => {
    return CAREER_TOOLBOX.filter(node => node.category === category).map(node => ({
      id: node.id,
      label: node.label,
      Icon: getCareerIconForNode(node.id),
      type: node.id
    }));
  };

  // --- DEFAULT LISTS ---
  const foundations = [
    { id: 'problem-statement', label: 'Problem Statement', Icon: Flag, type: 'problemStatement' },
    { id: 'vision', label: 'Vision / Impact', Icon: Target, type: 'vision' },
  ];

  const stakeholderLevels = {
    school: {
      title: 'School Level',
      items: [
        { id: 'student', label: 'Student', Icon: GraduationCap, type: 'stakeholder' },
        { id: 'teacher', label: 'Teacher', Icon: BookOpen, type: 'stakeholder' },
        { id: 'headmaster', label: 'Headmaster (HM)', Icon: Building2, type: 'stakeholder' },
        { id: 'smc-parent', label: 'SMC / Parent', Icon: Home, type: 'stakeholder' },
      ],
    },
    clusterBlock: {
      title: 'Cluster & Block Level',
      items: [
        { id: 'crp', label: 'CRP / CRCC', Icon: Handshake, type: 'stakeholder' },
        { id: 'beo', label: 'BEO', Icon: ClipboardList, type: 'stakeholder' },
        { id: 'brp', label: 'BRP', Icon: BookMarked, type: 'stakeholder' },
      ],
    },
    district: {
      title: 'District Level',
      items: [
        { id: 'deo', label: 'DEO', Icon: Briefcase, type: 'stakeholder' },
        { id: 'diet', label: 'DIET Official', Icon: School, type: 'stakeholder' },
        { id: 'dm', label: 'District Magistrate', Icon: Scale, type: 'stakeholder' },
      ],
    },
  };

  const interventions = [
    { id: 'training', label: 'Training Workshop', Icon: GraduationCap, type: 'intervention' },
    { id: 'mentoring', label: 'Mentoring / Coaching', Icon: Handshake, type: 'intervention' },
    { id: 'tlm-kit', label: 'TLM / Resource Kit', Icon: Package, type: 'intervention' },
    { id: 'digital-tool', label: 'Digital Tool / App', Icon: Smartphone, type: 'intervention' },
    { id: 'community-event', label: 'Community Event', Icon: Megaphone, type: 'intervention' },
    { id: 'governance-review', label: 'Governance Review', Icon: FileCheck, type: 'intervention' },
  ];

  const logicBridge = [
    { id: 'output', label: 'Output', Icon: ArrowRightCircle, type: 'output' },
    { id: 'practice-change', label: 'Practice Change', Icon: RefreshCw, type: 'practiceChange' },
    { id: 'intermediate-outcome', label: 'Intermediate Outcome', Icon: TrendingUp, type: 'intermediateOutcome' },
    { id: 'indicator', label: 'Indicator', Icon: BarChart3, type: 'indicator' },
  ];

  const modifiers = [
    { id: 'resource-cost', label: 'Resource Cost', Icon: Coins, type: 'resourceCost' },
    { id: 'assumption', label: 'Assumption', Icon: Dice1, type: 'assumption' },
    { id: 'risk', label: 'Risk', Icon: AlertTriangle, type: 'risk' },
  ];

  if (collapsed) {
    return (
      <div className="relative">
        <aside className="w-12 bg-[#171B21] border-r border-[#1F2937] flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-8 h-8 hover:bg-[#1F2937] mb-4"
            title="Expand Toolbox"
          >
            <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
          <div className="w-2 h-2 bg-[#D97706] rounded-full"></div>
        </aside>
      </div>
    );
  }

  const renderItem = (item: { id: string; label: string; Icon: any; type: string }, color: string, disabled: boolean = false) => (
    <button
      key={item.id}
      draggable={!disabled}
      className={`aspect-square bg-[#0F1216] border rounded transition-colors flex flex-col items-center justify-center gap-1 p-1 ${disabled
        ? 'border-[#2D3340] opacity-40 cursor-not-allowed'
        : 'border-[#374151] hover:border-[' + color + '] cursor-move'
        }`}
      onDragStart={(event) => {
        if (disabled) return;
        event.dataTransfer.setData('application/reactflow', item.id);
        event.dataTransfer.setData('application/reactflow-label', item.label);
        event.dataTransfer.setData('application/reactflow-nodetype', item.type);
        event.dataTransfer.effectAllowed = 'move';
      }}
      title={disabled ? 'Place Problem Statement first' : item.label}
    >
      <item.Icon className="w-4 h-4" style={{ color: disabled ? '#4B5563' : color }} />
      <span className="text-[9px] text-[#9CA3AF] text-center leading-tight line-clamp-2">
        {item.label}
      </span>
    </button>
  );

  const renderSectionHeader = (
    title: string,
    sectionKey: string,
    color: string,
    locked: boolean = false
  ) => (
    <Button
      variant="ghost"
      onClick={() => !locked && toggleSection(sectionKey)}
      className={`flex items-center justify-between w-full hover:bg-transparent transition-colors mb-2 h-auto font-normal p-0 ${locked ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      disabled={locked}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="font-medium text-sm" style={{ color: locked ? '#6B7280' : '#E5E7EB' }}>{title}</span>
        {locked && <Lock className="w-3 h-3 text-[#6B7280]" />}
      </div>
      <ChevronDown
        className={`w-4 h-4 transition-transform text-[#9CA3AF] ${expandedSections.includes(sectionKey) ? '' : '-rotate-90'}`}
      />
    </Button>
  );

  return (
    <aside className="w-72 bg-[#171B21] border-r border-[#1F2937] relative flex flex-col h-full">
      {/* Hexagon Background */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <HexagonBackground
          className="w-full h-full"
          hexagonSize={28}
          hexagonMargin={2}
          glowMode="hover"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative" style={{ zIndex: 10, pointerEvents: 'auto' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#D97706] rounded-full"></div>
            <h2 className="text-[#E5E7EB] font-medium">Logic Toolbox {domain ? `(${domain})` : ''}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-8 h-8 hover:bg-[#1F2937]"
            title="Collapse Toolbox"
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronLeft className="w-4 h-4 text-[#9CA3AF]" />
          </Button>
        </div>

        {/* --- CAREER READINESS DOMAIN RENDER --- */}
        {domain === 'Career Readiness' ? (
          <>
            {/* 1. Foundations */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('📍 Foundations', 'foundations', CATEGORY_COLORS.foundations)}
              {expandedSections.includes('foundations') && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getCareerNodes('foundation').map(item => renderItem(item, CATEGORY_COLORS.foundations, false))}
                </div>
              )}
            </div>

            {/* 2. Stakeholders */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('👥 Stakeholders', 'stakeholders', CATEGORY_COLORS.stakeholders, !isUnlocked)}
              {expandedSections.includes('stakeholders') && isUnlocked && (
                <div className="mt-2">
                  {/* Mobilization */}
                  <div className="text-xs text-[#9CA3AF] mb-1 font-medium pl-1">Mobilization</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {getCareerNodes('stakeholder')
                      .filter(n => ['youth_candidate', 'parent_guardian', 'field_mobilizer'].includes(n.id))
                      .map(item => renderItem(item, CATEGORY_COLORS.stakeholders, false))}
                  </div>

                  {/* Delivery */}
                  <div className="text-xs text-[#9CA3AF] mb-1 font-medium pl-1">Delivery</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {getCareerNodes('stakeholder')
                      .filter(n => ['vocational_trainer', 'soft_skills_trainer', 'center_manager'].includes(n.id))
                      .map(item => renderItem(item, CATEGORY_COLORS.stakeholders, false))}
                  </div>

                  {/* Market */}
                  <div className="text-xs text-[#9CA3AF] mb-1 font-medium pl-1">Market</div>
                  <div className="grid grid-cols-2 gap-2">
                    {getCareerNodes('stakeholder')
                      .filter(n => ['hr_manager', 'industry_mentor', 'alumni'].includes(n.id))
                      .map(item => renderItem(item, CATEGORY_COLORS.stakeholders, false))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Interventions */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('⚡ Interventions', 'interventions', CATEGORY_COLORS.interventions, !isUnlocked)}
              {expandedSections.includes('interventions') && isUnlocked && (
                <div className="mt-2">
                  {/* Skilling */}
                  <div className="text-xs text-[#9CA3AF] mb-1 font-medium pl-1">Skilling</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {getCareerNodes('intervention')
                      .filter(n => ['tech_bootcamp', 'career_counseling', 'mock_interview'].includes(n.id))
                      .map(item => renderItem(item, CATEGORY_COLORS.interventions, false))}
                  </div>

                  {/* Linkage */}
                  <div className="text-xs text-[#9CA3AF] mb-1 font-medium pl-1">Linkage</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {getCareerNodes('intervention')
                      .filter(n => ['internship_ojt', 'job_fair'].includes(n.id))
                      .map(item => renderItem(item, CATEGORY_COLORS.interventions, false))}
                  </div>

                  {/* Post-Placement */}
                  <div className="text-xs text-[#9CA3AF] mb-1 font-medium pl-1">Post-Placement</div>
                  <div className="grid grid-cols-2 gap-2">
                    {getCareerNodes('intervention')
                      .filter(n => ['migration_support', 'tracking_call'].includes(n.id))
                      .map(item => renderItem(item, CATEGORY_COLORS.interventions, false))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Logic Bridge */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('🔗 Logic Bridge', 'logicBridge', CATEGORY_COLORS.logicBridge, !isUnlocked)}
              {expandedSections.includes('logicBridge') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getCareerNodes('bridge').map(item => renderItem(item, CATEGORY_COLORS.logicBridge, false))}
                </div>
              )}
            </div>

            {/* 5. Risks */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('🎲 Risks', 'modifiers', CATEGORY_COLORS.modifiers, !isUnlocked)}
              {expandedSections.includes('modifiers') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getCareerNodes('risk').map(item => renderItem(item, CATEGORY_COLORS.modifiers, false))}
                </div>
              )}
            </div>
          </>
        ) : domain === 'FLN' ? (
          <>
            {/* 1. Foundations */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('📍 Foundations (The "Why")', 'foundations', CATEGORY_COLORS.foundations)}
              {expandedSections.includes('foundations') && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getFlnNodes('foundation').map(item => renderItem(item, CATEGORY_COLORS.foundations))}
                </div>
              )}
            </div>

            {/* 2. Stakeholders */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('👥 Stakeholders (The "Who")', 'stakeholders', CATEGORY_COLORS.stakeholders, !isUnlocked)}
              {expandedSections.includes('stakeholders') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getFlnNodes('stakeholder').map(item => renderItem(item, CATEGORY_COLORS.stakeholders))}
                </div>
              )}
            </div>

            {/* 3. Interventions */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('⚡ Interventions (The "What")', 'interventions', CATEGORY_COLORS.interventions, !isUnlocked)}
              {expandedSections.includes('interventions') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getFlnNodes('intervention').map(item => renderItem(item, CATEGORY_COLORS.interventions))}
                </div>
              )}
            </div>

            {/* 4. Logic Bridge */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('🔗 Logic Bridge (The "Practice Change")', 'logicBridge', CATEGORY_COLORS.logicBridge, !isUnlocked)}
              {expandedSections.includes('logicBridge') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getFlnNodes('bridge').map(item => renderItem(item, CATEGORY_COLORS.logicBridge))}
                </div>
              )}
            </div>

            {/* 5. Risks / Modifiers */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('🎲 Risks & Modifiers', 'modifiers', CATEGORY_COLORS.modifiers, !isUnlocked)}
              {expandedSections.includes('modifiers') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getFlnNodes('risk').map(item => renderItem(item, CATEGORY_COLORS.modifiers))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* --- DEFAULT RENDER --- */
          <>
            {/* 1. Foundations (Anchors) - Always Available */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('📍 Foundations', 'foundations', CATEGORY_COLORS.foundations)}
              {expandedSections.includes('foundations') && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {foundations.map(item => renderItem(item, CATEGORY_COLORS.foundations))}
                </div>
              )}
            </div>

            {/* 2. Stakeholders (Actors) - Locked until Problem Statement */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('👥 Stakeholders', 'stakeholders', CATEGORY_COLORS.stakeholders, !isUnlocked)}
              {expandedSections.includes('stakeholders') && isUnlocked && (
                <div className="mt-2 space-y-3">
                  {Object.entries(stakeholderLevels).map(([key, level]) => (
                    <div key={key} className="pl-2 border-l-2" style={{ borderColor: CATEGORY_COLORS.stakeholders + '40' }}>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSubSection(key)}
                        className="flex items-center justify-between w-full hover:bg-transparent transition-colors mb-1 h-auto font-normal p-0 text-xs"
                      >
                        <span className="text-[#9CA3AF]">{level.title}</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform text-[#6B7280] ${expandedSubSections.includes(key) ? '' : '-rotate-90'}`}
                        />
                      </Button>
                      {expandedSubSections.includes(key) && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {level.items.map(item => renderItem(item, CATEGORY_COLORS.stakeholders))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Interventions (Actions) - Locked until Problem Statement */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('⚡ Interventions', 'interventions', CATEGORY_COLORS.interventions, !isUnlocked)}
              {expandedSections.includes('interventions') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {interventions.map(item => renderItem(item, CATEGORY_COLORS.interventions))}
                </div>
              )}
            </div>

            {/* 4. Logic Bridge (Results) - Locked until Problem Statement */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('🔗 Logic Bridge', 'logicBridge', CATEGORY_COLORS.logicBridge, !isUnlocked)}
              {expandedSections.includes('logicBridge') && isUnlocked && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {logicBridge.map(item => renderItem(item, CATEGORY_COLORS.logicBridge))}
                </div>
              )}
            </div>

            {/* 5. Simulation Modifiers - Locked until Problem Statement */}
            <div className="mb-4" style={{ pointerEvents: 'auto' }}>
              {renderSectionHeader('🎲 Modifiers', 'modifiers', CATEGORY_COLORS.modifiers, !isUnlocked)}
              {expandedSections.includes('modifiers') && isUnlocked && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {modifiers.map(item => renderItem(item, CATEGORY_COLORS.modifiers))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Unlock hint */}
        {!isUnlocked && (
          <div className="mt-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded text-center">
            <p className="text-[#EF4444] text-xs">
              Drag a <strong>Problem Statement</strong> to unlock other categories.
            </p>
          </div>
        )}
      </div>
    </aside >
  );
}


// InspectorPanel Component
function InspectorPanel({
  selectedNode,
  selectedEdge,
  show,
  onClose,
  onUpdateNode,
  onDeleteNode,
  domain
}: {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  show: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
  onDeleteNode: (nodeId: string) => void;
  domain?: string;
}) {
  const [formData, setFormData] = useState<any>({});

  // Reset form data when node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData({ ...selectedNode.data });
    }
  }, [selectedNode]);

  if (!show || !selectedNode) return null;

  const updateField = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Auto-save to parent state immediately
    onUpdateNode(selectedNode.id, newData);
  };

  const renderConfigForm = () => {
    const type = selectedNode.data.type || selectedNode.type;

    // --- FLN DOMAIN LOGIC ---
    if (domain === 'FLN') {
      const flnNode = FLN_TOOLBOX.find(n => n.id === type);

      if (flnNode) {
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#D97706] uppercase tracking-wider">Configuration</h3>
              {flnNode.fields.map((field) => {
                if (field.type === 'textarea') {
                  return (
                    <FormTextArea
                      key={field.name}
                      label={field.label}
                      value={formData[field.name]}
                      onChange={(e: any) => updateField(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  );
                }
                if (field.type === 'select') {
                  return (
                    <FormSelect
                      key={field.name}
                      label={field.label}
                      value={formData[field.name]}
                      onChange={(e: any) => updateField(field.name, e.target.value)}
                      options={field.options || []}
                    />
                  );
                }
                if (field.type === 'boolean') {
                  return (
                    <div key={field.name} className="pt-2">
                      <FormCheckbox
                        label={field.label}
                        checked={formData[field.name]}
                        onChange={(checked: boolean) => updateField(field.name, checked)}
                      />
                    </div>
                  );
                }
                // Default to Input (text, number, date)
                return (
                  <FormInput
                    key={field.name}
                    label={field.label}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={(e: any) => updateField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                  />
                );
              })}
            </div>
          </div>
        );
      }
    }

    // --- CAREER DOMAIN LOGIC ---
    if (domain === 'Career Readiness') {
      const careerNode = CAREER_TOOLBOX.find(n => n.id === type);

      if (careerNode) {
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#D97706] uppercase tracking-wider">Career Configuration</h3>
              {careerNode.fields.length === 0 && (
                <p className="text-sm text-[#9CA3AF]">No specific configuration needed for this node.</p>
              )}
              {careerNode.fields.map((field) => {
                if (field.type === 'textarea') {
                  return (
                    <FormTextArea
                      key={field.name}
                      label={field.label}
                      value={formData[field.name]}
                      onChange={(e: any) => updateField(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  );
                }
                if (field.type === 'select') {
                  return (
                    <FormSelect
                      key={field.name}
                      label={field.label}
                      value={formData[field.name]}
                      onChange={(e: any) => updateField(field.name, e.target.value)}
                      options={field.options || []}
                    />
                  );
                }
                if (field.type === 'boolean') {
                  return (
                    <div key={field.name} className="pt-2">
                      <FormCheckbox
                        label={field.label}
                        checked={formData[field.name]}
                        onChange={(checked: boolean) => updateField(field.name, checked)}
                      />
                    </div>
                  );
                }
                // Default to Input
                return (
                  <FormInput
                    key={field.name}
                    label={field.label}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={(e: any) => updateField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                  />
                );
              })}
            </div>
          </div>
        );
      }
    }

    // --- DEFAULT FALLBACK ---

    // 1. Foundations: Problem Statement
    if (type === 'problemStatement') {
      return (
        <div className="space-y-4">
          <FormTextArea
            label="Core Challenge"
            value={formData.coreChallenge}
            onChange={(e: any) => updateField('coreChallenge', e.target.value)}
            placeholder="e.g., Grade 3 students cannot subtract."
          />
          <FormSelect
            label="Theme"
            value={formData.theme}
            onChange={(e: any) => updateField('theme', e.target.value)}
            options={['FLN', 'Career Readiness', 'School Leadership']}
          />
          <FormInput
            label="Evidence"
            value={formData.evidence}
            onChange={(e: any) => updateField('evidence', e.target.value)}
            placeholder="e.g., ASER Report 2024, Page 12"
          />
        </div>
      );
    }

    // 1. Foundations: Vision
    if (type === 'vision') {
      return (
        <div className="space-y-4">
          <FormTextArea
            label="Impact Vision"
            value={formData.vision}
            onChange={(e: any) => updateField('vision', e.target.value)}
            placeholder="e.g., Every child reads by Grade 3."
          />
          <FormInput
            label="Target Year"
            type="number"
            value={formData.targetYear}
            onChange={(e: any) => updateField('targetYear', e.target.value)}
          />
        </div>
      );
    }

    // 2. Stakeholders
    if (['student', 'teacher', 'headmaster', 'smc-parent', 'crp', 'beo', 'brp', 'deo', 'diet', 'dm'].includes(type || '')) {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded">
            <h4 className="text-indigo-400 text-sm font-semibold mb-1">Configuration Required</h4>
            <p className="text-indigo-200/60 text-xs">Define current capacity and training needs.</p>
          </div>
          <FormInput
            label="Current Capacity (1-10)"
            type="number"
            value={formData.capacity}
            onChange={(e: any) => updateField('capacity', e.target.value)}
          />
          <FormSelect
            label="Training Need"
            value={formData.trainingNeed}
            onChange={(e: any) => updateField('trainingNeed', e.target.value)}
            options={['High', 'Medium', 'Low']}
          />
          <FormSelect
            label="Role Type"
            value={formData.roleType}
            onChange={(e: any) => updateField('roleType', e.target.value)}
            options={['Permanent', 'Contractual', 'Volunteer']}
          />
        </div>
      );
    }

    // 3. Interventions
    if (['training', 'mentoring', 'tlm-kit', 'digital-tool', 'community-event', 'governance-review'].includes(type || '')) {
      return (
        <div className="space-y-4">
          <FormTextArea
            label="Activity Description"
            value={formData.description}
            onChange={(e: any) => updateField('description', e.target.value)}
            placeholder="Describe the activity..."
          />
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Frequency"
              value={formData.frequency}
              onChange={(e: any) => updateField('frequency', e.target.value)}
              placeholder="e.g. Weekly"
            />
            <FormInput
              label="Duration (Hrs)"
              type="number"
              value={formData.duration}
              onChange={(e: any) => updateField('duration', e.target.value)}
            />
          </div>
          <FormInput
            label="Cost Estimate (INR)"
            type="number"
            value={formData.budget}
            onChange={(e: any) => updateField('budget', e.target.value)}
          />
        </div>
      );
    }

    // 4. Logic Bridge
    if (['outcome', 'indicator', 'intermediateOutcome', 'output'].includes(type) || type === 'customNode') {
      return (
        <div className="space-y-4">
          <FormTextArea
            label="Indicator Statement"
            value={formData.label}
            onChange={(e: any) => updateField('label', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Baseline (%)"
              type="number"
              value={formData.baseline}
              onChange={(e: any) => updateField('baseline', e.target.value)}
            />
            <FormInput
              label="Target (%)"
              type="number"
              value={formData.target}
              onChange={(e: any) => updateField('target', e.target.value)}
            />
          </div>
          <FormSelect
            label="Data Source"
            value={formData.dataSource}
            onChange={(e: any) => updateField('dataSource', e.target.value)}
            options={['Standard Test', 'Government Data', 'Internal Assessment']}
          />
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="space-y-4">
        <FormTextArea
          label="Description"
          value={formData.label}
          onChange={(e: any) => updateField('label', e.target.value)}
        />
      </div>
    );
  };

  return (
    <aside className="absolute right-0 top-0 h-full w-[750px] bg-[#171B21] border-l border-[#1F2937] shadow-2xl flex flex-col z-20">
      {/* Header */}
      <div className="p-4 border-b border-[#2D3340] flex items-center justify-between bg-[#0F1216]">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full shadow-[0_0_8px]"
            style={{
              backgroundColor: getNodeColor(selectedNode.data.type),
              boxShadow: `0 0 8px ${getNodeColor(selectedNode.data.type)}`
            }}
          />
          <h2 className="text-[#E5E7EB] font-bold text-lg truncate w-48">
            {selectedNode.data.label}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {renderConfigForm()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#2D3340] bg-[#0F1216] flex items-center justify-between cursor-auto z-50">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteNode(selectedNode.id)}
          className="bg-red-900/50 hover:bg-red-900/80 text-red-200 border border-red-900"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          disabled
          className="bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/50 flex items-center gap-2 cursor-default"
        >
          <Save className="w-4 h-4" /> Auto-Saved
        </Button>
      </div>
    </aside>
  );
}

// Helper Components for Form
function FormInput({ label, type = "text", value, onChange, placeholder, readOnly }: any) {
  return (
    <div>
      <label className="block text-[#9CA3AF] text-xs font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] text-sm focus:outline-none focus:border-[#D97706] transition-colors ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function FormTextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-[#9CA3AF] text-xs font-medium mb-1.5">{label}</label>
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] text-sm focus:outline-none focus:border-[#D97706] transition-colors resize-none"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-[#9CA3AF] text-xs font-medium mb-1.5">{label}</label>
      <select
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] text-sm focus:outline-none focus:border-[#D97706] transition-colors appearance-none"
      >
        <option value="" disabled>Select {label}...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FormCheckbox({ label, checked, onChange }: any) {
  return (
    <div className="flex items-start gap-2 cursor-pointer group" onClick={() => onChange(!checked)}>
      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#D97706] border-[#D97706]' : 'bg-[#0F1216] border-[#374151] group-hover:border-[#9CA3AF]'}`}>
        {checked && <Check className="w-3 h-3 text-[#0F1216]" />}
      </div>
      <label className="text-[#E5E7EB] text-sm leading-tight cursor-pointer select-none group-hover:text-white">
        {label}
      </label>
    </div>
  );
}

// AI Companion Widget Component
function AICompanionWidget({ show, onToggle, nodes, edges }: { show: boolean; onToggle: () => void; nodes: Node[]; edges: Edge[] }) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Hello! I am here to help you design your program.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Window State
  const [position, setPosition] = useState({ x: window.innerWidth - 370, y: window.innerHeight - 520 });
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && (e.target.closest('button') || e.target.closest('input'))) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y
    };
  };

  // Handle Resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height
    };
  };

  // Global Mouse Move/Up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
          x: dragRef.current.startLeft + dx,
          y: dragRef.current.startTop + dy
        });
      }
      if (isResizing && resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setSize({
          width: Math.max(300, resizeRef.current.startWidth + dx),
          height: Math.max(400, resizeRef.current.startHeight + dy)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragRef.current = null;
      resizeRef.current = null;
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  // Load initial greeting based on persona
  useEffect(() => {
    const savedData = localStorage.getItem('current_mission_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.aiCompanion === 'critical') {
          setMessages(prev => prev[0]?.role === 'assistant' ? [{ role: 'assistant', content: 'I am here to review your logic. Please show me your evidence.' }] : prev);
        }
      } catch (e) {
        console.error("Error parsing mission data", e);
      }
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get persona from local storage
      let persona = 'supportive'; // default
      let missionContext = {};
      const savedData = localStorage.getItem('current_mission_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.aiCompanion) persona = parsed.aiCompanion;
        missionContext = parsed;
      }

      // Serialize Nodes and Edges for Context
      const graphData = {
        mission: missionContext,
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.data.type || n.type,
          data: n.data
        })),
        edges: edges.map(e => ({ source: e.source, target: e.target }))
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          persona,
          graphData
        }),
      });

      if (!response.body) throw new Error('No response body');

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantMessage.content += chunk;

        setMessages(prev => [
          ...prev.slice(0, -1),
          { ...assistantMessage }
        ]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition-all animate-pulse p-0 overflow-hidden cursor-pointer border-0 z-30"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-full"
        >
          <source src="/BeeBot.mp4" type="video/mp4" />
        </video>
      </button>
    );
  }

  return (
    <div
      className="fixed z-30 flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <div className="bg-[#0F1216] border border-[#D97706] rounded-lg shadow-2xl flex flex-col w-full h-full overflow-hidden relative">
        {/* Header - Draggable */}
        <div
          className="p-4 border-b border-[#D97706]/30 flex items-center justify-between bg-[#171B21] flex-shrink-0 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#D97706]" />
            <span className="text-[#E5E7EB] font-medium">Bee Bot</span>
          </div>
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-[#6B7280]" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-8 h-8 hover:bg-[#1F2937]"
            >
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </Button>
          </div>
        </div>

        {/* Messages Body - Scrollable */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar min-h-0 bg-[#0F1216]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-[#D97706]/20' : 'bg-[#374151]'}`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-[#D97706]" /> : <User className="w-4 h-4 text-[#E5E7EB]" />}
              </div>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-[#1F2937] text-[#E5E7EB]' : 'bg-[#D97706] text-[#0F1216]'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#D97706]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="bg-[#1F2937] text-[#E5E7EB] rounded-lg p-3 text-sm">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer - Fixed */}
        <div className="p-3 border-t border-[#2D3340] bg-[#171B21] flex-shrink-0 relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Bee Bot..."
              className="flex-1 px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706] text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="bg-[#D97706] hover:bg-[#B45309] text-[#0F1216]"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center z-40"
            onMouseDown={handleResizeStart}
          >
            <GripHorizontal className="w-3 h-3 text-[#6B7280] rotate-45" />
          </div>
        </div>
      </div>

    </div>
  );
}

// Simulation Results Modal Component
function SimulationResultsModal({ onClose, data, nodes, edges }: { onClose: () => void; data: { lfa: LFADocument; shortcomings: string[] } | null; nodes: Node[]; edges: Edge[] }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <div className="bg-[#171B21] rounded-xl w-[90vw] h-[90vh] border border-[#374151] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2D3340] flex items-center justify-between bg-[#0F1216]">
          <div>
            <h2 className="text-[#E5E7EB] text-2xl font-bold flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              Logic Simulation Report
            </h2>
            <p className="text-[#9CA3AF] text-sm mt-1">Generated via NitiNirmaan Engine • FLN Domain</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-10 h-10 hover:bg-[#1F2937]">
            <X className="w-6 h-6 text-[#9CA3AF]" />
          </Button>
        </div>

        {/* Modal Content - Split View */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT: LFA & Shortcomings */}
          <div className="w-1/2 flex flex-col border-r border-[#2D3340] overflow-hidden">

            {/* Shortcomings Panel */}
            <div className="p-6 bg-[#171B21] border-b border-[#2D3340]">
              <h3 className="text-[#E5E7EB] font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                AI Logic Analysis (Groq)
              </h3>
              {data.shortcomings.length > 0 ? (
                <div className="space-y-3">
                  {data.shortcomings.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded-lg">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                      <p className="text-[#E5E7EB] text-sm leading-relaxed">{err}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Logic flow appears consistent. No critical gaps detected.
                </div>
              )}
            </div>

            {/* LFA Table */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#0F1216]">
              <h3 className="text-[#E5E7EB] font-semibold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#6366F1]" />
                Generated Logical Framework (LFA)
              </h3>

              <div className="border border-[#374151] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1F2937] text-[#9CA3AF] text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-r border-[#374151] w-1/4">Level</th>
                      <th className="p-3 border-r border-[#374151] w-1/3">Narrative Summary</th>
                      <th className="p-3 border-r border-[#374151]">Indicators (OVI)</th>
                      <th className="p-3">Assumptions / Risks</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-[#E5E7EB] divide-y divide-[#374151]">
                    {/* Goal */}
                    <tr className="bg-[#171B21]/50">
                      <td className="p-3 border-r border-[#374151] font-medium text-[#EF4444]">Goal (Impact)</td>
                      <td className="p-3 border-r border-[#374151]">{data.lfa.goal?.narrative || <span className="text-gray-500 italic">Not defined</span>}</td>
                      <td className="p-3 border-r border-[#374151]">{data.lfa.goal?.indicators.join(', ') || '-'}</td>
                      <td className="p-3">{data.lfa.goal?.assumptions_risks.join(', ') || '-'}</td>
                    </tr>

                    {/* Outcomes */}
                    {data.lfa.outcomes.map((item, i) => (
                      <tr key={`outcome-${i}`} className="bg-[#171B21]/30">
                        <td className="p-3 border-r border-[#374151] font-medium text-[#0D9488]">{i === 0 ? 'Outcomes' : ''}</td>
                        <td className="p-3 border-r border-[#374151]">{item.narrative}</td>
                        <td className="p-3 border-r border-[#374151]">{item.indicators.join(', ')}</td>
                        <td className="p-3">{item.assumptions_risks.join(', ') || '-'}</td>
                      </tr>
                    ))}
                    {data.lfa.outcomes.length === 0 && (
                      <tr className="bg-[#171B21]/30"><td className="p-3 text-[#0D9488]" colSpan={4}>No Outcomes defined</td></tr>
                    )}

                    {/* Outputs */}
                    {data.lfa.outputs.map((item, i) => (
                      <tr key={`output-${i}`} className="bg-[#171B21]/10">
                        <td className="p-3 border-r border-[#374151] font-medium text-[#D97706]">{i === 0 ? 'Outputs' : ''}</td>
                        <td className="p-3 border-r border-[#374151]">{item.narrative}</td>
                        <td className="p-3 border-r border-[#374151]">{item.indicators.join(', ')}</td>
                        <td className="p-3">{item.assumptions_risks.join(', ') || '-'}</td>
                      </tr>
                    ))}

                    {/* Activities */}
                    {data.lfa.activities.map((item, i) => (
                      <tr key={`activity-${i}`}>
                        <td className="p-3 border-r border-[#374151] font-medium text-[#6B7280]">{i === 0 ? 'Activities' : ''}</td>
                        <td className="p-3 border-r border-[#374151]">{item.narrative}</td>
                        <td className="p-3 border-r border-[#374151]">{item.indicators.join(', ')}</td>
                        <td className="p-3">{item.assumptions_risks.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Real Canvas Snapshot */}
          <div className="w-1/2 flex flex-col bg-[#111111] relative">
            <div className="absolute top-4 right-4 z-20 bg-black/60 px-3 py-1 rounded-full text-xs text-white border border-white/20">
              Live Canvas Snapshot
            </div>
            {/* We render a Read-Only React Flow instance here to act as the snapshot */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes} // Reuse the same node types
              fitView
              attributionPosition="bottom-right"
              className="bg-[#111111]"
              nodesDraggable={false}
              nodesConnectable={false}
              panOnScroll={true}
              zoomOnScroll={true}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#333" gap={24} size={1} className="opacity-20" />
            </ReactFlow>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D3340] bg-[#171B21] flex justify-end gap-3">
          <Button variant="outline" className="border-[#374151] text-[#E5E7EB]" onClick={onClose}>Close</Button>
          <Button className="bg-[#D97706] hover:bg-[#B45309] text-[#0F1216]">
            <Download className="w-4 h-4 mr-2" />
            Export LFA PDF
          </Button>
        </div>
      </div>
    </div>
  );
}