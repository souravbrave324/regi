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
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { TeamRegistration, JuryScore } from '../types';
import { StorageService } from './storageService';
import { FileStorage } from '../utils/fileStorage';

const COLLECTION_NAME = 'registrations';

export class FirebaseService {
  static subscribeToRegistrations(callback: (teams: TeamRegistration[], isFirebaseLive: boolean) => void) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const localTeamsMap = new Map<string, string>();
            StorageService.getTeams().forEach(t => {
              if (t.pitchDeckUrl && t.pitchDeckUrl.startsWith('data:')) {
                localTeamsMap.set(t.id, t.pitchDeckUrl);
                if (t.pitchDeckFileName) localTeamsMap.set(t.pitchDeckFileName.toLowerCase(), t.pitchDeckUrl);
                if (t.startupName) localTeamsMap.set(t.startupName.toLowerCase(), t.pitchDeckUrl);
              }
            });

            const firestoreTeams: TeamRegistration[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              const teamId = docSnap.id;
              let pitchDeckUrl = data.pitchDeckUrl;

              // Check LocalStorage and FileStorage for cached base64 file data
              if (!pitchDeckUrl || pitchDeckUrl.startsWith('[')) {
                const cached = localTeamsMap.get(teamId) ||
                  localTeamsMap.get((data.pitchDeckFileName || '').toLowerCase()) ||
                  localTeamsMap.get((data.startupName || '').toLowerCase()) ||
                  FileStorage.getFileSync(teamId) ||
                  FileStorage.getFileSync(data.pitchDeckFileName || '') ||
                  FileStorage.getFileSync(data.startupName || '');
                
                if (cached) {
                  pitchDeckUrl = cached;
                }
              }

              return {
                ...data,
                id: teamId,
                pitchDeckUrl,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
              } as TeamRegistration;
            });

            const localTeams = StorageService.getTeams();
            const firestoreIds = new Set(firestoreTeams.map(t => t.id));
            const extraLocal = localTeams.filter(t => !firestoreIds.has(t.id));

            const combinedTeams = [...firestoreTeams, ...extraLocal].sort((a, b) => 
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );

            callback(combinedTeams, true);
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

    const rawPitchDeckUrl = teamData.pitchDeckUrl;

    if (rawPitchDeckUrl && rawPitchDeckUrl.startsWith('data:')) {
      FileStorage.saveFile(registrationId, rawPitchDeckUrl);
      if (teamData.pitchDeckFileName) FileStorage.saveFile(teamData.pitchDeckFileName, rawPitchDeckUrl);
      if (teamData.startupName) FileStorage.saveFile(teamData.startupName, rawPitchDeckUrl);
    }

    // Prevent Firestore document size limit error (1MB) if pitchDeckUrl is a large base64 file data URI
    let sanitizedPitchDeckUrl = rawPitchDeckUrl;
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

    // 1. SAVE DIRECTLY TO FIREBASE FIRESTORE DATABASE IMMEDIATELY
    try {
      const docRef = doc(db, COLLECTION_NAME, registrationId);
      await setDoc(docRef, {
        ...newTeam,
        serverTimestamp: Timestamp.now()
      });
      console.log('✅ Registration saved directly to Firebase Firestore ID:', registrationId);
    } catch (err) {
      console.error('❌ Firebase Firestore Save Error:', err);
    }

    // 2. Upload file to Firebase Cloud Storage asynchronously in background & update Firestore doc with cloud URL
    if (rawPitchDeckUrl && rawPitchDeckUrl.startsWith('data:')) {
      (async () => {
        try {
          const timestamp = Date.now();
          const cleanName = (teamData.pitchDeckFileName || 'Pitch_Deck.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
          const storageRef = ref(storage, `pitch_decks/${timestamp}_${cleanName}`);
          await uploadString(storageRef, rawPitchDeckUrl, 'data_url');
          const cloudUrl = await getDownloadURL(storageRef);
          if (cloudUrl) {
            const docRef = doc(db, COLLECTION_NAME, registrationId);
            await updateDoc(docRef, { pitchDeckUrl: cloudUrl });
            console.log('✅ Updated Firebase Firestore document with Storage cloud URL:', cloudUrl);
          }
        } catch (storageErr) {
          console.warn('⚠️ Firebase Storage upload notice (Firestore document saved):', storageErr);
        }
      })();
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
