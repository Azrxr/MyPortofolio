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
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort pinned projects first (client-side)
    return projects.sort((a, b) => {
      const aPinned = a.pin || false;
      const bPinned = b.pin || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
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
      return { id: docSnap.id, ...docSnap.data() };
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