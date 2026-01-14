import { useState } from 'react';
import { X, Check, AlertTriangle, Bot } from 'lucide-react';
import { Button } from "./ui/button";
import { Ripple } from "./ui/ripple";
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';

interface MissionInitializeProps {
  onClose: () => void;
  onComplete?: () => void;
}

type AICompanionType = 'supportive' | 'critical' | null;

interface MissionData {
  projectName: string;
  state: string;
  district: string;
  domain: string;
  outcome: string;
  aiCompanion: AICompanionType;
}

export default function MissionInitialize({ onClose, onComplete }: MissionInitializeProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [missionData, setMissionData] = useState<MissionData>({
    projectName: '',
    state: '',
    district: '',
    domain: '',
    outcome: '',
    aiCompanion: null,
  });

  const [showOutcomeWarning, setShowOutcomeWarning] = useState(false);
  const [showOutcomeSuggestion, setShowOutcomeSuggestion] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleInitialize = () => {
    // Initialize workspace logic here
    onComplete?.();
  };

  const isStep1Valid = missionData.projectName.trim().length > 0 && missionData.domain.length > 0;
  const isStep2Valid = missionData.outcome.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0F1216] text-gray-200 relative">
      {/* Subtle noise texture overlay */}
      <NoiseBackground />

      {/* Subtle vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
      }}></div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="border-b border-[#1F2937] bg-[#171B21]/90 backdrop-blur-sm relative overflow-hidden">
          {/* Hexagon Background */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <HexagonBackground
              className="w-full h-full"
              hexagonSize={28}
              hexagonMargin={2}
              glowMode="hover"
            />
          </div>

          <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
            <h1 className="text-[#E5E7EB] font-semibold text-xl">
              Niti<span className="text-[#E5E7EB]">Nirmaan</span>
            </h1>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-10 h-10 p-0 flex items-center justify-center hover:bg-[#1F2937] rounded transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              <X className="w-5 h-5 text-[#9CA3AF]" />
            </Button>
          </div>
        </header>

        {/* Step Indicator */}
        <div className="border-b border-[#1F2937] bg-[#171B21]/50">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>

        {/* Main Content Area - Animated */}
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="relative overflow-hidden">
            {/* Step 1: Context */}
            <div
              className={`transition-all duration-300 ${currentStep === 1
                ? 'opacity-100 translate-x-0'
                : currentStep > 1
                  ? 'opacity-0 -translate-x-8 absolute inset-0 pointer-events-none'
                  : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'
                }`}
            >
              <ContextStep
                missionData={missionData}
                setMissionData={setMissionData}
                onNext={handleNext}
                isValid={isStep1Valid}
              />
            </div>

            {/* Step 2: Outcome */}
            <div
              className={`transition-all duration-300 ${currentStep === 2
                ? 'opacity-100 translate-x-0'
                : currentStep > 2
                  ? 'opacity-0 -translate-x-8 absolute inset-0 pointer-events-none'
                  : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'
                }`}
            >
              <OutcomeStep
                missionData={missionData}
                setMissionData={setMissionData}
                onNext={handleNext}
                onBack={handleBack}
                isValid={isStep2Valid}
                showWarning={showOutcomeWarning}
                showSuggestion={showOutcomeSuggestion}
                setShowWarning={setShowOutcomeWarning}
                setShowSuggestion={setShowOutcomeSuggestion}
              />
            </div>

            {/* Step 3: Companion */}
            <div
              className={`transition-all duration-300 ${currentStep === 3
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'
                }`}
            >
              <CompanionStep
                missionData={missionData}
                setMissionData={setMissionData}
                onBack={handleBack}
                onInitialize={handleInitialize}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { number: 1, label: 'Context' },
    { number: 2, label: 'Outcome' },
    { number: 3, label: 'Companion' },
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div
              className={`flex items-center gap-3 px-6 py-3 rounded ${step.number === currentStep
                ? 'bg-[#D97706] text-[#0F1216]'
                : step.number < currentStep
                  ? 'bg-[#047857]/20 text-[#047857]'
                  : 'bg-[#374151]/30 text-[#6B7280]'
                } transition-all`}
            >
              {step.number < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="font-medium">{step.number}.</span>
              )}
              <span className="font-medium">{step.label}</span>
            </div>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="w-12 h-px bg-[#374151] mx-2"></div>
          )}
        </div>
      ))}
    </div>
  );
}

