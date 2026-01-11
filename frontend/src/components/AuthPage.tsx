import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onBack?: () => void;
  onAuthSuccess?: () => void;
}

export default function AuthPage({ onBack, onAuthSuccess }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      onAuthSuccess?.();
    }, 3000);
  };

  const handleGoogleSignIn = () => {
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      onAuthSuccess?.();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F1216] relative overflow-hidden flex">
      {/* Global Noise Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Global Radial Gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(23, 27, 33, 0.2) 0%, rgba(15, 18, 22, 0.4) 100%)'
      }} />

      {/* Global Vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
      }} />

      {/* Left Panel - Builder's World */}
      <div className="w-1/2 relative overflow-hidden bg-[#0F1216]">
        {/* Blueprint Grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(#171B21 1px, transparent 1px),
            linear-gradient(90deg, #171B21 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}></div>

        {/* Additional Perspective Grid on Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{
          backgroundImage: `
            linear-gradient(#171B21 1px, transparent 1px),
            linear-gradient(90deg, #171B21 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: 'perspective(600px) rotateX(45deg)',
          transformOrigin: 'center bottom',
          opacity: 0.15
        }}></div>

        {/* Construction Crate - Bottom Left */}
        <div className="absolute bottom-24 left-20">
          {/* Large crate */}
          <div className="w-32 h-32 bg-[#1A1E26] border-l-2 border-t-2 border-[#252A34] relative">
            <div className="absolute inset-4 border border-[#2D3340]"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border border-[#2D3340]"></div>
          </div>
          {/* Small stacked crate */}
          <div className="absolute -top-12 left-10 w-20 h-12 bg-[#1F2430] border-l border-t border-[#2D3340]"></div>
        </div>

        {/* Construction Crate - Bottom Right */}
        <div className="absolute bottom-32 right-28">
          <div className="w-28 h-28 bg-[#1A1E26] border-l-2 border-t-2 border-[#252A34] relative">
            <div className="absolute inset-3 border border-[#2D3340]"></div>
          </div>
        </div>

        {/* Crane Structure - Left Side */}
        <div className="absolute top-1/4 left-16">
          {/* Vertical pole */}
          <div className="w-2 h-40 bg-[#252A34]"></div>
          {/* Horizontal arm */}
          <div className="absolute top-8 left-2 w-32 h-2 bg-[#252A34]"></div>
          {/* Cable */}
          <div className="absolute top-10 left-24 w-0.5 h-16 bg-[#2D3340]"></div>
          {/* Small hook/weight */}
          <div className="absolute top-24 left-[5.75rem] w-2 h-3 bg-[#374151]"></div>
        </div>

        {/* Floating UI Node - Top Left */}
        <div className="absolute top-1/3 left-1/4">
          <div className="w-16 h-16 bg-[#252A34] border border-[#374151] rounded"></div>
          {/* Connection line to intervention */}
          <div className="absolute top-8 left-16 w-24 h-0.5 bg-[#374151]"></div>
        </div>

        {/* Floating UI Node - Top Right */}
        <div className="absolute top-1/4 right-1/3">
          <div className="w-14 h-14 bg-[#252A34] border border-[#374151] rounded-lg"></div>
        </div>

        {/* Central Intervention Node - HIGHLIGHTED */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Enhanced Emissive Glow effect - multiple layers */}
          <div className="absolute inset-0 -m-24 bg-[#FF9F43] rounded-full blur-3xl opacity-30"></div>
          <div className="absolute inset-0 -m-16 bg-[#E67E22] rounded-full blur-2xl opacity-35"></div>
          <div className="absolute inset-0 -m-8 bg-[#D97706] rounded-full blur-xl opacity-40"></div>

          {/* Main node */}
          <div className="relative w-44 h-28 bg-[#D97706] flex items-center justify-center">
            <div className="text-[#0F1216] font-semibold text-base tracking-wide">INTERVENTION</div>
          </div>

          {/* Small indicator */}
          <div className="absolute -top-3 -right-3 w-4 h-4 bg-[#D97706] rounded-full">
            <div className="absolute inset-0 bg-[#D97706] rounded-full blur-md opacity-60"></div>
          </div>
        </div>

        {/* UI Block - Right Side */}
        <div className="absolute bottom-1/3 right-1/4">
          <div className="w-10 h-10 border-2 border-[#374151] rotate-45"></div>
        </div>

        {/* Small modular elements */}
        <div className="absolute top-2/3 left-1/3">
          <div className="w-6 h-20 bg-[#252A34]"></div>
        </div>

        {/* Quote Overlay */}
        <div className="absolute bottom-20 left-16 max-w-md z-20">
          <blockquote className="text-[#9CA3AF] text-3xl italic leading-relaxed opacity-65" style={{ fontFamily: "'Playfair Display', serif" }}>
            Design the change<br />
            you wish to see.
          </blockquote>
        </div>

        {/* Enhanced vignette on left panel - heavier vertical vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)'
        }} />

        {/* Radial vignette for center focus */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)'
        }} />

        {/* Localized darkness away from intervention node */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 25%, rgba(0,0,0,0.4) 60%)'
        }} />
      </div>

      {/* Subtle Vertical Divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none z-10"></div>

      {/* Right Panel - Authentication Form */}
      <div className="w-1/2 bg-[#1A1C20] relative flex items-center justify-center px-8">
        {/* Vertical gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(15, 18, 22, 0.3) 0%, transparent 100%)'
        }} />

        {/* Enhanced Noise on right panel - Carbon Fiber Texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />

        {/* Carbon Fiber Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px)`,
        }} />

        {/* Vignette on right panel */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)'
        }} />

        {/* Form Container */}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#1B2028] rounded-lg p-10 relative" style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Subtle inner gradient */}
            <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
              background: 'linear-gradient(180deg, rgba(23, 27, 33, 0.2) 0%, transparent 100%)'
            }} />

            {/* Noise on card */}
            <div className="absolute inset-0 rounded-lg opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            <div className="relative">
              {/* Form Header */}
              <div className="mb-8">
                <h1 className="text-[#E5E7EB] text-3xl font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {isSignup ? 'Join the Alliance' : 'Enter Your Workspace'}
                </h1>
                <p className="text-[#9CA3AF] text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {isSignup
                    ? 'Create your account and start building program systems.'
                    : 'Access your Impact Canvas and ongoing program designs.'}
                </p>
              </div>

              {/* Form Fields */}
              <form className="space-y-5" onSubmit={handleAuth}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-[#E5E7EB] text-sm font-medium mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@organization.org"
                    className="w-full px-4 py-3 bg-[#0F1216] border border-[#2D3340] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#4B5563] transition-colors"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: 'linear-gradient(180deg, #0A0C0F 0%, #0F1216 100%)'
                    }}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-[#E5E7EB] text-sm font-medium mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[#0F1216] border border-[#2D3340] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#4B5563] transition-colors pr-12"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        background: 'linear-gradient(180deg, #0A0C0F 0%, #0F1216 100%)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Organization Name (Signup Only) */}
                {isSignup && (
                  <div>
                    <label htmlFor="orgName" className="block text-[#9CA3AF] text-sm font-medium mb-2 opacity-70" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Organization Name <span className="text-[#6B7280]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Your organization"
                      className="w-full px-4 py-3 bg-[#0F1216] border border-[#2D3340] rounded text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#4B5563] transition-colors opacity-80"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        background: 'linear-gradient(180deg, #0A0C0F 0%, #0F1216 100%)'
                      }}
                    />
                  </div>
                )}

                {/* Sign In / Sign Up Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full text-white font-medium py-3 px-4 rounded transition-all flex items-center justify-center gap-3"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: 'linear-gradient(90deg, #D35400 0%, #E67E22 100%)',
                      boxShadow: '0 0 20px rgba(230, 126, 34, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(230, 126, 34, 0.6)';
                      e.currentTarget.style.filter = 'brightness(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(230, 126, 34, 0.4)';
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
                  >
                    {isSignup ? 'Sign Up' : 'Sign In'}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2D3340]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#1B2028] text-[#9CA3AF]" style={{ fontFamily: "'Inter', sans-serif" }}>or</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <div>
                  {/* Radial Glow Behind Button */}
                  <div className="relative">
                    <div className="absolute inset-0 -m-8 bg-[#E67E22] rounded-full blur-2xl opacity-20 pointer-events-none"></div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full text-white font-medium py-3 px-4 rounded transition-all flex items-center justify-center gap-3 relative z-10"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        background: 'linear-gradient(90deg, #D35400 0%, #E67E22 100%)',
                        boxShadow: '0 0 20px rgba(230, 126, 34, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(230, 126, 34, 0.6)';
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(230, 126, 34, 0.4)';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </button>
                  </div>
                  <p className="text-[#9CA3AF] text-xs text-center mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Recommended for faster team collaboration.
                  </p>
                </div>
              </form>

              {/* Switch Between Login/Signup */}
              <div className="mt-8 text-center">
                <p className="text-[#9CA3AF] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-[#D97706] hover:text-[#B45309] transition-colors font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {isSignup ? 'Sign In' : 'Join the Alliance'}
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Overlay (Post-Signup Gamification) */}
      {showWelcome && (
        <div
          className="fixed inset-0 bg-[#0F1216]/90 backdrop-blur-sm flex items-center justify-center z-50"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            className="text-center"
            style={{
              animation: 'scaleIn 0.5s ease-out'
            }}
          >
            <h2 className="text-[#E5E7EB] text-4xl font-semibold mb-4">
              Welcome, Architect.
            </h2>
            <div className="h-1 w-32 bg-[#D97706] mx-auto mb-6"></div>
            <p className="text-[#9CA3AF] text-xl">
              Your workspace is ready.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}