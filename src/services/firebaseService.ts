import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs,
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { TeamRegistration, JuryScore } from '../types';
import { StorageService } from './storageService';
import { FileStorage } from '../utils/fileStorage';

const COLLECTION_NAME = 'registrations';

/**
 * Safely removes `undefined` fields from JavaScript objects to prevent Firestore setDoc errors.
 */
const sanitizeForFirestore = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
};

export class FirebaseService {
  /**
   * Automatically pushes any registrations stored in local storage to Firestore.
   * Ensures all teams registered across devices are synced live to Firestore.
   */
  static async syncLocalTeamsToFirestore() {
    try {
      const localTeams = StorageService.getTeams();
      for (const team of localTeams) {
        if (!team.id) continue;
        try {
          const docRef = doc(db, COLLECTION_NAME, team.id);
          const payload = sanitizeForFirestore({
            ...team,
            serverTimestamp: Timestamp.now()
          });
          await setDoc(docRef, payload, { merge: true });

          // If pitchDeckUrl is base64 data URI, sync file chunks to Firestore subcollection
          if (team.pitchDeckUrl && team.pitchDeckUrl.startsWith('data:')) {
            const chunkSize = 400000;
            const totalLen = team.pitchDeckUrl.length;
            let chunkIndex = 0;
            for (let i = 0; i < totalLen; i += chunkSize) {
              const chunkStr = team.pitchDeckUrl.substring(i, i + chunkSize);
              const chunkDocRef = doc(db, COLLECTION_NAME, team.id, 'fileChunks', `chunk_${chunkIndex}`);
              await setDoc(chunkDocRef, sanitizeForFirestore({
                chunk: chunkStr,
                index: chunkIndex
              }), { merge: true });
              chunkIndex++;
            }
          }
        } catch (e) {
          console.warn(`Sync warning for team ${team.id}:`, e);
        }
      }
      console.log('✅ Local teams and presentation files synced to Firestore');
    } catch (err) {
      console.warn('Local teams sync error:', err);
    }
  }

  /**
   * Fetches presentation file chunks from Firestore subcollection registrations/{teamId}/fileChunks
   * and re-assembles the complete original base64 file data URI for any device.
   */
  static async fetchPitchDeckFile(teamId: string, fileName?: string): Promise<string | null> {
    if (!teamId) return null;

    // 1. Check local IndexedDB / LocalStorage first for instant performance
    const localCached = await FileStorage.getFile(teamId) || 
                        (fileName ? await FileStorage.getFile(fileName) : null);
    if (localCached && localCached.startsWith('data:')) {
      return localCached;
    }

    // 2. Query Firestore subcollection registrations/{teamId}/fileChunks
    try {
      const chunksRef = collection(db, COLLECTION_NAME, teamId, 'fileChunks');
      const snapshot = await getDocs(chunksRef);
      if (!snapshot.empty) {
        const chunkDocs = snapshot.docs.map(d => d.data());
        chunkDocs.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        const fullBase64 = chunkDocs.map(d => d.chunk || '').join('');
        if (fullBase64 && fullBase64.startsWith('data:')) {
          FileStorage.saveFile(teamId, fullBase64);
          if (fileName) FileStorage.saveFile(fileName, fullBase64);
          return fullBase64;
        }
      }
    } catch (err) {
      console.warn('Error fetching presentation file chunks from Firestore:', err);
    }

    return null;
  }

