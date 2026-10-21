import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { StaffProfileTypes, UserProfileType } from "@/types/auth";
import storageUtil from "@/utils/storage";
import { queryClient } from "@/libs/query";

type AuthUser = Omit<UserProfileType, "token">;

export type SessionNotice = "expired" | null;

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  staff: StaffProfileTypes | null;
  token: string | null;
  sessionNotice: SessionNotice;
  login: (
    user: UserProfileType,
    staff: StaffProfileTypes,
    token: string
  ) => void;
  logout: () => Promise<void>;
  expireSession: () => Promise<void>;
  clearSessionNotice: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      staff: null,
      sessionNotice: null,
      login: (userData, staffData, token) => {
        const { token: _token, ...userWithoutToken } = userData;
        set({
          isAuthenticated: true,
          user: userWithoutToken,
          token,
          staff: staffData,
          sessionNotice: null,
        });
      },
      clearSessionNotice: () => {
        set({ sessionNotice: null });
      },
      logout: async () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          staff: null,
          sessionNotice: null,
        });
        queryClient.clear();
        await storageUtil.removeItem("auth-storage");
      },
      expireSession: async () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          staff: null,
          sessionNotice: "expired",
        });
        queryClient.clear();
        await storageUtil.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => storageUtil), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
