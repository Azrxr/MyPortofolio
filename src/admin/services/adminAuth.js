import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../../firebase/auth";
import { ADMIN_EMAILS } from "../constants/adminEmails";

export function isAuthorizedEmail(email) {
  const normalized = (email || "").toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const email = user?.email?.toLowerCase() || "";
  if (!isAuthorizedEmail(email)) {
    await signOut(auth);
    const err = new Error("Unauthorized email");
    err.code = "admin/unauthorized-email";
    throw err;
  }
  return user;
}

export async function logoutAdmin() {
  await signOut(auth);
}
