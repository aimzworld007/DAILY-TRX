import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Firestore,
} from "firebase/firestore";
import { DailyRecord } from "@/types/financial";

const firebaseConfig = {
  apiKey: "AIzaSyAdxbjOZEj3FW86yM6sZdgynSB2mQxXhoQ",
  authDomain: "ncp-da-uae-28-02-2025.firebaseapp.com",
  projectId: "ncp-da-uae-28-02-2025",
  storageBucket: "ncp-da-uae-28-02-2025.firebasestorage.app",
  messagingSenderId: "116452491345",
  appId: "1:116452491345:web:450df57a7d94fa9ae83870",
};

const FIRESTORE_DB_ID =
  "ai-studio-dailytraxhabatal-567e66a2-d59e-44bb-b67c-badd3ff98532";

let dbInstance: Firestore | null = null;

export function getDb(): Firestore {
  if (!dbInstance) {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    try {
      dbInstance = getFirestore(app, FIRESTORE_DB_ID);
    } catch {
      // Fallback to default database if named database fails
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
}

const COLLECTION_NAME = "daily_records";

/**
 * Fetch a daily financial record by date (YYYY-MM-DD)
 */
export async function fetchDailyRecord(
  dateStr: string
): Promise<DailyRecord | null> {
  try {
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, dateStr);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DailyRecord;
    }
    return null;
  } catch (error) {
    console.error("Error fetching daily record from Firestore:", error);
    throw error;
  }
}

/**
 * Save or update a daily financial record (ID format: YYYY-MM-DD)
 */
export async function saveDailyRecord(record: DailyRecord): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, record.date);
    const recordToSave: DailyRecord = {
      ...record,
      updated_at: new Date().toISOString(),
    };
    await setDoc(docRef, recordToSave, { merge: true });
  } catch (error) {
    console.error("Error saving daily record to Firestore:", error);
    throw error;
  }
}

/**
 * Delete a daily financial record from Firestore
 */
export async function removeDailyRecord(dateStr: string): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, COLLECTION_NAME, dateStr);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting daily record from Firestore:", error);
    throw error;
  }
}

/**
 * Fetch historical daily records ordered by date descending
 */
export async function fetchHistoryRecords(
  maxCount: number = 30
): Promise<DailyRecord[]> {
  try {
    const db = getDb();
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy("date", "desc"), limit(maxCount));
    const querySnapshot = await getDocs(q);

    const records: DailyRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      records.push(docSnap.data() as DailyRecord);
    });
    return records;
  } catch (error) {
    console.error("Error fetching history from Firestore:", error);
    throw error;
  }
}

// Aliases for clean component usage
export const getDailyRecord = fetchDailyRecord;
export const deleteDailyRecord = removeDailyRecord;
export const getAllDailyRecords = fetchHistoryRecords;

