import { publicAxios } from "@/libs/axiosInstance";
import { ForgotpasswordSchema, SigninFormSchema } from "@/modules/auth/types";
import { isAxiosError } from "axios";

const loginUser = async (payload: SigninFormSchema) => {
  try {
    // API LoginViewModel uses Email/Password; send both casings for binder safety.
    const { data } = await publicAxios.post(
      "/Account/auth_login?medium=Mobile",
      {
        email: payload.email,
        password: payload.password,
        Email: payload.email,
        Password: payload.password,
        rememberMe: true,
        RememberMe: true,
      }
    );
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (!error.response) {
        throw Object.assign(
          new Error(
            "Cannot reach PromaxCare API. Check internet or API URL (api.promaxcare.com.au)."
          ),
          {
            response: {
              data: {
                message:
                  "Cannot reach PromaxCare API. Check internet or API URL (api.promaxcare.com.au).",
              },
            },
          }
        );
      }
      throw error;
    }
    throw error instanceof Error ? error : new Error("Unable to login!");
  }
};

const forgotPassword = async ({ email }: ForgotpasswordSchema) => {
  try {
    const { data } = await publicAxios.get(
      `/Account/forgot_password?email=${encodeURIComponent(email)}`
    );
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (!error.response) {
        throw Object.assign(new Error("Cannot reach PromaxCare API."), {
          response: {
            data: { message: "Cannot reach PromaxCare API. Check internet." },
          },
        });
      }
      throw error;
    }
    throw error;
  }
};

const resetPassword = async (payload: {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const { data } = await publicAxios.post("/Account/reset_password", {
      email: payload.email,
      Email: payload.email,
      otp: payload.otp,
      OTP: payload.otp,
      password: payload.password,
      Password: payload.password,
      confirmPassword: payload.confirmPassword,
      ConfirmPassword: payload.confirmPassword,
    });
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (!error.response) {
        throw Object.assign(new Error("Cannot reach PromaxCare API."), {
          response: {
            data: { message: "Cannot reach PromaxCare API. Check internet." },
          },
        });
      }
      throw error;
    }
    throw error;
  }
};

export const AuthService = { loginUser, forgotPassword, resetPassword };
