import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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

  // Load Mission Data from Database (if logged in) or LocalStorage (guest)
  useEffect(() => {
    async function loadMissionData() {
      const projectId = localStorage.getItem('active_project_id');

      // If we have a valid project ID (not 'guest'), fetch from database
      if (projectId && projectId !== 'guest') {
        try {
          const { data: project, error } = await supabase
            .from('projects')
            .select('title, theme, location, state, district, outcome')
            .eq('id', projectId)
            .single();

          if (project && !error) {
            // Use separate columns if available, otherwise parse from location for backward compatibility
            const locationParts = (project.location || '').split(', ');
            const dbMissionData: MissionData = {
              projectName: project.title || 'Project Name',
              domain: project.theme || 'FLN', // 'theme' column stores the domain
              state: project.state || locationParts[1] || '',
              district: project.district || locationParts[0] || '',
              outcome: project.outcome || '',
            };
            setMissionData(dbMissionData);
            // Also update localStorage to keep it in sync
            localStorage.setItem('current_mission_data', JSON.stringify(dbMissionData));
            return;
          }
        } catch (e) {
          console.error("Failed to load project from database", e);
        }
      }

      // Fallback to localStorage for guest users or if DB fetch fails
      const storedData = localStorage.getItem('current_mission_data');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setMissionData(parsed);
        } catch (e) {
          console.error("Failed to parse mission data", e);
        }
      }
    }

    loadMissionData();
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

  const documentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!documentRef.current) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Helper function to inject color overrides
      const injectColorOverrides = (clonedDoc: Document) => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          :root, :host {
            --color-gray-50: #f9fafb; --color-gray-100: #f3f4f6; --color-gray-200: #e5e7eb;
            --color-gray-300: #d1d5db; --color-gray-400: #9ca3af; --color-gray-500: #6b7280;
            --color-gray-600: #4b5563; --color-gray-700: #374151; --color-gray-800: #1f2937;
            --color-gray-900: #111827; --color-red-50: #fef2f2; --color-red-100: #fee2e2;
            --color-red-500: #ef4444; --color-red-600: #dc2626; --color-emerald-50: #ecfdf5;
            --color-emerald-500: #10b981; --color-emerald-600: #059669; --color-green-50: #f0fdf4;
            --color-green-400: #4ade80; --color-green-500: #22c55e; --color-green-600: #16a34a;
            --color-amber-50: #fffbeb; --color-amber-500: #f59e0b; --color-amber-600: #d97706;
            --color-blue-100: #dbeafe; --color-blue-600: #2563eb; --color-blue-800: #1e40af;
            --color-indigo-600: #4f46e5;
          }
        `;
        clonedDoc.head.appendChild(style);
      };

      // Get all sections in the document
      const sections = documentRef.current.querySelectorAll('[data-pdf-section]');

      if (sections.length === 0) {
        // Fallback: capture entire document if no sections found
        const canvas = await html2canvas(documentRef.current, {
          scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
          onclone: injectColorOverrides
        });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
      } else {
        // Capture each section individually
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i] as HTMLElement;

          const canvas = await html2canvas(section, {
            scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
            onclone: injectColorOverrides
          });

          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * contentWidth) / canvas.width;

          // Check if section fits on current page
          if (currentY + imgHeight > pageHeight - margin) {
            // Start new page if section doesn't fit
            pdf.addPage();
            currentY = margin;
          }

          // Add section image to PDF
          pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
          currentY += imgHeight + 5; // Add small gap between sections
        }
      }

      pdf.save(`${missionData?.projectName || 'LFA_Document'}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const handleExportWord = () => {
    if (!documentRef.current) return;

    // Basic HTML content extraction with styles needed for Word
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'> <head><meta charset='utf-8'><title>LFA Document</title>" +
      "<style>table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #999; padding: 5px; } </style>" +
      "</head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + documentRef.current.innerHTML + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${missionData?.projectName || 'LFA_Document'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };


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
            <div ref={documentRef} className="bg-white p-4">
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
          </div>

          {/* Export Actions - Bottom Right */}
          <div className="px-8 py-4 bg-white border-t border-[#D1D5DB]">
            <div className="flex items-center gap-3">
              <Button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-[#D97706] text-white rounded font-medium hover:bg-[#B45309] transition-colors h-auto border-none shadow-none">
                <Download className="w-4 h-4" />
                Export to PDF
              </Button>
              <Button onClick={handleExportWord} variant="outline" className="flex items-center gap-2 px-4 py-2 bg-white text-[#1F2937] border border-[#D1D5DB] rounded font-medium hover:bg-[#F9FAFB] transition-colors h-auto shadow-none">
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
    ? `${missionData.district || ''}${missionData.district && missionData.state ? ', ' : ''}${missionData.state || ''} `
    : 'Not defined';
  const domain = missionData?.domain || 'Not defined';
  const goalNarrative = missionData?.outcome || lfaData?.goal?.narrative || 'Not defined';

  // Find Problem Statement from nodes OR use outcome from missionData
  const problemNode = canvasNodes.find(n => n.type === 'problem' || n.data?.type === 'problem');
  const problemStatement = problemNode?.data?.label || missionData?.outcome || '';

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
        <section data-pdf-section="program-identity" className="mb-10 border-b-2 border-gray-100 pb-6">
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
        <section data-pdf-section="logframe-matrix" className="mb-10">
          <h2 className="text-xl font-bold text-[#111827] mb-6 border-l-4 border-[#B91C1C] pl-3">2. The FLN LogFrame Matrix</h2>

          <div className="border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead style={{ backgroundColor: '#1f2937' }}>
                <tr>
                  <th style={{ color: '#ffffff', padding: '12px 16px', borderRight: '1px solid #4B5563', fontWeight: 600, width: '15%' }}>Objective Level</th>
                  <th style={{ color: '#ffffff', padding: '12px 16px', borderRight: '1px solid #4B5563', fontWeight: 600, width: '30%' }}>Narrative Summary (The Logic)</th>
                  <th style={{ color: '#ffffff', padding: '12px 16px', borderRight: '1px solid #4B5563', fontWeight: 600, width: '20%' }}>Indicators (KPIs)</th>
                  <th style={{ color: '#ffffff', padding: '12px 16px', borderRight: '1px solid #4B5563', fontWeight: 600, width: '15%' }}>Means of Verification (MoV)</th>
                  <th style={{ color: '#ffffff', padding: '12px 16px', fontWeight: 600, width: '20%' }}>Assumptions & Risks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* GOAL */}
                <tr className="bg-red-50/30">
                  <td className="py-3 px-4 font-bold text-[#B91C1C] border-r border-gray-200">GOAL (Impact)</td>
                  <td className="py-3 px-4 border-r border-gray-200">
                    <div className="text-gray-800">{goalNarrative || <span className="text-gray-400 italic">Reference Goal from Simulation</span>}</div>
                  </td>
                  <td className="py-3 px-4 border-r border-gray-200 text-xs">
                    {lfaData?.goal?.indicators?.map((i, idx) => <div key={idx}>• {i}</div>)}
                  </td>
                  <td className="py-3 px-4 border-r border-gray-200 text-xs">
                    {lfaData?.goal?.means_of_verification?.map((m, idx) => <div key={idx}>• {m}</div>)}
                  </td>
                  <td className="py-3 px-4 text-xs italic text-gray-600">
                    {lfaData?.goal?.assumptions_risks?.map((r, idx) => <div key={idx}>• {r}</div>)}
                  </td>
                </tr>

                {/* OUTCOMES - Dynamic Mapping */}
                {lfaData?.outcomes?.length ? (
                  lfaData.outcomes.map((item, i) => (
                    <tr key={`outcome - ${i} `} className="bg-emerald-50/30">
                      <td className="py-3 px-4 font-bold text-[#047857] border-r border-gray-200">
                        {i === 0 ? 'OUTCOMES (Practice)' : ''}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200">
                        <div className="text-gray-800">{item.narrative}</div>
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 text-xs">
                        {item.indicators?.map((ind, k) => <div key={k}>• {ind}</div>)}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 text-xs">
                        {item.means_of_verification?.map((mov, k) => <div key={k}>• {mov}</div>)}
                      </td>
                      <td className="py-3 px-4 text-xs italic text-gray-600">
                        {item.assumptions_risks?.map((r, k) => <div key={k}>• {r}</div>)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-emerald-50/30">
                    <td className="py-3 px-4 font-bold text-[#047857] border-r border-gray-200">OUTCOMES (Practice)</td>
                    <td className="py-3 px-4 border-r border-gray-200 text-gray-400 italic">No outcomes defined</td>
                    <td className="py-3 px-4 border-r border-gray-200"></td>
                    <td className="py-3 px-4 border-r border-gray-200"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                )}

                {/* OUTPUTS - Dynamic Mapping */}
                {lfaData?.outputs?.length ? (
                  lfaData.outputs.map((item, i) => (
                    <tr key={`output - ${i} `} className="bg-amber-50/30">
                      <td className="py-3 px-4 font-bold text-[#B45309] border-r border-gray-200">
                        {i === 0 ? 'OUTPUTS (Deliverables)' : ''}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 text-sm">
                        <div className="text-gray-800">{item.narrative}</div>
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 text-xs">
                        {item.indicators?.map((ind, k) => <div key={k}>• {ind}</div>)}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-200 text-xs">
                        {item.means_of_verification?.map((mov, k) => <div key={k}>• {mov}</div>)}
                      </td>
                      <td className="py-3 px-4 text-xs italic text-gray-600">
                        {item.assumptions_risks?.map((r, k) => <div key={k}>• {r}</div>)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-amber-50/30">
                    <td className="py-3 px-4 font-bold text-[#B45309] border-r border-gray-200">OUTPUTS (Deliverables)</td>
                    <td className="py-3 px-4 border-r border-gray-200 text-gray-400 italic">No outputs defined</td>
                    <td className="py-3 px-4 border-r border-gray-200"></td>
                    <td className="py-3 px-4 border-r border-gray-200"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                )}

                {/* ACTIVITIES - Dynamic Mapping */}
                <tr className="bg-white">
                  <td className="py-3 px-4 font-bold text-[#4B5563] border-r border-gray-200">ACTIVITIES (Inputs)</td>
                  <td className="py-3 px-4 border-r border-gray-200 text-sm">
                    {lfaData?.activities?.length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {lfaData.activities.map((a, i) => <li key={i}>{a.narrative}</li>)}
                      </ul>
                    ) : (
                      <div className="text-gray-400 italic">No activities defined</div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-r border-gray-200 text-xs bg-gray-50 text-center text-gray-500 italic">
                    N/A (Inputs)
                  </td>
                  <td className="py-3 px-4 border-r border-gray-200 text-xs">
                    {/* Activities MoV */}
                  </td>
                  <td className="py-3 px-4 text-xs italic text-gray-600">
                    {/* Risk for activities */}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </section>

        {/* --- Section 3: FLN Stakeholder Shift Map --- */}
        <section data-pdf-section="stakeholder-shift">
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
                {shiftNodes.length > 0 ? (
                  shiftNodes.map((node, i) => {
                    const d = node.data;
                    const actor = d.actor || "Stakeholder";
                    const fromBehavior = d.from_behavior || "Current behavior";
                    const toBehavior = d.to_behavior || "Desired behavior";
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">{actor}</td>
                        <td className="py-3 px-4 text-red-600 bg-red-50/30">{fromBehavior}</td>
                        <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          {toBehavior}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                      No matching actors or shifts found. Add "Pedagogy Shift" nodes.
                    </td>
                  </tr>
                )}
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
      <section data-pdf-section="program-identity" className="mb-10 border-b-2 border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-6">Program Identity</h1>

        {/* Org Header Integration */}
        <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {orgLogo ? (
            <img src={orgLogo} alt="Org Logo" className="h-12 w-auto object-contain" />
          ) : (
            <div className="h-12 w-12 bg-gray-200 flex items-center justify-center text-xs text-gray-400 rounded">Logo</div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{orgName || 'NitiNirmaan'}</h3>
            <p className="text-sm text-gray-500">{projectName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div>
            <span className="block font-semibold text-gray-900">Focus:</span>
            <span className="text-gray-700">{missionData?.outcome ? 'Skill Development & Livelihood' : ''}</span>
          </div>
          <div>
            <span className="block font-semibold text-gray-900">Key Metric:</span>
            <span className="text-gray-700">{lfaData?.goal?.indicators?.[1] || ''}</span>
          </div>
          <div>
            <span className="block font-semibold text-gray-900">Domain:</span>
            <span className="text-gray-700">{missionData?.domain || ''}</span>
          </div>
          <div>
            <span className="block font-semibold text-gray-900">Aligned Mission:</span>
            <span className="text-gray-700">{missionData?.domain === 'Career Readiness' ? 'Skill India / PMKVY' : ''}</span>
          </div>
          <div className="col-span-2">
            <span className="block font-semibold text-gray-900">Geography:</span>
            <span className="text-gray-700">{geography}</span>
          </div>
          <div className="col-span-2">
            <span className="block font-semibold text-gray-900">Target Group:</span>
            <span className="text-gray-700">{canvasNodes.some(n => n.data?.label?.toLowerCase().includes('youth')) ? 'Youth (18-25 Years)' : ''}</span>
          </div>
        </div>
      </section>

      {/* --- Section 2: Narrative Logic --- */}
      <section data-pdf-section="narrative-logic" className="mb-10 border-b-2 border-gray-100 pb-6">
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
      <section data-pdf-section="logframe-matrix" className="mb-10">
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
                  <td className="py-3 px-4 text-gray-600">{lfaData.goal?.indicators?.join('; ') || ''}</td>
                  <td className="py-3 px-4 text-gray-600">{lfaData.goal?.means_of_verification?.join('; ') || ''}</td>
                  <td className="py-3 px-4 text-gray-600 italic">{lfaData.goal?.assumptions_risks?.join('; ') || ''}</td>
                </tr>

                {/* Outcomes */}
                {lfaData.outcomes.length > 0 ? lfaData.outcomes.map((item, i) => (
                  <tr key={`outcome - ${i} `} className="bg-emerald-50/30 hover:bg-emerald-50/60">
                    <td className="py-3 px-4 font-bold text-[#047857]">{i === 0 ? 'Outcomes (Behavior)' : ''}</td>
                    <td className="py-3 px-4 text-gray-800">{item.narrative}</td>
                    <td className="py-3 px-4 text-gray-600">{item.indicators?.join('; ')}</td>
                    <td className="py-3 px-4 text-gray-600">{item.means_of_verification?.join('; ') || ''}</td>
                    <td className="py-3 px-4 text-gray-600 italic">{item.assumptions_risks?.join('; ') || ''}</td>
                  </tr>
                )) : (
                  <tr className="bg-emerald-50/30">
                    <td className="py-3 px-4 font-bold text-[#047857]">Outcomes</td>
                    <td colSpan={4} className="py-3 px-4 text-gray-400 italic">No outcomes defined</td>
                  </tr>
                )}

                {/* Outputs */}
                {lfaData.outputs.length > 0 ? lfaData.outputs.map((item, i) => (
                  <tr key={`output - ${i} `} className="bg-amber-50/30 hover:bg-amber-50/60">
                    <td className="py-3 px-4 font-bold text-[#B45309]">{i === 0 ? 'Outputs (Deliverables)' : ''}</td>
                    <td className="py-3 px-4 text-gray-800">{item.narrative}</td>
                    <td className="py-3 px-4 text-gray-600">{item.indicators?.join('; ')}</td>
                    <td className="py-3 px-4 text-gray-600">{item.means_of_verification?.join('; ') || ''}</td>
                    <td className="py-3 px-4 text-gray-600 italic">{item.assumptions_risks?.join('; ') || ''}</td>
                  </tr>
                )) : null}

                {/* Activities */}
                {lfaData.activities.length > 0 ? lfaData.activities.map((item, i) => (
                  <tr key={`activity - ${i} `} className="bg-white hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-[#4B5563]">{i === 0 ? 'Activities (Tasks)' : ''}</td>
                    <td className="py-3 px-4 text-gray-800">{item.narrative}</td>
                    <td className="py-3 px-4 text-gray-600">{item.indicators?.join('; ')}</td>
                    <td className="py-3 px-4 text-gray-600">{item.means_of_verification?.join('; ') || ''}</td>
                    <td className="py-3 px-4 text-gray-600 italic">{item.assumptions_risks?.join('; ') || ''}</td>
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

      {/* --- Section 3: Career Stakeholder Shift Map --- */}
      <section data-pdf-section="stakeholder-shift">
        <h2 className="text-xl font-bold text-[#111827] mb-6 border-l-4 border-indigo-600 pl-3">3. Career Stakeholder Shift Map</h2>
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
              {/* Youth Shift */}
              {(() => {
                const youthNode = canvasNodes.find(n => (n.data?.type || n.type) === 'aspiration_alignment');
                return youthNode ? (
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">Youth</td>
                    <td className="py-3 px-4 text-red-600 bg-red-50/30">{youthNode.data?.from_behavior || ''}</td>
                    <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-green-400" />
                      {youthNode.data?.to_behavior || ''}
                    </td>
                  </tr>
                ) : null;
              })()}

              {/* Employer Shift */}
              {(() => {
                const employerNode = canvasNodes.find(n => ['job_fair', 'internship_ojt'].includes(n.data?.type || n.type));
                return employerNode ? (
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">Employer</td>
                    <td className="py-3 px-4 text-red-600 bg-red-50/30">{employerNode.data?.from_behavior || ''}</td>
                    <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-green-400" />
                      {employerNode.data?.to_behavior || ''}
                    </td>
                  </tr>
                ) : null;
              })()}

              {/* Parent Shift */}
              {(() => {
                const parentNode = canvasNodes.find(n => (n.data?.type || n.type) === 'family_consent');
                return parentNode ? (
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">Parent</td>
                    <td className="py-3 px-4 text-red-600 bg-red-50/30">{parentNode.data?.from_behavior || ''}</td>
                    <td className="py-3 px-4 text-green-600 bg-green-50/30 font-semibold flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-green-400" />
                      {parentNode.data?.to_behavior || ''}
                    </td>
                  </tr>
                ) : null;
              })()}

              {/* Fallback if no relevant nodes found */}
              {!canvasNodes.some(n => ['aspiration_alignment', 'job_fair', 'internship_ojt', 'family_consent'].includes(n.data?.type || n.type)) && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                    Add "Aspiration Alignment", "Job Fair", or "Family Consent" nodes to see Stakeholder Shifts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
