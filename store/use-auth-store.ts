import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { StaffProfileTypes, UserProfileType } from "@/types/auth";
import storageUtil from "@/utils/storage";

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfileType | null;
  staff: StaffProfileTypes | null;
  token: string | null;
  login: (
    user: UserProfileType,
    staff: StaffProfileTypes,
    token: string
  ) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      staff: null,
      login: (userData, staffData, token) =>
        set({
          isAuthenticated: true,
          user: userData,
          token,
          staff: staffData,
        }),
      logout: () => {
        // Reset the state
        set({ isAuthenticated: false, user: null, token: null, staff: null });
        storageUtil.removeItem("auth-storage");
        // Optionally clear tokens on logout
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => storageUtil), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
