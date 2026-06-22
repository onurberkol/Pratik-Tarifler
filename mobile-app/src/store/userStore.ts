import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, PremiumStatus } from "@/types";

interface UserState {
  authUser: FirebaseUser | null;
  profile: User | null;
  premium: PremiumStatus;
  isAnonymous: boolean;
  isLoading: boolean;

  setAuthUser: (u: FirebaseUser | null) => void;
  setProfile: (p: User | null) => void;
  setPremium: (p: PremiumStatus) => void;
  setLoading: (l: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  authUser: null,
  profile: null,
  premium: { active: false },
  isAnonymous: false,
  isLoading: true,

  setAuthUser: (u) =>
    set({
      authUser: u,
      isAnonymous: u?.isAnonymous ?? false,
    }),
  setProfile: (p) => set({ profile: p }),
  setPremium: (p) => set({ premium: p }),
  setLoading: (l) => set({ isLoading: l }),
  reset: () =>
    set({
      authUser: null,
      profile: null,
      premium: { active: false },
      isAnonymous: false,
      isLoading: false,
    }),
}));

/**
 * Subscribe to the user's Firestore profile. Returns unsubscribe.
 */
export function subscribeUserProfile(uid: string): () => void {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as User;
      useUserStore.setState({
        profile: data,
        premium: data.premium ?? { active: false },
      });
    } else {
      useUserStore.setState({ profile: null });
    }
  });
}
