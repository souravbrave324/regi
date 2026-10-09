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
    <header className="sticky top-0 z-50 bg-white/80 border-b border-purple-200 backdrop-blur-xl">
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
                <span className="font-heading font-extrabold text-xl text-slate-900 tracking-wide">
                  NEC <span className="text-amber-500">2026</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full badge-glow-amber">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-purple-700 font-semibold hidden sm:block">
                E-Cell IIT Bombay • NEC Referral Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white p-1.5 rounded-xl border border-purple-200 shadow-sm">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'landing'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-md font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
              }`}
            >
              Overview & Guidelines
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-md font-bold'
                  : 'text-amber-600 hover:bg-amber-50'
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
                  : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-cyan-600" />
              Jury & Pitching
            </button>
          </nav>

          {/* Right Action & External Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://ecell.in/eureka"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-purple-200 text-slate-600 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 shadow-sm transition-all"
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
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Admin Dashboard
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1"
                  title="Logout Admin"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  activeTab === 'admin'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-white text-slate-600 border-purple-200 hover:text-slate-900 hover:bg-purple-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Organizers Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
