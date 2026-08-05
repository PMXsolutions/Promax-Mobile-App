import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { StaffProfileTypes, UserProfileType } from "@/types/auth";
import storageUtil from "@/utils/storage";
import { queryClient } from "@/libs/query";
import { isAuthSessionExpired } from "@/utils/auth-session";

export { isAuthSessionExpired } from "@/utils/auth-session";

type AuthUser = Omit<UserProfileType, "token">;

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  staff: StaffProfileTypes | null;
  token: string | null;
  login: (
    user: UserProfileType,
    staff: StaffProfileTypes,
    token: string
  ) => void;
  logout: () => Promise<void>;
  clearExpiredSession: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      staff: null,
      login: (userData, staffData, token) => {
        const { token: _token, ...userWithoutToken } = userData;
        set({
          isAuthenticated: true,
          user: userWithoutToken,
          token,
          staff: staffData,
        });
      },
      clearExpiredSession: () => {
        const { user, token, isAuthenticated } = get();
        if (!isAuthenticated) return;
        if (isAuthSessionExpired(user, token)) {
          set({ isAuthenticated: false, user: null, token: null, staff: null });
          queryClient.clear();
        }
      },
      logout: async () => {
        set({ isAuthenticated: false, user: null, token: null, staff: null });
        queryClient.clear();
        await storageUtil.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => storageUtil), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        state?.clearExpiredSession();
      },
    }
  )
);

export default useAuthStore;
