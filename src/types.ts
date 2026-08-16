export type StartupStage = 'Ideation' | 'Prototype / MVP' | 'Early Traction' | 'Scaling';

export type IndustryDomain = 
  | 'AI / Machine Learning' 
  | 'HealthTech & MedTech' 
  | 'FinTech & Web3' 
  | 'EdTech' 
  | 'CleanTech & Sustainability' 
  | 'SaaS & Enterprise' 
  | 'Hardware & IoT' 
  | 'Social Impact'
  | 'Other';

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Selected for Pitching';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  role: string;
  isLeader?: boolean;
}

export interface EurekaDetails {
  eurekaTeamId: string;
  necIdReferral: string;
  hasRegisteredOfficial: boolean;
}

export interface JuryScore {
  innovation: number; // 1-10
  marketPotential: number; // 1-10
  feasibility: number; // 1-10
  pitchQuality: number; // 1-10
  teamCapability: number; // 1-10
  feedback?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  totalScore: number; // Max 50
  averageScore: number; // Max 10
}

export interface TeamRegistration {
  id: string; // EUREKA-2026-XXXX
  createdAt: string;
  
  // Team Details
  startupName: string;
  stage: StartupStage;
  domain: IndustryDomain;
  problemStatement: string;
  solution: string;
  businessModel: string;
  teamSize: number; // 1 to 7
  pitchDeckUrl: string; // URL or Data URL
  pitchDeckFileName?: string;
  demoUrl?: string;

  // Members
  members: TeamMember[];

  // Eureka Details
  eurekaDetails: EurekaDetails;

  // Admin & Evaluation
  status: RegistrationStatus;
  notes?: string;
  juryScore?: JuryScore;
}

export interface AdminUser {
  email: string;
  role: 'organizer' | 'jury';
  name: string;
}
