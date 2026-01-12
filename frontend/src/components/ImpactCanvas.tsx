import { useState, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { Button } from './ui/button';

interface ImpactCanvasProps {
  projectName?: string;
  onBack?: () => void;
  onSimulationComplete?: () => void;
}

// Node type colors
const NODE_COLORS = {
  stakeholder: '#6B7280',
  intervention: '#D97706',
  practiceChange: '#0D9488',
  outcome: '#047857',
  resource: '#475569',
};

// Initial nodes - outcome and some stakeholders pre-seeded
const initialNodes: Node[] = [
  {
    id: 'outcome-1',
    type: 'customNode',
    data: { label: 'Students can read grade 3 texts', type: 'outcome' },
    position: { x: 600, y: 300 },
  },
  {
    id: 'stakeholder-1',
    type: 'customNode',
    data: { label: 'Teacher', type: 'stakeholder' },
    position: { x: 200, y: 200 },
  },
];

const initialEdges: Edge[] = [];

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
            width: 20,
            height: 20,
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

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

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

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'customNode',
        position,
        data: { label, type: nodeType },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="h-screen bg-[#0F1216] text-gray-200 flex flex-col">
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>

      {/* Top Toolbar */}
      <header className="bg-[#171B21] border-b border-[#1F2937] px-6 py-4 flex items-center justify-between z-10">
        {/* Left - Project Name */}
        <div className="flex items-center gap-4">
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
            />
          ) : (
            <Button
              variant="ghost"
              onClick={() => setEditingProjectName(true)}
              className="px-3 py-1 text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors h-auto font-normal"
            >
              {currentProjectName}
            </Button>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-4">
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
        <LogicToolbox collapsed={toolboxCollapsed} onToggleCollapse={() => setToolboxCollapsed(!toolboxCollapsed)} />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={{
              customNode: CustomNode,
            }}
            fitView
            className="bg-[#0F1216]"
            onInit={setReactFlowInstance}
          >
            <Background
              color="#1F2937"
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
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
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
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
      className="px-4 py-3 rounded-lg border-2 border-transparent hover:border-[#D97706] transition-all shadow-lg min-w-[120px] relative"
      style={{ backgroundColor }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-[#9CA3AF] !border-2 !border-[#E5E7EB]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-[#9CA3AF] !border-2 !border-[#E5E7EB]"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-[#9CA3AF] !border-2 !border-[#E5E7EB]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-[#9CA3AF] !border-2 !border-[#E5E7EB]"
      />

      <div className="text-[#E5E7EB] text-sm font-medium text-center">{data.label}</div>
    </div>
  );
}

// Logic Toolbox Component
function LogicToolbox({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string>('stakeholders');

  const stakeholders = [
    { id: 'teacher', label: 'Teacher', Icon: GraduationCap, type: 'stakeholder' },
    { id: 'headmaster', label: 'Headmaster', Icon: Building2, type: 'stakeholder' },
    { id: 'student', label: 'Student', Icon: Users, type: 'stakeholder' },
    { id: 'crp', label: 'CRP', Icon: School, type: 'stakeholder' },
    { id: 'beo', label: 'BEO', Icon: ClipboardList, type: 'stakeholder' },
    { id: 'diet', label: 'DIET Official', Icon: BookMarked, type: 'stakeholder' },
  ];

  const interventions = [
    { id: 'training', label: 'Training', Icon: BookOpen, type: 'intervention' },
    { id: 'kit', label: 'Kit', Icon: Package, type: 'intervention' },
    { id: 'app', label: 'App', Icon: Smartphone, type: 'intervention' },
    { id: 'meeting', label: 'Meeting', Icon: MessageSquare, type: 'intervention' },
  ];

  const resources = [
    { id: 'budget', label: 'Budget', Icon: DollarSign, type: 'resource' },
    { id: 'tablet', label: 'Tablet', Icon: Tablet, type: 'resource' },
    { id: 'workbook', label: 'Workbook', Icon: BookMarked, type: 'resource' },
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

  return (
    <aside className="w-64 bg-[#171B21] border-r border-[#1F2937] overflow-y-auto">
      <div className="p-4">
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
          >
            <ChevronLeft className="w-4 h-4 text-[#9CA3AF]" />
          </Button>
        </div>

        {/* Stakeholders */}
        <ToolboxSection
          title="Stakeholders"
          items={stakeholders}
          expanded={expandedSection === 'stakeholders'}
          onToggle={() => setExpandedSection(expandedSection === 'stakeholders' ? '' : 'stakeholders')}
        />

        {/* Interventions */}
        <ToolboxSection
          title="Interventions"
          items={interventions}
          expanded={expandedSection === 'interventions'}
          onToggle={() => setExpandedSection(expandedSection === 'interventions' ? '' : 'interventions')}
        />

        {/* Resources */}
        <ToolboxSection
          title="Resources"
          items={resources}
          expanded={expandedSection === 'resources'}
          onToggle={() => setExpandedSection(expandedSection === 'resources' ? '' : 'resources')}
        />
      </div>
    </aside>
  );
}

// Toolbox Section Component
function ToolboxSection({
  title,
  items,
  expanded,
  onToggle,
}: {
  title: string;
  items: Array<{ id: string; label: string; Icon: any; type: string }>;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-transparent transition-colors mb-2 h-auto font-normal p-0"
      >
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? '' : '-rotate-90'}`}
        />
      </Button>

      {expanded && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              draggable
              className="aspect-square bg-[#0F1216] border border-[#374151] rounded hover:border-[#D97706] transition-colors flex flex-col items-center justify-center gap-1 cursor-move"
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', item.id);
                event.dataTransfer.setData('application/reactflow-label', item.label);
                event.dataTransfer.setData('application/reactflow-nodetype', item.type);
                event.dataTransfer.effectAllowed = 'move';
              }}
            >
              <item.Icon className="w-5 h-5 text-[#9CA3AF]" />
              <span className="text-[10px] text-[#9CA3AF] text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Inspector Panel Component
function InspectorPanel({
  selectedNode,
  selectedEdge,
  onClose,
}: {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onClose: () => void;
}) {
  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-80 bg-[#171B21] border-l border-[#1F2937] p-6">
        <h2 className="text-[#9CA3AF] text-sm">Select a node or connection to inspect</h2>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-[#171B21] border-l border-[#1F2937] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#E5E7EB] font-medium">Inspector</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 hover:bg-[#1F2937]"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </Button>
        </div>

        {selectedNode && (
          <div className="space-y-6">
            <div>
              <label className="block text-[#9CA3AF] text-sm mb-2">Label</label>
              <input
                type="text"
                defaultValue={selectedNode.data.label}
                className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-[#9CA3AF] text-sm mb-2">Assumptions</label>
              <textarea
                placeholder="Example: Teachers will need hands-on training and demonstration to use FLN kits effectively."
                rows={4}
                className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706] resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-[#9CA3AF] text-sm mb-2">Cost Estimate</label>
              <input
                type="text"
                placeholder="₹ 5,000 - 10,000"
                className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706]"
              />
            </div>
          </div>
        )}

        {selectedEdge && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 bg-[#0D9488]/10 border border-[#0D9488]/30 rounded">
              <div className="w-3 h-3 bg-[#0D9488] rounded-full"></div>
              <span className="text-[#E5E7EB] text-sm font-medium">Practice Change</span>
            </div>

            <div>
              <label className="block text-[#E5E7EB] text-sm mb-2">
                What practice will change?
              </label>
              <textarea
                placeholder="Teacher uses kit for daily reading activities."
                rows={3}
                className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706] resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-[#E5E7EB] text-sm mb-2 flex items-center gap-2">
                Indicator
                <span className="text-[#6B7280] text-xs">(Required)</span>
              </label>
              <select className="w-full px-3 py-2 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] mb-2">
                <option value="">Select indicator...</option>
                <option>% of classrooms where kit is regularly used</option>
                <option>Average weekly usage frequency</option>
                <option>Student engagement score during kit activities</option>
              </select>
              <p className="text-[#6B7280] text-xs">
                Indicates how this node will be evaluated during simulation.
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <p className="text-[#F59E0B] text-xs">
                Missing indicator. This connection will be flagged during simulation.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
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