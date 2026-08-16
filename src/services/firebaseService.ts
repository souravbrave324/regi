import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { TeamRegistration, JuryScore } from '../types';
import { StorageService } from './storageService';

const COLLECTION_NAME = 'registrations';

export class FirebaseService {
  static subscribeToRegistrations(callback: (teams: TeamRegistration[], isFirebaseLive: boolean) => void) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreTeams: TeamRegistration[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                ...data,
                id: docSnap.id,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
              } as TeamRegistration;
            });
            callback(firestoreTeams, true);
          } else {
            const localTeams = StorageService.getTeams();
            callback(localTeams, true);
          }
        },
        (error) => {
          console.warn('Firestore snapshot listener warning (using hybrid local engine):', error.message);
          const localTeams = StorageService.getTeams();
          callback(localTeams, false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Firebase setup warning:', err);
      const localTeams = StorageService.getTeams();
      callback(localTeams, false);
      return () => {};
    }
  }

  static async saveRegistration(teamData: TeamRegistration): Promise<TeamRegistration> {
    const registrationId = teamData.id || `NEC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAtIso = teamData.createdAt || new Date().toISOString();

    // Prevent Firestore document size limit error (1MB) if pitchDeckUrl contains a large base64 file data URI
    let sanitizedPitchDeckUrl = teamData.pitchDeckUrl;
    if (sanitizedPitchDeckUrl && sanitizedPitchDeckUrl.startsWith('data:') && sanitizedPitchDeckUrl.length > 200000) {
      sanitizedPitchDeckUrl = `[File Uploaded: ${teamData.pitchDeckFileName || 'Pitch_Deck.pdf'}]`;
    }

    const newTeam: TeamRegistration = {
      ...teamData,
      id: registrationId,
      createdAt: createdAtIso,
      pitchDeckUrl: sanitizedPitchDeckUrl,
      status: teamData.status || 'Pending'
    };

    try {
      const docRef = doc(db, COLLECTION_NAME, registrationId);
      await setDoc(docRef, {
        ...newTeam,
        serverTimestamp: Timestamp.now()
      });
      console.log('✅ Registration saved to Firebase Firestore ID:', registrationId);
    } catch (err) {
      console.error('❌ Firebase Save Error:', err);
    }

    return newTeam;
  }

  static async updateRegistration(id: string, updates: Partial<TeamRegistration>): Promise<void> {
    StorageService.updateTeam(id, updates);

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Team updated in Firestore:', id);
    } catch (err) {
      console.warn('Updated in local storage (Firebase fallback):', err);
    }
  }

  static async saveJuryScore(id: string, scoreData: Omit<JuryScore, 'totalScore' | 'averageScore'>): Promise<void> {
    const total = scoreData.innovation + scoreData.marketPotential + scoreData.feasibility + scoreData.pitchQuality + scoreData.teamCapability;
    const avg = Number((total / 5).toFixed(1));

    const fullScore: JuryScore = {
      ...scoreData,
      totalScore: total,
      averageScore: avg,
      evaluatedAt: new Date().toISOString()
    };

    StorageService.saveJuryScore(id, scoreData);

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        juryScore: fullScore,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Jury score saved to Firestore:', id);
    } catch (err) {
      console.warn('Saved jury score to local storage (Firebase fallback):', err);
    }
  }
}
