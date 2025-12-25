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

const COLLECTION_NAME = "projects";

/**
 * Helper function to normalize project data from Firestore
 * Handles both PascalCase (from bulk import) and camelCase field names
 */
function normalizeProjectData(d) {
  return {
    // Core fields - check both PascalCase and camelCase
    title: d.title || d.Title || "",
    description: d.description || d.Description || "",
    img: d.img || d.Img || "",
    link: d.link || d.Link || "",
    github: d.github || d.Github || "",
    pin: d.pin ?? d.Pin ?? false,
    
    // Arrays
    features: d.features || d.Features || [],
    techStack: d.techStack || d.TechStack || [],
    myRole: d.myRole || d.MyRole || [],
    responsibilities: d.responsibilities || d.Responsibilities || [],
    
    // Other fields
    projectType: d.projectType || d.ProjectType || "",
    companyOrOrganization: d.companyOrOrganization || d.CompanyOrOrganization || "",
    
    // Timestamps
    createdAt: d.createdAt || d.created_at || null,
    updatedAt: d.updatedAt || d.updated_at || null,
  };
}

/**
 * Get total count of projects
 */
export async function getProjectsCount() {
  try {
    const coll = collection(db, COLLECTION_NAME);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting projects count:", error);
    throw error;
  }
}

/**
 * Get all projects (sorted: pinned first, then by createdAt)
 */
export async function getAllProjects() {
  try {
    // Get all projects without orderBy to avoid issues with missing createdAt
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const projects = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      // Debug: uncomment to verify raw data
      // console.log("Raw project data:", d);
      return {
        id: docSnap.id,
        ...normalizeProjectData(d),
      };
    });
    
    // Sort: pinned first, then by createdAt (newest first)
    return projects.sort((a, b) => {
      const aPinned = a.pin || false;
      const bPinned = b.pin || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Then sort by createdAt (newest first)
      const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
      const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const d = docSnap.data();
      return { 
        id: docSnap.id, 
        ...normalizeProjectData(d),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
}

/**
 * Add a new project
 */
export async function addProject(projectData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...projectData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(id, projectData) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

/**
 * Add multiple projects at once
 */
export async function addProjectsBulk(projectsArray) {
  const results = [];
  const errors = [];

  for (const project of projectsArray) {
    try {
      const docId = await addProject(project);
      results.push({ success: true, id: docId, title: project.title });
    } catch (error) {
      errors.push({ error: error.message, title: project.title });
    }
  }

  return { results, errors };
}