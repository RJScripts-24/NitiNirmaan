import { useState } from 'react';
import {
  Upload,
  X,
  Check,
  ChevronDown,
  LayoutDashboard,
  Book,
  Settings as SettingsIcon,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/button';
import NoiseBackground from './NoiseBackground';

interface SettingsProps {
  onNavigateToDashboard?: () => void;
  onNavigateToPatterns?: () => void;
}

export default function Settings({
  onNavigateToDashboard,
  onNavigateToPatterns,
}: SettingsProps) {
  const [organizationName, setOrganizationName] = useState('Shikshagraha Foundation');
  const [website, setWebsite] = useState('https://shikshagraha.org');
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [darkMode, setDarkMode] = useState<'on' | 'off' | 'system'>('on');
  const [defaultCurrency, setDefaultCurrency] = useState('₹');
  const [saveMessage, setSaveMessage] = useState(false);

  const handleSave = () => {
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  const teamMembers = [
    {
      id: 1,
      name: 'Aarav Desai',
      email: 'aarav@shikshagraha.org',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya@shikshagraha.org',
      role: 'Member',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Rohan Patel',
      email: 'rohan@shikshagraha.org',
      role: 'Member',
      status: 'Pending',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1216] text-gray-200 flex flex-col lg:flex-row">
      <NoiseBackground />
      {/* Left Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#171B21] border-b lg:border-b-0 lg:border-r border-[#1F2937] flex flex-col">
        <div className="p-4 lg:p-6 border-b border-[#1F2937]">
          <h1 className="text-[#E5E7EB] font-semibold text-lg lg:text-xl">
            Niti<span className="text-[#E5E7EB]">Nirmaan</span>
          </h1>
        </div>

        <nav className="flex lg:flex-col p-2 lg:p-4 gap-1 lg:gap-0 overflow-x-auto lg:overflow-visible">
          <Button
            variant="ghost"
            onClick={onNavigateToDashboard}
            className="flex items-center justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#9CA3AF] rounded transition-colors whitespace-nowrap lg:w-full text-sm lg:text-base mb-0 lg:mb-2 h-auto font-normal"
          >
            <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            onClick={onNavigateToPatterns}
            className="flex items-center justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#9CA3AF] rounded transition-colors whitespace-nowrap lg:w-full text-sm lg:text-base mb-0 lg:mb-2 h-auto font-normal"
          >
            <Book className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Pattern Library</span>
          </Button>
          <Button
            className="flex items-center justify-start gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-[#D97706] bg-[#D97706]/10 hover:bg-[#D97706]/20 rounded transition-colors whitespace-nowrap lg:w-full text-sm lg:text-base h-auto font-medium border-none shadow-none"
          >
            <SettingsIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Settings</span>
          </Button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column - Settings Forms */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <h2 className="text-[#E5E7EB] text-xl md:text-2xl font-semibold mb-2">Settings</h2>
              <p className="text-[#9CA3AF] text-xs md:text-sm">
                Manage organization identity, team, and preferences
              </p>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className="mb-4 md:mb-6 flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-[#047857]/10 border border-[#047857]/30 rounded">
                <Check className="w-4 h-4 text-[#047857]" />
                <span className="text-[#047857] text-xs md:text-sm">Settings saved.</span>
              </div>
            )}

            {/* Section 1: Organization Profile */}
            <section className="mb-12">
              <h3 className="text-[#E5E7EB] text-lg font-semibold mb-6 pb-3 border-b border-[#1F2937]">
                Organization Profile
              </h3>

              {/* Organization Logo */}
              <div className="mb-6">
                <label className="block text-[#E5E7EB] text-sm font-medium mb-2">
                  Organization Logo
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-[#1F2937] border border-[#2D3340] rounded flex items-center justify-center">
                    {logoUploaded ? (
                      <div className="w-full h-full flex items-center justify-center text-[#D97706] text-xs">
                        LOGO
                      </div>
                    ) : (
                      <Upload className="w-8 h-8 text-[#6B7280]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      onClick={() => setLogoUploaded(true)}
                      className="px-4 py-2 bg-[#1F2937] text-[#E5E7EB] border border-[#2D3340] rounded hover:bg-[#2D3340] transition-colors text-sm h-auto"
                    >
                      Upload Logo
                    </Button>
                    <p className="text-[#6B7280] text-xs mt-2">
                      PNG or SVG. Max 2MB. This logo appears on all exported documents.
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Name */}
              <div className="mb-6">
                <label className="block text-[#E5E7EB] text-sm font-medium mb-2">
                  Organization Name <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    handleSave();
                  }}
                  className="w-full px-4 py-2 bg-[#1F2937] border border-[#2D3340] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
                  placeholder="Enter organization name"
                />
                <p className="text-[#6B7280] text-xs mt-1">
                  Used in LFA document headers and export metadata
                </p>
              </div>

              {/* Website */}
              <div className="mb-6">
                <label className="block text-[#E5E7EB] text-sm font-medium mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    handleSave();
                  }}
                  className="w-full px-4 py-2 bg-[#1F2937] border border-[#2D3340] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
                  placeholder="https://example.org"
                />
              </div>

              {/* Permissions Note */}
              <div className="flex items-start gap-2 px-4 py-3 bg-[#1F2937] border border-[#2D3340] rounded">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <p className="text-[#9CA3AF] text-xs">
                  Identity is organizational, not personal. Editable by Admins only.
                </p>
              </div>
            </section>

            {/* Section 2: Team Management */}
            <section className="mb-12">
              <h3 className="text-[#E5E7EB] text-lg font-semibold mb-6 pb-3 border-b border-[#1F2937]">
                Team Management
              </h3>

              {/* Team Table */}
              <div className="bg-[#171B21] border border-[#1F2937] rounded overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1F2937]">
                      <th className="text-left px-4 py-3 text-[#9CA3AF] text-xs font-medium uppercase">
                        Name / Email
                      </th>
                      <th className="text-left px-4 py-3 text-[#9CA3AF] text-xs font-medium uppercase">
                        Role
                      </th>
                      <th className="text-left px-4 py-3 text-[#9CA3AF] text-xs font-medium uppercase">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-[#9CA3AF] text-xs font-medium uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member, index) => (
                      <tr
                        key={member.id}
                        className={
                          index !== teamMembers.length - 1
                            ? 'border-b border-[#1F2937]'
                            : ''
                        }
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-[#E5E7EB] text-sm">{member.name}</p>
                            <p className="text-[#6B7280] text-xs">{member.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            defaultValue={member.role}
                            className="px-3 py-1 bg-[#1F2937] border border-[#2D3340] rounded text-[#E5E7EB] text-sm focus:outline-none focus:border-[#D97706]"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${member.status === 'Active'
                              ? 'bg-[#047857]/10 text-[#047857]'
                              : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                              }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#B91C1C] hover:text-[#DC2626] hover:bg-transparent transition-colors h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role Tooltips */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-[#9CA3AF] font-medium">Admin:</span>
                  <span className="text-[#6B7280]">
                    Manage organization settings, add/remove users, control export branding
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#9CA3AF] font-medium">Member:</span>
                  <span className="text-[#6B7280]">
                    Build and edit projects, run simulations. Cannot manage org-wide settings
                  </span>
                </div>
              </div>

              {/* Add Member Button */}
              <Button className="mt-4 px-4 py-2 bg-[#D97706] text-[#0F1216] rounded font-medium hover:bg-[#B45309] transition-colors text-sm h-auto">
                Add Team Member
              </Button>
            </section>

            {/* Section 3: Preferences */}
            <section className="mb-12">
              <h3 className="text-[#E5E7EB] text-lg font-semibold mb-6 pb-3 border-b border-[#1F2937]">
                Preferences
              </h3>

              {/* Dark Mode */}
              <div className="mb-6">
                <label className="block text-[#E5E7EB] text-sm font-medium mb-2">
                  Dark Mode
                </label>
                <select
                  value={darkMode}
                  onChange={(e) => {
                    setDarkMode(e.target.value as 'on' | 'off' | 'system');
                    handleSave();
                  }}
                  className="w-full px-4 py-2 bg-[#1F2937] border border-[#2D3340] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                  <option value="system">System Default</option>
                </select>
                <p className="text-[#6B7280] text-xs mt-1">
                  Affects dashboard, canvas, and preview pages
                </p>
              </div>

              {/* Default Currency */}
              <div className="mb-6">
                <label className="block text-[#E5E7EB] text-sm font-medium mb-2">
                  Default Currency
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => {
                    setDefaultCurrency(e.target.value);
                    handleSave();
                  }}
                  className="w-full px-4 py-2 bg-[#1F2937] border border-[#2D3340] rounded text-[#E5E7EB] focus:outline-none focus:border-[#D97706] transition-colors"
                >
                  <option value="₹">₹ (Indian Rupee)</option>
                  <option value="$">$ (US Dollar)</option>
                  <option value="€">€ (Euro)</option>
                  <option value="£">£ (British Pound)</option>
                </select>
                <p className="text-[#6B7280] text-xs mt-1">
                  Used for new cost estimates only. Existing nodes are not converted
                  automatically.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column - Live LFA Document Preview */}
        <div className="w-full lg:w-[500px] bg-[#E5E7EB] border-t lg:border-t-0 lg:border-l border-[#D1D5DB] overflow-y-auto">
          <div className="p-4 md:p-6 bg-white border-b border-[#D1D5DB]">
            <h3 className="text-[#1F2937] font-semibold mb-1 text-sm md:text-base">Live Document Preview</h3>
            <p className="text-[#6B7280] text-xs">
              How your settings appear in exported documents
            </p>
          </div>

          <div className="p-4 md:p-8">
            <div className="bg-white rounded shadow-sm p-4 md:p-8 text-[#1F2937]">
              {/* Logo Preview */}
              <div className="mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F3F4F6] border border-[#D1D5DB] rounded flex items-center justify-center flex-shrink-0">
                  {logoUploaded ? (
                    <span className="text-[#D97706] text-xs">LOGO</span>
                  ) : (
                    <Upload className="w-5 h-5 md:w-6 md:h-6 text-[#9CA3AF]" />
                  )}
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-[#1F2937]">
                    {organizationName || 'Organization Name'}
                  </h4>
                  {website && (
                    <p className="text-xs text-[#6B7280]">{website}</p>
                  )}
                </div>
              </div>

              {/* Program Overview */}
              <section className="mb-4 md:mb-6">
                <h5 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-[#1F2937]">
                  Program Overview
                </h5>
                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
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
                </div>
              </section>

              {/* Stakeholders */}
              <section className="mb-4 md:mb-6">
                <h5 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-[#1F2937]">
                  Stakeholders
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D1D5DB]">
                        <th className="text-left py-2 font-semibold">Role</th>
                        <th className="text-left py-2 font-semibold">Responsibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E5E7EB]">
                        <td className="py-2 text-[#1F2937]">Teacher</td>
                        <td className="py-2 text-[#6B7280]">
                          Conducts daily reading activities
                        </td>
                      </tr>
                      <tr className="border-b border-[#E5E7EB]">
                        <td className="py-2 text-[#1F2937]">CRP</td>
                        <td className="py-2 text-[#6B7280]">Provides FLN training</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Risks */}
              <section className="mb-4 md:mb-6">
                <h5 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 text-[#1F2937]">
                  Risks & Assumptions
                </h5>
                <ul className="space-y-1 text-xs text-[#6B7280] list-disc list-inside">
                  <li>Teachers will need hands-on training</li>
                  <li>CRPs have capacity for up to 10 schools</li>
                </ul>
              </section>

              {/* Footer */}
              <div className="mt-6 md:mt-8 pt-3 md:pt-4 border-t border-[#E5E7EB] text-[10px] text-[#9CA3AF] italic">
                Auto-generated from validated logic model
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}