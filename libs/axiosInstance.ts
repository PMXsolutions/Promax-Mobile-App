import useAuthStore from "@/store/use-auth-store";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { showMessage } from "react-native-flash-message";
import { tryRefreshSession } from "@/services/session";

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface DataStructure {
  id: number;
  name: string;
}

// Fail closed: never fall back to a hardcoded hosted API URL (prevents
// accidental production traffic when EXPO_PUBLIC_API_BASEURL is unset).
const baseURL = process.env.EXPO_PUBLIC_API_BASEURL?.trim() || "";

if (!baseURL) {
  console.warn(
    "[PromaxCare] EXPO_PUBLIC_API_BASEURL is not set. API calls will fail until a non-production base URL is configured."
  );
}

const rejectIfUnconfigured = (config: { headers?: unknown }) => {
  if (!baseURL) {
    return Promise.reject(
      new Error(
        "API base URL is not configured. Set EXPO_PUBLIC_API_BASEURL before making requests."
      )
    );
  }
  return config;
};

export const publicAxios = axios.create({
  baseURL: baseURL || undefined,
  timeout: 30000,
});

const axiosInstance = axios.create({
  baseURL: baseURL || undefined,
  timeout: 30000,
});

publicAxios.interceptors.request.use(
  (config) => rejectIfUnconfigured(config) as typeof config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.request.use(
  (config) => {
    if (!baseURL) {
      return Promise.reject(
        new Error(
          "API base URL is not configured. Set EXPO_PUBLIC_API_BASEURL before making requests."
        )
      );
    }
    const authToken = useAuthStore.getState().token;
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type RetryConfig = InternalAxiosRequestConfig & { _wave11bRetry?: boolean };

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<DataStructure>>) => response,
  async (error: AxiosError<{ message?: string; Message?: string; Code?: string; code?: string }>) => {
    const { response } = error;
    const original = error.config as RetryConfig | undefined;

    if (response) {
      switch (response.status) {
        case 401: {
          if (original && !original._wave11bRetry) {
            original._wave11bRetry = true;
            const { refreshToken, deviceId } = useAuthStore.getState();
            if (refreshToken && deviceId) {
              const result = await tryRefreshSession({
                refreshToken,
                deviceId,
              });
              if (result.ok && result.accessToken) {
                useAuthStore.getState().applyRefreshedTokens({
                  token: result.accessToken,
                  refreshToken: result.refreshToken,
                  tokenExpiration: result.tokenExpiration,
                });
                original.headers = original.headers || {};
                original.headers["Authorization"] = `Bearer ${result.accessToken}`;
                return axiosInstance(original);
              }
            }
          }
          useAuthStore.getState().clearInvalidAuth();
          break;
        }

        case 403:
          showMessage({
            message:
              response.data?.message ||
              response.data?.Message ||
              "You do not have access to this resource.",
            type: "danger",
          });
          break;

        case 404:
          break;
        case 500:
          break;
        default:
          break;
      }
    } else {
      throw error;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
