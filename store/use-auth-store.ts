import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { StaffProfileTypes, UserProfileType } from "@/types/auth";
import storageUtil from "@/utils/storage";
import { queryClient } from "@/libs/query";

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  user: UserProfileType | null;
  staff: StaffProfileTypes | null;
  token: string | null;
  login: (
    user: UserProfileType,
    staff: StaffProfileTypes,
    token: string
  ) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      hasHydrated: false,
      user: null,
      token: null,
      staff: null,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      login: (userData, staffData, token) =>
        set({
          isAuthenticated: true,
          user: userData,
          token,
          staff: staffData,
        }),
      logout: () => {
        queryClient.clear();
        set({ isAuthenticated: false, user: null, token: null, staff: null });
        storageUtil.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => storageUtil), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
