/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Helps catch side-effects in React Flow
  
  images: {
    remotePatterns: [
      {
        // Allow images from your Supabase Project
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        // Allow Google Auth Avatars (common in Hackathons)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Allow GitHub Auth Avatars
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Optional: If you use server-side libraries for PDF generation (like Puppeteer/Playwright)
  // experimental: {
  //   serverComponentsExternalPackages: ['puppeteer-core'], 
  // },
};

export default nextConfig;