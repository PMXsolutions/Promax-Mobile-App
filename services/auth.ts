import { publicAxios } from "@/libs/axiosInstance";
import {
  ChangePasswordSchema,
  ForgotpasswordSchema,
  SigninFormSchema,
} from "@/modules/auth/types";
import { isAxiosError } from "axios";
import useAuthStore from "@/store/use-auth-store";

const loginUser = async (payload: SigninFormSchema) => {
  // BE auth_login defaults medium to "Web" when omitted; staff app must tag Mobile.
  const deviceId = useAuthStore.getState().getOrCreateDeviceId();
  const { data } = await publicAxios.post(
    "/Account/auth_login?medium=Mobile",
    { ...payload, deviceId }
  );

  return data;
};

const forgotPassword = async ({ email }: ForgotpasswordSchema) => {
  try {
    const { data } = await publicAxios.get("/Account/forgot_password", {
      params: { email },
    });

    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw error;
    }
    return error;
  }
};

const resetPassword = async (
  email: string,
  payload: ChangePasswordSchema
) => {
  const { data } = await publicAxios.post("/Account/reset_password", {
    Email: email,
    OTP: payload.old_password,
    Password: payload.new_password,
    ConfirmPassword: payload.confirm_new_password,
  });

  return data;
};

// const { data } = await publicAxios.post("/Account/post_otp", postData);

// const loginUser = async ({
//     email,
//     password,
//   }: Record<string, string>): Promise<AuthSuccessResponse> => {
//     try {
//       const response = await http
//         .post('auth/login', {
//           json: { email, password },
//         })
//         .json<AuthSuccessResponse>();

//       if ('error' in response) {
//         throw new Error('Something went wrong');
//       }

//       return response;
//     } catch (error) {
//       if (error instanceof HTTPError) {
//         const errorBody = await error.response.json<AuthLoginResponse>();
//         throw new Error(errorBody.message || `HTTP error ${error.response.status}`);
//       }
//       throw error;
//     }
//   };

export const AuthService = { loginUser, forgotPassword, resetPassword };
