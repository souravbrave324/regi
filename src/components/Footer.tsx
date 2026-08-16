import React from 'react';
import { ExternalLink, Heart, MapPin, Navigation } from 'lucide-react';

export const Footer: React.FC = () => {
  const mapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Ghousia+College+of+Engineering+B.M.+Road+Ramanagara+Karnataka+562159";

  return (
    <footer className="border-t border-slate-800 bg-[#04060E] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-xs text-slate-400">
        
        {/* Brand with Official E-Cell Logo */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src="/ecell_logo.jpg"
              alt="E-Cell IIT Bombay X//O Labs Emblem"
              className="w-10 h-10 rounded-full object-cover border border-purple-500/50"
            />
            <div>
              <span className="font-heading font-extrabold text-lg text-white block">
                NEC <span className="text-amber-400">2026</span>
              </span>
              <span className="text-[11px] text-purple-400 font-semibold block">
                E-Cell IIT Bombay • NEC
              </span>
            </div>
          </div>
          <p className="max-w-xs text-slate-400 leading-relaxed">
            The official portal for Asia's premier business model competition. Managed by The Entrepreneurship Cell, IIT Bombay.
          </p>
          <div className="flex items-center gap-2 text-slate-300">
            <span>Official Portal:</span>
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

        {/* Venue & Location Directions */}
        <div className="space-y-3 md:col-span-1 p-4 rounded-2xl bg-[#080D1A] border border-amber-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Event Venue</span>
          </div>
          <div>
            <h5 className="font-bold text-white text-xs">Ghousia College of Engineering</h5>
            <p className="text-[11px] text-slate-300 mt-0.5">
              B.M. Road, Ramanagara, Karnataka 562159
            </p>
          </div>
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all group"
          >
            <Navigation className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
            Set Google Maps Destination
          </a>
        </div>

        {/* Quick Links */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Competition Rules</h4>
          <ul className="space-y-1.5">
            <li>Pitch Format: 2 Min Pitch + 3 Min Q&A</li>
            <li>Team Size Limit: 1 to 7 Members</li>
            <li>Registration Deadline: 20 August 2026</li>
            <li>Referral Requirement: NEC ID Referral</li>
          </ul>
        </div>

        {/* Organizers */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Organizers & Support</h4>
          <ul className="space-y-1.5">
            <li>E-Cell IIT Bombay (NEC)</li>
            <li>Ghousia College of Engineering, Ramanagara</li>
            <li>Support Email: nec@ecell.in</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <span>© 2026 National Entrepreneurship Challenge (NEC) • E-Cell IIT Bombay & Ghousia College of Engineering. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for startup founders
        </span>
      </div>
    </footer>
  );
};