// Context Step Component
function ContextStep({
  missionData,
  setMissionData,
  onNext,
  isValid,
}: {
  missionData: MissionData;
  setMissionData: (data: MissionData) => void;
  onNext: () => void;
  isValid: boolean;
}) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-[#E5E7EB] mb-3">
          Define the <span className="text-[#E5E7EB]">Context</span> of Your Mission
        </h2>
        <p className="text-[#9CA3AF]">
          Ground your program in specific realities before design begins.
        </p>
      </div>

      <div className="flex justify-center">
        {/* Left Panel - Program Context */}
        <div className="bg-[#171B21] rounded-lg p-8 border border-[#2D3340] max-w-2xl w-full">
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-[#E5E7EB] font-medium mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={missionData.projectName}
                onChange={(e) =>
                  setMissionData({ ...missionData, projectName: e.target.value })
                }
                placeholder='FLN Improvement – Bihar (2026)'
                className="w-full px-4 py-3 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706] transition-colors"
              />
              <p className="text-[#6B7280] text-sm mt-2">
                Be specific. Avoid names like "Test Project".
              </p>
            </div>

            {/* Target Geography */}
            <div>
              <label className="block text-[#D97706] font-medium mb-3">
                Target Geography
              </label>
              <div className="space-y-3">
                <select
                  value={missionData.state}
                  onChange={(e) =>
                    setMissionData({ ...missionData, state: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
                >
                  <option value="">Select State</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                </select>

                <select
                  value={missionData.district}
                  onChange={(e) =>
                    setMissionData({ ...missionData, district: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
                >
                  <option value="">Select District (Optional)</option>
                  <option value="Patna">Patna</option>
                  <option value="Gaya">Gaya</option>
                  <option value="Muzaffarpur">Muzaffarpur</option>
                </select>
              </div>

              <div className="flex items-start gap-2 mt-3">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <p className="text-[#F59E0B] text-sm">
                  Multi-district projects require stronger system actors.
                </p>
              </div>
            </div>

            {/* Primary Domain */}
            <div>
              <label className="block text-[#D97706] font-medium mb-3">
                Primary Domain
              </label>
              <select
                value={missionData.domain}
                onChange={(e) =>
                  setMissionData({ ...missionData, domain: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
              >
                <option value="">Select Domain</option>
                <option value="FLN">FLN (Foundational Literacy & Numeracy - Grades 1-5)</option>
                <option value="Career Readiness">Career Readiness / School-to-Work (or STEM/Secondary Ed - Grades 6-12)</option>
              </select>

              <div className="flex items-start gap-2 mt-3">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <p className="text-[#F59E0B] text-sm">
                  Used to load domain-specific logic patterns and AI critiques.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#2D3340]">
            <Button
              onClick={onNext}
              disabled={!isValid}
              className={`w-full py-3 rounded font-semibold transition-colors h-auto ${isValid
                ? 'bg-[#D97706] text-[#0F1216] hover:bg-[#B45309]'
                : 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
                }`}
            >
              Next
            </Button>
            <p className="text-[#6B7280] text-center text-sm mt-3">Step 1 of 3</p>
          </div>
        </div>

        {/* Right Panel - AI Companion Preview */}
        {/* Removed as per user request */}
      </div>
    </div>
  );
}

// Outcome Step Component
function OutcomeStep({
  missionData,
  setMissionData,
  onNext,
  onBack,
  isValid,
  showWarning,
  showSuggestion,
  setShowWarning,
  setShowSuggestion,
}: {
  missionData: MissionData;
  setMissionData: (data: MissionData) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  showWarning: boolean;
  showSuggestion: boolean;
  setShowWarning: (show: boolean) => void;
  setShowSuggestion: (show: boolean) => void;
}) {
  const handleOutcomeChange = (value: string) => {
    setMissionData({ ...missionData, outcome: value });

    // Show warnings based on content
    if (value.toLowerCase().includes('intervention') || value.toLowerCase().includes('training')) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }

    if (value.length > 20 && !value.toLowerCase().includes('measurable')) {
      setShowSuggestion(true);
    } else {
      setShowSuggestion(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-[#E5E7EB] mb-3">
          Clarify the Core Outcome
        </h2>
        <p className="text-[#9CA3AF]">
          Write your primary objective clearly to anchor your entire program design.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-[#171B21] rounded-lg p-8 border border-[#2D3340]">
          <div className="mb-6">
            <label className="block text-[#E5E7EB] font-medium mb-2">
              What is the single biggest change you want to see <span className="text-[#E5E7EB]">for the student</span>?
            </label>
            <p className="text-[#6B7280] text-sm mb-4">
              Describe the change, not the action.
            </p>
            <textarea
              value={missionData.outcome}
              onChange={(e) => handleOutcomeChange(e.target.value)}
              placeholder="Students in grade 3 can read age-appropriate texts with comprehension."
              rows={5}
              className="w-full px-4 py-3 bg-[#0F1216] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706] transition-colors resize-none"
            />
          </div>

          {/* System Feedback */}
          {showWarning && (
            <div className="flex items-start gap-3 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded mb-4">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <p className="text-[#F59E0B] text-sm">
                This sounds like an intervention. Try describing the end state instead.
              </p>
            </div>
          )}

          {showSuggestion && (
            <div className="flex items-start gap-3 p-4 bg-[#22D3EE]/10 border border-[#22D3EE]/30 rounded mb-4">
              <Bot className="w-5 h-5 text-[#22D3EE] flex-shrink-0 mt-0.5" />
              <p className="text-[#22D3EE] text-sm">
                Consider making this observable or measurable.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-[#2D3340]">
            <Button
              onClick={onBack}
              className="px-6 py-2.5 bg-[#374151] text-[#E5E7EB] rounded font-medium hover:bg-[#4B5563] transition-colors h-auto"
            >
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid}
              className={`px-8 py-2.5 rounded font-semibold transition-colors h-auto ${isValid
                ? 'bg-[#D97706] text-[#0F1216] hover:bg-[#B45309]'
                : 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
                }`}
            >
              Next
            </Button>
          </div>
          <p className="text-[#6B7280] text-center text-sm mt-3">Step 2 of 3</p>
        </div>
      </div>
    </div>
  );
}

// Companion Step Component
function CompanionStep({
  missionData,
  setMissionData,
  onBack,
  onInitialize,
}: {
  missionData: MissionData;
  setMissionData: (data: MissionData) => void;
  onBack: () => void;
  onInitialize: () => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-[#E5E7EB] mb-3">
          Choose Your AI Companion
        </h2>
        <p className="text-[#9CA3AF]">
          Both will question your logic. Differently.
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="mb-6">
          <h3 className="text-[#E5E7EB] font-medium mb-2">
            Choose Your <span className="text-[#D97706]">AI Companion</span>
          </h3>
          <p className="text-[#9CA3AF] text-sm">
            Both will question your logic. Differently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Supportive Mentor Card */}
          <button
            onClick={() => setMissionData({ ...missionData, aiCompanion: 'supportive' })}
            className={`relative bg-[#171B21] rounded-lg p-6 text-left transition-all border-2 ${missionData.aiCompanion === 'supportive'
              ? 'border-[#22D3EE] shadow-lg shadow-[#22D3EE]/20'
              : 'border-[#22D3EE]/30 hover:border-[#22D3EE]/60'
              }`}
          >
            {missionData.aiCompanion === 'supportive' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#22D3EE] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-[#0F1216]" />
              </div>
            )}

            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-[#22D3EE]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-[#22D3EE]" />
              </div>
              <div>
                <h4 className="text-[#E5E7EB] font-semibold text-lg">Supportive Mentor</h4>
                <p className="text-[#9CA3AF] text-sm">Encouraging tone</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-sm text-[#9CA3AF]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                <span>Suggests improvements gently</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                <span>Optimizes for learning and confidence</span>
              </li>
            </ul>
            <Ripple />
          </button>

          {/* Critical Funder Card */}
          <button
            onClick={() => setMissionData({ ...missionData, aiCompanion: 'critical' })}
            className={`relative bg-[#171B21] rounded-lg p-6 text-left transition-all border-2 ${missionData.aiCompanion === 'critical'
              ? 'border-[#D97706] shadow-lg shadow-[#D97706]/20'
              : 'border-[#D97706]/30 hover:border-[#D97706]/60'
              }`}
          >
            {missionData.aiCompanion === 'critical' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-[#0F1216]" />
              </div>
            )}

            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-[#D97706]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-[#D97706]" />
              </div>
              <div>
                <h4 className="text-[#E5E7EB] font-semibold text-lg">Critical Funder</h4>
                <p className="text-[#9CA3AF] text-sm">Skeptical tone</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-sm text-[#9CA3AF]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                <span>Pushes for evidence, feasibility, and scale</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                <span>Optimizes for funder-ready rigor</span>
              </li>
            </ul>
            <Ripple />
          </button>
        </div>

        <p className="text-[#6B7280] text-sm text-center mb-8">
          You can change this later
        </p>

        {/* Footer */}
        <div className="bg-[#171B21] rounded-lg p-6 border border-[#2D3340]">
          <div className="flex items-center justify-between mb-2">
            <Button
              onClick={onBack}
              className="px-6 py-2.5 bg-[#374151] text-[#E5E7EB] rounded font-medium hover:bg-[#4B5563] transition-colors h-auto"
            >
              Back
            </Button>
            <Button
              onClick={onInitialize}
              disabled={!missionData.aiCompanion}
              className={`px-8 py-2.5 rounded font-semibold transition-colors h-auto ${missionData.aiCompanion
                ? 'bg-[#D97706] text-[#0F1216] hover:bg-[#B45309]'
                : 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
                }`}
            >
              Initialize Workspace
            </Button>
          </div>
          <p className="text-[#6B7280] text-center text-sm">
            Setting up your system...
          </p>
        </div>
      </div>
    </div>
  );
}