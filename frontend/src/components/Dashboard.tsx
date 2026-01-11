import { useState } from 'react';
import { Plus, Book, Bell, Settings, User, MoreVertical, Search } from 'lucide-react';

interface DashboardProps {
  onBack?: () => void;
  onNavigateToPatterns?: () => void;
  onNavigateToInitialize?: () => void;
  onNavigateToSettings?: () => void;
}

export default function Dashboard({ onBack, onNavigateToPatterns, onNavigateToInitialize, onNavigateToSettings }: DashboardProps) {
  const [sortBy, setSortBy] = useState('Recently Edited');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const projects = [
    {
      id: '1',
      name: 'FLN Bihar 2026',
      status: 'Draft',
      edited: '2 days ago',
      logicHealth: 65,
      statusColor: 'neutral'
    },
    {
      id: '2',
      name: 'STEM Gujarat 2027',
      status: 'Draft',
      edited: '3 hours ago',
      logicHealth: 25,
      statusColor: 'neutral'
    },
    {
      id: '3',
      name: 'STEM Gujarat 2027',
      status: 'Simulation Failed',
      edited: '3 hours ago',
      logicHealth: 25,
      statusColor: 'error',
      hasError: true
    },
    {
      id: '4',
      name: 'EdTech Punjab 2026',
      status: 'Ready for Export',
      edited: '5 days ago',
      logicHealth: 85,
      statusColor: 'success'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F1216] text-gray-200 relative">
      {/* Global Noise Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Vertical Grain Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
      }} />

      {/* Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px)',
        backgroundSize: '100% 3px',
      }} />

      {/* Global Vignette - Enhanced */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)'
      }} />

      {/* Soft Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% 30%, rgba(23, 27, 33, 0.15) 0%, transparent 60%)'
      }} />

      {/* Top Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-[#1F2937]/30">
        <div className="bg-[#171B21]/90 relative">
          {/* Noise on top bar */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} />

          <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center gap-6 relative">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
              <h1 className="text-[#E5E7EB] font-semibold text-xl whitespace-nowrap">
                Niti<span className="text-[#E5E7EB]">Nirmaan</span>
              </h1>
            </div>

            {/* Left Icons */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center bg-[#D97706] hover:bg-[#B45309] rounded transition-colors">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#374151] hover:bg-[#4B5563] rounded transition-colors relative">
                <svg className="w-5 h-5 text-[#E5E7EB]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects or templates"
                  className="w-full pl-4 pr-4 py-2.5 bg-[#0F1216] border border-[#2D3340] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#4B5563] transition-colors text-sm"
                />
              </div>
            </div>

            {/* Center-Right: Avatar & Level Badge */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative w-12 h-12 rounded-full bg-[#374151] overflow-hidden border-2 border-[#2D3340]">
                <img
                  src="figma:asset/c2883b253b54d2569f35712fdc66c1601585d805.png"
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#D97706] rounded-full border-2 border-[#171B21]"></div>
              </div>

              {/* Level Badge */}
              <div className="group relative cursor-help">
                <div className="text-sm">
                  <span className="text-[#E5E7EB]">Level 2: </span>
                  <span className="text-[#D97706]">Strategist</span>
                  <span className="text-[#D97706] ml-1">•</span>
                </div>

                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2.5 bg-[#1F2937] rounded text-xs text-[#E5E7EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1F2937] rotate-45"></div>
                  <div className="relative">Unlocked after completing<br />2 simulations.</div>
                </div>
              </div>
            </div>

            {/* Right: Utility Icons */}
            <div className="flex items-center gap-2">
              <button className="relative w-10 h-10 flex items-center justify-center hover:bg-[#1F2937] rounded transition-colors border border-[#2D3340]">
                <Bell className="w-5 h-5 text-[#9CA3AF]" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D97706] rounded-full"></div>
              </button>
              <button
                onClick={onNavigateToSettings}
                className="w-10 h-10 flex items-center justify-center hover:bg-[#1F2937] rounded transition-colors border border-[#2D3340]"
              >
                <Settings className="w-5 h-5 text-[#9CA3AF]" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-[#1F2937] rounded transition-colors border border-[#2D3340]">
                <User className="w-5 h-5 text-[#9CA3AF]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-[#E5E7EB] text-xl font-semibold mb-6">Quick Actions</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create New Mission Card */}
            <div
              onClick={onNavigateToInitialize}
              className="group relative rounded-lg overflow-hidden cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(to bottom, #1E2024 0%, #181A1E 100%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(74,77,82,0.4)',
                border: '1px solid rgba(74,77,82,0.3)'
              }}>
              {/* Noise on card */}
              <div className="absolute inset-0 rounded-lg opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}></div>

              {/* Etched Copper Schematics Background */}
              <div className="absolute inset-0 opacity-[0.12]">
                <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" stroke="#A0522D" strokeWidth="0.5">
                  <line x1="50" y1="100" x2="120" y2="100" />
                  <circle cx="120" cy="100" r="8" />
                  <line x1="128" y1="100" x2="180" y2="60" />
                  <line x1="128" y1="100" x2="180" y2="140" />
                  <rect x="180" y="50" width="40" height="20" rx="2" />
                  <rect x="180" y="130" width="40" height="20" rx="2" />
                  <line x1="220" y1="60" x2="280" y2="60" />
                  <line x1="220" y1="140" x2="280" y2="140" />
                  <circle cx="280" cy="60" r="6" />
                  <circle cx="280" cy="140" r="6" />
                </svg>
              </div>

              <div className="relative p-8 min-h-[200px] flex flex-col justify-between">
                <div className="flex items-start gap-6">
                  {/* Vibrant Orange Plus Icon with Neon Glow */}
                  <div className="relative flex-shrink-0">
                    {/* Outer halo */}
                    <div className="absolute inset-0 -m-2 bg-[#CC7A00] blur-lg opacity-30 rounded-full"></div>
                    <Plus className="w-12 h-12 text-[#FF8C00] relative z-10" strokeWidth={2.5} style={{
                      filter: 'drop-shadow(0 0 6px rgba(255, 140, 0, 0.6))'
                    }} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-xl font-bold mb-2">Create New Mission</h3>
                    <p className="text-[#8E959F] text-sm">Start from a goal, not a blank canvas.</p>
                  </div>
                </div>

                {/* Decorative Icons - Bottom Right */}
                <div className="flex justify-end items-end">
                  <div className="flex items-center gap-3 opacity-40">
                    {/* Levels/Slider Icon */}
                    <div className="flex flex-col justify-center gap-[6px]">
                      <div className="w-5 h-[2px] bg-[#70757D] relative">
                        <div className="absolute -top-[2px] left-1 w-[2px] h-[6px] bg-[#70757D]"></div>
                      </div>
                      <div className="w-5 h-[2px] bg-[#70757D] relative">
                        <div className="absolute -top-[2px] right-1 w-[2px] h-[6px] bg-[#70757D]"></div>
                      </div>
                    </div>

                    {/* Equals Icon */}
                    <div className="flex flex-col gap-[4px]">
                      <div className="w-5 h-[3px] bg-[#70757D] rounded-sm"></div>
                      <div className="w-5 h-[3px] bg-[#70757D] rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Pattern Library Card */}
            <div
              onClick={onNavigateToPatterns}
              className="group relative rounded-lg overflow-hidden cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(to bottom, #1E2024 0%, #181A1E 100%)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(74,77,82,0.4)',
                border: '1px solid rgba(74,77,82,0.3)'
              }}>
              {/* Noise on card */}
              <div className="absolute inset-0 rounded-lg opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}></div>

              {/* Etched Copper Schematics Background - Fork Pattern */}
              <div className="absolute inset-0 opacity-[0.12]">
                <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" stroke="#A0522D" strokeWidth="0.5">
                  <line x1="40" y1="100" x2="100" y2="100" />
                  <circle cx="100" cy="100" r="8" />
                  <line x1="108" y1="100" x2="160" y2="60" />
                  <line x1="108" y1="100" x2="160" y2="140" />
                  <rect x="160" y="50" width="50" height="20" rx="2" />
                  <rect x="160" y="130" width="50" height="20" rx="2" />
                  <line x1="210" y1="60" x2="260" y2="60" />
                  <line x1="210" y1="140" x2="260" y2="140" />
                  <line x1="260" y1="60" x2="300" y2="100" />
                  <line x1="260" y1="140" x2="300" y2="100" />
                  <circle cx="300" cy="100" r="8" />
                </svg>
              </div>

              <div className="relative p-8 min-h-[200px] flex flex-col justify-between">
                <div className="flex items-start gap-6">
                  {/* Vibrant Orange Book Icon with Neon Glow */}
                  <div className="relative flex-shrink-0">
                    {/* Outer halo */}
                    <div className="absolute inset-0 -m-2 bg-[#CC7A00] blur-lg opacity-30 rounded-full"></div>
                    <Book className="w-12 h-12 text-[#FF8C00] relative z-10" strokeWidth={2.5} style={{
                      filter: 'drop-shadow(0 0 6px rgba(255, 140, 0, 0.6))'
                    }} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-xl font-bold mb-2">Browse Pattern Library</h3>
                    <p className="text-[#8E959F] text-sm">Fork proven program logic from the network.</p>
                  </div>
                </div>

                {/* Decorative Icons - Bottom Right */}
                <div className="flex justify-end items-end">
                  <div className="flex items-center gap-3 opacity-40">
                    {/* Play/Triangle Icon */}
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#70757D] border-b-[6px] border-b-transparent"></div>

                    {/* Pause Icon */}
                    <div className="flex gap-[3px]">
                      <div className="w-[3px] h-4 bg-[#70757D] rounded-sm"></div>
                      <div className="w-[3px] h-4 bg-[#70757D] rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* My Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-[#E5E7EB] text-xl font-semibold">My Projects</h2>
              <button className="text-[#9CA3AF] hover:text-[#E5E7EB]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#171B21] border border-[#1F2937] rounded px-4 py-2 pr-8 text-sm text-[#9CA3AF] focus:outline-none focus:border-[#374151] cursor-pointer"
              >
                <option>Recently Edited</option>
                <option>Name</option>
                <option>Logic Health</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Project Cards - Full Width List */}
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="relative bg-[#2B2F38] rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-[#2F333C] border border-[#374151]/50"
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                {/* Noise on card */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}></div>

                <div className="relative flex items-center">
                  {/* Left Section - Project Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-[#E5E7EB] font-semibold text-lg">{project.name}</h3>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        {project.statusColor === 'success' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#047857]/20 text-[#047857]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {project.status}
                          </span>
                        ) : project.statusColor === 'error' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#B91C1C]/20 text-[#B91C1C]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {project.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#374151]/50 text-[#9CA3AF]">
                            {project.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <p className="text-[#9CA3AF] text-sm mb-4">Edited {project.edited}</p>

                    {/* Logic Health */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#9CA3AF] text-xs font-medium">Logic Health</span>
                      </div>
                      <div className="relative h-2.5 bg-[#1A1D24] rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all"
                          style={{
                            width: `${project.logicHealth}%`,
                            background: project.logicHealth <= 30
                              ? 'linear-gradient(to right, #B22222 0%, #FF8C00 100%)'
                              : project.logicHealth <= 70
                                ? 'linear-gradient(to right, #FF8C00 0%, #D97706 100%)'
                                : 'linear-gradient(to right, #32CD32 0%, #ADFF2F 100%)',
                            boxShadow: project.logicHealth <= 30
                              ? '0 0 8px rgba(178, 34, 34, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                              : project.logicHealth <= 70
                                ? '0 0 8px rgba(255, 140, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                                : '0 0 8px rgba(50, 205, 50, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                          }}
                          title="Based on completeness, causal integrity, and indicator coverage."
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Logic Preview & Menu */}
                  <div className="flex items-center gap-4 pr-4">
                    {/* Logic Flow Preview */}
                    <div className="w-64 h-24 bg-[#1F2329] rounded p-3 flex items-center justify-center relative overflow-hidden">
                      {/* Grid background */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `
                          linear-gradient(#374151 1px, transparent 1px),
                          linear-gradient(90deg, #374151 1px, transparent 1px)
                        `,
                        backgroundSize: '10px 10px',
                      }}></div>

                      {/* Logic diagram preview */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        {project.id === '1' && (
                          // FLN Bihar - Simple flow
                          <>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#6B7280] rounded"></div>
                            <div className="absolute left-7 top-1/2 -translate-y-1/2 w-12 h-px bg-[#6B7280]"></div>
                            <div className="absolute left-20 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#6B7280] rounded-sm"></div>
                            <div className="absolute left-24 top-1/2 -translate-y-1/2 w-16 h-px bg-[#6B7280]"></div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#6B7280] rounded"></div>

                            {/* Status indicator */}
                            <div className="absolute right-2 top-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#374151] rounded text-[10px] text-[#9CA3AF]">
                              <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full"></div>
                              Draft
                            </div>
                          </>
                        )}
                        {project.id === '2' && (
                          // STEM Gujarat - Failed simulation
                          <>
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#6B7280] rounded-sm"></div>
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-8 h-px bg-[#B91C1C]"></div>
                            <div className="absolute left-24 top-1/2 -translate-y-1/2 flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#B91C1C]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                              </svg>
                            </div>
                            <div className="absolute left-32 top-1/2 -translate-y-1/2 w-12 h-px bg-[#6B7280]"></div>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#6B7280] rounded"></div>

                            {/* Status indicator */}
                            <div className="absolute right-2 top-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#B91C1C]/20 rounded text-[10px] text-[#B91C1C]">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Simulation Failed
                            </div>
                          </>
                        )}
                        {project.id === '3' && (
                          // Duplicate STEM Gujarat
                          <>
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#6B7280] rounded-sm"></div>
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-8 h-px bg-[#B91C1C]"></div>
                            <div className="absolute left-24 top-1/2 -translate-y-1/2 flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#B91C1C]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                              </svg>
                            </div>
                            <div className="absolute left-32 top-1/2 -translate-y-1/2 w-12 h-px bg-[#6B7280]"></div>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#6B7280] rounded"></div>

                            {/* Status indicator */}
                            <div className="absolute right-2 top-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#B91C1C]/20 rounded text-[10px] text-[#B91C1C]">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Simulation Failed
                            </div>
                          </>
                        )}
                        {project.id === '4' && (
                          // EdTech Punjab - Success flow
                          <>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#6B7280] rounded"></div>
                            <div className="absolute left-7 top-1/2 -translate-y-1/2 w-10 h-px bg-[#047857]"></div>
                            <div className="absolute left-18 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#047857] rounded-sm"></div>
                            <div className="absolute left-24 top-1/2 -translate-y-1/2 w-14 h-px bg-[#047857]"></div>
                            <div className="absolute left-40 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#047857] rounded-sm"></div>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-px bg-[#047857]"></div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#047857] rounded"></div>

                            {/* Status indicator */}
                            <div className="absolute right-2 top-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#047857]/20 rounded text-[10px] text-[#047857]">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Ready for Export
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Three-dot Menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === project.id ? null : project.id);
                      }}
                      className="p-2 hover:bg-[#1F2937] rounded transition-colors relative"
                    >
                      <MoreVertical className="w-5 h-5 text-[#9CA3AF]" />

                      {/* Menu Dropdown */}
                      {showMenu === project.id && (
                        <div className="absolute right-0 top-10 bg-[#1F2937] rounded shadow-lg py-1 z-10 min-w-[160px]">
                          <button className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors">
                            Open
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors">
                            Duplicate
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-[#6B7280] cursor-not-allowed"
                            disabled={project.statusColor !== 'success'}
                          >
                            Export
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors">
                            Manage Team
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors">
                            Archive
                          </button>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}