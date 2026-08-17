import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Check,
  Copy,
  ExternalLink,
  Code2,
  Cpu,
  Heart,
  Radio,
  Zap,
  Activity,
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const email = 'hemdaniayush2007@gmail.com';
  const githubUrl = 'https://github.com/ayusshh66';
  const linkedinUrl = 'https://www.linkedin.com/in/ayush-hemdani-4000a9424/';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const techStack = [
    { name: 'React 19', color: 'bg-cyan-100 text-cyan-900' },
    { name: 'TypeScript', color: 'bg-blue-100 text-blue-900' },
    { name: 'WebSockets', color: 'bg-emerald-100 text-emerald-900' },
    { name: 'Node.js & Express', color: 'bg-lime-100 text-lime-900' },
    { name: 'PostgreSQL & Drizzle', color: 'bg-amber-100 text-amber-900' },
    { name: 'Web Audio API', color: 'bg-purple-100 text-purple-900' },
    { name: 'Tailwind CSS', color: 'bg-sky-100 text-sky-900' },
    { name: 'Arcjet Security', color: 'bg-rose-100 text-rose-900' },
  ];

  return (
    <footer className="mt-14 w-full bg-[#FFFFFF] border-3 border-black shadow-[8px_8px_0px_0px_#000000] relative overflow-hidden">
      {/* Decorative Neo-Brutalist Top Stripe */}
      <div className="h-3 w-full bg-gradient-to-r from-[#10B981] via-[#8B5CF6] to-[#F43F5E]" />

      <div className="p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Column 1: Application Brand & Philosophy */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#10B981] text-black border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-black stroke-black" />
                <span>SPORTSOCKET</span>
              </div>
              <span className="bg-[#8B5CF6] text-white border-2 border-black px-2.5 py-0.5 font-mono text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                v2.4 REAL-TIME
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              SportSocket <span className="text-[#8B5CF6]">—</span> Real-Time Sports Engine
            </h3>

            <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
              An event-driven sports platform broadcasting live match statistics, ball-by-ball commentary streams, and immersive dynamic stadium soundscapes with sub-50ms latency.
            </p>

            {/* Live WebSocket Architecture Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F4F4F0] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
                <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
                <span className="text-xs font-black uppercase">Socket Broadcast Protocol</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F4F4F0] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
                <Activity className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-black uppercase">Multi-Sport Audio Synthesis</span>
              </div>
            </div>
          </div>

          {/* Column 2: Developer Profile Card (Ayush Hemdani) */}
          <div className="lg:col-span-4 bg-[#FAF5FF] border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#8B5CF6] border-2 border-black text-white flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#000000]">
                    AH
                  </div>
                  <div>
                    <h4 className="font-black text-base text-black uppercase tracking-tight">Ayush Hemdani</h4>
                    <p className="text-[11px] font-bold text-[#6D28D9] uppercase">Full Stack Developer</p>
                  </div>
                </div>
                <span className="bg-[#10B981] text-black border border-black text-[10px] font-black px-2 py-0.5 uppercase shadow-[1px_1px_0px_0px_#000000]">
                  Architect
                </span>
              </div>

              <p className="text-xs font-semibold text-neutral-700 leading-relaxed mb-4">
                Specialized in designing resilient distributed systems, real-time WebSocket infrastructures, and modern responsive web interfaces.
              </p>

              {/* Developer Links */}
              <div className="space-y-2.5">
                {/* GitHub */}
                <motion.a
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-white hover:bg-neutral-100 text-black border-2 border-black px-3.5 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GithubIcon className="w-4 h-4" />
                    <span>github.com/ayusshh66</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </motion.a>

                {/* LinkedIn */}
                <motion.a
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-[#0A66C2] hover:bg-[#004182] text-white border-2 border-black px-3.5 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className="w-4 h-4 fill-white" />
                    <span>Ayush Hemdani on LinkedIn</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                </motion.a>

                {/* Email with 1-click Copy & Direct Mailto */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={`mailto:${email}`}
                    className="flex-1 flex items-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white border-2 border-black px-3.5 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-colors truncate"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{email}</span>
                  </a>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyEmail}
                    title="Copy Email"
                    className="bg-white hover:bg-neutral-100 text-black border-2 border-black p-2 shadow-[3px_3px_0px_0px_#000000] cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-[#10B981] stroke-[3]" />
                    ) : (
                      <Copy className="w-4 h-4 text-black" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {copiedEmail && (
              <div className="mt-2 bg-[#10B981] text-black border-2 border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-center shadow-[2px_2px_0px_0px_#000000]">
                Email copied to clipboard!
              </div>
            )}
          </div>

          {/* Column 3: Stack & Architecture */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-black font-black uppercase text-sm tracking-wider">
              <Cpu className="w-4 h-4 text-[#8B5CF6]" />
              <span>Core Tech Stack</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${tech.color}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>

            <div className="p-3.5 bg-[#F4F4F0] border-2 border-black shadow-[3px_3px_0px_0px_#000000] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-neutral-800">
                <Code2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Architecture Highlights</span>
              </div>
              <p className="text-[11px] font-semibold text-neutral-600 leading-snug">
                • Dual-channel WebSocket pub/sub engine<br />
                • Procedural Web Audio sports acoustic synthesis<br />
                • Anti-bot Arcjet rate limiting & DDoS shielding
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Credits */}
        <div className="mt-10 pt-6 border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black">
            <span>© {new Date().getFullYear()} SportSocket Engine</span>
            <span className="text-neutral-400">•</span>
            <span>All Rights Reserved</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-[#F4F4F0] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000000]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#F43F5E] fill-[#F43F5E] animate-bounce" />
            <span>by</span>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B5CF6] underline hover:text-[#6D28D9]"
            >
              Ayush Hemdani
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
