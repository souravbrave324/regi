import React from 'react';
import { ShieldCheck, Trophy, UserCheck, ExternalLink, Rocket } from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'register' | 'admin' | 'leaderboard';
  setActiveTab: (tab: 'landing' | 'register' | 'admin' | 'leaderboard') => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onLogoutAdmin
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#050814]/95 border-b border-slate-800/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand with Official E-Cell IIT Bombay Emblem */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* E-Cell IIT Bombay Emblem Logo */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-amber-400 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/ecell_logo.jpg"
                alt="E-Cell IIT Bombay X//O Labs Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl text-white tracking-wide">
                  EUREKA! <span className="text-amber-400">2026</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full badge-glow-amber">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-purple-300 font-semibold hidden sm:block">
                E-Cell IIT Bombay • X//O Labs
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0B1120] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'landing'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Overview & Guidelines
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-semibold'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Register Team
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4 text-cyan-400" />
              Jury & Pitching
            </button>
          </nav>

          {/* Right Action & External Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://ecell.in/eureka"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#0B1120] border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
              <span>ecell.in/eureka</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    activeTab === 'admin'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-[#0B1120] text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Admin Dashboard
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1"
                  title="Logout Admin"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-800 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#0B1120] text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Organizers Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
