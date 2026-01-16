import { useState, useEffect } from 'react';
import ReactFlow, { Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
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
  AlertTriangle,
} from 'lucide-react';
import { Button } from './ui/button';
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';
import { LFADocument } from '../lib/fln-compiler';

// Define MissionData interface to match MissionInitialize
interface MissionData {
  projectName: string;
  state: string;
  district: string;
  domain: string;
  outcome: string;
  aiCompanion?: string | null;
}

interface LogicPreviewProps {
  projectName?: string; // Legacy prop, can be overridden by missionData
  onBack?: () => void;
  simulationPassed?: boolean;
  onSettings?: () => void;
  lfaData?: LFADocument | null;
  canvasNodes?: Node[];
  canvasEdges?: Edge[];
  shortcomings?: string[];
}

export default function LogicPreview({
  projectName = 'Mission Project', // Default fallback
  onBack,
  simulationPassed = true,
  onSettings,
  lfaData,
  canvasNodes = [],
  canvasEdges = [],
  shortcomings = [],
}: LogicPreviewProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [missionData, setMissionData] = useState<MissionData | null>(null);

  // Load Mission Data from LocalStorage
  useEffect(() => {
    const storedData = localStorage.getItem('current_mission_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setMissionData(parsed);
      } catch (e) {
        console.error("Failed to parse mission data", e);
      }
    }
  }, []);

  // Use Mission Data if available, else prop, else default
  const displayProjectName = missionData?.projectName || projectName;

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
            <span className="text-[#9CA3AF] text-sm">{displayProjectName}</span>
          </div>

          {/* Center - Validation Banner */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#047857]/10 border border-[#047857]/30 rounded">
            <CheckCircle2 className="w-4 h-4 text-[#047857]" />
            <div>
              <p className="text-[#047857] text-sm font-medium">
                Logic Validation Successful
              </p>
              <p className="text-[#047857]/70 text-xs">
                {shortcomings.length > 0 ? `${shortcomings.length} Issues Identified` : 'Clean Logic'} | Simulation passes
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
          <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between">
            <h2 className="text-[#E5E7EB] font-medium">Visual System Snapshot</h2>
            <span className="text-xs text-[#6B7280]">{canvasNodes.length} nodes</span>
          </div>

          {/* Canvas Snapshot - Live ReactFlow */}
          <div className="flex-1 relative">
            {canvasNodes.length > 0 ? (
              <ReactFlow
                nodes={canvasNodes}
                edges={canvasEdges}
                fitView
                className="bg-[#0F1216]"
                nodesDraggable={false}
                nodesConnectable={false}
                panOnScroll={true}
                zoomOnScroll={true}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#333" gap={24} size={1} className="opacity-20" />
              </ReactFlow>
            ) : (
              <div className="flex items-center justify-center h-full text-[#6B7280]">
                No canvas data available
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-[#171B21] border border-[#2D3340] rounded-lg p-4 z-10">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <LegendItem color="#EF4444" icon={Target} label="Foundation" />
                <LegendItem color="#6366F1" icon={Users} label="Stakeholders" />
                <LegendItem color="#D97706" icon={Flame} label="Interventions" />
                <LegendItem color="#0D9488" icon={Target} label="Practice Change" />
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
          <div className="flex-1 overflow-auto p-6">
            <LFADocumentPreview
              hoveredNode={hoveredNode}
              onSectionHover={setHoveredSection}
              lfaData={lfaData}
              missionData={missionData}
              shortcomings={shortcomings}
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

// LFA Document Preview Component
function LFADocumentPreview({
  hoveredNode,
  onSectionHover,
  lfaData,
  missionData,
  shortcomings
}: {
  hoveredNode: string | null;
  onSectionHover: (section: string | null) => void;
  lfaData?: LFADocument | null;
  missionData?: MissionData | null;
  shortcomings: string[];
}) {
  // Derive Fallback strings
  const projectName = missionData?.projectName || 'Project Name';
  const geography = (missionData?.state || missionData?.district)
    ? `${missionData.district || ''}${missionData.district && missionData.state ? ', ' : ''}${missionData.state || ''}`
    : 'Not defined';
  const domain = missionData?.domain || 'Not defined';
  const goalNarrative = missionData?.outcome || lfaData?.goal?.narrative || 'Not defined';

  return (
    <div className="bg-white rounded shadow-sm p-8 text-[#1F2937] max-w-3xl mx-auto">
      {/* Shortcomings Panel */}
      {shortcomings.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            AI Logic Analysis
          </h3>
          <div className="space-y-2">
            {shortcomings.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-red-700">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <span className="text-[#6B7280]">{projectName}</span>
          </div>
          <div>
            <span className="font-medium">Geography:</span>{' '}
            <span className="text-[#6B7280]">{geography}</span>
          </div>
          <div>
            <span className="font-medium">Domain:</span>{' '}
            <span className="text-[#6B7280]">{domain}</span>
          </div>
          {/* Note: Scale is inferred or static for now */}
          <div>
            <span className="font-medium">Scale:</span>{' '}
            <span className="text-[#6B7280]">District/Block Level</span>
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
          {goalNarrative}
        </p>
        {/* If LFA goal exists and is different, show indicators */}
        {lfaData?.goal?.indicators && lfaData.goal.indicators.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-1">Indicators:</p>
            <p className="text-sm text-[#6B7280]">{lfaData.goal.indicators.join(', ')}</p>
          </div>
        )}
      </section>

      {/* Stakeholders (Could be dynamic from LFA data if available, but for now specific LogicPreview static vs LFA dynamic is mixed. Ideally use lfaData if strictly valid, but the sample code had hardcoded table. I will keep the static table structure but note it might need dynamic populating in future tasks. For now, Goal/Overview were the requested dynamic parts.)
         Checking if lfaData has actors/stakeholders... LFADocument type usually has outcomes/outputs.
         Let's keep existing sections but prioritize LFA table integration.
      */}

      {/* Dynamic LFA Table */}
      <section
        className="mb-8"
        onMouseEnter={() => onSectionHover('theory')}
        onMouseLeave={() => onSectionHover(null)}
      >
        <h3 className="text-lg font-semibold mb-4 text-[#1F2937]">Logical Framework (LFA)</h3>

        {lfaData ? (
          <div className="border border-[#D1D5DB] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#D1D5DB]">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-[#1F2937] w-1/5">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1F2937] w-2/5">Narrative Summary</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Indicators</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1F2937]">Assumptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {/* Goal (Using Mission Data or LFA Data) */}
                <tr>
                  <td className="py-3 px-4 font-medium text-[#EF4444]">Goal (Impact)</td>
                  <td className="py-3 px-4 text-[#6B7280]">{goalNarrative}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{lfaData.goal?.indicators?.join(', ') || '-'}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{lfaData.goal?.assumptions_risks?.join(', ') || '-'}</td>
                </tr>

                {/* Outcomes */}
                {lfaData.outcomes.map((item, i) => (
                  <tr key={`outcome-${i}`} className="bg-[#F0FDFA]">
                    <td className="py-3 px-4 font-medium text-[#0D9488]">{i === 0 ? 'Outcomes' : ''}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.narrative}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.indicators?.join(', ')}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.assumptions_risks?.join(', ') || '-'}</td>
                  </tr>
                ))}
                {lfaData.outcomes.length === 0 && (
                  <tr className="bg-[#F0FDFA]">
                    <td className="py-3 px-4 font-medium text-[#0D9488]">Outcomes</td>
                    <td className="py-3 px-4 text-gray-400 italic" colSpan={3}>No outcomes defined</td>
                  </tr>
                )}

                {/* Outputs */}
                {lfaData.outputs.map((item, i) => (
                  <tr key={`output-${i}`} className="bg-[#FFFBEB]">
                    <td className="py-3 px-4 font-medium text-[#D97706]">{i === 0 ? 'Outputs' : ''}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.narrative}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.indicators?.join(', ')}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.assumptions_risks?.join(', ') || '-'}</td>
                  </tr>
                ))}

                {/* Activities */}
                {lfaData.activities.map((item, i) => (
                  <tr key={`activity-${i}`}>
                    <td className="py-3 px-4 font-medium text-[#6B7280]">{i === 0 ? 'Activities' : ''}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.narrative}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.indicators?.join(', ')}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{item.assumptions_risks?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[#6B7280]">
            No LFA data available. Run simulation first.
          </div>
        )}
      </section>

      {/* Risks & Assumptions - Collapsed or Summary */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-[#1F2937]">Risks & Assumptions (Summary)</h3>
        {lfaData && (lfaData.goal.assumptions_risks.length > 0 || lfaData.outcomes.some(o => o.assumptions_risks.length > 0)) ? (
          <ul className="space-y-2 text-sm text-[#6B7280] list-disc list-inside">
            {/* Combine all risks for summary */}
            {[
              ...lfaData.goal.assumptions_risks,
              ...lfaData.outcomes.flatMap(o => o.assumptions_risks),
              ...lfaData.outputs.flatMap(o => o.assumptions_risks)
            ].slice(0, 5).map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
            {/* Fallback if list is empty but arrays exist? No, check length above */}
          </ul>
        ) : (
          <p className="text-sm text-[#9CA3AF] italic">No specific risks identified in simulation.</p>
        )}
      </section>

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-xs text-[#9CA3AF] italic">
        This document is auto-generated from validated logic model (Impact Canvas) and Mission Context ({domain}).
        All content is system-enforced and simulation-validated.
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
