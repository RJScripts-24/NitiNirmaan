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
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';
import { LFADocument } from '../lib/fln-compiler';
import { supabase } from '../lib/supabase';
import { AiInsightsPanel } from './simulation/AiInsightsPanel';
import axios from 'axios';

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
  const [orgDetails, setOrgDetails] = useState<{ name: string, logo: string } | null>(null);

  // AI Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  const handleAudit = async () => {
    setIsAuditing(true);
    setShowAuditPanel(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/ai-audit`, {
        graphData: { nodes: canvasNodes, edges: canvasEdges },
        projectContext: {
          mode: missionData?.domain === 'Career Readiness' ? 'Career' : 'FLN',
          region: missionData?.state || 'Bihar',
          problemStatement: missionData?.outcome || canvasNodes.find(n => n.type === 'problem')?.data?.label || ''
        }
      });
      setAuditResult(response.data);
    } catch (error) {
      console.error("AI Audit missed:", error);
    } finally {
      setIsAuditing(false);
    }
  };

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

  // Load Org Details from Supabase
  useEffect(() => {
    async function loadOrgDetails() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('organization_name, org_logo_url').eq('id', user.id).single();
        if (data) {
          setOrgDetails({
            name: data.organization_name || 'NitiNirmaan',
            logo: data.org_logo_url || ''
          });
        }
      }
    }
    loadOrgDetails();
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
            {/* AI Audit Button */}
            {/* AI Audit Button */}
            {/* AI Audit Button */}
            {/* AI Audit Button */}
            <Button
              onClick={handleAudit}
              variant={null}
              style={{ backgroundColor: '#ea580c' }}
              className="hover:!bg-[#c2410c] text-white flex items-center gap-2 h-9 px-4 rounded shadow-lg shadow-[#f97316]/20 border border-[#f97316]/50"
            >
              <Sparkles className="w-4 h-4" />
              Bee Audit
            </Button>

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
              canvasNodes={canvasNodes}
              orgName={orgDetails?.name}
              orgLogo={orgDetails?.logo}
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
      <AiInsightsPanel
        isOpen={showAuditPanel}
        onClose={() => setShowAuditPanel(false)}
        isLoading={isAuditing}
        auditResult={auditResult}
      />
    </div>
  );
}

// LFA Document Preview Component
function LFADocumentPreview({
  hoveredNode,
  onSectionHover,
  lfaData,
  missionData,
  shortcomings,
  canvasNodes = [],
  orgName,
  orgLogo
}: {
  hoveredNode: string | null;
  onSectionHover: (section: string | null) => void;
  lfaData?: LFADocument | null;
  missionData?: MissionData | null;
  shortcomings: string[];
  canvasNodes?: Node[];
  orgName?: string;
  orgLogo?: string;
}) {
  // --- Mode Detection ---
  const isFLN = missionData?.domain !== 'Career Readiness';

  // --- Data Maps ---
  const projectName = missionData?.projectName || 'Project Name';
  const geography = (missionData?.state || missionData?.district)
    ? `${missionData.district || ''}${missionData.district && missionData.state ? ', ' : ''}${missionData.state || ''}`
    : 'Not defined';
  const domain = missionData?.domain || 'Not defined';
  const goalNarrative = missionData?.outcome || lfaData?.goal?.narrative || 'Not defined';

  // Find Problem Statement from nodes
  const problemNode = canvasNodes.find(n => n.type === 'problem' || n.data?.type === 'problem');
  const problemStatement = problemNode?.data?.label || "Grade 3 students lack reading fluency due to rote-based teaching.";

  // Build Theory of Change statement
  const activities = lfaData?.activities?.slice(0, 2).map(a => a.narrative.split(' ').slice(0, 3).join(' ')).join(', ') || "interventions are implemented";
  const outcomes = lfaData?.outcomes?.slice(0, 2).map(o => o.narrative).join(' and ') || "practices improve";
  const tocStatement = `IF we ${activities.toLowerCase()}... THEN ${outcomes.toLowerCase()}, LEADING TO ${goalNarrative}.`;

  // Find Stakeholder Shifts (Pedagogy Shift / Bridge Nodes)
  const shiftNodes = canvasNodes.filter(n =>
    ['pedagogy_shift', 'bridge', 'tlm_usage'].includes(n.data?.type || n.type)
  );

  // --- FLN SPECIFIC RENDER ---
  if (isFLN) {
    return (
      <div className="bg-white rounded shadow-sm p-10 text-[#1F2937] max-w-4xl mx-auto font-sans">

        {/* Header - Org & Logo */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div className="flex items-center gap-4">
            {orgLogo ? (
              <img src={orgLogo} alt="Org Logo" className="h-16 w-auto object-contain" />
            ) : (
              <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded">
                No Logo
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">{orgName || 'NitiNirmaan'}</h1>
              <p className="text-sm text-gray-500">{projectName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              FLN Mode
            </span>
            <p className="text-xs text-gray-500 mt-1">{geography}</p>
          </div>
        </div>

        {/* --- Section 1: Program Identity (Header) --- */}
        <section className="mb-10 border-b-2 border-gray-100 pb-6">
          <h2 className="text-xl font-bold text-[#111827] mb-6 border-l-4 border-[#047857] pl-3">1. Program Identity</h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <span className="block font-semibold text-gray-900">Focus:</span>
              <span className="text-gray-700">School System, Pedagogy, and Early Learning.</span>
            </div>
            <div>
              <span className="block font-semibold text-gray-900">Key Metric:</span>
              <span className="text-gray-700">NIPUN Lakshya (Grade-level competency).</span>
            </div>
            <div>
              <span className="block font-semibold text-gray-900">Domain:</span>
              <span className="text-gray-700">School Education (FLN)</span>
            </div>
            <div>
              <span className="block font-semibold text-gray-900">Aligned Mission:</span>
              <span className="text-gray-700">NIPUN Bharat Mission</span>
            </div>
            <div className="col-span-2">
              <span className="block font-semibold text-gray-900">Target Group:</span>
              <span className="text-gray-700">Students (Grade 1-3), Teachers, CRCCs.</span>
            </div>
          </div>
        </section>

        {/* --- Section 2: The FLN LogFrame Matrix --- */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#111827] mb-6 border-l-4 border-[#B91C1C] pl-3">2. The FLN LogFrame Matrix</h2>

          {lfaData ? (
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#1f2937] text-white font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-[15%] border-r border-gray-600">Objective Level</th>
                    <th className="py-3 px-4 w-[30%] border-r border-gray-600">Narrative Summary (The Logic)</th>
                    <th className="py-3 px-4 w-[20%] border-r border-gray-600">Indicators (KPIs)</th>
                    <th className="py-3 px-4 w-[15%] border-r border-gray-600">Means of Verification (MoV)</th>
                    <th className="py-3 px-4 w-[20%]">Assumptions & Risks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* GOAL */}
                  <tr className="bg-red-50/30">
                    <td className="py-3 px-4 font-bold text-[#B91C1C] border-r border-gray-200">GOAL (Impact)</td>
                    <td className="py-3 px-4 border-r border-gray-200">
                      <div className="font-semibold mb-1">Students achieve grade-level proficiency.</div>
                      <div className="text-gray-600 text-xs">{goalNarrative}</div>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      {lfaData.goal?.indicators?.length ? lfaData.goal.indicators.map((i, idx) => <div key={idx}>• {i}</div>) :
                        <div>
                          <div>• % of Gr 3 students reading Gr 2 text fluently.</div>
                          <div>• % of students solving 2-digit subtraction.</div>
                        </div>}
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      {lfaData.goal?.means_of_verification?.length ? lfaData.goal.means_of_verification.map((m, idx) => <div key={idx}>• {m}</div>) :
                        <div>
                          <div>• Annual ASER Survey</div>
                          <div>• State Achievement Survey (SAS)</div>
                          <div>• 3rd Party Endline</div>
                        </div>}
                    </td>
                    <td className="py-3 px-4 text-xs italic text-gray-600">
                      <div>Risk: Schools are closed due to external factors (Pandemic/Climate).</div>
                      <div>Assumption: State continues to prioritize FLN.</div>
                    </td>
                  </tr>

                  {/* OUTCOMES */}
                  <tr className="bg-emerald-50/30">
                    <td className="py-3 px-4 font-bold text-[#047857] border-r border-gray-200">OUTCOMES (Practice)</td>
                    <td className="py-3 px-4 border-r border-gray-200">
                      <div className="font-semibold mb-1">Teachers adopt activity-based pedagogy.</div>
                      <div className="text-gray-600 text-xs">Teachers shift from rote learning to using TLM and targeted teaching (TaRL) daily.</div>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      {lfaData.outcomes?.length > 0 && lfaData.outcomes[0].indicators?.length ? lfaData.outcomes[0].indicators.map((i, idx) => <div key={idx}>• {i}</div>) :
                        <>
                          <div>• % of Teachers scoring &gt;3 on Pedagogy Observation Tool.</div>
                          <div>• % of classrooms with functional Library Corners.</div>
                        </>
                      }
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      <div>• Classroom Observation App Data</div>
                      <div>• Monthly Cluster Review Minutes</div>
                    </td>
                    <td className="py-3 px-4 text-xs italic text-gray-600">
                      <div>Risk: Trained teachers are transferred out.</div>
                      <div>Assumption: Teachers accept the new method.</div>
                    </td>
                  </tr>

                  {/* OUTPUTS */}
                  <tr className="bg-amber-50/30">
                    <td className="py-3 px-4 font-bold text-[#B45309] border-r border-gray-200">OUTPUTS (Deliverables)</td>
                    <td className="py-3 px-4 border-r border-gray-200 text-sm">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Capacity Building: Teachers trained.</li>
                        <li>Resources: TLM Kits distributed.</li>
                        <li>Monitoring: CRCCs conduct visits.</li>
                      </ol>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      <div>• # of Teachers certified.</div>
                      <div>• # of FLN Kits distributed.</div>
                      <div>• # of CRCC visits conducted/month.</div>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      <div>• Training Attendance Register</div>
                      <div>• Stock Receipt Vouchers</div>
                      <div>• Visiting Officer App Log</div>
                    </td>
                    <td className="py-3 px-4 text-xs italic text-gray-600">
                      <div>Assumption: Master Trainers are available.</div>
                      <div>Assumption: Vendors supply kits on time.</div>
                    </td>
                  </tr>

                  {/* ACTIVITIES */}
                  <tr className="bg-white">
                    <td className="py-3 px-4 font-bold text-[#4B5563] border-r border-gray-200">ACTIVITIES (Inputs)</td>
                    <td className="py-3 px-4 border-r border-gray-200 text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        {lfaData.activities?.slice(0, 4).map((a, i) => <li key={i}>{a.narrative}</li>)}
                        {(!lfaData.activities || lfaData.activities.length === 0) && (
                          <>
                            <li>Conduct 4-day Residential Training.</li>
                            <li>Procure & Distribute Math Kits.</li>
                            <li>Hold Monthly "Shiksha Chaupal".</li>
                          </>
                        )}
                        <li className="font-semibold mt-2">Budget: INR [Amount]</li>
                        <li className="font-semibold">Timeline: [Dates]</li>
                      </ul>
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs bg-gray-50 text-center text-gray-500 italic">
                      N/A (Inputs)
                    </td>
                    <td className="py-3 px-4 border-r border-gray-200 text-xs">
                      <div>• Utilization Certificates (UC)</div>
                      <div>• Invoices</div>
                    </td>
                    <td className="py-3 px-4 text-xs italic text-gray-600">
                      <div>Risk: Funds release delayed.</div>
                    </td>
                  </tr>


                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
              Run simulation to generate the FLN LogFrame Matrix.
            </div>
          )}

        </section>

        {/* --- Section 3: FLN Stakeholder Shift Map --- */}
        <section>
          <h2 className="text-xl font-bold text-[#111827] mb-6 border-l-4 border-blue-600 pl-3">3. FLN Stakeholder Shift Map</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F3F4F6] text-gray-700 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-[20%]">Actor</th>
                  <th className="py-3 px-4 w-[40%]">Current Practice (FROM)</th>
                  <th className="py-3 px-4 w-[40%]">Desired Practice (TO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Teacher Row */}
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">Teacher</td>
                  <td className="py-3 px-4 text-red-600 bg-red-50/30">"Completing the Syllabus" (Rote)</td>
                  <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold">"Teaching at the Right Level" (Activity)</td>
                </tr>
                {/* CRCC Row */}
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">CRCC</td>
                  <td className="py-3 px-4 text-red-600 bg-red-50/30">Inspection / Fault-finding</td>
                  <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold">Academic Mentoring / Demo Lessons</td>
                </tr>
                {/* Parent Row */}
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">Parent</td>
                  <td className="py-3 px-4 text-red-600 bg-red-50/30">Disengaged from learning</td>
                  <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold">Ensures 15-min reading at home</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-center text-gray-400">
          Generated by NitiNirmaan Logic Engine | Validated against FLN Framework
        </div>

      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm p-10 text-[#1F2937] max-w-4xl mx-auto font-sans">

      {/* --- Section 1: Program Identity --- */}
      <section className="mb-10 border-b-2 border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-6">Program Identity</h1>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Project Name</span>
            <span className="text-lg font-medium text-gray-900">{projectName}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Organization</span>
            <div className="flex items-center gap-2">
              {orgLogo && <img src={orgLogo} alt="Org" className="h-8 w-8 object-contain rounded-sm" />}
              <span className="text-lg text-gray-700">{orgName || 'NitiNirmaan'}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Geography</span>
            <span className="text-base text-gray-700">{geography}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Duration</span>
            <span className="text-base text-gray-700">April 2026 - March 2029</span>
          </div>
          <div className="col-span-2">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Primary Domain</span>
            <span className="text-base text-gray-700">{domain}</span>
          </div>
        </div>
      </section>

      {/* --- Section 2: Narrative Logic --- */}
      <section className="mb-10 border-b-2 border-gray-100 pb-6">
        <h2 className="text-xl font-bold text-[#111827] mb-6">Narrative Logic</h2>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            Problem Statement
          </h3>
          <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-100 italic">
            "{problemStatement}"
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Theory of Change
          </h3>
          <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-100">
            {tocStatement}
          </p>
        </div>
      </section>

      {/* --- Section 3: Master LogFrame Matrix --- */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#111827] mb-6">Master LogFrame Matrix</h2>

        {lfaData ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F3F4F6] text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-[15%]">Level</th>
                  <th className="py-3 px-4 w-[30%]">Narrative Summary</th>
                  <th className="py-3 px-4 w-[20%]">Indicators</th>
                  <th className="py-3 px-4 w-[15%]">Data Sources</th>
                  <th className="py-3 px-4 w-[20%]">Assumptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Goal */}
                <tr className="bg-white hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-[#B91C1C]">Goal (Impact)</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{goalNarrative}</td>
                  <td className="py-3 px-4 text-gray-600">{lfaData.goal?.indicators?.join('; ') || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{lfaData.goal?.means_of_verification?.join('; ') || '-'}</td>
                  <td className="py-3 px-4 text-gray-600 italic">{lfaData.goal?.assumptions_risks?.join('; ') || '-'}</td>
                </tr>

                {/* Outcomes */}
                {lfaData.outcomes.length > 0 ? lfaData.outcomes.map((item, i) => (
                  <tr key={`outcome-${i}`} className="bg-emerald-50/30 hover:bg-emerald-50/60">
                    <td className="py-3 px-4 font-bold text-[#047857]">{i === 0 ? 'Outcomes (Behavior)' : ''}</td>
                    <td className="py-3 px-4 text-gray-800">{item.narrative}</td>
                    <td className="py-3 px-4 text-gray-600">{item.indicators?.join('; ')}</td>
                    <td className="py-3 px-4 text-gray-600">{item.means_of_verification?.join('; ') || 'COT'}</td>
                    <td className="py-3 px-4 text-gray-600 italic">{item.assumptions_risks?.join('; ') || '-'}</td>
                  </tr>
                )) : (
                  <tr className="bg-emerald-50/30">
                    <td className="py-3 px-4 font-bold text-[#047857]">Outcomes</td>
                    <td colSpan={4} className="py-3 px-4 text-gray-400 italic">No outcomes defined</td>
                  </tr>
                )}

                {/* Outputs */}
                {lfaData.outputs.length > 0 ? lfaData.outputs.map((item, i) => (
                  <tr key={`output-${i}`} className="bg-amber-50/30 hover:bg-amber-50/60">
                    <td className="py-3 px-4 font-bold text-[#B45309]">{i === 0 ? 'Outputs (Deliverables)' : ''}</td>
                    <td className="py-3 px-4 text-gray-800">{item.narrative}</td>
                    <td className="py-3 px-4 text-gray-600">{item.indicators?.join('; ')}</td>
                    <td className="py-3 px-4 text-gray-600">{item.means_of_verification?.join('; ') || 'Project Records'}</td>
                    <td className="py-3 px-4 text-gray-600 italic">{item.assumptions_risks?.join('; ') || '-'}</td>
                  </tr>
                )) : null}

                {/* Activities */}
                {lfaData.activities.length > 0 ? lfaData.activities.map((item, i) => (
                  <tr key={`activity-${i}`} className="bg-white hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-[#4B5563]">{i === 0 ? 'Activities (Tasks)' : ''}</td>
                    <td className="py-3 px-4 text-gray-800">{item.narrative}</td>
                    <td className="py-3 px-4 text-gray-600">{item.indicators?.join('; ')}</td>
                    <td className="py-3 px-4 text-gray-600">{item.means_of_verification?.join('; ') || 'Admin Records'}</td>
                    <td className="py-3 px-4 text-gray-600 italic">{item.assumptions_risks?.join('; ') || '-'}</td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
            Run simulation to generate the Master LogFrame Matrix.
          </div>
        )}
      </section>

      {/* --- Section 4: Stakeholder Shift Map --- */}
      <section>
        <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
          Stakeholder Shift Map
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-normal">System Change</span>
        </h2>

        {shiftNodes.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F3F4F6] text-gray-700 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-1/4">Actor</th>
                  <th className="py-3 px-4 w-1/4">Current Practice (From)</th>
                  <th className="py-3 px-4 w-1/4">Desired Practice (To)</th>
                  <th className="py-3 px-4 w-1/4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {shiftNodes.map((node, i) => {
                  const d = node.data;
                  // Infer fields if not strictly present
                  const actor = d.actor || "Teacher"; // Fallback
                  const fromBehavior = d.from_behavior || "Traditional rote method";
                  const toBehavior = d.to_behavior || "Activity-based learning";
                  const verification = d.evidence_source || "Observation Score";

                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{actor}</td>
                      <td className="py-3 px-4 text-red-600 bg-red-50/50">{fromBehavior}</td>
                      <td className="py-3 px-4 text-green-600 bg-green-50/50 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-green-400" />
                        {toBehavior}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{verification}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500">
            <p className="mb-2">No "Practice Change" or "Pedagogy Shift" nodes detected.</p>
            <p>Add <strong>Pedagogy Shift</strong> nodes to your canvas to see the Stakeholder Shift Map.</p>
          </div>
        )}
      </section>

      {/* Footer note */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-center text-gray-400">
        Generated by NitiNirmaan Logic Engine | Validated against {domain} Framework
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
