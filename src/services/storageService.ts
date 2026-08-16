import type { TeamRegistration, JuryScore } from '../types';

const STORAGE_KEY = 'eureka_registrations_v1';
const ADMIN_SESSION_KEY = 'eureka_admin_session_v1';

// Initial realistic seed teams for testing
const INITIAL_SEED_TEAMS: TeamRegistration[] = [
  {
    id: 'EUREKA-2026-8812',
    createdAt: '2026-08-14T14:30:00Z',
    startupName: 'NeuroPulse AI',
    stage: 'Early Traction',
    domain: 'AI / Machine Learning',
    problemStatement: 'Neurodegenerative diseases are diagnosed late due to expensive MRI scans and lack of accessible non-invasive biomarker monitoring.',
    solution: 'AI-powered electroencephalogram (EEG) analysis platform detecting cognitive impairment 3 years before clinical symptoms.',
    businessModel: 'B2B SaaS subscription for diagnostic clinics ($499/mo) and API licensing for hospital networks.',
    teamSize: 3,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pitchDeckFileName: 'NeuroPulse_Eureka_PitchDeck.pdf',
    demoUrl: 'https://neuropulse.ai',
    members: [
      { id: 'm1', name: 'Aarav Mehta', email: 'aarav@neuropulse.ai', phone: '+91 98765 43210', college: 'IIT Bombay', role: 'Founder & CEO', isLeader: true },
      { id: 'm2', name: 'Riya Sharma', email: 'riya@neuropulse.ai', phone: '+91 98765 43211', college: 'IIT Bombay', role: 'CTO & AI Lead' },
      { id: 'm3', name: 'Karan Verma', email: 'karan@neuropulse.ai', phone: '+91 98765 43212', college: 'AIIMS Delhi', role: 'Medical Advisor' }
    ],
    eurekaDetails: {
      eurekaTeamId: 'EUR-2026-8812',
      necIdReferral: 'NEC-IITB-7741',
      hasRegisteredOfficial: true
    },
    status: 'Selected for Pitching',
    juryScore: {
      innovation: 9,
      marketPotential: 9,
      feasibility: 8,
      pitchQuality: 9,
      teamCapability: 9,
      totalScore: 44,
      averageScore: 8.8,
      feedback: 'Outstanding medical AI application. Strong clinical validation team.',
      evaluatedBy: 'Dr. S. Kulkarni (Jury)',
      evaluatedAt: '2026-08-15T10:00:00Z'
    }
  },
  {
    id: 'EUREKA-2026-4419',
    createdAt: '2026-08-15T09:15:00Z',
    startupName: 'EcoFlow Dynamics',
    stage: 'Prototype / MVP',
    domain: 'CleanTech & Sustainability',
    problemStatement: 'Industrial wastewater treatment consumes 12% of factory energy and leads to heavy toxic sludge disposal penalties.',
    solution: 'Micro-bubble hydrodynamic cavitation system that degrades micro-pollutants while using 40% less energy.',
    businessModel: 'Equipment sale with annual maintenance contracts and carbon credit profit sharing.',
    teamSize: 4,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pitchDeckFileName: 'EcoFlow_PitchDeck_2026.pdf',
    demoUrl: 'https://ecoflow.tech',
    members: [
      { id: 'm1', name: 'Vikram Singh', email: 'vikram@ecoflow.tech', phone: '+91 91234 56789', college: 'BITS Pilani', role: 'Lead Founder', isLeader: true },
      { id: 'm2', name: 'Ananya Roy', email: 'ananya@ecoflow.tech', phone: '+91 91234 56790', college: 'BITS Pilani', role: 'Chemical Process Lead' },
      { id: 'm3', name: 'Siddharth Jain', email: 'sid@ecoflow.tech', phone: '+91 91234 56791', college: 'IIT Kharagpur', role: 'Hardware Architect' },
      { id: 'm4', name: 'Pooja Nair', email: 'pooja@ecoflow.tech', phone: '+91 91234 56792', college: 'BITS Pilani', role: 'Business & Ops' }
    ],
    eurekaDetails: {
      eurekaTeamId: 'EUR-2026-4419',
      necIdReferral: 'NEC-BITS-3329',
      hasRegisteredOfficial: true
    },
    status: 'Selected for Pitching',
    juryScore: {
      innovation: 8,
      marketPotential: 9,
      feasibility: 9,
      pitchQuality: 8,
      teamCapability: 8,
      totalScore: 42,
      averageScore: 8.4,
      feedback: 'High commercial scalability in chemical manufacturing hubs.',
      evaluatedBy: 'Prof. R. Patel (Jury)',
      evaluatedAt: '2026-08-15T11:30:00Z'
    }
  },
  {
    id: 'EUREKA-2026-3105',
    createdAt: '2026-08-15T11:00:00Z',
    startupName: 'PayStream Web3',
    stage: 'Ideation',
    domain: 'FinTech & Web3',
    problemStatement: 'Cross-border freelancer remittances suffer from 6-8% transaction fees and 3-day bank clearing delays.',
    solution: 'Zero-knowledge real-time wage streaming protocol powered by layer-2 stablecoin liquidity pools.',
    businessModel: '0.25% transaction fee on automated micro-settlements.',
    teamSize: 2,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pitchDeckFileName: 'PayStream_Deck.pdf',
    members: [
      { id: 'm1', name: 'Neha Gupta', email: 'neha@paystream.io', phone: '+91 99887 76655', college: 'DTU Delhi', role: 'Founder & Blockchain Architect', isLeader: true },
      { id: 'm2', name: 'Rohan Joshi', email: 'rohan@paystream.io', phone: '+91 99887 76656', college: 'DTU Delhi', role: 'Smart Contract Dev' }
    ],
    eurekaDetails: {
      eurekaTeamId: 'EUR-2026-3105',
      necIdReferral: 'NEC-DTU-1092',
      hasRegisteredOfficial: true
    },
    status: 'Approved'
  }
];

