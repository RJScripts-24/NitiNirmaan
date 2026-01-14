import { useState } from 'react';
import {
  CheckCircle2,
  Users,
  Flame,
  Target,
  BarChart3,
  FileText,
  Download,
  Settings,
  ChevronDown,
  Presentation,
} from 'lucide-react';
import { Button } from './ui/button';
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';

interface LogicPreviewProps {
  projectName?: string;
  onBack?: () => void;
  simulationPassed?: boolean;
  onSettings?: () => void;
}

export default function LogicPreview({
  projectName = 'FLN Improvement – Bihar (2026)',
  onBack,
  simulationPassed = true,
  onSettings,
}: LogicPreviewProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // If simulation hasn't passed, show locked state
  if (!simulationPassed) {
    return (
      <div className="h-screen bg-[#0F1216] flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-[#B91C1C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-[#B91C1C]" />
          </div>
          <h2 className="text-[#E5E7EB] text-xl font-semibold mb-2">
            Simulation Required
          </h2>
          <p className="text-[#9CA3AF] mb-6">
            Your system must pass simulation before export.
          </p>
          <Button
            onClick={onBack}
            className="px-6 py-2 bg-[#D97706] text-[#0F1216] rounded font-semibold hover:bg-[#B45309] transition-colors h-auto"
          >
            Return to Canvas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0F1216] text-gray-200 flex flex-col">
      {/* Subtle grain texture overlay */}
      <NoiseBackground />

      {/* Top Bar - Validation State */}
      <header className="bg-[#171B21] border-b border-[#1F2937] px-6 py-3 z-10 relative overflow-hidden">
        {/* Hexagon Background */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <HexagonBackground
            className="w-full h-full"
            hexagonSize={28}
            hexagonMargin={2}
            glowMode="hover"
          />
        </div>

        <div className="flex items-center justify-between relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
          {/* Left - Branding & Project */}
          <div className="flex items-center gap-6">
            <img 
              src="/logo-2.png" 
              alt="NitiNirmaan" 
              className="h-12 w-auto object-contain"
            />
            <span className="text-[#9CA3AF] text-sm">{projectName}</span>
          </div>

          {/* Center - Validation Banner */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#047857]/10 border border-[#047857]/30 rounded">
            <CheckCircle2 className="w-4 h-4 text-[#047857]" />
            <div>
              <p className="text-[#047857] text-sm font-medium">
                Logic Validation Successful
              </p>
              <p className="text-[#047857]/70 text-xs">
                1 issue resolved | Simulation passes
              </p>
            </div>
          </div>

          {/* Right - Collaborators & Actions */}
          <div className="flex items-center gap-3" style={{ pointerEvents: 'auto' }}>
            {/* Collaborators */}
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#D97706] border-2 border-[#171B21] flex items-center justify-center">
                <span className="text-xs text-white">JD</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#047857] border-2 border-[#171B21] flex items-center justify-center">
                <span className="text-xs text-white">AS</span>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="w-9 h-9 flex items-center justify-center hover:bg-[#1F2937] rounded transition-colors" onClick={onSettings}>
              <Settings className="w-4 h-4 text-[#6B7280]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Split View - 50/50 */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - Visual System Snapshot */}
        <div className="w-1/2 bg-[#0F1216] border-r border-[#1F2937] flex flex-col">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-[#1F2937]">
            <h2 className="text-[#E5E7EB] font-medium">Visual System Snapshot</h2>
          </div>

          {/* Canvas Snapshot */}
          <div className="flex-1 p-6 overflow-auto relative">
            <SystemSnapshot
              hoveredSection={hoveredSection}
              onNodeHover={setHoveredNode}
            />

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-[#171B21] border border-[#2D3340] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <LegendItem color="#6B7280" icon={Users} label="Stakeholders" />
                <LegendItem color="#D97706" icon={Flame} label="Interventions" />
                <LegendItem color="#0D9488" icon={Target} label="Practice Change" />
                <LegendItem color="#047857" icon={Target} label="Outcomes" />
                <LegendItem color="#475569" icon={BarChart3} label="Indicators" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Live LFA Document Preview */}
        <div className="w-1/2 bg-[#E5E7EB] flex flex-col">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-[#D1D5DB] bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-[#1F2937] font-medium">Live LFA Document Preview</h2>
              <Button variant="ghost" className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] text-sm h-auto font-normal">
                <span>Preview</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-8">
            <LFADocumentPreview
              hoveredNode={hoveredNode}
              onSectionHover={setHoveredSection}
            />
          </div>

          {/* Export Actions - Bottom Right */}
          <div className="px-8 py-4 bg-white border-t border-[#D1D5DB]">
            <div className="flex items-center gap-3">
              <Button className="flex items-center gap-2 px-4 py-2 bg-[#D97706] text-white rounded font-medium hover:bg-[#B45309] transition-colors h-auto border-none shadow-none">
                <Download className="w-4 h-4" />
                Export to PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white text-[#1F2937] border border-[#D1D5DB] rounded font-medium hover:bg-[#F9FAFB] transition-colors h-auto shadow-none">
                <FileText className="w-4 h-4" />
                Export to Word
              </Button>
              <Button variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white text-[#1F2937] border border-[#D1D5DB] rounded font-medium hover:bg-[#F9FAFB] transition-colors h-auto shadow-none">
                <Presentation className="w-4 h-4" />
                Generate Deck
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// System Snapshot Component
function SystemSnapshot({
  hoveredSection,
  onNodeHover,
}: {
  hoveredSection: string | null;
  onNodeHover: (node: string | null) => void;
}) {
  return (
    <div className="relative w-full h-full">
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(#1F2937 1px, transparent 1px),
            linear-gradient(90deg, #1F2937 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.3,
        }}
      ></div>

      {/* Mock nodes - read-only visualization */}
      <svg className="w-full h-full" viewBox="0 0 800 600">
        {/* Connections */}
        <path
          d="M 150 100 Q 200 150 250 180"
          stroke="#6B7280"
          strokeWidth="2"
          fill="none"
          opacity={hoveredSection === 'stakeholders' ? 1 : 0.6}
        />
        <path
          d="M 290 200 Q 350 250 400 280"
          stroke="#D97706"
          strokeWidth="2"
          fill="none"
          opacity={hoveredSection === 'interventions' ? 1 : 0.6}
        />
        <path
          d="M 440 300 Q 500 320 560 300"
          stroke="#0D9488"
          strokeWidth="2"
          fill="none"
          opacity={hoveredSection === 'theory' ? 1 : 0.6}
        />

        {/* Teacher Node */}
        <g
          onMouseEnter={() => onNodeHover('teacher')}
          onMouseLeave={() => onNodeHover(null)}
          className="cursor-pointer"
        >
          <rect
            x="100"
            y="80"
            width="100"
            height="40"
            rx="4"
            fill="#6B7280"
            opacity={hoveredSection === 'stakeholders' ? 1 : 0.8}
          />
          <text x="150" y="105" textAnchor="middle" fill="#E5E7EB" fontSize="12">
            Teacher
          </text>
        </g>

        {/* Kit Node */}
        <g
          onMouseEnter={() => onNodeHover('kit')}
          onMouseLeave={() => onNodeHover(null)}
          className="cursor-pointer"
        >
          <rect
            x="250"
            y="160"
            width="80"
            height="40"
            rx="4"
            fill="#D97706"
            opacity={hoveredSection === 'interventions' ? 1 : 0.8}
          />
          <text x="290" y="185" textAnchor="middle" fill="#E5E7EB" fontSize="12">
            Kit
          </text>
        </g>

        {/* Practice Change Node */}
        <g
          onMouseEnter={() => onNodeHover('practice')}
          onMouseLeave={() => onNodeHover(null)}
          className="cursor-pointer"
        >
          <rect
            x="360"
            y="260"
            width="120"
            height="50"
            rx="4"
            fill="#0D9488"
            opacity={hoveredSection === 'theory' ? 1 : 0.8}
          />
          <text x="420" y="280" textAnchor="middle" fill="#E5E7EB" fontSize="11">
            Teacher uses kit
          </text>
          <text x="420" y="295" textAnchor="middle" fill="#E5E7EB" fontSize="11">
            for reading
          </text>
        </g>

        {/* Outcome Node */}
        <g
          onMouseEnter={() => onNodeHover('outcome')}
          onMouseLeave={() => onNodeHover(null)}
          className="cursor-pointer"
        >
          <rect
            x="520"
            y="270"
            width="120"
            height="50"
            rx="4"
            fill="#047857"
            opacity={hoveredSection === 'goal' ? 1 : 0.8}
          />
          <text x="580" y="290" textAnchor="middle" fill="#E5E7EB" fontSize="11">
            Students read
          </text>
          <text x="580" y="305" textAnchor="middle" fill="#E5E7EB" fontSize="11">
            Grade 3 texts
          </text>
        </g>

        {/* Budget Node */}
        <g>
          <rect x="100" y="200" width="80" height="35" rx="4" fill="#475569" opacity="0.8" />
          <text x="140" y="222" textAnchor="middle" fill="#E5E7EB" fontSize="11">
            Budget
          </text>
        </g>

        {/* Indicator labels */}
        <text
          x="420"
          y="330"
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize="9"
          opacity={hoveredSection === 'theory' ? 1 : 0.5}
        >
          % of classrooms where kit is regularly used
        </text>
      </svg>
    </div>
  );
}

// LFA Document Preview Component
function LFADocumentPreview({
  hoveredNode,
  onSectionHover,
}: {
  hoveredNode: string | null;
  onSectionHover: (section: string | null) => void;
}) {
  return (
    <div className="bg-white rounded shadow-sm p-8 text-[#1F2937] max-w-3xl mx-auto">
      {/* Program Overview */}
      <section
        className="mb-8"
        onMouseEnter={() => onSectionHover('overview')}
        onMouseLeave={() => onSectionHover(null)}
      >
        <h3 className="text-lg font-semibold mb-4 text-[#1F2937]">Program Overview</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Project Name:</span>{' '}
            <span className="text-[#6B7280]">FLN Improvement – Bihar (2026)</span>
          </div>
          <div>
            <span className="font-medium">Geography:</span>{' '}
            <span className="text-[#6B7280]">Rural Bihar</span>
          </div>
          <div>
            <span className="font-medium">Domain:</span>{' '}
            <span className="text-[#6B7280]">Foundational Literacy & Numeracy</span>
          </div>
          <div>
            <span className="font-medium">Scale:</span>{' '}
            <span className="text-[#6B7280]">Clusters, Blocks</span>
          </div>
        </div>
      </section>

      {/* Goal */}
      <section
        className="mb-8"
        onMouseEnter={() => onSectionHover('goal')}
        onMouseLeave={() => onSectionHover(null)}
        style={{
          backgroundColor: hoveredNode === 'outcome' ? '#F0FDF4' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        <h3 className="text-lg font-semibold mb-3 text-[#1F2937]">Goal</h3>
        <p className="text-sm text-[#6B7280]">
          Students in Grade 3 demonstrate grade-level reading comprehension.
        </p>
      </section>

      {/* Stakeholders */}
      <section
        className="mb-8"
        onMouseEnter={() => onSectionHover('stakeholders')}
        onMouseLeave={() => onSectionHover(null)}
        style={{
          backgroundColor: hoveredNode === 'teacher' ? '#F9FAFB' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        <h3 className="text-lg font-semibold mb-3 text-[#1F2937]">
          Stakeholders — Who Is Involved
        </h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#D1D5DB]">
              <th className="text-left py-2 font-semibold">Role</th>
              <th className="text-left py-2 font-semibold">Responsibility</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#E5E7EB]">
              <td className="py-3 text-[#1F2937]">Teacher</td>
              <td className="py-3 text-[#6B7280]">
                Conducts daily reading activities using the FLN kit. Trainable for 3 hours/week.
              </td>
            </tr>
            <tr className="border-b border-[#E5E7EB]">
              <td className="py-3 text-[#1F2937]">CRP</td>
              <td className="py-3 text-[#6B7280]">
                Provides kit-based FLN training to cluster-level teachers. | Manageable within 10 schools
              </td>
            </tr>
            <tr className="border-b border-[#E5E7EB]">
              <td className="py-3 text-[#1F2937]">Students</td>
              <td className="py-3 text-[#6B7280]">
                Grade 3 children in program-specified schools
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Theory of Change */}
      <section
        className="mb-8"
        onMouseEnter={() => onSectionHover('theory')}
        onMouseLeave={() => onSectionHover(null)}
        style={{
          backgroundColor: hoveredNode === 'practice' ? '#F0FDFA' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        <h3 className="text-lg font-semibold mb-3 text-[#1F2937]">
          Theory of Change — Core LFA Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[#D1D5DB]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#D1D5DB]">
                <th className="text-left py-2 px-3 font-semibold">From</th>
                <th className="text-left py-2 px-3 font-semibold">Practice Change</th>
                <th className="text-left py-2 px-3 font-semibold">To</th>
                <th className="text-left py-2 px-3 font-semibold">Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E5E7EB]">
                <td className="py-3 px-3 text-[#1F2937]">CRP</td>
                <td className="py-3 px-3 text-[#6B7280]">Provides kit-based FLN training</td>
                <td className="py-3 px-3 text-[#1F2937]">Teacher</td>
                <td className="py-3 px-3 text-[#6B7280]">
                  % of classrooms where kit is regularly used
                </td>
              </tr>
              <tr className="border-b border-[#E5E7EB]">
                <td className="py-3 px-3 text-[#1F2937]">CRP</td>
                <td className="py-3 px-3 text-[#6B7280]">
                  Provides kit-based FLN training to cluster-level teachers
                </td>
                <td className="py-3 px-3 text-[#1F2937]">Students</td>
                <td className="py-3 px-3 text-[#6B7280]">
                  Average weekly usage frequency
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Risks & Assumptions */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-[#1F2937]">Risks & Assumptions</h3>
        <ul className="space-y-2 text-sm text-[#6B7280] list-disc list-inside">
          <li>Teachers will need hands-on training to use FLN kits effectively</li>
          <li>CRPs have capacity to support up to 10 schools within cluster geography</li>
          <li>Budget allocation is sufficient for kit procurement and distribution</li>
        </ul>
      </section>

      {/* Monitoring & Indicators */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-[#1F2937]">
          Monitoring & Indicators
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-[#1F2937] mb-1">Outcome Level</p>
            <ul className="space-y-1 text-[#6B7280] list-disc list-inside ml-2">
              <li>% of Grade 3 students demonstrating grade-level comprehension</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[#1F2937] mb-1">Output Level</p>
            <ul className="space-y-1 text-[#6B7280] list-disc list-inside ml-2">
              <li>% of classrooms where kit is regularly used</li>
              <li>Average weekly usage frequency</li>
              <li>Number of teachers trained in kit-based pedagogy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-xs text-[#9CA3AF] italic">
        This document is auto-generated from validated logic model. All content is system-enforced
        and simulation-validated.
      </div>
    </div>
  );
}

// Legend Item Component
function LegendItem({
  color,
  icon: Icon,
  label,
}: {
  color: string;
  icon: any;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
      <Icon className="w-3 h-3 text-[#9CA3AF]" />
      <span className="text-[#9CA3AF]">{label}</span>
    </div>
  );
}
