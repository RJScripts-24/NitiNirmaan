import { useState } from 'react';
import { X, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';

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

const templates: TemplateData[] = [
  {
    id: '1',
    title: 'Pratham – Read India Model',
    institution: 'Pratham',
    forkedCount: 45,
    successRate: 'High',
    theme: ['FLN'],
    geography: ['Rural'],
    scale: ['Block'],
    nodes: [
      { type: 'stakeholders', label: 'Teacher', x: 60, y: 50 },
      { type: 'interventions', label: 'Activity Needed', x: 160, y: 50 },
      { type: 'stakeholders', label: 'Student', x: 260, y: 50 },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ],
    metadata: {
      geography: 'Rural',
      operatingScale: 'Block Level',
      stakeholders: ['Teachers', 'Students', 'Community Volunteers'],
      constraints: ['Limited infrastructure', 'High student-teacher ratio'],
    },
  },
  {
    id: '2',
    title: 'HP Education Dept – NIPUN Bharat 2023',
    institution: 'HP Education Dept',
    forkedCount: 32,
    successRate: 'Moderate',
    theme: ['FLN'],
    geography: ['Rural'],
    scale: ['District'],
    nodes: [
      { type: 'stakeholders', label: 'Student', x: 60, y: 50 },
      { type: 'practiceChange', label: 'Remedial', x: 140, y: 50 },
      { type: 'interventions', label: 'Digital', x: 200, y: 30 },
      { type: 'outcomes', label: 'Learning Outcomes', x: 280, y: 50 },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ],
    metadata: {
      geography: 'Rural',
      operatingScale: 'District Level',
      stakeholders: ['Government teachers', 'District officials'],
      constraints: ['Digital infrastructure gaps', 'Training capacity'],
    },
  },
  {
    id: '3',
    title: 'RISE Rajasthan',
    institution: 'RISE',
    forkedCount: 27,
    successRate: 'High',
    theme: ['Leadership'],
    geography: ['Rural'],
    scale: ['Block'],
    nodes: [
      { type: 'stakeholders', label: 'Student', x: 60, y: 50 },
      { type: 'interventions', label: 'Moderate', x: 150, y: 50 },
      { type: 'stakeholders', label: 'Classroom Change', x: 240, y: 30 },
      { type: 'resources', label: 'Period', x: 240, y: 70 },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 1, to: 3 },
    ],
    metadata: {
      geography: 'Rural',
      operatingScale: 'Block Level',
      stakeholders: ['School leaders', 'Teachers', 'Students'],
      constraints: ['Leadership turnover', 'Resource allocation'],
    },
  },
  {
    id: '4',
    title: 'Quest Alliance – Anandshala Model',
    institution: 'Quest Alliance',
    forkedCount: 19,
    successRate: 'Moderate',
    theme: ['STEM'],
    geography: ['Mixed Contexts'],
    scale: ['School'],
    nodes: [
      { type: 'stakeholders', label: 'Fedral', x: 60, y: 50 },
      { type: 'stakeholders', label: 'Learner', x: 140, y: 30 },
      { type: 'interventions', label: 'Digital', x: 200, y: 50 },
      { type: 'stakeholders', label: 'Modware', x: 280, y: 50 },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ],
    metadata: {
      geography: 'Mixed Contexts',
      operatingScale: 'School',
      stakeholders: ['Students', 'Teachers', 'Technology partners'],
      constraints: ['Digital literacy', 'Device availability'],
    },
  },
];

export default function PatternLibrary({ onBack }: PatternLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    theme: string[];
    geography: string[];
    scale: string[];
  }>({
    theme: ['FLN', 'Rural'],
    geography: [],
    scale: [],
  });

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
    const allFilters = [...activeFilters.theme, ...activeFilters.geography, ...activeFilters.scale];
    if (allFilters.length === 0) return true;

    return allFilters.some(
      (filter) =>
        template.theme.includes(filter) ||
        template.geography.includes(filter) ||
        template.scale.includes(filter)
    );
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
          onClose={() => setSelectedTemplate(null)}
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
  onClose,
}: {
  template: TemplateData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-[#171B21] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2D3340]">
          <h2 className="text-[#E5E7EB] text-xl font-semibold">{template.title}</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-[#1F2937] rounded transition-colors w-auto h-auto"
          >
            <X className="w-5 h-5 text-[#9CA3AF]" />
          </Button>
        </div>

        <div className="p-6 flex gap-6">
          {/* Impact Canvas */}
          <div className="flex-1">
            <h3 className="text-[#E5E7EB] text-sm font-medium mb-3">Impact Canvas</h3>
            <div className="bg-[#0F1216] rounded-lg p-8 relative" style={{ height: '400px' }}>
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(#374151 1px, transparent 1px),
                    linear-gradient(90deg, #374151 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              ></div>

              {/* Logic graph - larger version */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400" style={{ padding: '20px' }}>
                {/* Draw connections */}
                {template.connections.map((conn, i) => {
                  const fromNode = template.nodes[conn.from];
                  const toNode = template.nodes[conn.to];
                  return (
                    <line
                      key={i}
                      x1={fromNode.x * 1.8}
                      y1={fromNode.y * 2.5}
                      x2={toNode.x * 1.8}
                      y2={toNode.y * 2.5}
                      stroke="#6B7280"
                      strokeWidth="3"
                    />
                  );
                })}

                {/* Draw nodes */}
                {template.nodes.map((node, i) => (
                  <g key={i}>
                    <rect
                      x={node.x * 1.8 - 50}
                      y={node.y * 2.5 - 20}
                      width="100"
                      height="40"
                      rx="6"
                      fill={NODE_COLORS[node.type]}
                    />
                    <text
                      x={node.x * 1.8}
                      y={node.y * 2.5 + 6}
                      textAnchor="middle"
                      fill="#E5E7EB"
                      fontSize="14"
                      fontWeight="500"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Zoom controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button className="w-8 h-8 p-0 bg-[#1F2937] rounded flex items-center justify-center hover:bg-[#374151] transition-colors border-none">
                  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </Button>
                <Button className="w-8 h-8 p-0 bg-[#1F2937] rounded flex items-center justify-center hover:bg-[#374151] transition-colors border-none">
                  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </Button>
                <Button className="w-8 h-8 p-0 bg-[#1F2937] rounded flex items-center justify-center hover:bg-[#374151] transition-colors border-none">
                  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Metadata Panel */}
          <div className="w-80 flex-shrink-0">
            <h3 className="text-[#E5E7EB] text-sm font-medium mb-3">Context Metadata</h3>
            <div className="space-y-4 mb-6">
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
              <div>
                <label className="text-[#9CA3AF] text-xs">Stakeholders</label>
                <ul className="text-[#E5E7EB] text-sm space-y-1">
                  {template.metadata.stakeholders.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="text-[#9CA3AF] text-xs">Known constraints</label>
                <ul className="text-[#E5E7EB] text-sm space-y-1">
                  {template.metadata.constraints.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Primary CTA */}
            <Button className="w-full py-3 bg-[#D97706] text-[#0F1216] rounded font-semibold hover:bg-[#B45309] transition-colors h-auto">
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