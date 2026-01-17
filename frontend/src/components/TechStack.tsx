
import { motion } from 'framer-motion';

const technologies = [
    {
        name: 'React',
        logo: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22C12 22 15 18 15 12C15 6 12 2 12 2C12 2 9 6 9 12C9 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        name: 'Vite',
        logo: (
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <path d="M26.4 2.222L15.9 28.889L5.6 2.222H26.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 9L13 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        name: 'Supabase',
        logo: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <path d="M4 14.5L11 2L9.5 9.5H20L13 22L14.5 14.5H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        name: 'Tailwind CSS',
        logo: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.247 17.846 10.025C17.488 6.456 14.331 3.5 10.5 3.5C6.35786 3.5 3 6.85786 3 11C3 11.758 3.142 12.483 3.4 13.15C2.523 13.882 2 14.991 2 16.25C2 18.873 4.127 21 6.75 21H17.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        name: 'React Flow',
        logo: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <path d="M6.5 10V17.5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 6.5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        name: 'TypeScript',
        logo: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10">
                <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.5 16V10M8 10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 16V14.5C16.5 13.5 15 13.5 15 12.5C15 11.5 16.5 11.5 16.5 10.5V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }
];

export default function TechStack() {
    return (
        <section className="w-full px-4 md:px-6 py-12 relative z-10 border-t border-[#1F2937]/50 bg-[#0F1216]">
            <div className="max-w-7xl mx-auto text-center">
                <h3 className="text-[#9CA3AF] text-sm font-medium tracking-wide mb-8 uppercase">
                    Powered by
                </h3>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500">
                    {technologies.map((tech, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center gap-2 group cursor-default"
                        >
                            <div className="text-[#6B7280] group-hover:text-[#D97706] transition-colors duration-300">
                                {tech.logo}
                            </div>
                            <span className="text-xs text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors duration-300 font-medium">
                                {tech.name}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
