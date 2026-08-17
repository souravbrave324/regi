import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationSuccess } from './components/RegistrationSuccess';
import { AdminDashboard } from './components/AdminDashboard';
import { JuryScoring } from './components/JuryScoring';
import { Footer } from './components/Footer';
import type { TeamRegistration, JuryScore } from './types';
import { FirebaseService } from './services/firebaseService';
import { StorageService } from './services/storageService';

export function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'register' | 'admin' | 'leaderboard'>('landing');
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [recentRegistration, setRecentRegistration] = useState<TeamRegistration | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Subscribe to real-time Firebase Firestore updates under the hood & sync local teams
  useEffect(() => {
    setIsAdminLoggedIn(StorageService.isAdminLoggedIn());

    FirebaseService.syncLocalTeamsToFirestore().catch((err) => {
      console.warn('Background Firestore sync warning:', err);
    });

    const unsubscribe = FirebaseService.subscribeToRegistrations((data) => {
      setTeams(data);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Handle successful registration submit (persists to local state & background Firestore sync)
  const handleRegistrationSuccess = async (newTeam: TeamRegistration) => {
    setRecentRegistration(newTeam);
    setTeams((prevTeams) => {
      const exists = prevTeams.some((t) => t.id === newTeam.id || t.startupName.toLowerCase() === newTeam.startupName.toLowerCase());
      return exists ? prevTeams : [newTeam, ...prevTeams];
    });

    try {
      await FirebaseService.saveRegistration(newTeam);
    } catch (err) {
      console.warn('Background Firebase registration sync warning:', err);
    }
  };

  // Update team status in real-time Firestore database
  const handleUpdateTeam = async (id: string, updates: Partial<TeamRegistration>) => {
    await FirebaseService.updateRegistration(id, updates);
  };

  // Update Jury score in real-time Firestore database
  const handleUpdateJuryScore = async (id: string, score: Omit<JuryScore, 'totalScore' | 'averageScore'>) => {
    await FirebaseService.saveJuryScore(id, score);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050814] text-slate-100 selection:bg-amber-500 selection:text-black">
      
      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'register') {
            setRecentRegistration(null);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={() => {
          StorageService.setAdminSession(false);
          setIsAdminLoggedIn(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* Tab 1: Landing Page */}
        {activeTab === 'landing' && (
          <LandingPage
            onStartRegistration={() => {
              setRecentRegistration(null);
              setActiveTab('register');
            }}
          />
        )}

        {/* Tab 2: Registration Wizard or Success Screen */}
        {activeTab === 'register' && (
          <>
            {recentRegistration ? (
              <RegistrationSuccess
                registration={recentRegistration}
                onGoHome={() => setActiveTab('landing')}
                onGoLeaderboard={() => setActiveTab('leaderboard')}
              />
            ) : (
              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                onCancel={() => setActiveTab('landing')}
              />
            )}
          </>
        )}

        {/* Tab 3: Organizers Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            teams={teams}
            onUpdateTeam={handleUpdateTeam}
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginSuccess={() => setIsAdminLoggedIn(true)}
            onLogout={() => setIsAdminLoggedIn(false)}
          />
        )}

        {/* Tab 4: Pitching Leaderboard & Jury Scoring */}
        {activeTab === 'leaderboard' && (
          <JuryScoring
            teams={teams}
            onUpdateScore={handleUpdateJuryScore}
          />
        )}

      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}

export default App;
