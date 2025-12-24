import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const DOC_ID = "settings";
const COLLECTION_NAME = "home";

/**
 * Get portfolio settings for public display
 */
export async function getPortfolioSettings() {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    // Return defaults if not found
    return {
      name: "Moh Asrori",
      title: "Mobile & Backend Developer",
      bio: "",
      experienceStartDate: "2021-11-06",
      cvUrlId: "",
      cvUrlEn: "",
      profileImage: "/Photo.jpg",
      github: "",
      linkedin: "",
      instagram: "",
      email: "",
    };
  } catch (error) {
    console.error("Error getting portfolio settings:", error);
    // Return defaults on error
    return {
      name: "Moh Asrori",
      title: "Mobile & Backend Developer",
      bio: "",
      experienceStartDate: "2021-11-06",
      cvUrlId: "",
      cvUrlEn: "",
      profileImage: "/Photo.jpg",
      github: "",
      linkedin: "",
      instagram: "",
      email: "",
    };
  }
}

/**
 * Calculate years of experience
 */
export function calculateYearsOfExperience(startDateString) {
  if (!startDateString) return 0;
  
  const startDate = new Date(startDateString);
  const today = new Date();
  let years = today.getFullYear() - startDate.getFullYear();
  
  if (today < new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
}
