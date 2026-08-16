import React, { useState } from 'react';
import { Trophy, Award, Sparkles, FileText, Send, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TeamRegistration, JuryScore } from '../types';
import { openPitchDeck } from '../utils/pitchDeck';

interface JuryScoringProps {
  teams: TeamRegistration[];
  onUpdateScore: (id: string, score: Omit<JuryScore, 'totalScore' | 'averageScore'>) => void;
}

export const JuryScoring: React.FC<JuryScoringProps> = ({ teams, onUpdateScore }) => {
  const pitchingTeams = teams.filter(t => t.status === 'Selected for Pitching' || t.status === 'Approved');
  const [evaluatingTeamId, setEvaluatingTeamId] = useState<string | null>(pitchingTeams[0]?.id || null);

  const [innovation, setInnovation] = useState<number>(8);
  const [marketPotential, setMarketPotential] = useState<number>(8);
  const [feasibility, setFeasibility] = useState<number>(8);
  const [pitchQuality, setPitchQuality] = useState<number>(8);
  const [teamCapability, setTeamCapability] = useState<number>(8);
  const [feedback, setFeedback] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('Dr. S. Kulkarni (Jury)');

  const currentTeam = teams.find(t => t.id === evaluatingTeamId);
  const liveTotal = innovation + marketPotential + feasibility + pitchQuality + teamCapability;

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingTeamId) return;

    onUpdateScore(evaluatingTeamId, {
      innovation,
      marketPotential,
      feasibility,
      pitchQuality,
      teamCapability,
      feedback,
      evaluatedBy: evaluatorName
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const triggerWinnerCelebration = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const leaderboard = [...teams]
    .filter(t => t.juryScore && t.juryScore.totalScore > 0)
    .sort((a, b) => (b.juryScore?.totalScore || 0) - (a.juryScore?.totalScore || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white font-heading">
              Pitching Management & Jury Scoring
            </h1>
            <span className="badge-glow-cyan px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              Evaluator Panel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate 2-min pitch presentations across 5 key rubric metrics & trigger winner declarations.
          </p>
        </div>

        <button
          onClick={triggerWinnerCelebration}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/25 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Declare Winner Celebration
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-[#0B1120]">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Select Team for Live Evaluation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pitchingTeams.map((team) => {
                const isSelected = team.id === evaluatingTeamId;
                const hasScore = Boolean(team.juryScore);

                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      setEvaluatingTeamId(team.id);
                      if (team.juryScore) {
                        setInnovation(team.juryScore.innovation);
                        setMarketPotential(team.juryScore.marketPotential);
                        setFeasibility(team.juryScore.feasibility);
                        setPitchQuality(team.juryScore.pitchQuality);
                        setTeamCapability(team.juryScore.teamCapability);
                        setFeedback(team.juryScore.feedback || '');
                      }
                    }}
                    className={`p-3.5 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md'
                        : 'bg-[#050814] border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{team.startupName}</span>
                      {hasScore && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                          {team.juryScore?.totalScore}/50
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{team.domain}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {currentTeam ? (
            <form onSubmit={handleScoreSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 bg-[#0B1120]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold">{currentTeam.id}</span>
                  <h3 className="text-xl font-bold text-white font-heading">{currentTeam.startupName}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Score</span>
                  <span className="text-2xl font-extrabold text-amber-400 font-heading">
                    {liveTotal} <span className="text-xs text-slate-500">/ 50</span>
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#050814] border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Presentation Deck:</span>
                <button
                  type="button"
                  onClick={() => openPitchDeck(currentTeam.pitchDeckUrl, currentTeam.pitchDeckFileName)}
                  className="text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Open Pitch Deck
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">1. Innovation & Problem Fit</span>
                    <span className="font-bold text-amber-400">{innovation} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={innovation}
                    onChange={(e) => setInnovation(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">2. Market Opportunity & Business Model</span>
                    <span className="font-bold text-amber-400">{marketPotential} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={marketPotential}
                    onChange={(e) => setMarketPotential(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">3. Traction & Technical Feasibility</span>
                    <span className="font-bold text-amber-400">{feasibility} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feasibility}
                    onChange={(e) => setFeasibility(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">4. Pitch Quality & Q&A Response (2 min + 3 min)</span>
                    <span className="font-bold text-amber-400">{pitchQuality} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pitchQuality}
                    onChange={(e) => setPitchQuality(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">5. Team Execution Capability</span>
                    <span className="font-bold text-amber-400">{teamCapability} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={teamCapability}
                    onChange={(e) => setTeamCapability(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Evaluator / Jury Name
                  </label>
                  <input
                    type="text"
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-slate-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Qualitative Feedback
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Strong clinical traction & market fit"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Save Jury Score & Update Leaderboard
              </button>
            </form>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-400 bg-[#0B1120]">
              No teams selected for pitching. Change team status to "Selected for Pitching" in Admin Dashboard.
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 bg-[#0B1120]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white font-heading">
                  Pitching Leaderboard
                </h3>
              </div>
              <span className="badge-glow-amber px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                Live Ranking
              </span>
            </div>

            {leaderboard.length >= 1 && (
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                {leaderboard[1] ? (
                  <div className="p-3 rounded-xl bg-[#050814] border border-slate-700/60 space-y-1">
                    <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Rank #2</span>
                    <span className="text-xs font-bold text-white truncate block">{leaderboard[1].startupName}</span>
                    <span className="text-xs font-mono font-bold text-slate-300 block">{leaderboard[1].juryScore?.totalScore}/50</span>
                  </div>
                ) : <div />}

                {leaderboard[0] && (
                  <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/60 space-y-1 -mt-3 shadow-lg shadow-amber-500/10">
                    <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">Winner #1</span>
                    <span className="text-xs font-extrabold text-white truncate block">{leaderboard[0].startupName}</span>
                    <span className="text-sm font-mono font-extrabold text-amber-400 block">{leaderboard[0].juryScore?.totalScore}/50</span>
                  </div>
                )}

                {leaderboard[2] ? (
                  <div className="p-3 rounded-xl bg-[#050814] border border-slate-800 space-y-1">
                    <Award className="w-5 h-5 text-amber-700 mx-auto" />
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Rank #3</span>
                    <span className="text-xs font-bold text-white truncate block">{leaderboard[2].startupName}</span>
                    <span className="text-xs font-mono font-bold text-amber-600 block">{leaderboard[2].juryScore?.totalScore}/50</span>
                  </div>
                ) : <div />}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {leaderboard.map((team, index) => (
                <div
                  key={team.id}
                  className="p-3 rounded-xl bg-[#050814] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{team.startupName}</span>
                      <span className="text-[10px] text-slate-400">{team.domain}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-amber-400 text-sm block">
                      {team.juryScore?.totalScore} <span className="text-[10px] text-slate-500">/ 50</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Avg: {team.juryScore?.averageScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
