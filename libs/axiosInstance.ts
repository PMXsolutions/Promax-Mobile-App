import useAuthStore from "@/store/use-auth-store";
import { sessionActionForStatus } from "@/libs/session-status";
import axios, { AxiosError, AxiosResponse } from "axios";

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

const baseURL =
  process.env.EXPO_PUBLIC_API_BASEURL ||
  "https://api.promaxcare.com.au/api";

export const publicAxios = axios.create({
  baseURL,
  timeout: 30000,
});

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
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
  (error: AxiosError) => {
    const { response } = error;
    if (response) {
      if (sessionActionForStatus(response.status) === "expire") {
        void useAuthStore.getState().expireSession();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
