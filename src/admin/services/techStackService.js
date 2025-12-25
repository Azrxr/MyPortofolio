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
 * Helper function to normalize tech stack data from Firestore
 * Handles legacy fields (title, img) and new fields (name, icon)
 * Also handles PascalCase from bulk import
 */
function normalizeTechStackData(d) {
  return {
    // Core fields - priority: name > title, icon > img (handles legacy + new format)
    name: d.name || d.Name || d.title || d.Title || "",
    icon: d.icon || d.Icon || d.img || d.Img || "",
    category: d.category || d.Category || "",
    
    // Timestamps
    createdAt: d.createdAt || d.created_at || null,
    updatedAt: d.updatedAt || d.updated_at || null,
  };
}

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
    // Get all tech stack without orderBy to avoid issues with missing createdAt
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const items = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      // Debug: uncomment to verify raw data
      // console.log("Raw tech stack data:", d);
      return {
        id: docSnap.id,
        ...normalizeTechStackData(d),
      };
    });
    
    // Sort by createdAt (newest first)
    return items.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
      return bTime - aTime;
    });
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
      const d = docSnap.data();
      return { 
        id: docSnap.id, 
        ...normalizeTechStackData(d),
      };
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