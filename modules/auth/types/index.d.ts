import { z } from "zod";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  signInFormSchema,
} from "../validation";

export type SigninFormSchema = z.infer<typeof signInFormSchema>;
export type ForgotpasswordSchema = z.infer<typeof forgotPasswordSchema>;

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
