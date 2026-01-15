import { useState, useEffect } from 'react';
import { X, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';
import { supabase } from '../lib/supabase';
import ImpactCanvas from "./ImpactCanvas";
import { Node, Edge } from "reactflow";

interface PatternLibraryProps {
  onBack?: () => void;
}

// Node color semantics
const NODE_COLORS = {
  stakeholders: '#6B7280',
  interventions: '#D97706',
  practiceChange: '#0D9488',
  outcomes: '#047857',
  resources: '#475569',
};

interface TemplateData {
  id: string;
  title: string;
  description: string;
  institution: string;
  forkedCount: number;
  successRate: 'High' | 'Moderate' | 'Low';
  theme: string[];
  geography: string[];
  scale: string[];
  nodes: Array<{
    type: 'stakeholders' | 'interventions' | 'practiceChange' | 'outcomes' | 'resources';
    label: string;
    x: number;
    y: number;
  }>;
  connections: Array<{ from: number; to: number }>;
  metadata: {
    geography: string;
    operatingScale: string;
    stakeholders: string[];
    constraints: string[];
  };
}



export default function PatternLibrary({ onBack }: PatternLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    theme: string[];
    geography: string[];
    scale: string[];
  }>({
    theme: [],
    geography: [],
    scale: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Templates from Supabase
  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_template', true);

      if (error) {
        console.error('Error fetching templates:', error);
      } else if (data) {
        // Map Database Row -> Frontend TemplateData
        const realTemplates: TemplateData[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || '',
          institution: row.institution || 'NitiNirmaan',
          forkedCount: 120, // Mock for now, or add to DB
          successRate: row.metadata?.success_rate || 'High',
          theme: row.primary_domain ? [row.primary_domain] : ['General'],
          geography: row.geography ? [row.geography] : [],
          scale: row.operating_scale ? [row.operating_scale] : [],
          nodes: [], // loaded on demand
          connections: [],
          metadata: {
            geography: row.geography,
            operatingScale: row.operating_scale,
            stakeholders: ['Community', 'Government'],
            constraints: ['Resource constraints']
          }
        }));
        setTemplates(realTemplates);
      }
      setLoading(false);
    }

    fetchTemplates();
  }, []);

  // --- Preview Logic ---
  const [previewNodes, setPreviewNodes] = useState<Node[]>([]);
  const [previewEdges, setPreviewEdges] = useState<Edge[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load graph data when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      async function loadGraph() {
        setLoadingPreview(true);
        const { data: nodesData } = await supabase.from('nodes').select('*').eq('project_id', selectedTemplate?.id);
        const { data: edgesData } = await supabase.from('edges').select('*').eq('project_id', selectedTemplate?.id);

        if (nodesData) setPreviewNodes(nodesData.map((n: any) => ({ ...n, data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data, position: typeof n.position === 'string' ? JSON.parse(n.position) : n.position })));
        if (edgesData) setPreviewEdges(edgesData.map((e: any) => ({ ...e })));
        setLoadingPreview(false);
      }
      loadGraph();
    } else {
      setPreviewNodes([]);
      setPreviewEdges([]);
    }
  }, [selectedTemplate]);

  const handleFork = async (templateId: string) => {
    // Check for Guest Mode
    const isGuest = localStorage.getItem('niti_guest_mode') === 'true';

    // User check (only if not guest)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isGuest) return alert("Please sign in to fork patterns.");

    if (isGuest) {
      // GUEST FORK: Store in localStorage
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Create a full project object for the guest
        const guestProject = {
          id: 'guest-project-' + Date.now(),
          title: template.title + ' (Guest Copy)',
          nodes: previewNodes, // Use the fetched nodes
          edges: previewEdges,
          isGuest: true
        };
        localStorage.setItem('guest_active_project', JSON.stringify(guestProject));
        // Ensure standard active project ID is cleared or set to guest indicator
        localStorage.removeItem('active_project_id');
        alert('Pattern cloned to Guest Workspace! Redirecting...');
        console.log('Redirecting to builder for Guest...');
        window.location.hash = 'builder';
        return;
      }
    }

    // AUTH FORK: DB RPC
    const { data, error } = await supabase.rpc('fork_project', {
      p_template_id: templateId,
      p_owner_id: user?.id
    });

    if (error) {
      console.error('Forking failed:', error);
      alert('Failed to fork project.');
    } else {
      // Redirect to the new project
      localStorage.setItem('active_project_id', data); // Store the new project ID for the builder to load
      alert('Project forked successfully! Redirecting...');
      window.location.hash = `builder`;
    }
  };

  const toggleFilter = (category: 'theme' | 'geography' | 'scale', value: string) => {
    setActiveFilters((prev) => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      }
      return { ...prev, [category]: [...current, value] };
    });
  };

  const removeFilter = (category: 'theme' | 'geography' | 'scale', value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ theme: [], geography: [], scale: [] });
  };

  const filteredTemplates = templates.filter((template) => {
    // Search Filter
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category Filters
    const matchesTheme = activeFilters.theme.length === 0 ||
      template.theme.some(t => activeFilters.theme.includes(t));

    const matchesGeography = activeFilters.geography.length === 0 ||
      template.geography.some(g => activeFilters.geography.includes(g));

    const matchesScale = activeFilters.scale.length === 0 ||
      template.scale.some(s => activeFilters.scale.includes(s));

    return matchesSearch && matchesTheme && matchesGeography && matchesScale;
  });

  const hasActiveFilters =
    activeFilters.theme.length > 0 ||
    activeFilters.geography.length > 0 ||
    activeFilters.scale.length > 0;

  return (
    <div className="min-h-screen bg-[#0F1216] text-gray-200">
      <NoiseBackground />
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#171B21] border-b border-[#1F2937]/30 relative overflow-hidden">
        {/* Hexagon Background */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <HexagonBackground
            className="w-full h-full"
            hexagonSize={28}
            hexagonMargin={2}
            glowMode="hover"
          />
        </div>

        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo-2.png"
              alt="NitiNirmaan"
              className="h-14 w-auto object-contain"
            />
          </div>


        </div>
      </nav>

      {/* Search Bar Row */}
      <div className="sticky top-16 z-40 bg-[#171B21] border-b border-[#1F2937]/30">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search templates or templates..."
                className="w-full pl-12 pr-4 py-3 bg-[#0F1216] border border-[#2D3340] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#4B5563] text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex max-w-[1920px] mx-auto">
        {/* Left Sidebar - Filters */}
        <aside className="w-64 bg-[#171B21] min-h-screen sticky top-16 flex-shrink-0 relative overflow-hidden">
          {/* Hexagon Background */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <HexagonBackground
              className="w-full h-full"
              hexagonSize={28}
              hexagonMargin={2}
              glowMode="hover"
            />
          </div>

          <div className="p-6 relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
            <h2 className="text-[#E5E7EB] font-semibold mb-6">Filters</h2>

            {/* Primary Domain Filter */}
            <FilterSection title="1. Primary Domain">
              <FilterCheckbox
                label="FLN (Foundational Literacy & Numeracy)"
                checked={activeFilters.theme.includes('FLN')}
                onChange={() => toggleFilter('theme', 'FLN')}
              />
              <FilterCheckbox
                label="School-to-Work (Career Readiness / Secondary Ed)"
                checked={activeFilters.theme.includes('School-to-Work')}
                onChange={() => toggleFilter('theme', 'School-to-Work')}
              />
            </FilterSection>

            {/* Intervention Lever Filter */}
            <FilterSection title="2. Intervention Lever" collapsible>
              <FilterCheckbox
                label="Pedagogy / Capacity Building"
                checked={activeFilters.theme.includes('Pedagogy')}
                onChange={() => toggleFilter('theme', 'Pedagogy')}
              />
              <FilterCheckbox
                label="Governance & Leadership"
                checked={activeFilters.theme.includes('Governance')}
                onChange={() => toggleFilter('theme', 'Governance')}
              />
              <FilterCheckbox
                label="Community Engagement"
                checked={activeFilters.theme.includes('Community')}
                onChange={() => toggleFilter('theme', 'Community')}
              />
              <FilterCheckbox
                label="EdTech / Digital Infrastructure"
                checked={activeFilters.theme.includes('EdTech')}
                onChange={() => toggleFilter('theme', 'EdTech')}
              />
              <FilterCheckbox
                label="TLM Provisioning"
                checked={activeFilters.theme.includes('TLM')}
                onChange={() => toggleFilter('theme', 'TLM')}
              />
            </FilterSection>

            {/* Context & Geography Filter */}
            <FilterSection title="3. Context & Geography" collapsible>
              <FilterCheckbox
                label="Rural"
                checked={activeFilters.geography.includes('Rural')}
                onChange={() => toggleFilter('geography', 'Rural')}
              />
              <FilterCheckbox
                label="Urban / Peri-urban"
                checked={activeFilters.geography.includes('Urban')}
                onChange={() => toggleFilter('geography', 'Urban')}
              />
              <FilterCheckbox
                label="Aspirational Districts"
                checked={activeFilters.geography.includes('Aspirational')}
                onChange={() => toggleFilter('geography', 'Aspirational')}
              />
              <FilterCheckbox
                label="Tribal / Remote"
                checked={activeFilters.geography.includes('Tribal')}
                onChange={() => toggleFilter('geography', 'Tribal')}
              />
            </FilterSection>

            {/* Scale Filter */}
            <FilterSection title="4. Scale" collapsible>
              <FilterCheckbox
                label="School Level"
                checked={activeFilters.scale.includes('School')}
                onChange={() => toggleFilter('scale', 'School')}
              />
              <FilterCheckbox
                label="Cluster/Block"
                checked={activeFilters.scale.includes('Cluster')}
                onChange={() => toggleFilter('scale', 'Cluster')}
              />
              <FilterCheckbox
                label="District/State"
                checked={activeFilters.scale.includes('District')}
                onChange={() => toggleFilter('scale', 'District')}
              />
            </FilterSection>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-[#E5E7EB] text-2xl font-semibold">Pattern Library</h1>
              <div className="flex items-center gap-2">
                <span className="text-[#9CA3AF] text-sm">Sort by:</span>
                <select className="bg-[#171B21] border border-[#2D3340] rounded px-3 py-1.5 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#4B5563]">
                  <option>Most Forked</option>
                  <option>Success Rate</option>
                  <option>Recently Added</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {activeFilters.theme.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    onRemove={() => removeFilter('theme', filter)}
                  />
                ))}
                {activeFilters.geography.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    onRemove={() => removeFilter('geography', filter)}
                  />
                ))}
                {activeFilters.scale.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    onRemove={() => removeFilter('scale', filter)}
                  />
                ))}
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-[#D97706] text-sm hover:text-[#B45309] transition-colors p-0 h-auto hover:bg-transparent"
                >
                  Clear All
                </Button>
              </div>
            )}

            <p className="text-[#9CA3AF] text-sm">Showing {filteredTemplates.length} Templates</p>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length > 0 ? (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#9CA3AF]">Try widening geography or scale.</p>
            </div>
          )}
        </main>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          nodes={previewNodes}
          edges={previewEdges}
          isLoading={loadingPreview}
          onClose={() => setSelectedTemplate(null)}
          onFork={() => handleFork(selectedTemplate.id)}
        />
      )}
    </div>
  );
}