export class StorageService {
  static getTeams(): TeamRegistration[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_TEAMS));
        return INITIAL_SEED_TEAMS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('LocalStorage read error:', e);
      return INITIAL_SEED_TEAMS;
    }
  }

  static saveTeam(teamData: Omit<TeamRegistration, 'id' | 'createdAt' | 'status'>): TeamRegistration {
    const existing = this.getTeams();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTeam: TeamRegistration = {
      ...teamData,
      id: `EUREKA-2026-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      status: 'Pending'
    };

    const updated = [newTeam, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTeam;
  }

  static checkDuplicate(startupName: string, leaderEmail: string, eurekaTeamId: string): { isDuplicate: boolean; reason?: string } {
    const teams = this.getTeams();
    const cleanName = startupName.trim().toLowerCase();
    const cleanEmail = leaderEmail.trim().toLowerCase();
    const cleanEurekaId = eurekaTeamId.trim().toLowerCase();

    for (const team of teams) {
      if (team.startupName.trim().toLowerCase() === cleanName) {
        return { isDuplicate: true, reason: `A team named "${startupName}" is already registered.` };
      }
      if (team.eurekaDetails.eurekaTeamId.trim().toLowerCase() === cleanEurekaId) {
        return { isDuplicate: true, reason: `Eureka! Team ID "${eurekaTeamId}" has already been submitted.` };
      }
      const leader = team.members.find(m => m.isLeader) || team.members[0];
      if (leader && leader.email.trim().toLowerCase() === cleanEmail) {
        return { isDuplicate: true, reason: `The email "${leaderEmail}" is already associated with an existing team (${team.startupName}).` };
      }
    }
    return { isDuplicate: false };
  }

  static updateTeam(id: string, updates: Partial<TeamRegistration>): TeamRegistration | null {
    const teams = this.getTeams();
    const index = teams.findIndex(t => t.id === id);
    if (index === -1) return null;

    teams[index] = { ...teams[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    return teams[index];
  }

  static saveJuryScore(id: string, scoreData: Omit<JuryScore, 'totalScore' | 'averageScore'>): TeamRegistration | null {
    const total = scoreData.innovation + scoreData.marketPotential + scoreData.feasibility + scoreData.pitchQuality + scoreData.teamCapability;
    const avg = Number((total / 5).toFixed(1));

    const fullScore: JuryScore = {
      ...scoreData,
      totalScore: total,
      averageScore: avg,
      evaluatedAt: new Date().toISOString()
    };

    return this.updateTeam(id, { juryScore: fullScore });
  }

  static exportToCSV(teams: TeamRegistration[]): string {
    const headers = [
      'Registration ID', 'Created At', 'Startup Name', 'Stage', 'Domain', 'Team Size', 'Status',
      'Leader Name', 'Leader Email', 'Leader Phone', 'College / Org', 'Eureka Team ID', 'NEC Referral ID',
      'Jury Score (/50)', 'Jury Avg (/10)', 'Pitch Deck URL', 'Problem Statement', 'Solution'
    ];

    const rows = teams.map(t => {
      const leader = t.members.find(m => m.isLeader) || t.members[0] || {};
      return [
        `"${t.id}"`,
        `"${new Date(t.createdAt).toLocaleDateString()}"`,
        `"${t.startupName.replace(/"/g, '""')}"`,
        `"${t.stage}"`,
        `"${t.domain}"`,
        t.teamSize,
        `"${t.status}"`,
        `"${(leader.name || '').replace(/"/g, '""')}"`,
        `"${(leader.email || '').replace(/"/g, '""')}"`,
        `"${(leader.phone || '').replace(/"/g, '""')}"`,
        `"${(leader.college || '').replace(/"/g, '""')}"`,
        `"${t.eurekaDetails.eurekaTeamId}"`,
        `"${t.eurekaDetails.necIdReferral}"`,
        t.juryScore ? t.juryScore.totalScore : 'N/A',
        t.juryScore ? t.juryScore.averageScore : 'N/A',
        `"${t.pitchDeckUrl}"`,
        `"${t.problemStatement.replace(/"/g, '""').substring(0, 100)}..."`,
        `"${t.solution.replace(/"/g, '""').substring(0, 100)}..."`
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static downloadCSV(teams: TeamRegistration[], filename = `Eureka_Registrations_${new Date().toISOString().slice(0, 10)}.csv`) {
    const csvContent = this.exportToCSV(teams);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static setAdminSession(isAdmin: boolean) {
    if (isAdmin) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }

  static isAdminLoggedIn(): boolean {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }
}
