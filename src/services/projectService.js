import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getProjects = async () => {
  try {
    // Simple query without compound index requirement
    const q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const projects = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Map Firebase field names to component expected names
        Img: data.img || data.Img,
        Title: data.title || data.Title,
        Description: data.description || data.Description,
        Link: data.link || data.Link,
        Github: data.github || data.Github,
        Features: data.features || data.Features,
        TechStack: data.techStack || data.TechStack,
        Pin: data.isPinned || data.pin || data.Pin,
        // Keep original field names for backward compatibility
        ...data,
      };
    });

    // Sort pinned projects first (client-side sorting)
    return projects.sort((a, b) => {
      const aPinned = a.Pin || a.isPinned || a.pin || false;
      const bPinned = b.Pin || b.isPinned || b.pin || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

export const getCertificates = async () => {
  try {
    // Simple query without compound index requirement
    const q = query(
      collection(db, "certificates"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const certificates = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Map Firebase field names to component expected names
        Img: data.img || data.Img,
        title: data.title || data.tittle || data.Title || data.Tittle,
        Pin: data.pin || data.Pin || false,
        // Keep original field names for backward compatibility
        ...data,
      };
    });

    // Sort pinned certificates first (client-side sorting)
    return certificates.sort((a, b) => {
      const aPinned = a.Pin || a.pin || false;
      const bPinned = b.Pin || b.pin || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

export const getTechStacks = async () => {
  try {
    const q = query(collection(db, "tech_stack"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching tech stacks:", error);
    return [];
  }
};
