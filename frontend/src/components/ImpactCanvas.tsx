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
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Play,
  Settings,
  User as UserIcon,
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
} from 'lucide-react';
import { Button } from './ui/button';

import HexagonBackground from './HexagonBackground';

interface ImpactCanvasProps {
  projectName?: string;
  onBack?: () => void;
  onSimulationComplete?: () => void;
}

// Node type colors
const NODE_COLORS = {
  // Foundations (Red)
  problemStatement: '#EF4444',
  vision: '#EF4444',
  // Stakeholders (Indigo)
  stakeholder: '#6366F1',
  // Interventions (Amber)
  intervention: '#D97706',
  // Logic Bridge (Teal)
  output: '#0D9488',
  practiceChange: '#0D9488',
  intermediateOutcome: '#0D9488',
  indicator: '#0D9488',
  outcome: '#047857',
  // Simulation Modifiers (Purple)
  resourceCost: '#8B5CF6',
  assumption: '#8B5CF6',
  risk: '#8B5CF6',
  resource: '#475569',
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

export default function ImpactCanvas({ projectName = 'FLN Improvement – Bihar (2026)', onBack, onSimulationComplete }: ImpactCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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

  // Check if Problem Statement has been placed on canvas
  const hasProblemStatement = nodes.some(node => node.data.type === 'problemStatement');

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

  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Simulate for 2 seconds
    setTimeout(() => {
      setIsSimulating(false);
      setShowSimulationResult(true);
      if (onSimulationComplete) {
        onSimulationComplete();
      }
    }, 2000);
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
          <h1 className="text-[#E5E7EB] font-semibold text-lg">
            Niti<span className="text-[#E5E7EB]">Nirmaan</span>
          </h1>
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

          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]">
            <Settings className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-[#1F2937] border border-[#2D3340]">
            <UserIcon className="w-5 h-5 text-[#9CA3AF]" />
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
            panOnDrag={[1, 2]}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}
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
        />

        {/* AI Companion */}
        <AICompanionWidget
          show={showAICompanion}
          onToggle={() => setShowAICompanion(!showAICompanion)}
        />
      </div>

      {/* Simulation Results Modal */}
      {showSimulationResult && (
        <SimulationResultsModal onClose={() => setShowSimulationResult(false)} />
      )}
    </div>
  );
}