// Filter Section Component
function FilterSection({
  title,
  children,
  collapsible = false,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6" style={{ pointerEvents: 'auto' }}>
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <h3 className="text-[#E5E7EB] text-sm font-medium">{title}</h3>
        {collapsible && (
          <ChevronDown
            className={`w-4 h-4 text-[#9CA3AF] transition-transform ${isOpen ? '' : '-rotate-90'
              }`}
          />
        )}
      </div>
      {isOpen && <div className="space-y-2.5">{children}</div>}
    </div>
  );
}

// Filter Checkbox Component
function FilterCheckbox({
  label,
  checked,
  onChange,
  tooltip,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  tooltip?: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group" style={{ pointerEvents: 'auto' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 w-4 h-4 rounded border-[#4B5563] bg-[#0F1216] text-[#D97706] focus:ring-0 focus:ring-offset-0 cursor-pointer"
        style={{
          accentColor: checked ? '#D97706' : undefined,
        }}
      />
      <span className={`text-sm flex-1 ${checked ? 'text-[#E5E7EB]' : 'text-[#9CA3AF]'}`}>
        {label}
      </span>
      {tooltip && (
        <div className="relative group/tooltip">
          <HelpCircle className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0 mt-0.5" />
          <div className="absolute left-full ml-2 top-0 px-3 py-2 bg-[#1F2937] rounded text-xs text-[#E5E7EB] whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            {tooltip}
          </div>
        </div>
      )}
    </label>
  );
}

