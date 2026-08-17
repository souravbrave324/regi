import React, { useState } from 'react';
import { ShieldCheck, Search, Download, FileText, Lock, LogOut, Users, Mail, Phone, Building, Upload } from 'lucide-react';
import type { TeamRegistration, RegistrationStatus, TeamMember } from '../types';
import { StorageService } from '../services/storageService';
import { openPitchDeck, downloadPitchDeck } from '../utils/pitchDeck';
import { FileStorage } from '../utils/fileStorage';

interface AdminDashboardProps {
  teams: TeamRegistration[];
  onUpdateTeam: (id: string, updates: Partial<TeamRegistration>) => void;
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teams,
  onUpdateTeam,
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout
}) => {
  // Login Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Table Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [activeView, setActiveView] = useState<'teams' | 'participants'>('teams');

  // Selected Team for Detail Modal
  const [selectedTeam, setSelectedTeam] = useState<TeamRegistration | null>(null);

  // Handle Admin Login (Updated Credentials: e-cell@admin701 / admin)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim().toLowerCase() === 'e-cell@admin701' && passwordInput === 'admin') {
      StorageService.setAdminSession(true);
      onLoginSuccess();
      setLoginError(null);
    } else {
      setLoginError('Invalid admin credentials. Access restricted to authorized E-Cell administrators.');
    }
  };

  // Filtered Teams
  const filteredTeams = teams.filter(t => {
    const matchesSearch = 
      t.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.eurekaDetails.eurekaTeamId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()) || m.college.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesDomain = domainFilter === 'ALL' || t.domain === domainFilter;

    return matchesSearch && matchesStatus && matchesDomain;
  });

  // Flattened list of all individual participants across registered teams
  const allParticipants: { member: TeamMember; teamName: string; teamId: string; domain: string; status: RegistrationStatus; eurekaId: string }[] = [];
  filteredTeams.forEach(team => {
    team.members.forEach(member => {
      allParticipants.push({
        member,
        teamName: team.startupName,
        teamId: team.id,
        domain: team.domain,
        status: team.status,
        eurekaId: team.eurekaDetails.eurekaTeamId
      });
    });
  });

  // Overview Stats
  const totalTeamsCount = teams.length;
  const totalParticipantsCount = teams.reduce((acc, t) => acc + t.members.length, 0);
  const pendingCount = teams.filter(t => t.status === 'Pending').length;
  const pitchingCount = teams.filter(t => t.status === 'Selected for Pitching').length;

  // CSV Export
  const handleExportCSV = () => {
    StorageService.downloadCSV(filteredTeams);
  };

  // Render Admin Login Modal (Demo credentials text box removed)
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center bg-[#0B1120]">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Organizers Admin Login</h2>
            <p className="text-xs text-slate-400 mt-1">Access registration portal management & participant directory</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin ID / Email
              </label>
              <input
                type="text"
                required
                placeholder="Enter Admin ID / Email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Authenticate Admin Session
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white font-heading">
              Organizers Admin Portal
            </h1>
            <span className="badge-glow-amber px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              E-Cell Administrator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage startup registrations, view individual participant details, and export data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Data (CSV/Excel)
          </button>

          <button
            onClick={() => {
              StorageService.setAdminSession(false);
              onLogout();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Exit Session
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 bg-[#0B1120]">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Teams</span>
          <div className="text-3xl font-extrabold text-white font-heading">{totalTeamsCount}</div>
          <span className="text-[11px] text-amber-400 font-medium">Registered startups</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 bg-[#0B1120]">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Participants</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-heading">{totalParticipantsCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Student & founder members</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 bg-[#0B1120]">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pending Review</span>
          <div className="text-3xl font-extrabold text-amber-400 font-heading">{pendingCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Awaiting shortlisting</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 bg-[#0B1120]">
          <span className="text-xs text-slate-400 uppercase font-semibold">Pitching Finalists</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-heading">{pitchingCount}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Selected for pitching</span>
        </div>
      </div>

      {/* Directory View Toggle & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0B1120]">
        
        {/* Toggle between Team View and Participant Directory View */}
        <div className="flex items-center gap-1 bg-[#050814] p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveView('teams')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'teams'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Startup Teams ({filteredTeams.length})
          </button>

          <button
            onClick={() => setActiveView('participants')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'participants'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> All Participants Directory ({allParticipants.length})
          </button>
        </div>

        {/* Search & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search team, member, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-xs"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050814] border border-slate-800 text-white text-xs focus:outline-none"
          >
            <option value="ALL">All Domains</option>
            <option value="AI / Machine Learning">AI / Machine Learning</option>
            <option value="HealthTech & MedTech">HealthTech & MedTech</option>
            <option value="FinTech & Web3">FinTech & Web3</option>
            <option value="EdTech">EdTech</option>
            <option value="CleanTech & Sustainability">CleanTech & Sustainability</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#050814] border border-slate-800 text-white text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Selected for Pitching">Selected for Pitching</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

      </div>

      {/* VIEW 1: Startup Teams Directory */}
      {activeView === 'teams' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-[#0B1120]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050814] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">App ID</th>
                  <th className="py-3.5 px-4">Startup & Stage</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Primary Contact / Leader</th>
                  <th className="py-3.5 px-4">Team Size</th>
                  <th className="py-3.5 px-4">Pitch Deck</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No registrations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const leader = team.members.find(m => m.isLeader) || team.members[0];

                    return (
                      <tr key={team.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-amber-400">
                          {team.id}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-sm">{team.startupName}</div>
                          <span className="text-[10px] text-slate-400">{team.stage}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded-md bg-[#050814] text-cyan-300 border border-slate-800 text-[11px] font-medium">
                            {team.domain}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-200">{leader?.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" /> {leader?.email}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" /> {leader?.college}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-bold text-white">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
                            {team.members.length} Members
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-slate-300">
                          <div className="font-bold text-amber-400">{team.eurekaDetails.eurekaTeamId}</div>
                          <div className="text-[10px] text-emerald-400">{team.eurekaDetails.necIdReferral}</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openPitchDeck(team.pitchDeckUrl, team.pitchDeckFileName)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              title={`Open ${team.pitchDeckFileName || 'Pitch Deck'}`}
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              {team.pitchDeckFileName?.endsWith('.pptx') || team.pitchDeckFileName?.endsWith('.ppt') ? 'View PPT' : 'View PDF'}
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadPitchDeck(team.pitchDeckUrl, team.pitchDeckFileName)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-all cursor-pointer"
                              title="Download Presentation File"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            <label className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-all cursor-pointer relative" title="Upload / Re-attach File">
                              <Upload className="w-3.5 h-3.5 text-cyan-400" />
                              <input
                                type="file"
                                accept=".pdf,.pptx,.ppt"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const fileData = ev.target?.result as string;
                                    if (fileData) {
                                      FileStorage.saveFile(team.id, fileData);
                                      FileStorage.saveFile(file.name, fileData);
                                      FileStorage.saveFile(team.startupName, fileData);
                                      onUpdateTeam(team.id, { pitchDeckUrl: fileData, pitchDeckFileName: file.name });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={team.status}
                            onChange={(e) => onUpdateTeam(team.id, { status: e.target.value as RegistrationStatus })}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                              team.status === 'Selected for Pitching'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : team.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : team.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            <option value="Pending" className="bg-[#050814] text-white">Pending</option>
                            <option value="Approved" className="bg-[#050814] text-white">Approved</option>
                            <option value="Selected for Pitching" className="bg-[#050814] text-white">Selected for Pitching</option>
                            <option value="Rejected" className="bg-[#050814] text-white">Rejected</option>
                          </select>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedTeam(team)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1.5 ml-auto transition-all"
                          >
                            <Users className="w-3.5 h-3.5 text-amber-400" /> View Participant Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: All Participants Directory View */}
      {activeView === 'participants' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-[#0B1120]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050814] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Participant Name</th>
                  <th className="py-3.5 px-4">Role / Designation</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">College / Organization</th>
                  <th className="py-3.5 px-4">Startup Team Name</th>
                  <th className="py-3.5 px-4">Eureka Team ID</th>
                  <th className="py-3.5 px-4">Pitch Deck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No participants found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  allParticipants.map((item, idx) => (
                    <tr key={`${item.teamId}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                        <span>{item.member.name}</span>
                        {item.member.isLeader && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-extrabold uppercase">
                            Leader
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        {item.member.role}
                      </td>

                      <td className="py-4 px-4 text-cyan-300 font-mono">
                        {item.member.email}
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-mono">
                        {item.member.phone}
                      </td>

                      <td className="py-4 px-4 text-slate-300">
                        {item.member.college}
                      </td>

                      <td className="py-4 px-4 font-bold text-amber-400">
                        {item.teamName} ({item.teamId})
                      </td>

                      <td className="py-4 px-4 font-mono text-emerald-400">
                        {item.eurekaId}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const team = teams.find(t => t.id === item.teamId);
                            if (team) openPitchDeck(team.pitchDeckUrl, team.pitchDeckFileName);
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-amber-400" /> View Deck
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Team & Participants Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto bg-[#050814]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedTeam.id}</span>
                <h2 className="text-2xl font-bold text-white font-heading">{selectedTeam.startupName}</h2>
                <p className="text-xs text-slate-400">{selectedTeam.stage} • {selectedTeam.domain}</p>
              </div>

              <button
                onClick={() => setSelectedTeam(null)}
                className="w-9 h-9 rounded-full bg-[#0B1120] hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Eureka Team ID</span>
                <span className="text-amber-400 font-bold font-mono">{selectedTeam.eurekaDetails.eurekaTeamId}</span>
              </div>
              <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                <span className="text-slate-400 block">NEC Referral ID</span>
                <span className="text-emerald-400 font-bold font-mono">{selectedTeam.eurekaDetails.necIdReferral}</span>
              </div>
              <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Registration Status</span>
                <span className="text-cyan-400 font-bold">{selectedTeam.status}</span>
              </div>
            </div>

            {/* PARTICIPANTS BREAKDOWN */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Users className="w-4 h-4 text-amber-400" /> Participant Members ({selectedTeam.members.length})
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {selectedTeam.members.map((member: TeamMember, idx: number) => (
                  <div key={member.id || idx} className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-2 relative">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-white text-sm">{member.name}</span>
                      {member.isLeader ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-extrabold uppercase">
                          Team Leader
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Member #{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Role: <strong>{member.role}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-cyan-300">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
                      </div>

                      <div className="flex items-center gap-2 text-emerald-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{member.college}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem & Solution */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#0B1120] rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold uppercase tracking-wider block">Problem Statement</span>
                <p className="text-slate-300 leading-relaxed">{selectedTeam.problemStatement}</p>
              </div>

              <div className="p-4 bg-[#0B1120] rounded-xl border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold uppercase tracking-wider block">Solution & Innovation</span>
                <p className="text-slate-300 leading-relaxed">{selectedTeam.solution}</p>
              </div>

              <div className="p-4 bg-[#0B1120] rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold uppercase tracking-wider block">Business Model</span>
                <p className="text-slate-300 leading-relaxed">{selectedTeam.businessModel}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPitchDeck(selectedTeam.pitchDeckUrl, selectedTeam.pitchDeckFileName)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-2 hover:bg-amber-400 transition-all cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4" /> Open / View Pitch Deck (PDF / PPT)
                </button>

                <button
                  type="button"
                  onClick={() => downloadPitchDeck(selectedTeam.pitchDeckUrl, selectedTeam.pitchDeckFileName)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4 text-amber-400" /> Download File
                </button>

                <label className="px-4 py-2.5 rounded-xl bg-slate-800 text-cyan-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-md relative">
                  <Upload className="w-4 h-4 text-cyan-400" /> Upload / Replace File
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const fileData = ev.target?.result as string;
                        if (fileData) {
                          FileStorage.saveFile(selectedTeam.id, fileData);
                          FileStorage.saveFile(file.name, fileData);
                          FileStorage.saveFile(selectedTeam.startupName, fileData);
                          onUpdateTeam(selectedTeam.id, { pitchDeckUrl: fileData, pitchDeckFileName: file.name });
                          setSelectedTeam({ ...selectedTeam, pitchDeckUrl: fileData, pitchDeckFileName: file.name });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              <button
                onClick={() => setSelectedTeam(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
