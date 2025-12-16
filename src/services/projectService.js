import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getProjects = async () => {
  try {
    const q = query(
      collection(db, "projects"),
      orderBy("isPinned", "desc"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
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
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getCertificates = async () => {
  const q = query(
    collection(db, "certificates"),
    orderBy("isPinned", "desc"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      // Map Firebase field names to component expected names
      Img: data.img || data.Img,
      title: data.title || data.tittle || data.Title || data.Tittle,
      // Keep original field names for backward compatibility
      ...data,
    };
  });
};

export const getTechStacks = async () => {
  const q = query(collection(db, "tech_stack"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};