// Filter Chip Component
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D97706] text-[#0F1216] rounded text-sm font-medium">
      <span>{label}</span>
      <Button
        variant="ghost"
        onClick={onRemove}
        className="hover:bg-[#B45309] rounded-full transition-colors p-1 w-auto h-auto"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onClick,
}: {
  template: TemplateData;
  onClick: () => void;
}) {
  const getSuccessRateColor = (rate: 'High' | 'Moderate' | 'Low') => {
    switch (rate) {
      case 'High':
        return '#047857';
      case 'Moderate':
        return '#F59E0B';
      case 'Low':
        return '#9CA3AF';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#171B21] rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-[#2D3340]"
    >
      <div className="flex gap-6">
        {/* Mini Logic Graph */}
        <div className="w-64 h-40 bg-[#0F1216] rounded flex-shrink-0 relative overflow-hidden">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(#374151 1px, transparent 1px),
                linear-gradient(90deg, #374151 1px, transparent 1px)
              `,
              backgroundSize: '12px 12px',
            }}
          ></div>

          {/* Logic nodes and connections */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 160">
            {/* Draw connections first */}
            {template.connections.map((conn, i) => {
              const fromNode = template.nodes[conn.from];
              const toNode = template.nodes[conn.to];
              return (
                <line
                  key={i}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#4B5563"
                  strokeWidth="2"
                />
              );
            })}

            {/* Draw nodes */}
            {template.nodes.map((node, i) => (
              <g key={i}>
                <rect
                  x={node.x - 30}
                  y={node.y - 12}
                  width="60"
                  height="24"
                  rx="4"
                  fill={NODE_COLORS[node.type]}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#E5E7EB"
                  fontSize="10"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-[#E5E7EB] text-lg font-semibold mb-2">{template.title}</h3>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[#9CA3AF] text-sm">Forked {template.forkedCount} times</span>
            <div className="flex items-center gap-2 group/tooltip relative">
              <span className="text-sm">
                Success Rate:{' '}
                <span style={{ color: getSuccessRateColor(template.successRate) }}>
                  {template.successRate}
                </span>
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-[#6B7280]" />
              <div className="absolute left-0 top-full mt-2 px-3 py-2 bg-[#1F2937] rounded text-xs text-[#E5E7EB] whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                Based on post-fork simulation outcomes and reported field results.
              </div>
            </div>
          </div>

          {/* Click hint */}
          <p className="text-[#6B7280] text-sm">Click to inspect logic</p>
        </div>

        {/* Three-dot menu */}
        <Button variant="ghost" className="p-2 hover:bg-[#1F2937] rounded transition-colors h-fit w-auto">
          <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

// Template Preview Modal
function TemplatePreviewModal({
  template,
  nodes,
  edges,
  isLoading,
  onClose,
  onFork
}: {
  template: TemplateData;
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  onClose: () => void;
  onFork: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-[#171B21] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2D3340] flex-shrink-0">
          <h2 className="text-[#E5E7EB] text-xl font-semibold">{template.title}</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-[#1F2937] rounded transition-colors w-auto h-auto"
          >
            <X className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Impact Canvas Preview */}
          <div className="flex-1 bg-[#0F1216] relative flex flex-col">
            <h3 className="text-[#E5E7EB] text-sm font-medium p-4 absolute top-0 left-0 z-10 bg-black/50 rounded-br">Impact Canvas Preview</h3>

            {isLoading ? (
              <div className="flex items-center justify-center h-full text-[#9CA3AF]">Loading logic graph...</div>
            ) : (
              <div className="flex-1 w-full h-full">
                <ImpactCanvas
                  projectName={template.title}
                  initialNodes={nodes}
                  initialEdges={edges}
                  readOnly={true}
                // Hide controls for cleaner preview if needed, or keep them
                />
              </div>
            )}
          </div>

          {/* Metadata Panel (Sidebar) */}
          <div className="w-80 flex-shrink-0 bg-[#171B21] border-l border-[#2D3340] p-6 overflow-y-auto">
            <h3 className="text-[#E5E7EB] text-sm font-medium mb-3">Context Metadata</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[#9CA3AF] text-xs">Description</label>
                <p className="text-[#E5E7EB] text-sm mt-1">{template.description}</p>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs">Institution</label>
                <p className="text-[#E5E7EB] text-sm">{template.institution}</p>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs">Forked</label>
                <p className="text-[#E5E7EB] text-sm">{template.forkedCount} times</p>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs">Success Rate</label>
                <p className="text-[#E5E7EB] text-sm">{template.successRate}</p>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs">Geography</label>
                <p className="text-[#E5E7EB] text-sm">{template.metadata.geography}</p>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs">Operating Scale</label>
                <p className="text-[#E5E7EB] text-sm">{template.metadata.operatingScale}</p>
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={onFork}
              className="w-full py-3 bg-[#D97706] text-[#0F1216] rounded font-semibold hover:bg-[#B45309] transition-colors h-auto"
            >
              Fork this Logic
            </Button>
            <p className="text-[#6B7280] text-xs mt-2 text-center">
              Create an editable copy and adapt it to your context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}