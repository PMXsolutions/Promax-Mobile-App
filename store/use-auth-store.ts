import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { StaffProfileTypes, UserProfileType } from "@/types/auth";
import storageUtil from "@/utils/storage";
import { queryClient } from "@/libs/query";
import { isAuthSessionExpired } from "@/utils/auth-session";
import { logoutRemoteSession } from "@/services/session";

export { isAuthSessionExpired } from "@/utils/auth-session";

type AuthUser = Omit<UserProfileType, "token">;

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  staff: StaffProfileTypes | null;
  token: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  getOrCreateDeviceId: () => string;
  login: (
    user: UserProfileType,
    staff: StaffProfileTypes,
    token: string
  ) => void;
  applyRefreshedTokens: (args: {
    token: string;
    refreshToken?: string;
    tokenExpiration?: string;
  }) => void;
  logout: () => Promise<void>;
  clearExpiredSession: () => void;
  clearInvalidAuth: () => void;
}

function ensureDeviceId(existing: string | null): string {
  if (existing) return existing;
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      deviceId: null,
      staff: null,
      getOrCreateDeviceId: () => {
        const deviceId = ensureDeviceId(get().deviceId);
        if (deviceId !== get().deviceId) set({ deviceId });
        return deviceId;
      },
      login: (userData, staffData, token) => {
        const { token: _token, refreshToken, ...rest } = userData;
        const deviceId = ensureDeviceId(get().deviceId);
        set({
          isAuthenticated: true,
          user: rest,
          token,
          staff: staffData,
          refreshToken: refreshToken || get().refreshToken || null,
          deviceId,
        });
      },
      applyRefreshedTokens: ({ token, refreshToken, tokenExpiration }) => {
        const user = get().user;
        set({
          token,
          refreshToken: refreshToken ?? get().refreshToken,
          user: user
            ? {
                ...user,
                tokenExpiration: tokenExpiration || user.tokenExpiration,
              }
            : user,
          isAuthenticated: true,
        });
      },
      clearExpiredSession: () => {
        const { user, token, isAuthenticated } = get();
        if (!isAuthenticated) return;
        if (isAuthSessionExpired(user, token)) {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            staff: null,
            refreshToken: null,
          });
          queryClient.clear();
        }
      },
      clearInvalidAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          staff: null,
          refreshToken: null,
        });
        queryClient.clear();
      },
      logout: async () => {
        const refresh = get().refreshToken;
        await logoutRemoteSession(refresh);
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          staff: null,
          refreshToken: null,
        });
        queryClient.clear();
        await storageUtil.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => storageUtil),
      onRehydrateStorage: () => (state) => {
        state?.clearExpiredSession();
      },
    }
  )
);

export default useAuthStore;