// Custom Node Component
function CustomNode({ data }: { data: any }) {
  const backgroundColor = NODE_COLORS[data.type as keyof typeof NODE_COLORS] || '#6B7280';

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

// Logic Toolbox Component
function LogicToolbox({
  collapsed,
  onToggleCollapse,
  isUnlocked
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isUnlocked: boolean;
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

  // Category colors
  const CATEGORY_COLORS = {
    foundations: '#EF4444',
    stakeholders: '#6366F1',
    interventions: '#D97706',
    logicBridge: '#0D9488',
    modifiers: '#8B5CF6',
  };

  // Foundations (Anchors)
  const foundations = [
    { id: 'problem-statement', label: 'Problem Statement', Icon: Flag, type: 'problemStatement' },
    { id: 'vision', label: 'Vision / Impact', Icon: Target, type: 'vision' },
  ];

  // Stakeholders organized by level
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

  // Interventions (Actions)
  const interventions = [
    { id: 'training', label: 'Training Workshop', Icon: GraduationCap, type: 'intervention' },
    { id: 'mentoring', label: 'Mentoring / Coaching', Icon: Handshake, type: 'intervention' },
    { id: 'tlm-kit', label: 'TLM / Resource Kit', Icon: Package, type: 'intervention' },
    { id: 'digital-tool', label: 'Digital Tool / App', Icon: Smartphone, type: 'intervention' },
    { id: 'community-event', label: 'Community Event', Icon: Megaphone, type: 'intervention' },
    { id: 'governance-review', label: 'Governance Review', Icon: FileCheck, type: 'intervention' },
  ];

  // Logic Bridge (Results)
  const logicBridge = [
    { id: 'output', label: 'Output', Icon: ArrowRightCircle, type: 'output' },
    { id: 'practice-change', label: 'Practice Change', Icon: RefreshCw, type: 'practiceChange' },
    { id: 'intermediate-outcome', label: 'Intermediate Outcome', Icon: TrendingUp, type: 'intermediateOutcome' },
    { id: 'indicator', label: 'Indicator', Icon: BarChart3, type: 'indicator' },
  ];

  // Simulation Modifiers
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
    <aside className="w-72 bg-[#171B21] border-r border-[#1F2937] overflow-y-auto relative">
      {/* Hexagon Background */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <HexagonBackground
          className="w-full h-full"
          hexagonSize={28}
          hexagonMargin={2}
          glowMode="hover"
        />
      </div>

      <div className="p-4 relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#D97706] rounded-full"></div>
            <h2 className="text-[#E5E7EB] font-medium">Logic Toolbox</h2>
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

        {/* Unlock hint */}
        {!isUnlocked && (
          <div className="mt-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded text-center">
            <p className="text-[#EF4444] text-xs">
              Drag a <strong>Problem Statement</strong> to unlock other categories.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}


// Inspector Panel Component
function InspectorPanel({
  selectedNode,
  selectedEdge,
  show,
  onClose,
  onUpdateNode,
  onDeleteNode,
}: {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  show: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
  onDeleteNode: (nodeId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'config' | 'ai' | 'team'>('config');
  const [formData, setFormData] = useState<any>({});

  // Reset form data when node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData({ ...selectedNode.data });
    }
  }, [selectedNode]);

  if (!show || !selectedNode) return null;

  const handleSave = () => {
    onUpdateNode(selectedNode.id, formData);
    // Optional: show toast
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const getNodeCategoryColor = (type: string) => {
    const colorKey = type as keyof typeof NODE_COLORS;
    return NODE_COLORS[colorKey] || '#6B7280';
  };

  const renderConfigForm = () => {
    const type = selectedNode.data.type || selectedNode.type;

    // 1. Foundations: Problem Statement
    if (type === 'problemStatement') {
      return (
        <div className="space-y-4">
          <FormTextArea
            label="Core Challenge"
            value={formData.coreChallenge}
            onChange={(e) => updateField('coreChallenge', e.target.value)}
            placeholder="e.g., Grade 3 students cannot subtract."
          />
          <FormSelect
            label="Theme"
            value={formData.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            options={['FLN', 'Career Readiness', 'School Leadership']}
          />
          <FormInput
            label="Evidence"
            value={formData.evidence}
            onChange={(e) => updateField('evidence', e.target.value)}
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
            label="Vision Statement"
            value={formData.visionStatement}
            onChange={(e) => updateField('visionStatement', e.target.value)}
            placeholder="e.g., All students are grade-level competent in Math."
          />
          <FormInput
            label="Target Year"
            type="number"
            value={formData.targetYear}
            onChange={(e) => updateField('targetYear', e.target.value)}
            placeholder="e.g., 2028"
          />
        </div>
      );
    }

    // 2. Stakeholders
    if (type === 'stakeholder') {
      return (
        <div className="space-y-4">
          <FormInput
            label="Role Name"
            value={formData.label} // Read-only mostly, but editable here for now driven by label
            readOnly
          />
          <FormInput
            label="Target Count"
            type="number"
            value={formData.targetCount}
            onChange={(e) => updateField('targetCount', e.target.value)}
            placeholder="e.g., 50"
          />
          <div>
            <label className="block text-[#9CA3AF] text-xs mb-2 flex justify-between">
              <span>Current Bandwidth</span>
              <span>{formData.bandwidth || 100}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.bandwidth || 100}
              onChange={(e) => updateField('bandwidth', parseInt(e.target.value))}
              className="w-full h-2 bg-[#374151] rounded-lg appearance-none cursor-pointer accent-[#D97706]"
            />
            <p className="text-[#6B7280] text-[10px] mt-1">Lower bandwidth triggers warnings for complex tasks.</p>
          </div>
          {formData.targetCount && (
            <div className="p-2 bg-[#1F2937] rounded border border-[#374151] text-xs text-[#9CA3AF]">
              Budget Required: est. ₹ {(formData.targetCount * 500).toLocaleString()}
            </div>
          )}
        </div>
      );
    }

    // 3. Interventions
    if (type === 'intervention') {
      const totalCost = (formData.unitCost || 0) * (formData.duration || 0); // Simplified calc
      return (
        <div className="space-y-4">
          <FormInput
            label="Activity Name"
            value={formData.label}
            onChange={(e) => updateField('label', e.target.value)}
          />
          <FormSelect
            label="Frequency"
            value={formData.frequency}
            onChange={(e) => updateField('frequency', e.target.value)}
            options={['One-time', 'Weekly', 'Monthly', 'Quarterly']}
          />
          <FormInput
            label="Duration (Hours/Days)"
            type="number"
            value={formData.duration}
            onChange={(e) => updateField('duration', e.target.value)}
          />
          <FormInput
            label="Unit Cost (₹)"
            type="number"
            value={formData.unitCost}
            onChange={(e) => updateField('unitCost', e.target.value)}
          />
          <div className="p-2 bg-[#1F2937] rounded border border-[#374151] text-xs text-[#D97706] font-medium">
            Total Cost: ₹ {totalCost.toLocaleString()}
          </div>
        </div>
      );
    }

    // 4. Practice Change
    if (type === 'practiceChange') {
      return (
        <div className="space-y-4">
          <FormInput
            label="Who is changing?"
            value={formData.actor || 'Linked Stakeholder'}
            readOnly
          />
          <FormInput
            label="Current Behavior"
            value={formData.currentBehavior}
            onChange={(e) => updateField('currentBehavior', e.target.value)}
            placeholder="e.g., Uses blackboard only"
          />
          <FormInput
            label="New Behavior"
            value={formData.newBehavior}
            onChange={(e) => updateField('newBehavior', e.target.value)}
            placeholder="e.g., Uses math kit for 10 mins daily"
          />
          <FormSelect
            label="Verification Method"
            value={formData.verificationMethod}
            onChange={(e) => updateField('verificationMethod', e.target.value)}
            options={['Observation', 'Self-Report', 'Survey']}
          />
        </div>
      );
    }

    // 5. Indicators & Outcomes
    if (['outcome', 'indicator', 'intermediateOutcome', 'output'].includes(type) || type === 'customNode') {
      return (
        <div className="space-y-4">
          <FormTextArea
            label="Indicator Statement"
            value={formData.label}
            onChange={(e) => updateField('label', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <FormInput
              label="Baseline (%)"
              type="number"
              value={formData.baseline}
              onChange={(e) => updateField('baseline', e.target.value)}
            />
            <FormInput
              label="Target (%)"
              type="number"
              value={formData.target}
              onChange={(e) => updateField('target', e.target.value)}
            />
          </div>
          <FormSelect
            label="Data Source"
            value={formData.dataSource}
            onChange={(e) => updateField('dataSource', e.target.value)}
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
          onChange={(e) => updateField('label', e.target.value)}
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
              backgroundColor: getNodeCategoryColor(selectedNode.data.type),
              boxShadow: `0 0 8px ${getNodeCategoryColor(selectedNode.data.type)}`
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
          onClick={handleSave}
          className="bg-[#D97706] hover:bg-[#B45309] text-white flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
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

// AI Companion Widget Component
function AICompanionWidget({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      {show ? (
        <div className="bg-[#171B21] border border-[#22D3EE] rounded-lg shadow-xl w-80">
          <div className="p-4 border-b border-[#22D3EE]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#22D3EE]" />
              <span className="text-[#E5E7EB] font-medium">AI Companion</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-8 h-8 hover:bg-[#1F2937]"
            >
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </Button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#22D3EE]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#22D3EE]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#22D3EE] text-sm">
                    Your logic looks incomplete. May I assist you?
                  </p>
                  <p className="text-[#9CA3AF] text-xs mt-2">
                    You added a Teacher node but no intervention. Similar programs struggle without clear activities.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button className="px-3 py-1 bg-[#22D3EE] text-[#0F1216] rounded text-xs font-medium hover:bg-[#22D3EE]/80 transition-colors h-auto border-none shadow-none">
                      Add Intervention
                    </Button>
                    <Button variant="secondary" className="px-3 py-1 bg-[#374151] text-[#E5E7EB] rounded text-xs font-medium hover:bg-[#4B5563] transition-colors h-auto border-none shadow-none">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-[#2D3340]">
            <input
              type="text"
              placeholder="Ask me anything..."
              className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#22D3EE] text-sm"
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={onToggle}
          className="w-14 h-14 bg-[#22D3EE] rounded-full flex items-center justify-center shadow-lg hover:bg-[#22D3EE]/80 transition-colors animate-pulse p-0 h-14"
        >
          <Bot className="w-7 h-7 text-[#0F1216]" />
        </Button>
      )}
    </div>
  );
}

// Simulation Results Modal Component
function SimulationResultsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-[#171B21] rounded-lg max-w-2xl w-full border border-[#B91C1C]">
        <div className="p-6 border-b border-[#2D3340]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[#E5E7EB] text-xl font-semibold mb-2">Simulation Failed</h2>
              <p className="text-[#B91C1C] text-sm">2 Critical Errors Found</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 hover:bg-[#1F2937]"
            >
              <X className="w-4 h-4 text-[#9CA3AF]" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Error 1 */}
          <div className="flex items-start gap-3 p-4 bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded">
            <AlertTriangle className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#E5E7EB] font-medium mb-1">BEO assigned 5 tasks beyond capacity</p>
              <p className="text-[#9CA3AF] text-sm">
                Block Education Officer cannot realistically manage this many responsibilities. Consider adding support staff or reducing scope.
              </p>
            </div>
          </div>

          {/* Error 2 */}
          <div className="flex items-start gap-3 p-4 bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded">
            <AlertTriangle className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#E5E7EB] font-medium mb-1">Outcome has no measurable indicator</p>
              <p className="text-[#9CA3AF] text-sm">
                Add at least one indicator to measure progress toward your outcome. Without this, the program cannot be evaluated.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#2D3340] bg-[#0F1216]/50">
          <p className="text-[#6B7280] text-sm mb-4">
            Export remains locked until all critical errors are resolved.
          </p>
          <Button
            onClick={onClose}
            className="w-full py-3 bg-[#D97706] text-[#0F1216] rounded font-semibold hover:bg-[#B45309] transition-colors h-auto border-none shadow-none"
          >
            Return to Canvas
          </Button>
        </div>
      </div>
    </div>
  );
}