import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

export const provider = new GoogleAuthProvider();
export { auth };