  static subscribeToRegistrations(callback: (teams: TeamRegistration[], isFirebaseLive: boolean) => void) {
    try {
      // Trigger background sync of any local teams
      this.syncLocalTeamsToFirestore().catch(() => {});

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

    let initialPitchDeckUrl = teamData.pitchDeckUrl;

    // Prevent Firestore document size limit error (1MB) if pitchDeckUrl remains a large base64 file data URI
    // Lowered limit to 500,000 to be absolutely safe for all UTF-8 characters and overhead
    if (initialPitchDeckUrl && initialPitchDeckUrl.startsWith('data:') && initialPitchDeckUrl.length > 500000) {
      initialPitchDeckUrl = `[File Uploaded: ${teamData.pitchDeckFileName || 'Pitch_Deck.pdf'}]`;
    }

    const newTeam: TeamRegistration = {
      ...teamData,
      id: registrationId,
      createdAt: createdAtIso,
      pitchDeckUrl: initialPitchDeckUrl,
      status: teamData.status || 'Pending'
    };

    // 1. Immediately save the main registration document to ensure it's not lost on page refresh
    try {
      const docRef = doc(db, COLLECTION_NAME, registrationId);
      await setDoc(docRef, sanitizeForFirestore({
        ...newTeam,
        serverTimestamp: Timestamp.now()
      }), { merge: true });
      console.log('✅ Registration immediately saved to Firebase Firestore ID:', registrationId);
    } catch (err) {
      console.error('❌ Firebase Save Error:', err);
    }

    // 2. Perform slow file chunking and cloud storage uploads asynchronously
    if (teamData.pitchDeckUrl && teamData.pitchDeckUrl.startsWith('data:')) {
      FileStorage.saveFile(registrationId, teamData.pitchDeckUrl);
      if (teamData.pitchDeckFileName) FileStorage.saveFile(teamData.pitchDeckFileName, teamData.pitchDeckUrl);
      if (teamData.startupName) FileStorage.saveFile(teamData.startupName, teamData.pitchDeckUrl);

      let finalPitchDeckUrl = initialPitchDeckUrl;

      // Store base64 file data in Firestore subcollection chunks (400KB per chunk)
      try {
        const chunkSize = 400000;
        const totalLen = teamData.pitchDeckUrl.length;
        let chunkIndex = 0;
        for (let i = 0; i < totalLen; i += chunkSize) {
          const chunkStr = teamData.pitchDeckUrl.substring(i, i + chunkSize);
          const chunkDocRef = doc(db, COLLECTION_NAME, registrationId, 'fileChunks', `chunk_${chunkIndex}`);
          await setDoc(chunkDocRef, sanitizeForFirestore({
            chunk: chunkStr,
            index: chunkIndex
          }), { merge: true });
          chunkIndex++;
        }
        console.log(`✅ Stored ${chunkIndex} presentation file chunks in Firestore subcollection for ID:`, registrationId);
      } catch (chunkErr) {
        console.warn('⚠️ Firestore file chunk upload warning:', chunkErr);
      }

      // Upload file blob to Firebase Cloud Storage so admins on deployed production can view the exact uploaded file
      try {
        const parts = teamData.pitchDeckUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const isPPT = (teamData.pitchDeckFileName || '').toLowerCase().endsWith('.pptx') || (teamData.pitchDeckFileName || '').toLowerCase().endsWith('.ppt');
        const mimeType = mimeMatch ? mimeMatch[1] : (isPPT ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf');
        
        const base64Data = parts[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });

        const timestamp = Date.now();
        const cleanName = (teamData.pitchDeckFileName || 'Pitch_Deck.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageRef = ref(storage, `pitch_decks/${timestamp}_${cleanName}`);
        
        try {
          const uploadResult = await uploadBytes(storageRef, blob, { contentType: mimeType });
          const cloudUrl = await getDownloadURL(uploadResult.ref);
          if (cloudUrl) {
            finalPitchDeckUrl = cloudUrl;
            console.log('✅ Pitch deck uploaded to Firebase Cloud Storage via uploadBytes:', cloudUrl);
          }
        } catch (bytesErr) {
          await uploadString(storageRef, teamData.pitchDeckUrl, 'data_url');
          const cloudUrl = await getDownloadURL(storageRef);
          if (cloudUrl) {
            finalPitchDeckUrl = cloudUrl;
            console.log('✅ Pitch deck uploaded to Firebase Cloud Storage via uploadString:', cloudUrl);
          }
        }
      } catch (storageErr) {
        console.warn('⚠️ Firebase Storage upload warning:', storageErr);
      }

      // If we got a real cloud URL (not a placeholder), update the main document with the fast URL
      if (finalPitchDeckUrl !== initialPitchDeckUrl) {
        try {
          const docRef = doc(db, COLLECTION_NAME, registrationId);
          await setDoc(docRef, sanitizeForFirestore({ pitchDeckUrl: finalPitchDeckUrl }), { merge: true });
        } catch (updateErr) {
          console.warn('⚠️ Failed to update main document with Cloud URL:', updateErr);
        }
      }
    }

    return newTeam;
  }

  static async updateRegistration(id: string, updates: Partial<TeamRegistration>): Promise<void> {
    StorageService.updateTeam(id, updates);

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, sanitizeForFirestore({
        ...updates,
        updatedAt: Timestamp.now()
      }));
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
      await updateDoc(docRef, sanitizeForFirestore({
        juryScore: fullScore,
        updatedAt: Timestamp.now()
      }));
      console.log('✅ Jury score saved to Firestore:', id);
    } catch (err) {
      console.warn('Saved jury score to local storage (Firebase fallback):', err);
    }
  }
}

