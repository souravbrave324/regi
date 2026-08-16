import React, { useState, useEffect } from 'react';
import { Rocket, Clock, Award, CheckCircle2, AlertTriangle, Users, Presentation, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStartRegistration: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartRegistration }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-08-20T23:59:59+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Critical Mandatory Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-b border-amber-500/30 py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-amber-200">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider bg-amber-500 text-black px-2.5 py-0.5 rounded-full text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" /> Mandatory Requirement
          </span>
          <span>
            Participants MUST complete official registration on{' '}
            <a href="https://ecell.in/eureka" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-400 hover:text-white inline-flex items-center gap-1">
              ecell.in/eureka <ExternalLink className="w-3 h-3" />
            </a>{' '}
            using the <strong>NEC ID Referral</strong> by <strong>20 August 2026</strong> to remain eligible.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative glass-panel rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full badge-glow-amber text-xs font-semibold">
                <Sparkles className="w-4 h-4" /> Asia's Largest B-Model Competition
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-heading">
                Turn Your Vision Into <br />
                <span className="text-gradient-gold">A Market-Leading Startup</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Welcome to the <strong>NEC 2026 Pitching Competition</strong> portal. Submit your startup details, upload your pitch deck, and get evaluated by top VC jury panels in the Zonal rounds.
              </p>

              {/* Pitch Format Card */}
              <div className="p-4 rounded-2xl bg-[#050814]/80 border border-slate-800 flex items-center gap-4 text-slate-200">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold">Official Pitch Format</h4>
                  <p className="text-sm font-semibold text-white">
                    2 Minutes Pitch + 3 Minutes Q&A with Jury
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartRegistration}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold text-base hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 transition-all flex items-center gap-2 group"
                >
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Register Your Team Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="https://ecell.in/eureka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-2xl bg-[#0B1120] hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700/80 hover:border-slate-500 transition-all flex items-center gap-2 text-sm"
                >
                  Official NEC Portal
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Right Timer Card */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-6 text-center shadow-xl relative overflow-hidden bg-[#050814]/90">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 animate-pulse" />
                  Registration Closes In
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                    <span className="block text-2xl font-extrabold text-white font-heading">{timeLeft.days}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Days</span>
                  </div>
                  <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                    <span className="block text-2xl font-extrabold text-white font-heading">{timeLeft.hours}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Hours</span>
                  </div>
                  <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                    <span className="block text-2xl font-extrabold text-white font-heading">{timeLeft.minutes}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Mins</span>
                  </div>
                  <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                    <span className="block text-2xl font-extrabold text-amber-400 font-heading">{timeLeft.seconds}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Secs</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Deadline Date:</span>
                    <span className="text-amber-400 font-bold">20 August 2026</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-slate-200 font-medium">ecell.in/eureka</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Referral Required:</span>
                    <span className="text-cyan-400 font-medium">NEC ID Referral</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic">
                  Ensure all member details and pitch deck link/PDF are uploaded before deadline expiry.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-white font-heading">
            Competition Guidelines & Structure
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Everything you need to know about preparing your team and pitch deck for evaluation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Team Composition</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Team size: <strong>1 to 7 members</strong> maximum.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Open to students, scholars, and early founders.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Designate primary team leader for communication.
              </li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Pitch Format</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <strong>2 Minutes Pitch</strong>: Problem, Solution & Business Model.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <strong>3 Minutes Q&A</strong>: Jury grilling on financials & traction.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Deck upload: PDF/PPTX file (Max 10MB) or view link.
              </li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Zonal & National Round</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Top teams qualify for live Zonal Pitching.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Mentorship sessions with industry veterans.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Cash prizes, equity-free funding, & incubation.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0B1120] via-[#050814] to-[#0B1120] border border-amber-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl font-extrabold text-white font-heading">
            Ready to Pitch Your Startup?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Don't miss your opportunity to get evaluated by premier venture capitalists and win incubation support.
          </p>
          <button
            onClick={onStartRegistration}
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-base shadow-lg shadow-amber-500/20 hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Complete Registration Now
          </button>
        </div>
      </section>

    </div>
  );
};
