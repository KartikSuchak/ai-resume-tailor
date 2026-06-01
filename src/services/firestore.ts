import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Message } from '../components/workspace/ChatMessage';

export interface SavedResume {
  id: string; // The Firestore document ID
  userId: string;
  originalResume: string;
  jobDescription: string;
  originalTailoredResume: string;
  currentTailoredResume: string;
  chatMessages: Message[];
  title: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

const RESUMES_COLLECTION = 'resumes';

/**
 * Auto-generates a brief title based on the job description.
 */
const generateTitle = (jobDesc: string): string => {
  const firstLine = jobDesc.split('\n')[0].trim();
  const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  return title || 'Untitled Resume';
};

/**
 * Creates a new resume document in Firestore.
 */
/**
 * Creates a new resume document in Firestore.
 */
export const saveResume = async (
  userId: string,
  originalResume: string,
  jobDescription: string,
  tailoredResume: string
): Promise<string> => {
  console.log(`[SAVE] Attempting save...`);
  console.log(`[SAVE] User authenticated: uid=${userId}`);
  
  // Validate input parameters
  if (!userId) {
    console.error(`[SAVE] Validation failed: userId is missing.`);
    throw new Error("User ID is required to save.");
  }
  if (!originalResume || !jobDescription || !tailoredResume) {
    console.error(`[SAVE] Validation failed: Payloads cannot be empty.`, {
      originalResumeLen: originalResume?.length,
      jobDescLen: jobDescription?.length,
      tailoredLen: tailoredResume?.length
    });
    throw new Error("Cannot save empty resume data.");
  }
  
  console.log(`[SAVE] Payload validated`);

  try {
    const resumesRef = collection(db, RESUMES_COLLECTION);
    const newDocRef = doc(resumesRef); // auto-generate ID
    
    const newResumeData: Omit<SavedResume, 'id'> = {
      userId,
      originalResume,
      jobDescription,
      originalTailoredResume: tailoredResume,
      currentTailoredResume: tailoredResume,
      chatMessages: [],
      title: generateTitle(jobDescription),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log(`[SAVE] Document ID allocated: ${newDocRef.id}`);
    console.log(`[SAVE] Sending Firestore setDoc payload:`, newResumeData);

    await setDoc(newDocRef, newResumeData);
    
    console.log(`[SAVE] Firestore write success: documentId=${newDocRef.id}`);
    return newDocRef.id;
  } catch (error: any) {
    console.error("[SAVE] Firestore write CRITICAL FAILURE:", error);
    throw new Error(`Failed to save resume: ${error.message || error}`);
  }
};

/**
 * Updates an existing resume document in Firestore with new refinements.
 */
export const updateResume = async (
  documentId: string,
  currentTailoredResume: string,
  chatMessages: Message[]
): Promise<void> => {
  console.log(`[SAVE] Attempting update for documentId=${documentId}...`);
  try {
    const docRef = doc(db, RESUMES_COLLECTION, documentId);
    
    console.log(`[SAVE] Sending Firestore updateDoc payload. Messages count: ${chatMessages.length}`);
    await updateDoc(docRef, {
      currentTailoredResume,
      chatMessages,
      updatedAt: serverTimestamp(),
    });
    
    console.log(`[SAVE] Firestore update success: documentId=${documentId}`);
  } catch (error: any) {
    console.error("[SAVE] Firestore update CRITICAL FAILURE:", error);
    throw new Error(`Failed to update resume: ${error.message || error}`);
  }
};

/**
 * Safe utility to extract millisecond timestamp from various Firestore date representations.
 * Handles Timestamps, plain Dates, strings, and parsed JSON structures without crashing.
 */
const getTimestampMillis = (timestamp: any): number => {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }
  if (typeof timestamp.getTime === 'function') {
    return timestamp.getTime();
  }
  if (typeof timestamp.seconds === 'number') {
    return timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1000000);
  }
  const parsed = Date.parse(timestamp);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Fetches all saved resumes for a specific user.
 */
export const getUserResumes = async (userId: string): Promise<SavedResume[]> => {
  console.log(`[LOAD] Fetching resumes for uid=${userId}...`);
  try {
    const resumesRef = collection(db, RESUMES_COLLECTION);
    const q = query(resumesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const resumes: SavedResume[] = [];
    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() } as SavedResume);
    });
    
    console.log(`[LOAD] Retrieved ${resumes.length} resumes`);
    
    // Sort client-side by updatedAt descending using a crash-free serialization helper
    return resumes.sort((a, b) => {
      const timeA = getTimestampMillis(a.updatedAt);
      const timeB = getTimestampMillis(b.updatedAt);
      return timeB - timeA;
    });
  } catch (error) {
    console.error("[LOAD] Critical error fetching resumes from Firestore:", error);
    throw new Error("Failed to fetch saved resumes.");
  }
};

/**
 * Deletes a specific resume document.
 */
export const deleteResume = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, RESUMES_COLLECTION, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting resume from Firestore:", error);
    throw new Error("Failed to delete resume.");
  }
};
