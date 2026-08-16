import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#04060E] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-xs text-slate-400">
        
        {/* Brand with Official E-Cell Logo */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/ecell_logo.jpg"
              alt="E-Cell IIT Bombay X//O Labs Emblem"
              className="w-10 h-10 rounded-full object-cover border border-purple-500/50"
            />
            <div>
              <span className="font-heading font-extrabold text-lg text-white block">
                EUREKA! <span className="text-amber-400">2026</span>
              </span>
              <span className="text-[11px] text-purple-400 font-semibold block">
                E-Cell IIT Bombay • X//O Labs
              </span>
            </div>
          </div>
          <p className="max-w-md text-slate-400 leading-relaxed">
            The official portal for Asia's premier business model competition. Managed by The Entrepreneurship Cell, IIT Bombay.
          </p>
          <div className="flex items-center gap-2 text-slate-300">
            <span>Official Portal Link:</span>
            <a
              href="https://ecell.in/eureka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              ecell.in/eureka <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Competition Rules</h4>
          <ul className="space-y-1.5">
            <li>Pitch Format: 2 Min Pitch + 3 Min Q&A</li>
            <li>Team Size Limit: 1 to 7 Members</li>
            <li>Registration Deadline: 20 August 2026</li>
            <li>Referral Requirement: NEC ID Referral</li>
          </ul>
        </div>

        {/* Organizers */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Organizers & Support</h4>
          <ul className="space-y-1.5">
            <li>E-Cell IIT Bombay (NEC)</li>
            <li>X//O Labs Entrepreneurship Desk</li>
            <li>Support Email: eureka@ecell.in</li>
            <li>Organizers Access: e-cell@admin701</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <span>© 2026 Eureka! Pitching Competition • E-Cell IIT Bombay. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for startup founders
        </span>
      </div>
    </footer>
  );
};
