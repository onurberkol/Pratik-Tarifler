import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  linkWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
  sendPasswordResetEmail,
  deleteUser as fbDeleteUser,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/lib/firebase";

export type AuthUser = FirebaseUser;

export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signUpEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInAnonymous() {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const user = auth.currentUser;
  if (user?.isAnonymous) {
    // Link anonymous → google to preserve UID
    const result = await linkWithCredential(user, credential);
    return result.user;
  }
  // Direct sign-in
  const { signInWithCredential } = await import("firebase/auth");
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function signInWithAppleIdToken(
  idToken: string,
  nonce: string
) {
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({ idToken, rawNonce: nonce });
  const user = auth.currentUser;
  if (user?.isAnonymous) {
    const result = await linkWithCredential(user, credential);
    return result.user;
  }
  const { signInWithCredential } = await import("firebase/auth");
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function linkEmailToAnonymous(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const user = auth.currentUser;
  if (!user?.isAnonymous) {
    throw new Error("not_anonymous");
  }
  const credential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(user, credential);
  return result.user;
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function deleteAccount() {
  // Cloud Function performs full data purge (sub-collections, storage, etc.)
  const purge = httpsCallable(functions, "purgeUserData");
  await purge({});
  if (auth.currentUser) {
    await fbDeleteUser(auth.currentUser);
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
