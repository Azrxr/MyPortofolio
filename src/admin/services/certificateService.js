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

const COLLECTION_NAME = "certificates";

/**
 * Get total count of certificates
 */
export async function getCertificatesCount() {
  try {
    const coll = collection(db, COLLECTION_NAME);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting certificates count:", error);
    throw error;
  }
}

/**
 * Get all certificates (sorted: pinned first, then by createdAt)
 */
export async function getAllCertificates() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const certificates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort pinned certificates first (client-side)
    return certificates.sort((a, b) => {
      const aPinned = a.pin || false;
      const bPinned = b.pin || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error getting certificates:", error);
    throw error;
  }
}

/**
 * Get a single certificate by ID
 */
export async function getCertificate(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting certificate:", error);
    throw error;
  }
}

/**
 * Add a new certificate
 */
export async function addCertificate(certData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...certData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding certificate:", error);
    throw error;
  }
}

/**
 * Update an existing certificate
 */
export async function updateCertificate(id, certData) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...certData,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error("Error updating certificate:", error);
    throw error;
  }
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting certificate:", error);
    throw error;
  }
}

/**
 * Add multiple certificates at once
 */
export async function addCertificatesBulk(certificatesArray) {
  const results = [];
  const errors = [];

  for (const cert of certificatesArray) {
    try {
      const docId = await addCertificate(cert);
      results.push({ success: true, id: docId });
    } catch (error) {
      errors.push({ error: error.message });
    }
  }

  return { results, errors };
}