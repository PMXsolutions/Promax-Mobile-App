import { z } from "zod";

export const signInFormSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please enter a valid email"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email"),
});

export const changePasswordSchema = z
  .object({
    old_password: z
      .string({ required_error: "Code is required" })
      .regex(/^\d{6}$/, "Enter the six-digit code from your email"),
    new_password: z
      .string({ required_error: "New password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must include at least one symbol"
      ),
    confirm_new_password: z.string({
      required_error: "Please confirm your new password",
    }),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords don't match",
    path: ["confirm_new_password"],
  });
