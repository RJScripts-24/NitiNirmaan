import { useState, useEffect } from 'react';
import { Plus, Book, Bell, Settings, User, MoreVertical, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import NoiseBackground from './NoiseBackground';
import HexagonBackground from './HexagonBackground';

interface DashboardProps {
  onBack?: () => void;
  onNavigateToPatterns?: () => void;
  onNavigateToInitialize?: () => void;
  onNavigateToSettings?: () => void;
}

import { supabase } from '../lib/supabase';

// ... (keep imports)

export default function Dashboard({ onBack, onNavigateToPatterns, onNavigateToInitialize, onNavigateToSettings }: DashboardProps) {
  const [sortBy, setSortBy] = useState('Recently Edited');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Delete State
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (project: any) => {
    setProjectToDelete(project);
    setDeleteConfirmationText('');
    setShowMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Get fresh token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert("Authentication error. Please sign in again.");
        return;
      }

      // 2. Call Delete API
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // 3. Update UI
      setUserProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setProjectToDelete(null); // Close modal

    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Real Projects State
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock Projects (Only for Guests)
  const mockProjects = [
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

  const getHealthColor = (health: number) => {
    if (health <= 30) return '#B91C1C';
    if (health <= 70) return '#F59E0B';
    return '#047857';
  };

  // Load Projects (Real or Guest)
  const [guestProject, setGuestProject] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = localStorage.getItem('token');

      if (session || token) {
        setIsAuthenticated(true);
        setIsLoadingProjects(true);
        try {
          // Fetch real projects
          // Using Supabase client directly, assuming RLS allows selecting own projects
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (data) {
            // Map DB projects to Dashboard UI format
            const mappedProjects = data.map(p => ({
              id: p.id,
              name: p.title,
              status: 'Draft', // Default for now
              edited: new Date(p.updated_at || p.created_at).toLocaleDateString(),
              logicHealth: 0, // Need to calculate or store this?
              statusColor: 'neutral'
            }));
            setUserProjects(mappedProjects);
          }
        } catch (err) {
          console.error('Error fetching projects:', err);
        } finally {
          setIsLoadingProjects(false);
        }
      } else {
        // Guest Mode
        setIsAuthenticated(false);
        const stored = localStorage.getItem('guest_active_project');
        if (stored) {
          setGuestProject(JSON.parse(stored));
        }
      }
    };

    checkAuthAndFetch();
  }, []);

  // Determine which projects to show
  const allProjects = isAuthenticated
    ? userProjects
    : (guestProject ? [{
      id: guestProject.id,
      name: guestProject.title,
      status: 'Guest Draft',
      edited: 'Just now',
      logicHealth: 50,
      statusColor: 'neutral',
      isGuest: true
    }, ...mockProjects] : mockProjects);

  return (
    <div className="min-h-screen bg-[#0F1216] text-gray-200 relative">
      {/* Global Noise Layer */}
      <NoiseBackground />

      {/* Global Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
      }}></div>

      {/* Soft Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% 30%, rgba(23, 27, 33, 0.15) 0%, transparent 60%)'
      }}></div>

      {/* Top Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-[#1F2937]/30 relative overflow-hidden bg-[#171B21]/80">
        {/* Hexagon Background */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <HexagonBackground
            className="w-full h-full"
            hexagonSize={28}
            hexagonMargin={2}
            glowMode="hover"
          />
        </div>

        {/* Noise on top bar */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>

        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center gap-6 relative" style={{ zIndex: 10, pointerEvents: 'none' }}>
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/logo-2.png"
              alt="NitiNirmaan Logo"
              title="Build programs, not paperwork."
              style={{ height: '2.8rem', width: 'auto', maxWidth: '150px', objectFit: 'contain' }}
              className="block"
            />
          </div>

          {/* Left Icons */}
          <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
            {/* Removed orange button with white square icon */}
            {/* Removed dark button with warning triangle icon */}
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-xl" style={{ pointerEvents: 'auto' }}>
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
          <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>

            <Button
              onClick={onNavigateToSettings}
              className="w-10 h-10 p-0 flex items-center justify-center hover:bg-[#1F2937] rounded transition-colors border border-[#2D3340] bg-transparent"
            >
              <Settings className="w-5 h-5 text-[#9CA3AF]" />
            </Button>
            {/* Removed User icon button */}
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
              className="group relative bg-[#1F2329] rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-[#232831] border border-[#2D3340]" style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
              {/* Hexagon Background Effect */}
              <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <HexagonBackground
                  className="w-full h-full"
                  hexagonSize={25}
                  hexagonMargin={2}
                  glowMode="none"
                />
              </div>

              {/* Noise on card */}
              <div className="absolute inset-0 rounded-lg opacity-[0.04] pointer-events-none" style={{ zIndex: 1, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

              <div className="relative p-8" style={{ zIndex: 10 }}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#D97706] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#E5E7EB] text-xl font-semibold mb-2">Create New Mission</h3>
                    <p className="text-[#9CA3AF] text-sm">Start from a goal, not a blank canvas.</p>
                  </div>
                </div>

                {/* Wireframe preview - always visible */}
                <div className="h-24 bg-[#171B21] rounded p-4 relative overflow-hidden">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
linear - gradient(#374151 1px, transparent 1px),
  linear - gradient(90deg, #374151 1px, transparent 1px)
    `,
                    backgroundSize: '12px 12px',
                  }}></div>

                  {/* Flowchart elements */}
                  <div className="relative w-full h-full flex items-center justify-start gap-3">
                    {/* Input node */}
                    <div className="w-6 h-6 border-2 border-[#6B7280] rounded-sm"></div>

                    {/* Arrow */}
                    <div className="w-8 h-px bg-[#6B7280]"></div>

                    {/* Process box */}
                    <div className="w-12 h-8 border-2 border-[#6B7280] rounded"></div>

                    {/* Arrow */}
                    <div className="w-8 h-px bg-[#6B7280]"></div>

                    {/* Decision diamond */}
                    <div className="w-7 h-7 border-2 border-[#6B7280] rotate-45"></div>

                    {/* Arrow */}
                    <div className="w-8 h-px bg-[#6B7280]"></div>

                    {/* Output boxes */}
                    <div className="flex flex-col gap-1.5">
                      <div className="w-10 h-3 border border-[#6B7280] rounded-sm"></div>
                      <div className="w-10 h-3 border border-[#6B7280] rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Pattern Library Card */}
            <div
              onClick={onNavigateToPatterns}
              className="group relative bg-[#1F2329] rounded-lg overflow-hidden cursor-pointer transition-all hover:bg-[#232831] border border-[#2D3340]"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
              {/* Hexagon Background Effect */}
              <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <HexagonBackground
                  className="w-full h-full"
                  hexagonSize={25}
                  hexagonMargin={2}
                  glowMode="none"
                />
              </div>

              {/* Noise on card */}
              <div className="absolute inset-0 rounded-lg opacity-[0.04] pointer-events-none" style={{ zIndex: 1, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

              <div className="relative p-8" style={{ zIndex: 10 }}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#D97706] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Book className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#E5E7EB] text-xl font-semibold mb-2">Browse Pattern Library</h3>
                    <p className="text-[#9CA3AF] text-sm">Fork proven program logic from the network.</p>
                  </div>
                </div>

                {/* Branching preview - always visible */}
                <div className="h-24 bg-[#171B21] rounded p-4 relative overflow-hidden">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
linear - gradient(#374151 1px, transparent 1px),
  linear - gradient(90deg, #374151 1px, transparent 1px)
    `,
                    backgroundSize: '12px 12px',
                  }}></div>

                  {/* Fork/branch diagram */}
                  <div className="relative w-full h-full">
                    {/* Main branch */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 80" fill="none" stroke="#6B7280" strokeWidth="2">
                      {/* Main line */}
                      <line x1="20" y1="40" x2="80" y2="40" />

                      {/* Fork node */}
                      <circle cx="80" cy="40" r="5" fill="#6B7280" />

                      {/* Upper branch */}
                      <line x1="80" y1="40" x2="120" y2="20" />
                      <rect x="120" y="12" width="40" height="16" rx="2" />
                      <line x1="160" y1="20" x2="200" y2="20" />

                      {/* Lower branch */}
                      <line x1="80" y1="40" x2="120" y2="60" />
                      <rect x="120" y="52" width="40" height="16" rx="2" />
                      <line x1="160" y1="60" x2="200" y2="60" />

                      {/* Merge indicators */}
                      <polygon points="210,20 218,20 214,26" fill="#6B7280" />
                      <polygon points="210,60 218,60 214,54" fill="#6B7280" />
                    </svg>
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
              <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#E5E7EB] h-auto p-0 hover:bg-transparent">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
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
            {allProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  if ((project as any).isGuest) {
                    window.location.hash = 'builder';
                  } else {
                    localStorage.setItem('active_project_id', project.id);
                    window.location.hash = 'builder';
                  }
                }}
                className={`relative bg-[#2B2F38] rounded-lg cursor-pointer transition-all hover:bg-[#2F333C] ${showMenu === project.id ? 'z-50' : ''}`}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {/* Noise on card */}
                <div className="absolute inset-0 opacity-[0.04] rounded-lg overflow-hidden" style={{
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
                            width: `${project.logicHealth}% `,
                            background: project.logicHealth <= 30
                              ? '#B91C1C'
                              : project.logicHealth <= 70
                                ? '#D97706'
                                : 'linear-gradient(to right, #047857 0%, #F59E0B 100%)'
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
linear - gradient(#374151 1px, transparent 1px),
  linear - gradient(90deg, #374151 1px, transparent 1px)
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
                    <div className="relative">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === project.id ? null : project.id);
                        }}
                        className="p-2 h-auto hover:bg-[#1F2937] rounded transition-colors bg-transparent"
                      >
                        <MoreVertical className="w-5 h-5 text-[#9CA3AF]" />
                      </Button>

                      {/* Menu Dropdown */}
                      {showMenu === project.id && (
                        <div className="absolute right-0 top-full mt-1 bg-[#1F2937] rounded shadow-lg py-1 z-20 min-w-[160px] border border-[#374151]">
                          <div className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors cursor-pointer" onClick={(e) => {
                            e.stopPropagation();
                            if ((project as any).isGuest) {
                              window.location.hash = 'builder';
                            } else {
                              localStorage.setItem('active_project_id', project.id);
                              window.location.hash = 'builder';
                            }
                          }}>
                            Open
                          </div>
                          <div className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors cursor-pointer">
                            Duplicate
                          </div>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-[#6B7280] cursor-not-allowed bg-transparent border-none"
                            disabled={project.statusColor !== 'success'}
                          >
                            Export
                          </button>
                          <div className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors cursor-pointer">
                            Manage Team
                          </div>
                          <div className="w-full px-4 py-2 text-left text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors cursor-pointer">
                            Archive
                          </div>
                          <div
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#374151] hover:text-red-300 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(project);
                            }}
                          >
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all scale-100 opacity-100">
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">Delete Project?</h3>
            <p className="text-[#9CA3AF] mb-6">
              This action cannot be undone. To confirm deletion of <span className="text-white font-medium">{projectToDelete.name}</span>, type <span className="text-[#D97706] font-mono">delete</span> below.
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="w-full px-4 py-2 bg-[#111318] border border-[#374151] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#D97706] mb-6"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setProjectToDelete(null)}
                className="text-[#9CA3AF] hover:text-[#E5E7EB]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.toLowerCase() !== 'delete' || isDeleting}
                className={`
                  ${deleteConfirmationText.toLowerCase() === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#374151] text-[#6B7280] cursor-not-allowed'}
                `}
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}