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
    .min(2, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email"),
});

export const changePasswordSchema = z
  .object({
    old_password: z.string({
      required_error: "Old password is required",
    }),
    new_password: z.string({
      required_error: "New password is required",
    }),
    confirm_new_password: z.string({
      required_error: "Please confirm your new password",
    }),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords don't match",
    path: ["confirm_new_password"],
  });
