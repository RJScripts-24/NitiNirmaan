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

      {/* Left Panel - Technical Illustration */}
      <div className="w-1/2 flex relative overflow-hidden" style={{
        backgroundColor: '#121418'
      }}>        {/* SVG Grid Pattern Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/%3E%3Cpath d='M 0 0 L 100 100 M 100 0 L 0 100' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.25' stroke-dasharray='2,2'/%3E%3Ccircle cx='50' cy='50' r='1' fill='rgba(255,255,255,0.2)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>

        {/* Emissive Glow Behind Crane */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full max-w-[80%] max-h-[80%]" style={{
            background: 'radial-gradient(ellipse at center, rgba(230, 126, 34, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }}></div>
        </div>

        {/* Crane Image - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/crane.png"
            alt="Construction crane illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quote at Bottom Left */}
        <div className="absolute bottom-12 left-12 flex items-start gap-4 z-20">
          {/* Vertical Line */}
          <div className="w-0.5 h-24 bg-white opacity-30"></div>

          {/* Quote Text */}
          <blockquote
            className="text-white text-3xl italic leading-relaxed max-w-md"
            style={{
              fontFamily: "'Playfair Display', serif",
              opacity: 0.7
            }}
          >
            Design the change<br />
            you wish to see.
          </blockquote>
        </div>
      </div>

      {/* Subtle Vertical Divider - Hidden on Mobile */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none z-10"></div>

      {/* Right Panel - Authentication Form */}
      <div className="w-1/2 bg-[#1A1C20] relative flex items-center justify-center px-8">        {/* Vertical gradient */}
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