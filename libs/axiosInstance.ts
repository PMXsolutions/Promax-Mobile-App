import useAuthStore from "@/store/use-auth-store";
import axios, { AxiosError, AxiosResponse } from "axios";
import { showMessage } from "react-native-flash-message";

// Define the structure of your API response data
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  // Add other fields if needed
}

// Define the structure of your specific response data
interface DataStructure {
  // Define the structure based on your API response
  // For example:
  id: number;
  name: string;
  // Add other fields as per your response data
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

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<DataStructure>>) => response,
  (error: AxiosError<{ message?: string; Message?: string }>) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401: // Unauthorized
          void useAuthStore.getState().logout();
          break;

        case 403:
          // Forbidden is action-scoped (e.g. TenantAccess), not whole-session invalid.
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
