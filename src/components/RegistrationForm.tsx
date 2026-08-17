import React, { useState } from 'react';
import { Users, FileText, AlertCircle, ArrowLeft, ArrowRight, Upload, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import type { StartupStage, IndustryDomain, TeamMember, TeamRegistration } from '../types';
import { StorageService } from '../services/storageService';

interface RegistrationFormProps {
  onSuccess: (registration: TeamRegistration) => void;
  onCancel: () => void;
}

const STAGES: StartupStage[] = ['Ideation', 'Prototype / MVP', 'Early Traction', 'Scaling'];

const DOMAINS: IndustryDomain[] = [
  'AI / Machine Learning',
  'HealthTech & MedTech',
  'FinTech & Web3',
  'EdTech',
  'CleanTech & Sustainability',
  'SaaS & Enterprise',
  'Hardware & IoT',
  'Social Impact',
  'Other'
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [startupName, setStartupName] = useState('');
  const [stage, setStage] = useState<StartupStage>('Ideation');
  const [domain, setDomain] = useState<IndustryDomain>('AI / Machine Learning');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [teamSize, setTeamSize] = useState<number>(2);
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');
  const [pitchDeckFileName, setPitchDeckFileName] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'm-1', name: '', email: '', phone: '', college: '', role: 'Founder & CEO', isLeader: true },
    { id: 'm-2', name: '', email: '', phone: '', college: '', role: 'CTO / Tech Lead', isLeader: false }
  ]);

  const [eurekaTeamId, setEurekaTeamId] = useState('');
  const [necIdReferral, setNecIdReferral] = useState('NEC ID:NEC2640259');
  const [hasRegisteredOfficial, setHasRegisteredOfficial] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleTeamSizeChange = (newSize: number) => {
    const size = Math.max(1, Math.min(7, newSize));
    setTeamSize(size);

    if (members.length < size) {
      const added: TeamMember[] = Array.from({ length: size - members.length }, (_, i) => ({
        id: `m-${members.length + i + 1}`,
        name: '',
        email: '',
        phone: '',
        college: '',
        role: `Team Member ${members.length + i + 1}`,
        isLeader: false
      }));
      setMembers([...members, ...added]);
    } else if (members.length > size) {
      setMembers(members.slice(0, size));
    }
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.pptx')) {
      setErrorMsg('Please upload a PDF or PPTX presentation file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit. Please upload a smaller file or provide a Drive link.');
      return;
    }

    setErrorMsg(null);
    setPitchDeckFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setPitchDeckUrl(event.target?.result as string || URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = (): boolean => {
    if (!startupName.trim()) {
      setErrorMsg('Startup / Team name is required.');
      return false;
    }
    if (!problemStatement.trim() || problemStatement.trim().length < 15) {
      setErrorMsg('Please provide a problem statement of at least 15 characters.');
      return false;
    }
    if (!solution.trim() || solution.trim().length < 15) {
      setErrorMsg('Please provide a solution description of at least 15 characters.');
      return false;
    }
    if (!businessModel.trim()) {
      setErrorMsg('Business model description is required.');
      return false;
    }
    if (!pitchDeckUrl.trim()) {
      setErrorMsg('Please upload your pitch deck file or provide a valid pitch deck URL.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setErrorMsg(`Member #${i + 1} name is required.`);
        return false;
      }
      if (!m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) {
        setErrorMsg(`Member #${i + 1} has an invalid email address.`);
        return false;
      }
      if (!m.phone.trim() || m.phone.trim().length < 8) {
        setErrorMsg(`Member #${i + 1} has an invalid phone number.`);
        return false;
      }
      if (!m.college.trim()) {
        setErrorMsg(`Member #${i + 1} college or organization is required.`);
        return false;
      }
    }
    setErrorMsg(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!eurekaTeamId.trim()) {
      setErrorMsg('Eureka! Team ID is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!necIdReferral.trim()) {
      setErrorMsg('NEC ID / Referral code is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!hasRegisteredOfficial) {
      setErrorMsg('You must confirm registration on the official ecell.in/eureka portal.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Please accept the competition terms and rules consent.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const leader = members.find(m => m.isLeader) || members[0];
    const dupCheck = StorageService.checkDuplicate(startupName, leader.email, eurekaTeamId);
    if (dupCheck.isDuplicate) {
      setErrorMsg(dupCheck.reason || 'Duplicate registration detected.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const saved = StorageService.saveTeam({
        startupName,
        stage,
        domain,
        problemStatement,
        solution,
        businessModel,
        teamSize,
        pitchDeckUrl,
        pitchDeckFileName: pitchDeckFileName || 'Pitch_Deck.pdf',
        demoUrl,
        members,
        eurekaDetails: {
          eurekaTeamId,
          necIdReferral,
          hasRegisteredOfficial
        }
      });

      onSuccess(saved);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err?.message || 'Error submitting team registration. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Eureka! Team Registration
            </h2>
            <p className="text-xs text-slate-400">Step {currentStep} of 3 — Fill in team & pitch details</p>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#0B1120] border border-slate-800"
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className={`h-2 rounded-full transition-all ${currentStep >= 1 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-slate-800'}`} />
          <div className={`h-2 rounded-full transition-all ${currentStep >= 2 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-slate-800'}`} />
          <div className={`h-2 rounded-full transition-all ${currentStep >= 3 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-slate-800'}`} />
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-8 bg-[#0B1120]">

        {/* STEP 1: Startup Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-xl font-bold text-white font-heading">Startup & Pitch Details</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Startup / Team Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NeuroPulse AI"
                  value={startupName}
                  onChange={(e) => setStartupName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Startup / Idea Stage <span className="text-rose-400">*</span>
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as StartupStage)}
                  className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Industry / Domain <span className="text-rose-400">*</span>
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as IndustryDomain)}
                  className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white focus:outline-none focus:border-amber-500/50 text-sm"
                >
                  {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Team Size (1–7 Members) <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={teamSize}
                    onChange={(e) => handleTeamSizeChange(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="w-10 text-center font-bold text-amber-400 text-lg font-heading bg-[#050814] py-1 rounded-lg border border-slate-800">
                    {teamSize}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Problem Statement <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the problem, target audience, and market gap..."
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Proposed Solution & Product <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain your technology, product features, and key innovation..."
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Business Model & Revenue Streams <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B2B SaaS Subscription ($499/mo) & API licensing"
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            {/* Pitch Deck File / Link */}
            <div className="p-4 rounded-2xl bg-[#050814] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Pitch Deck Upload / View Link <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">PDF / PPTX (Max 10MB) or Drive URL</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#0B1120]">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.ppsx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-200 block">
                    {pitchDeckFileName ? pitchDeckFileName : 'Click to Upload Pitch Deck File'}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF or PPTX format</span>
                </div>

                <div>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="url"
                      placeholder="Or paste Google Drive / Canva link"
                      value={pitchDeckUrl}
                      onChange={(e) => {
                        setPitchDeckUrl(e.target.value);
                        setPitchDeckFileName('Online Presentation Deck');
                      }}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Ensure link view permissions are public.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Website / Product Demo Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://yourstartup.com or prototype link"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center gap-2"
              >
                Next: Team Members ({teamSize}) <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: Team Members Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Team Member Details</h3>
                <p className="text-xs text-slate-400">Fill details for all {teamSize} team members</p>
              </div>
            </div>

            <div className="space-y-6">
              {members.map((member, index) => (
                <div key={member.id} className="p-5 rounded-2xl bg-[#050814] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Member #{index + 1} {index === 0 && '(Team Leader / Primary Contact)'}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold uppercase">
                        Primary Leader
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Mehta"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Role / Designation <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Founder & CEO / CTO"
                        value={member.role}
                        onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="aarav@college.edu"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        College / Organization Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IIT Bombay / BITS Pilani / Company"
                        value={member.college}
                        onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 rounded-xl bg-[#050814] border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center gap-2"
              >
                Next: Eureka! Verification <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Eureka Details & Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Eureka! Verification & Confirmation</h3>
                <p className="text-xs text-slate-400">Confirm official portal registration and NEC ID (NEC ID:NEC2640259)</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Eureka! Team ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Eureka! Team ID"
                  value={eurekaTeamId}
                  onChange={(e) => setEurekaTeamId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  NEC ID / Referral Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="NEC ID:NEC2640259"
                  value={necIdReferral}
                  onChange={(e) => setNecIdReferral(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#050814] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRegisteredOfficial}
                  onChange={(e) => setHasRegisteredOfficial(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs text-amber-200 leading-relaxed">
                  <strong>Official Platform Confirmation:</strong> I confirm that our team has registered on the official platform at{' '}
                  <a href="https://ecell.in/eureka" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-400">
                    ecell.in/eureka
                  </a>{' '}
                  using our NEC ID:NEC2640259 referral prior to <strong>20 August 2026</strong>. <span className="text-rose-400">*</span>
                </span>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-[#050814] border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I certify that all provided team information and pitch deck materials are authentic. I agree to abide by the competition rules and time limits (2 min pitch + 3 min Q&A). <span className="text-rose-400">*</span>
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-[#050814] border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Submitting Team Registration...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> Submit Team Registration
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </form>
    </div>
  );
};
