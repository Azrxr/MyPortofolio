import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { uploadToCloudinary } from "./cloudinaryService";

const DOC_ID = "settings";
const COLLECTION_NAME = "home";

/**
 * Default settings structure
 */
const defaultSettings = {
  // Personal Info
  name: "Moh Asrori",
  title: "Mobile & Backend Developer",
  bio: "Saya adalah seorang Mobile & Backend Developer dengan pengalaman dalam membangun aplikasi Android menggunakan Kotlin serta mengembangkan backend menggunakan Laravel dan RESTful API.",
  
  // Experience
  experienceStartDate: "2021-11-06",
  
  // CV - Indonesian Version
  cvUrlId: "",
  cvFileNameId: "",
  
  // CV - English Version
  cvUrlEn: "",
  cvFileNameEn: "",
  
  // Social Links
  github: "",
  linkedin: "",
  instagram: "",
  email: "",
  
  // Other
  profileImage: "/Photo.jpg",
  
  // Metadata
  updatedAt: null,
};

/**
 * Get portfolio settings
 */
export async function getSettings() {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...defaultSettings, ...docSnap.data() };
    } else {
      // Create default settings if not exists
      await setDoc(docRef, { ...defaultSettings, createdAt: new Date() });
      return { id: DOC_ID, ...defaultSettings };
    }
  } catch (error) {
    console.error("Error getting settings:", error);
    throw error;
  }
}

/**
 * Update portfolio settings
 */
export async function updateSettings(data) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === "not-found") {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      await setDoc(docRef, {
        ...defaultSettings,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      console.error("Error updating settings:", error);
      throw error;
    }
  }
}

/**
 * Upload CV to Cloudinary (Indonesian or English version)
 * @param {File} file - The CV file
 * @param {string} lang - Language version: 'id' or 'en'
 * @param {Function} onProgress - Progress callback
 */
export async function uploadCV(file, lang = 'id', onProgress) {
  try {
    const folder = lang === 'en' ? 'portfolio/cv/en' : 'portfolio/cv/id';
    const url = await uploadToCloudinary(file, folder, onProgress);
    
    // Update settings with CV URL based on language
    if (lang === 'en') {
      await updateSettings({
        cvUrlEn: url,
        cvFileNameEn: file.name,
      });
    } else {
      await updateSettings({
        cvUrlId: url,
        cvFileNameId: file.name,
      });
    }
    
    return url;
  } catch (error) {
    console.error("Error uploading CV:", error);
    throw error;
  }
}

/**
 * Upload profile image to Cloudinary
 */
export async function uploadProfileImage(file, onProgress) {
  try {
    const url = await uploadToCloudinary(file, "portfolio/profile", onProgress);
    
    // Update settings with profile image URL
    await updateSettings({
      profileImage: url,
    });
    
    return url;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
}

/**
 * Calculate years of experience from start date
 */
export function calculateYearsOfExperience(startDateString) {
  if (!startDateString) return 0;
  
  const startDate = new Date(startDateString);
  const today = new Date();
  let years = today.getFullYear() - startDate.getFullYear();
  
  // Adjust if anniversary hasn't occurred this year
  if (today < new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
}
