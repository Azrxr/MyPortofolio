import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";

const COLLECTION_NAME = "tech_stack";

/**
 * Get total count of tech stack items
 */
export async function getTechStackCount() {
  try {
    const coll = collection(db, COLLECTION_NAME);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting tech stack count:", error);
    throw error;
  }
}

/**
 * Get all tech stack items
 */
export async function getAllTechStack() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting tech stack:", error);
    throw error;
  }
}

/**
 * Get a single tech stack item by ID
 */
export async function getTechStack(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting tech stack:", error);
    throw error;
  }
}

/**
 * Add a new tech stack item
 */
export async function addTechStack(techData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...techData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding tech stack:", error);
    throw error;
  }
}

/**
 * Update an existing tech stack item
 */
export async function updateTechStack(id, techData) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...techData,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error("Error updating tech stack:", error);
    throw error;
  }
}

/**
 * Delete a tech stack item
 */
export async function deleteTechStack(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting tech stack:", error);
    throw error;
  }
}

/**
 * Add multiple tech stack items at once
 */
export async function addTechStacksBulk(techStacksArray) {
  const results = [];
  const errors = [];

  for (const tech of techStacksArray) {
    try {
      const docId = await addTechStack(tech);
      results.push({ success: true, id: docId, title: tech.title });
    } catch (error) {
      errors.push({ error: error.message, title: tech.title });
    }
  }

  return { results, errors };
}