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
export const saveResume = async (
  userId: string,
  originalResume: string,
  jobDescription: string,
  tailoredResume: string
): Promise<string> => {
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

    await setDoc(newDocRef, newResumeData);
    return newDocRef.id;
  } catch (error) {
    console.error("Error saving resume to Firestore:", error);
    throw new Error("Failed to save resume. Please try again.");
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
  try {
    const docRef = doc(db, RESUMES_COLLECTION, documentId);
    await updateDoc(docRef, {
      currentTailoredResume,
      chatMessages,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating resume in Firestore:", error);
    throw new Error("Failed to update resume.");
  }
};

/**
 * Fetches all saved resumes for a specific user.
 */
export const getUserResumes = async (userId: string): Promise<SavedResume[]> => {
  try {
    const resumesRef = collection(db, RESUMES_COLLECTION);
    const q = query(resumesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const resumes: SavedResume[] = [];
    querySnapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() } as SavedResume);
    });
    
    // Sort client-side by updatedAt descending for simplicity
    // Note: requires indexing if sorted server-side via orderBy
    return resumes.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis() || 0;
      const timeB = b.updatedAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching resumes from Firestore:", error);
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
