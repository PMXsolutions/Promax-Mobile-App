import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { StaffProfileTypes, UserProfileType } from "@/types/auth";
import storageUtil from "@/utils/storage";
import { queryClient } from "@/libs/query";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      logout: async () => {
        set({ isAuthenticated: false, user: null, token: null, staff: null });
        queryClient.clear();
        // Recently updated: clear user-scoped push registration state on shared devices.
        await AsyncStorage.multiRemove(["fcmToken", "fcmTokenOwner"]);
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
