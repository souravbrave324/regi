import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// In-memory / database collection store
let teams = [
  {
    id: 'EUREKA-2026-8812',
    createdAt: '2026-08-14T14:30:00Z',
    startupName: 'NeuroPulse AI',
    stage: 'Early Traction',
    domain: 'AI / Machine Learning',
    problemStatement: 'Neurodegenerative diseases diagnosed late due to lack of non-invasive biomarker monitoring.',
    solution: 'AI-powered EEG analysis detecting cognitive impairment 3 years before clinical symptoms.',
    businessModel: 'B2B SaaS subscription for clinics ($499/mo).',
    teamSize: 3,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    demoUrl: 'https://neuropulse.ai',
    members: [
      { id: 'm1', name: 'Aarav Mehta', email: 'aarav@neuropulse.ai', phone: '+91 98765 43210', college: 'IIT Bombay', role: 'Founder & CEO', isLeader: true }
    ],
    eurekaDetails: { eurekaTeamId: 'EUR-2026-8812', necIdReferral: 'NEC-IITB-7741', hasRegisteredOfficial: true },
    status: 'Selected for Pitching',
    juryScore: { innovation: 9, marketPotential: 9, feasibility: 8, pitchQuality: 9, teamCapability: 9, totalScore: 44, averageScore: 8.8 }
  }
];

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eureka! Pitching Competition API Server is live', timestamp: new Date().toISOString() });
});

// GET all team registrations
app.get('/api/teams', (req, res) => {
  const { search, status, domain } = req.query;
  let filtered = [...teams];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(t => t.startupName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.eurekaDetails.eurekaTeamId.toLowerCase().includes(q));
  }
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  if (domain) {
    filtered = filtered.filter(t => t.domain === domain);
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST create team registration
app.post('/api/teams', (req, res) => {
  const body = req.body;

  if (!body.startupName || !body.members || body.members.length === 0) {
    return res.status(400).json({ success: false, message: 'Startup name and team members are required' });
  }

  // Duplicate Check
  const exists = teams.some(t => t.startupName.toLowerCase() === body.startupName.toLowerCase() || t.eurekaDetails.eurekaTeamId.toLowerCase() === body.eurekaDetails?.eurekaTeamId?.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: 'Team name or Eureka Team ID already registered' });
  }

  const id = `EUREKA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTeam = {
    ...body,
    id,
    createdAt: new Date().toISOString(),
    status: 'Pending'
  };

  teams.unshift(newTeam);
  res.status(201).json({ success: true, message: 'Registration created successfully', data: newTeam });
});

// PUT update team status or score
app.put('/api/teams/:id', (req, res) => {
  const { id } = req.params;
  const index = teams.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  teams[index] = { ...teams[index], ...req.body };
  res.json({ success: true, message: 'Team updated successfully', data: teams[index] });
});

// Export CSV endpoint
app.get('/api/teams/export/csv', (req, res) => {
  const headers = ['Registration ID', 'Startup Name', 'Stage', 'Domain', 'Team Size', 'Status', 'Eureka Team ID', 'Jury Score'];
  const rows = teams.map(t => [
    t.id,
    `"${t.startupName}"`,
    `"${t.stage}"`,
    `"${t.domain}"`,
    t.teamSize,
    t.status,
    t.eurekaDetails.eurekaTeamId,
    t.juryScore ? t.juryScore.totalScore : 'N/A'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=Eureka_Teams.csv');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`🚀 Eureka Backend Server running on http://localhost:${PORT}`);
});
