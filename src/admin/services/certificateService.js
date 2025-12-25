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
 * Helper function to normalize certificate data from Firestore
 * Handles legacy fields and different case variations
 * Standard output: title, img, isPinned
 */
function normalizeCertificateData(d) {
  return {
    // Core fields - check all variations
    title: d.title || d.Title || "",
    img: d.img || d.Img || d.image || d.Image || "",
    isPinned: d.isPinned ?? d.IsPinned ?? d.pin ?? d.Pin ?? false,
    
    // Optional fields
    issuer: d.issuer || d.Issuer || "",
    date: d.date || d.Date || "",
    link: d.link || d.Link || "",
    
    // Timestamps
    createdAt: d.createdAt || d.created_at || null,
    updatedAt: d.updatedAt || d.updated_at || null,
  };
}

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
    // Get all certificates without orderBy to avoid issues with missing createdAt
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const certificates = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      // Debug: uncomment to verify raw data
      // console.log("Raw certificate data:", d);
      return {
        id: docSnap.id,
        ...normalizeCertificateData(d),
      };
    });
    
    // Sort: pinned first, then by createdAt (newest first)
    return certificates.sort((a, b) => {
      const aPinned = a.isPinned || false;
      const bPinned = b.isPinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Then sort by createdAt (newest first)
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
      return bTime - aTime;
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
      const d = docSnap.data();
      return { 
        id: docSnap.id, 
        ...normalizeCertificateData(d),
      };
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