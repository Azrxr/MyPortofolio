import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

const COLLECTION_NAME = "portfolio_comments";

/**
 * Get all comments (sorted: pinned first, then by createdAt)
 */
export async function getAllComments() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort pinned comments first (client-side)
    return comments.sort((a, b) => {
      const aPinned = a.isPinned || false;
      const bPinned = b.isPinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
}

/**
 * Get comments count
 */
export async function getCommentsCount() {
  try {
    const coll = collection(db, COLLECTION_NAME);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting comments count:", error);
    return 0;
  }
}

/**
 * Get visible comments count (not hidden)
 */
export async function getVisibleCommentsCount() {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    const visibleComments = snapshot.docs.filter(doc => !doc.data().isHidden);
    return visibleComments.length;
  } catch (error) {
    console.error("Error getting visible comments count:", error);
    return 0;
  }
}

/**
 * Update comment (pin, hide, etc.)
 */
export async function updateComment(id, data) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

/**
 * Toggle pin status
 */
export async function toggleCommentPin(id, currentPinStatus) {
  try {
    // If pinning a new comment, first unpin all others
    if (!currentPinStatus) {
      const allComments = await getAllComments();
      const pinnedComments = allComments.filter(c => c.isPinned);
      
      // Unpin all currently pinned comments
      for (const comment of pinnedComments) {
        await updateDoc(doc(db, COLLECTION_NAME, comment.id), {
          isPinned: false,
          updatedAt: new Date(),
        });
      }
    }

    // Toggle the pin status
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isPinned: !currentPinStatus,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error toggling comment pin:", error);
    throw error;
  }
}

/**
 * Toggle hide status
 */
export async function toggleCommentVisibility(id, currentHiddenStatus) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isHidden: !currentHiddenStatus,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error toggling comment visibility:", error);
    throw error;
  }
}

/**
 * Delete comment
 */
export async function deleteComment(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
