import React, { useState } from 'react';
import { CheckCircle2, Copy, Download, Mail, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import type { TeamRegistration } from '../types';

interface RegistrationSuccessProps {
  registration: TeamRegistration;
  onGoHome: () => void;
  onGoLeaderboard: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  registration,
  onGoHome,
  onGoLeaderboard
}) => {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const leader = registration.members.find(m => m.isLeader) || registration.members[0];

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 5000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 shadow-2xl text-center space-y-8 bg-purple-50">
        
        {/* Emblem Logo & Success Checkmark */}
        <div className="relative w-24 h-24 mx-auto">
          <img
            src="/ecell_logo.jpg"
            alt="E-Cell IIT Bombay X//O Labs Logo"
            className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/20"
          />
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-emerald-500 border-2 border-[#0B1120] text-black flex items-center justify-center font-bold shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-black" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Official Registration Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-4">
            Welcome to Eureka! 2026
          </h1>
          <p className="text-slate-700 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Your team application for <strong className="text-slate-900">{registration.startupName}</strong> has been successfully registered and recorded for evaluation by E-Cell IIT Bombay organizers.
          </p>
        </div>

        {/* Application ID Highlight Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-200 space-y-2 relative max-w-md mx-auto shadow-inner">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Generated Registration / Application ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-heading tracking-wider">
              {registration.id}
            </span>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-slate-900 hover:bg-purple-100 text-slate-700 transition-all text-xs flex items-center gap-1 border border-purple-300"
              title="Copy Registration ID"
            >
              <Copy className="w-4 h-4 text-amber-700" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="text-left p-6 rounded-2xl bg-white/80 border border-purple-200 space-y-4">
          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider border-b border-purple-200 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700" /> Registration Summary & Verification
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-600 block">Startup Name:</span>
              <span className="text-slate-900 font-bold">{registration.startupName}</span>
            </div>
            <div>
              <span className="text-slate-600 block">Domain & Stage:</span>
              <span className="text-cyan-700 font-medium">{registration.domain} • {registration.stage}</span>
            </div>
            <div>
              <span className="text-slate-600 block">Team Leader:</span>
              <span className="text-slate-900 font-medium">{leader?.name} ({leader?.email})</span>
            </div>
            <div>
              <span className="text-slate-600 block">Team Size:</span>
              <span className="text-slate-900 font-medium">{registration.teamSize} Members</span>
            </div>
            <div>
              <span className="text-slate-600 block">Eureka Team ID:</span>
              <span className="text-amber-700 font-semibold">{registration.eurekaDetails.eurekaTeamId}</span>
            </div>
            <div>
              <span className="text-slate-600 block">NEC Referral ID:</span>
              <span className="text-emerald-700 font-semibold">{registration.eurekaDetails.necIdReferral}</span>
            </div>
          </div>
        </div>

        {/* Email Simulation Toast */}
        {emailSent ? (
          <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-cyan-700 animate-bounce" />
            <span>Confirmation receipt dispatched to <strong>{leader?.email}</strong>!</span>
          </div>
        ) : (
          <button
            onClick={handleSimulateEmail}
            className="text-xs text-slate-600 hover:text-cyan-700 inline-flex items-center gap-1.5 underline"
          >
            <Mail className="w-3.5 h-3.5" /> Send copy to team leader email ({leader?.email})
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-purple-200">
          <button
            onClick={handlePrintReceipt}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-purple-100 text-slate-800 border border-purple-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-amber-700" /> Download Pass / Print Summary
          </button>

          <button
            onClick={onGoLeaderboard}
            className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-700" /> View Jury Evaluation Panel
          </button>

          <button
            onClick={onGoHome}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            Return to Homepage <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
