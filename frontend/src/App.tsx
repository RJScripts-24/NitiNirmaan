import { useState, useEffect, useRef } from 'react';
import { Network, Activity, Bot, ArrowRight, User } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import PatternLibrary from './components/PatternLibrary';
import MissionInitialize from './components/MissionInitialize';
import ImpactCanvas from './components/ImpactCanvas';
import LogicPreview from './components/LogicPreview';
import { LFADocument } from './lib/fln-compiler';
import { Node, Edge } from 'reactflow';
import HeroGridWarp from './components/HeroGridWarp';
import Settings from './components/Settings';
import HexagonBackground from './components/HexagonBackground';
import BeeBackground from './components/BeeBackground';
import ScrollReveal from './components/ScrollReveal';
import { Button } from './components/ui/button';
import Loader from './components/Loader';
import { checkBackEndHealth } from './lib/api';

type PageType = 'landing' | 'auth' | 'dashboard' | 'patterns' | 'initialize' | 'builder' | 'preview' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [simulationPassed, setSimulationPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    lfa: LFADocument;
    nodes: Node[];
    edges: Edge[];
    shortcomings: string[];
  } | null>(null);

  // Refs for hero text animations
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  // Hero text fade-in animation from center
  useGSAP(() => {
    if (currentPage === 'landing') {
      const timeline = gsap.timeline();

      timeline
        .fromTo(
          headlineRef.current,
          { opacity: 0, scale: 0.8, y: -20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        .fromTo(
          subheadlineRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(
          taglineRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        );
    }
  }, [currentPage]);

  // Backend Health Check
  useEffect(() => {
    checkBackEndHealth().then((data: any) => {
      if (data && data.status === 'ok') {
        console.log('%c Backend Integrated Successfully ', 'background: #222; color: #bada55');
        console.log('Backend Status:', data);
      } else {
        console.log('%c Backend Connection Failed ', 'background: #222; color: #ff0000');
      }
    });
  }, []);

  // Initialize state from URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as PageType; // Remove #
      if (hash && hash !== currentPage) {
        // Validate hash is a valid PageType, otherwise default to landing
        console.log('Routing to:', hash);
        const validPages: PageType[] = ['landing', 'auth', 'dashboard', 'patterns', 'initialize', 'builder', 'preview', 'settings'];
        if (validPages.includes(hash)) {
          setCurrentPage(hash);
        } else {
          console.warn('Invalid hash, redirecting to landing:', hash);
          setCurrentPage('landing');
        }
      } else if (!hash) {
        console.log('No hash, default to landing');
        setCurrentPage('landing');
      }
    };

    // Set initial page from hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Wrapper to update URL hash instead of direct state
  const navigateTo = (page: PageType) => {
    window.location.hash = page;
  };

  const handlePageTransition = (targetPage: 'landing' | 'auth') => {
    setIsLoading(true);
    setTimeout(() => {
      navigateTo(targetPage);
      setIsLoading(false);
    }, 1500);
  };

  if (currentPage === 'settings') {
    return <Settings onNavigateToDashboard={() => navigateTo('dashboard')} onNavigateToPatterns={() => navigateTo('patterns')} />;
  }

  if (currentPage === 'preview') {
    return (
      <LogicPreview
        simulationPassed={simulationPassed}
        onBack={() => navigateTo('builder')}
        onSettings={() => navigateTo('settings')}
        lfaData={simulationResults?.lfa || null}
        canvasNodes={simulationResults?.nodes || []}
        canvasEdges={simulationResults?.edges || []}
        shortcomings={simulationResults?.shortcomings || []}
      />
    );
  }

  if (currentPage === 'builder') {
    return (
      <ImpactCanvas
        onBack={() => navigateTo('dashboard')}
        onSimulationComplete={(results) => {
          console.log('📦 [App] Received simulation results:', results);
          setSimulationPassed(true);
          if (results) {
            setSimulationResults(results);
          }
          navigateTo('preview');
        }}
        onSettings={() => navigateTo('settings')}
      />
    );
  }

  if (currentPage === 'initialize') {
    return <MissionInitialize onClose={() => navigateTo('dashboard')} onComplete={() => navigateTo('builder')} />;
  }

  if (currentPage === 'patterns') {
    return <PatternLibrary onBack={() => navigateTo('dashboard')} />;
  }

  if (currentPage === 'dashboard') {
    return <Dashboard onNavigateToPatterns={() => navigateTo('patterns')} onNavigateToInitialize={() => navigateTo('initialize')} onNavigateToSettings={() => navigateTo('settings')} />;
  }

  if (currentPage === 'auth') {
    return (
      <>
        {isLoading && <Loader />}
        <AuthPage onBack={() => handlePageTransition('landing')} onAuthSuccess={() => navigateTo('dashboard')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1216] text-gray-200 relative overflow-x-hidden">
      <BeeBackground />
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>

      {/* Subtle vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)'
      }}></div>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="bg-[#171B21]/85 border-b border-[#171B21] relative overflow-hidden">
          {/* Hexagon Background */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <HexagonBackground
              className="w-full h-full"
              hexagonSize={28}
              hexagonMargin={2}
              glowMode="none"
            />
          </div>

          <div className="w-full px-4 md:px-6 relative" style={{ zIndex: 10 }}>
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img
                  src="/logo-2.png"
                  alt="NitiNirmaan Logo"
                  title="Build programs, not paperwork."
                  style={{ height: '2.8rem', width: 'auto', maxWidth: '150px', objectFit: 'contain' }}
                  className="block"
                />
              </div>

              {/* Center Nav Links */}
              <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                <a href="#how-it-works" className="text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors text-sm xl:text-base">
                  How it Works
                </a>
                <a href="#common-lfa" className="text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors text-sm xl:text-base">
                  The Common LFA
                </a>
                <a href="#success-stories" className="text-[#9CA3AF] hover:text-[#E5E7EB] transition-colors text-sm xl:text-base">
                  Success Stories
                </a>
              </div>

              {/* Right CTA Group */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageTransition('auth')}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-[#6B7280] text-[#E5E7EB] rounded hover:bg-[#171B21] transition-colors text-sm h-auto"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => handlePageTransition('auth')}
                  className="px-3 py-1.5 md:px-5 md:py-2 bg-[#D97706] text-[#0F1216] rounded font-medium hover:bg-[#B45309] transition-colors text-sm h-auto border-none shadow-none"
                  title="No blank documents. Start with a system."
                >
                  <span className="hidden sm:inline">Start Building</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-16 overflow-hidden">
        {/* Three.js Interactive Grid */}
        <HeroGridWarp />

        <div className="text-center mb-8 md:mb-12 relative z-10 max-w-7xl mx-auto">
          {/* Headline */}
          <h2 ref={headlineRef} className="text-3xl md:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight px-4">
            <span className="text-[#E5E7EB]">Stop Writing Documents. </span>
            <span className="text-[#D97706]">Start Building Systems.</span>
          </h2>

          {/* Subheadline */}
          <p ref={subheadlineRef} className="text-[#9CA3AF] text-base md:text-lg xl:text-xl max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
            The first gamified Logical Framework Architect for the Shikshagraha network. Turn your program design into a living, breathing simulation.
          </p>

          {/* Primary CTA */}
          <div ref={ctaRef} className="mb-3">
            <Button
              onClick={() => handlePageTransition('auth')}
              className="px-6 py-2.5 md:px-8 md:py-3 bg-[#D97706] text-[#0F1216] rounded font-semibold text-base md:text-lg hover:bg-[#B45309] transition-colors inline-flex items-center gap-2 h-auto border-none shadow-none"
            >
              Start Building <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
          <p ref={taglineRef} className="text-[#9CA3AF] text-xs md:text-sm">See your program before you run it.</p>
        </div>


      </section>

      {/* Content Below Hero - Wrapped in Hexagon Background */}
      <div className="relative w-full overflow-hidden">
        {/* Hexagon Background covering everything below hero */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <HexagonBackground
            className="w-full h-full"
            hexagonSize={28}
            hexagonMargin={2}
            glowMode="none"
          />
        </div>

        {/* Key Features Grid */}
        <section className="w-full px-4 md:px-6 py-12 md:py-20 relative" style={{ zIndex: 10 }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1 - Drag-and-Drop LFA Builder */}
              <ScrollReveal delay={0}>
                <div className="bg-[#171B21] border border-[#1F2937] rounded-lg p-6 md:p-8 relative" style={{
                  backgroundImage: `
                  linear-gradient(#1F2937 1px, transparent 1px),
                  linear-gradient(90deg, #1F2937 1px, transparent 1px)
                `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: 'center'
                }}>
                  <div className="relative z-10 bg-[#171B21] p-2 -m-2">
                    <Network className="w-8 h-8 md:w-10 md:h-10 text-[#D97706] mb-3 md:mb-4" />
                    <h3 className="text-[#E5E7EB] text-lg md:text-xl font-semibold mb-2 md:mb-3">
                      Drag-and-Drop LFA Builder
                      <div className="h-1 w-12 md:w-16 bg-[#D97706] mt-2"></div>
                    </h3>
                    <p className="text-[#9CA3AF] mb-3 md:mb-4 text-sm md:text-base">
                      Visual Logic Construction
                    </p>

                    {/* Mini Visual */}
                    <div className="my-4 md:my-6 flex items-center gap-2 md:gap-3">
                      <div className="bg-[#6B7280] px-2 py-1.5 md:px-3 md:py-2 rounded text-xs flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Teacher
                      </div>
                      <div className="flex-1 h-px bg-[#6B7280]"></div>
                      <div className="bg-[#D97706] px-2 py-1.5 md:px-3 md:py-2 rounded text-xs flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Student
                      </div>
                    </div>

                    <p className="text-[#6B7280] text-xs md:text-sm italic">
                      "No orphan activities. Ever."
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 2 - Pre-Mortem Simulator */}
              <ScrollReveal delay={0.2}>
                <div className="bg-[#171B21] border border-[#1F2937] rounded-lg p-6 md:p-8 relative" style={{
                  backgroundImage: `
                  linear-gradient(#1F2937 1px, transparent 1px),
                  linear-gradient(90deg, #1F2937 1px, transparent 1px)
                `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: 'center'
                }}>
                  <div className="relative z-10 bg-[#171B21] p-2 -m-2">
                    <Activity className="w-8 h-8 md:w-10 md:h-10 text-[#047857] mb-3 md:mb-4" />
                    <h3 className="text-[#E5E7EB] text-lg md:text-xl font-semibold mb-2 md:mb-3">
                      Pre-Mortem Simulator
                      <div className="h-1 w-12 md:w-16 bg-[#047857] mt-2"></div>
                    </h3>
                    <p className="text-[#9CA3AF] mb-3 md:mb-4 text-sm md:text-base">
                      Simulation & Pre-Mortem
                    </p>

                    {/* Mini Visual */}
                    <div className="my-4 md:my-6 grid grid-cols-4 gap-2">
                      <div className="aspect-square bg-[#1F2937] rounded"></div>
                      <div className="aspect-square bg-[#1F2937] rounded"></div>
                      <div className="aspect-square bg-[#6B7280] rounded"></div>
                      <div className="aspect-square bg-[#1F2937] rounded"></div>
                      <div className="col-span-4 h-6 md:h-8 bg-[#D97706] rounded flex items-center justify-center gap-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#0F1216] rounded"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#0F1216] rounded"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#0F1216] rounded"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#0F1216] rounded"></div>
                      </div>
                    </div>

                    <p className="text-[#6B7280] text-xs md:text-sm italic">
                      "Find out what breaks — before the field does."
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 3 - AI That Challenges Your Logic */}
              <ScrollReveal delay={0.4}>
                <div className="bg-[#171B21] border border-[#1F2937] rounded-lg p-6 md:p-8 relative" style={{
                  backgroundImage: `
                  linear-gradient(#1F2937 1px, transparent 1px),
                  linear-gradient(90deg, #1F2937 1px, transparent 1px)
                `,
                  backgroundSize: '20px 20px',
                  backgroundPosition: 'center'
                }}>
                  <div className="relative z-10 bg-[#171B21] p-2 -m-2">
                    <Bot className="w-8 h-8 md:w-10 md:h-10 text-[#22D3EE] mb-3 md:mb-4" />
                    <h3 className="text-[#E5E7EB] text-lg md:text-xl font-semibold mb-2 md:mb-3">
                      AI That Challenges Your Logic
                      <div className="h-1 w-12 md:w-16 bg-[#22D3EE] mt-2"></div>
                    </h3>
                    <p className="text-[#9CA3AF] mb-3 md:mb-4 text-sm md:text-base">
                      Adversarial AI Coach
                    </p>

                    {/* Mini Visual */}
                    <div className="my-4 md:my-6 space-y-2">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-[#22D3EE] rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 md:w-4 md:h-4 text-[#0F1216]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 md:h-2 bg-[#1F2937] rounded w-3/4"></div>
                          <div className="h-1.5 md:h-2 bg-[#1F2937] rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-[#D97706] rounded flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-[#0F1216]" />
                        </div>
                        <div className="flex-1 bg-[#6B7280] rounded h-5 md:h-6"></div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-[#047857] rounded"></div>
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-[#DC2626] rounded"></div>
                      </div>
                    </div>

                    <p className="text-[#6B7280] text-xs md:text-sm italic">
                      "Designed to disagree with you — productively."
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Footer Spacing */}
        <div className="h-12 md:h-20"></div>
      </div>
    </div >
  );
}