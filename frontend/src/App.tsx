import React, { useState } from 'react';
import { Network, Activity, Bot, ArrowRight, User } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import PatternLibrary from './components/PatternLibrary';
import MissionInitialize from './components/MissionInitialize';
import ImpactCanvas from './components/ImpactCanvas';
import LogicPreview from './components/LogicPreview';
import HeroGrid3D from './components/HeroGrid3D';
import Settings from './components/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard' | 'patterns' | 'initialize' | 'builder' | 'preview' | 'settings'>('landing');
  const [simulationPassed, setSimulationPassed] = useState(false);

  if (currentPage === 'settings') {
    return <Settings onNavigateToDashboard={() => setCurrentPage('dashboard')} onNavigateToPatterns={() => setCurrentPage('patterns')} />;
  }

  if (currentPage === 'preview') {
    return <LogicPreview simulationPassed={simulationPassed} onBack={() => setCurrentPage('builder')} />;
  }

  if (currentPage === 'builder') {
    return <ImpactCanvas onBack={() => setCurrentPage('dashboard')} onSimulationComplete={() => {
      setSimulationPassed(true);
      setCurrentPage('preview');
    }} />;
  }

  if (currentPage === 'initialize') {
    return <MissionInitialize onClose={() => setCurrentPage('dashboard')} onComplete={() => setCurrentPage('builder')} />;
  }

  if (currentPage === 'patterns') {
    return <PatternLibrary onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'dashboard') {
    return <Dashboard onNavigateToPatterns={() => setCurrentPage('patterns')} onNavigateToInitialize={() => setCurrentPage('initialize')} onNavigateToSettings={() => setCurrentPage('settings')} />;
  }

  if (currentPage === 'auth') {
    return <AuthPage onBack={() => setCurrentPage('landing')} onAuthSuccess={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#0f1318] text-white relative overflow-x-hidden">
      {/* Hero Background Gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% 20%, rgba(230, 126, 34, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #0f1318 0%, #1a1f28 100%)
        `
      }}></div>

      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(15, 19, 24, 0.3) 70%, rgba(15, 19, 24, 0.6) 100%)'
      }}></div>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="bg-[#1a1f28]/85 border-b border-[#2d3340]">
          <div className="w-full px-4 md:px-6">
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <h1 className="text-white font-semibold text-lg md:text-xl" title="Build programs, not paperwork.">
                  Niti<span className="text-white">Nirmaan</span>
                </h1>
              </div>

              {/* Center Nav Links */}
              <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                <a href="#how-it-works" className="text-[#b8bcc4] hover:text-white transition-colors text-sm xl:text-base">
                  How it Works
                </a>
                <span className="text-[#6b7280]">◆</span>
                <a href="#common-lfa" className="text-[#b8bcc4] hover:text-white transition-colors text-sm xl:text-base">
                  The Common LFA
                </a>
                <a href="#success-stories" className="text-[#b8bcc4] hover:text-white transition-colors text-sm xl:text-base">
                  Success Stories
                </a>
              </div>

              {/* Right CTA Group */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <button 
                  onClick={() => setCurrentPage('auth')}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-[#2d3340] text-white rounded hover:bg-[#1a1f28] transition-colors text-sm"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setCurrentPage('auth')}
                  className="px-3 py-1.5 md:px-5 md:py-2 rounded font-medium text-sm text-white transition-all duration-300 hover:transform hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                    boxShadow: '0 4px 14px rgba(230, 126, 34, 0.3)'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 126, 34, 0.4)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(230, 126, 34, 0.3)';
                  }}
                  title="No blank documents. Start with a system."
                >
                  <span className="hidden sm:inline">Start Building</span>
                  <span className="sm:hidden">Start</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-16 overflow-hidden">
        {/* Grid background covering entire hero section */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        ></div>

        {/* 3D Hover Effect */}
        <HeroGrid3D />

        <div className="text-center mb-8 md:mb-12 relative z-10 max-w-7xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight px-4">
            <span className="text-white">Stop Writing Documents. </span>
            <span className="text-[#e67e22]">Start Building Systems.</span>
          </h2>

          {/* Subheadline */}
          <p className="text-[#b8bcc4] text-base md:text-lg xl:text-xl max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
            The first gamified Logical Framework Architect for the Shikshagraha network. Turn your program design into a living, breathing simulation.
          </p>

          {/* Primary CTA */}
          <div className="mb-3">
            <button 
              onClick={() => setCurrentPage('auth')}
              className="px-6 py-2.5 md:px-8 md:py-3 rounded font-semibold text-base md:text-lg text-white transition-all duration-300 hover:transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                boxShadow: '0 4px 14px rgba(230, 126, 34, 0.3)'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 126, 34, 0.4)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(230, 126, 34, 0.3)';
              }}
            >
              Start Building <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <p className="text-[#b8bcc4] text-xs md:text-sm">See your program before you run it.</p>
        </div>

        {/* Hero Visual */}
        <div className="relative bg-[#0f1318] border border-[#2d3340] rounded-lg p-6 md:p-12 mt-8 md:mt-16 z-10 max-w-7xl mx-auto">
          <div className="relative h-48 md:h-64 flex items-center justify-center overflow-x-auto md:overflow-visible">
            {/* Teacher Node */}
            <div className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 bg-[#252b35] px-3 py-1.5 md:px-4 md:py-2 rounded flex items-center gap-1.5 md:gap-2 text-xs md:text-sm whitespace-nowrap text-white">
              <User className="w-3 h-3 md:w-4 md:h-4" />
              <span>Teacher</span>
            </div>

            {/* Connection Line from Teacher to Activity */}
            <svg className="absolute left-16 md:left-36 top-1/2 w-20 md:w-32 h-1 -translate-y-1/2" style={{ marginLeft: '30px' }}>
              <path d="M 0 0 Q 60 -20, 120 0" stroke="#6b7280" strokeWidth="2" fill="none" />
            </svg>

            {/* Activity Needed Node */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 md:px-5 md:py-2 rounded flex items-center gap-1.5 md:gap-2 shadow-lg whitespace-nowrap text-white font-medium text-xs md:text-base"
              style={{
                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                boxShadow: '0 4px 14px rgba(230, 126, 34, 0.3)'
              }}
            >
              <Activity className="w-3 h-3 md:w-4 md:h-4" />
              <span>Activity Needed!</span>
            </div>

            {/* Connection Line from Activity to Student */}
            <svg className="absolute right-16 md:right-36 top-1/2 w-20 md:w-32 h-1 -translate-y-1/2" style={{ marginRight: '30px' }}>
              <path d="M 0 0 Q 60 20, 120 0" stroke="#6b7280" strokeWidth="2" fill="none" />
            </svg>

            {/* Student Node */}
            <div className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 bg-[#252b35] px-3 py-1.5 md:px-4 md:py-2 rounded flex items-center gap-1.5 md:gap-2 text-xs md:text-sm whitespace-nowrap text-white">
              <User className="w-3 h-3 md:w-4 md:h-4" />
              <span>Student</span>
            </div>
          </div>

          {/* Toolbar Icons */}
          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-[#252b35] rounded flex items-center justify-center border border-[#2d3340]">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-[#6b7280] rounded"></div>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-[#252b35] rounded flex items-center justify-center border border-[#2d3340]">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-[#6b7280] rounded-sm"></div>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-[#252b35] rounded flex items-center justify-center border border-[#2d3340]">
              <div className="w-2 h-2 md:w-3 md:h-3 border-2 border-[#6b7280] rounded-full"></div>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-[#252b35] rounded flex items-center justify-center border border-[#2d3340]">
              <Network className="w-3 h-3 md:w-4 md:h-4 text-[#6b7280]" />
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-[#252b35] rounded flex items-center justify-center border border-[#2d3340]">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="w-full px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Card 1 - Drag-and-Drop LFA Builder */}
            <div className="rounded-lg p-6 md:p-8 relative transition-all duration-300 hover:transform hover:-translate-y-1" style={{
              background: 'linear-gradient(135deg, rgba(26, 31, 40, 0.8) 0%, rgba(37, 43, 53, 0.6) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #2d3340',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = '#3d4451';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = '#2d3340';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
            }}
            >
              <div className="relative z-10">
                <Network className="w-8 h-8 md:w-10 md:h-10 text-[#e67e22] mb-3 md:mb-4" />
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2 md:mb-3">
                  Drag-and-Drop LFA Builder
                  <div className="h-1 w-12 md:w-16 bg-[#e67e22] mt-2"></div>
                </h3>
                <p className="text-[#b8bcc4] mb-3 md:mb-4 text-sm md:text-base">
                  Visual Logic Construction
                </p>
                
                {/* Mini Visual */}
                <div className="my-4 md:my-6 flex items-center gap-2 md:gap-3">
                  <div className="bg-[#252b35] px-2 py-1.5 md:px-3 md:py-2 rounded text-xs flex items-center gap-1 text-white">
                    <User className="w-3 h-3" />
                    Teacher
                  </div>
                  <div className="flex-1 h-px bg-[#6b7280]"></div>
                  <div className="px-2 py-1.5 md:px-3 md:py-2 rounded text-xs flex items-center gap-1 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'
                    }}
                  >
                    <Activity className="w-3 h-3" />
                    Activity Needed!
                  </div>
                  <div className="flex-1 h-px bg-[#6b7280]"></div>
                  <div className="bg-[#252b35] px-2 py-1.5 md:px-3 md:py-2 rounded text-xs flex items-center gap-1 text-white">
                    <User className="w-3 h-3" />
                    Student
                  </div>
                </div>

                <p className="text-[#6b7280] text-xs md:text-sm italic">
                  "No orphan activities. Ever."
                </p>
              </div>
            </div>

            {/* Card 2 - Pre-Mortem Simulator */}
            <div className="rounded-lg p-6 md:p-8 relative transition-all duration-300 hover:transform hover:-translate-y-1" style={{
              background: 'linear-gradient(135deg, rgba(26, 31, 40, 0.8) 0%, rgba(37, 43, 53, 0.6) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #2d3340',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = '#3d4451';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = '#2d3340';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
            }}
            >
              <div className="relative z-10">
                <Activity className="w-8 h-8 md:w-10 md:h-10 text-[#047857] mb-3 md:mb-4" />
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2 md:mb-3">
                  Pre-Mortem Simulator
                  <div className="h-1 w-12 md:w-16 bg-[#047857] mt-2"></div>
                </h3>
                <p className="text-[#b8bcc4] mb-3 md:mb-4 text-sm md:text-base">
                  Simulation & Pre-Mortem
                </p>

                {/* Mini Visual */}
                <div className="my-4 md:my-6 grid grid-cols-4 gap-2">
                  <div className="aspect-square bg-[#252b35] rounded border border-[#2d3340]"></div>
                  <div className="aspect-square bg-[#252b35] rounded border border-[#2d3340]"></div>
                  <div className="aspect-square bg-[#6b7280] rounded border border-[#2d3340]"></div>
                  <div className="aspect-square bg-[#252b35] rounded border border-[#2d3340]"></div>
                  <div className="col-span-4 h-6 md:h-8 rounded flex items-center justify-center gap-1 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'
                    }}
                  >
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded"></div>
                  </div>
                  <div className="col-span-2 aspect-square bg-[#252b35] rounded border border-[#2d3340]"></div>
                  <div className="col-span-2 aspect-square bg-[#252b35] rounded border border-[#2d3340]"></div>
                </div>

                <p className="text-[#6b7280] text-xs md:text-sm italic">
                  "Find out what breaks — before the field does."
                </p>
              </div>
            </div>

            {/* Card 3 - AI That Challenges Your Logic */}
            <div className="rounded-lg p-6 md:p-8 relative transition-all duration-300 hover:transform hover:-translate-y-1" style={{
              background: 'linear-gradient(135deg, rgba(26, 31, 40, 0.8) 0%, rgba(37, 43, 53, 0.6) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #2d3340',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = '#3d4451';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = '#2d3340';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
            }}
            >
              <div className="relative z-10">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-[#4ecdc4] mb-3 md:mb-4" />
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2 md:mb-3">
                  AI That Challenges Your Logic
                  <div className="h-1 w-12 md:w-16 bg-[#4ecdc4] mt-2"></div>
                </h3>
                <p className="text-[#b8bcc4] mb-3 md:mb-4 text-sm md:text-base">
                  Adversarial AI Coach
                </p>

                {/* Mini Visual */}
                <div className="my-4 md:my-6 space-y-2">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#4ecdc4] rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 md:w-4 md:h-4 text-[#0f1318]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 md:h-2 bg-[#252b35] rounded w-3/4"></div>
                      <div className="h-1.5 md:h-2 bg-[#252b35] rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded flex items-center justify-center flex-shrink-0 text-white"
                      style={{
                        background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'
                      }}
                    >
                      <User className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div className="flex-1 bg-[#6b7280] rounded h-5 md:h-6"></div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-[#047857] rounded"></div>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-[#ff6b6b] rounded"></div>
                  </div>
                </div>

                <p className="text-[#6b7280] text-xs md:text-sm italic">
                  "Designed to disagree with you — productively."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="w-full px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-white text-xl md:text-2xl text-center mb-8 md:mb-12">
            Trusted by 150+ Education Organizations
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-40">
            {/* Logo placeholders - grayscale rectangles representing logos */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i}
                className="w-16 h-12 md:w-24 md:h-16 bg-[#252b35] rounded opacity-50 hover:opacity-100 transition-opacity cursor-pointer border border-[#2d3340]"
                title={`Program model forked ${Math.floor(Math.random() * 50) + 10} times`}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="w-full px-4 md:px-6 py-12 md:py-20 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#b8bcc4] text-lg md:text-xl xl:text-2xl mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
            Your program already exists as a system.<br />
            NitiNirmaan just makes it visible.
          </p>

          <button 
            onClick={() => setCurrentPage('auth')}
            className="px-6 py-2.5 md:px-8 md:py-3 rounded font-semibold text-base md:text-lg text-white transition-all duration-300 hover:transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
              boxShadow: '0 4px 14px rgba(230, 126, 34, 0.3)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 126, 34, 0.4)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(230, 126, 34, 0.3)';
            }}
          >
            Start Building <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-12 md:h-20"></div>
    </div>
  );
}