import React from 'react';
import { Button } from '../ui/button';
import {
    AlertTriangle,
    X,
    AlertCircle,
    Lightbulb,
    CheckCircle2,
    Target
} from 'lucide-react';

interface AuditResult {
    score: number;
    summary: string;
    critical_gaps: string[];
    warnings: string[];
    missing_nodes?: string[];
    needs_detailing?: string[];
    regional_insights: string[];
    suggestions: string[];
}

interface AiInsightsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    auditResult: AuditResult | null;
}

export function AiInsightsPanel({ isOpen, onClose, isLoading, auditResult }: AiInsightsPanelProps) {
    if (!isOpen) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-[#22c55e]';
        if (score >= 50) return 'text-[#eab308]';
        return 'text-[#ef4444]';
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0F1216] shadow-2xl z-50 border-l border-[#1F2937] flex flex-col font-sans">
            {/* Header */}
            <div className="p-6 border-b border-[#1F2937] flex items-center justify-between bg-[#171B21] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1F2937] rounded-lg border border-[#374151]/50">
                        <Lightbulb className="w-5 h-5 text-[#818CF8]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#E5E7EB]">Bee Logic Audit</h2>
                        <p className="text-xs text-[#9CA3AF] font-medium tracking-wide uppercase">Niti Aayog Impact Lens</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#E5E7EB] rounded-full h-8 w-8">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Content - Scrollable */}
            <div
                className="overflow-y-auto p-6 space-y-8"
                style={{
                    height: 'calc(100vh - 140px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#6B7280 #1F2937'
                }}
            >
                {isLoading ? (
                    <div className="space-y-6 animate-pulse px-4">
                        <div className="h-32 bg-[#1F2937] rounded-full w-32 mx-auto opacity-50"></div>
                        <div className="h-4 bg-[#1F2937] rounded w-3/4 mx-auto opacity-50"></div>
                        <div className="space-y-3">
                            <div className="h-12 bg-[#1F2937] rounded opacity-30"></div>
                            <div className="h-12 bg-[#1F2937] rounded opacity-30"></div>
                            <div className="h-12 bg-[#1F2937] rounded opacity-30"></div>
                        </div>
                    </div>
                ) : auditResult ? (
                    <>
                        {/* Score Section */}
                        <div className="text-center relative">
                            <div className="w-36 h-36 mx-auto rounded-full border-[6px] border-[#1F2937]/50 flex items-center justify-center relative bg-[#0F1216]/50">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90 text-[#1F2937]" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="6" />
                                    <circle
                                        cx="50" cy="50" r="46"
                                        fill="transparent"
                                        stroke={auditResult.score >= 80 ? '#22c55e' : auditResult.score >= 50 ? '#eab308' : '#ef4444'}
                                        strokeWidth="6"
                                        strokeDasharray={`${auditResult.score * 2.89} 289`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out drop-shadow-md"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <span className={`text-4xl font-bold ${getScoreColor(auditResult.score)} tracking-tight leading-none mb-1`}>{auditResult.score}</span>
                                    <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold tracking-wider">Logic Score</span>
                                </div>
                            </div>
                            <div className="mt-6 relative px-4">
                                <p className="text-[#D1D5DB] italic text-sm leading-relaxed border-l-2 border-[#374151] pl-4">
                                    "{auditResult.summary}"
                                </p>
                            </div>
                        </div>

                        {/* Critical Gaps */}
                        {auditResult.critical_gaps.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#F87171] flex items-center gap-2 uppercase tracking-wide px-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Critical Logic Gaps
                                </h3>
                                <div className="space-y-2">
                                    {auditResult.critical_gaps.map((gap, i) => (
                                        <div key={i} className="p-3 bg-[#7F1D1D]/10 border border-[#7F1D1D]/30 rounded-lg text-sm text-[#FCA5A5] flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 flex-shrink-0"></div>
                                            <span className="leading-relaxed">{gap}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Missing Nodes */}
                        {auditResult.missing_nodes && auditResult.missing_nodes.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#F97316] flex items-center gap-2 uppercase tracking-wide px-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Missing Components
                                </h3>
                                <div className="space-y-2">
                                    {auditResult.missing_nodes.map((node, i) => (
                                        <div key={i} className="p-3 bg-[#7C2D12]/10 border border-dashed border-[#7C2D12]/30 rounded-lg text-sm text-[#FDBA74] flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] mt-1.5 flex-shrink-0"></div>
                                            <span className="leading-relaxed">{node}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Warnings */}
                        {auditResult.warnings.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#FBBF24] flex items-center gap-2 uppercase tracking-wide px-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Warnings
                                </h3>
                                <div className="space-y-2">
                                    {auditResult.warnings.map((warn, i) => (
                                        <div key={i} className="p-3 bg-[#78350F]/10 border border-[#78350F]/30 rounded-lg text-sm text-[#FDE68A] flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0"></div>
                                            <span className="leading-relaxed">{warn}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Needs Detailing */}
                        {auditResult.needs_detailing && auditResult.needs_detailing.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#60A5FA] flex items-center gap-2 uppercase tracking-wide px-1">
                                    <Lightbulb className="w-4 h-4" />
                                    Needs Detailing
                                </h3>
                                <div className="space-y-2">
                                    {auditResult.needs_detailing.map((detail, i) => (
                                        <div key={i} className="p-3 bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 rounded-lg text-sm text-[#93C5FD] flex gap-3 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 flex-shrink-0"></div>
                                            <span className="leading-relaxed">{detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regional Insights */}
                        {auditResult.regional_insights.length > 0 && (
                            <div className="p-4 bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 rounded-xl space-y-3 relative overflow-hidden">
                                <h3 className="text-xs font-bold text-[#60A5FA] flex items-center gap-2 uppercase tracking-wide">
                                    <Target className="w-4 h-4" />
                                    Regional Context Check
                                </h3>
                                <div className="space-y-2">
                                    {auditResult.regional_insights.map((insight, i) => (
                                        <div key={i} className="flex gap-3 text-sm text-[#BFDBFE]">
                                            <CheckCircle2 className="w-4 h-4 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                                            <span className="leading-relaxed">{insight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {auditResult.suggestions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#E5E7EB] flex items-center gap-2 uppercase tracking-wide px-1">
                                    Actionable Steps
                                </h3>
                                <div className="space-y-3">
                                    {auditResult.suggestions.map((sugg, i) => (
                                        <div key={i} className="p-4 bg-[#1F2937]/30 rounded-lg border border-[#374151]/50 flex items-center justify-between">
                                            <span className="text-sm text-[#9CA3AF] leading-relaxed pr-4">{sugg}</span>
                                            <Button size="sm" variant="outline" className="h-7 text-[10px] border border-[#374151] bg-[#111827] text-[#9CA3AF] hover:text-[#818CF8] hover:border-[#818CF8]/50 ml-2 whitespace-nowrap font-medium tracking-wide uppercase">
                                                Fix It
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-[#1F2937]/30 rounded-full flex items-center justify-center border border-[#374151]/30">
                            <Lightbulb className="w-8 h-8 text-[#4B5563]" />
                        </div>
                        <p className="text-[#6B7280] text-sm">Run an audit to see AI insights.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#1F2937] bg-[#0F1216] text-center shrink-0">
                <p className="text-[10px] text-[#4B5563] uppercase tracking-wider font-medium">Powered by Groq & Llama 3</p>
            </div>
        </div>
    );
}
