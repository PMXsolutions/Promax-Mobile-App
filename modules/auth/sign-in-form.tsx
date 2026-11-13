import { StyleSheet, View, Alert } from "react-native";
import Text from "@/components/shared/text";
import React, { useState } from "react";
import CustomButton from "@/components/shared/custom-button";
import { Link, router } from "expo-router";
import { THEME } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { SigninFormSchema } from "./types";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showMessage } from "react-native-flash-message";
import { signInFormSchema } from "./validation";
import useAuthStore from "@/store/use-auth-store";
import { AuthService } from "@/services/auth";
import { FormInput, FormPasswordInput } from "@/components/wrapper";
import Checkbox from "@/components/shared/checkbox";
import { isAxiosError } from "axios";

const readApiMessage = (error: unknown): string | undefined => {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : undefined;
  }
  const data = error.response?.data as
    | { message?: string; Message?: string }
    | undefined;
  return data?.message || data?.Message;
};

const signInFailureMessage = (message?: string) => {
  if (!message) {
    return "Unable to sign in. Check your email and password, then try again.";
  }
  if (/sending mail|mail address does not exist/i.test(message)) {
    return "Sign in did not complete. Check the email address and try again.";
  }
  return message;
};

const SignInForm = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SigninFormSchema>({
    resolver: zodResolver(signInFormSchema),
  });
  const authstore = useAuthStore();

  const onSignIn = async (data: SigninFormSchema) => {
    setLoading(true);
    setFormError(null);
    try {
      const response = await AuthService.loginUser(data);
      const status =
        response?.response?.status ||
        response?.Response?.Status ||
        response?.status;
      const userProfile = response?.userProfile || response?.UserProfile;
      const staffProfile = response?.staffProfile || response?.StaffProfile;
      const accessToken = userProfile?.token || userProfile?.Token;

      if (String(status).toLowerCase() === "success" && userProfile) {
        const role = userProfile?.role || userProfile?.Role;
        if (role === "Staff") {
          if (!accessToken) {
            const message = "Login succeeded but no access token was returned.";
            setFormError(message);
            showMessage({
              message,
              type: "danger",
            });
            return;
          }
          authstore.login(userProfile, staffProfile, accessToken);
          router.replace("/(root)/(tabs)");
          return;
        }
        Alert.alert(
          "Info",
          "Thank you for your interest in our mobile app. At this time, the app is exclusively available for staff members. In the meantime, you can continue to access our web platform for all your needs."
        );
        return;
      }

      const failure = signInFailureMessage(
        response?.response?.message || response?.Response?.Message
      );
      setFormError(failure);
      showMessage({
        message: failure,
        type: "danger",
      });
    } catch (error: unknown) {
      const message = readApiMessage(error);

      if (message === "User Not Found") {
        const failure = "User not found";
        setFormError(failure);
        showMessage({ message: failure, type: "danger" });
      } else if (
        message === "Email Not Confirmed" ||
        message ===
          "Email Not Confirmed. An OTP has been sent to your mail to confirm your email"
      ) {
        showMessage({
          message: message || "Email not confirmed",
          type: "danger",
        });
        router.navigate(
          `/(auth)/otp-verification/${encodeURIComponent(data.email)}`
        );
      } else if (message === "Invalid Login Attempt") {
        const failure = "Incorrect Email or Password";
        setFormError(failure);
        showMessage({
          message: failure,
          type: "danger",
        });
      } else {
        const failure = signInFailureMessage(message);
        setFormError(failure);
        showMessage({
          message: failure,
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit: SubmitHandler<SigninFormSchema> = (formData) => {
    onSignIn(formData);
  };

  return (
    <View style={styles.form}>
      <FormInput
        keyboardType="email-address"
        control={form.control}
        name="email"
        label="Email"
        placeholder="Enter your email"
        autoCapitalize="none"
        autoCorrect={false}
        icon={<Feather name={"mail"} size={20} color={THEME.colors.grayBg} />}
      />
      <FormPasswordInput
        control={form.control}
        name="password"
        label="Password"
        placeholder="Enter your password"
        icon={<Feather name={"lock"} size={20} color={THEME.colors.grayBg} />}
      />

      <View style={styles.row}>
        <Checkbox checked={checked} onChange={setChecked} label="Remember me" />

        <Link
          href="/(auth)/forgot-password"
          style={{
            color: THEME.colors.primary,
            fontSize: 14,
            fontFamily: THEME.fontFamily.medium,
          }}
        >
          Forgot password?
        </Link>
      </View>

      <View style={styles.formAction}>
        <CustomButton
          title={"Sign In"}
          onPress={form.handleSubmit(handleFormSubmit, () => {
            const failure = "Enter your email and password to sign in.";
            setFormError(failure);
            showMessage({ message: failure, type: "danger" });
          })}
          loading={loading}
          disabled={loading}
        />
        {formError ? (
          <Text style={styles.formError} accessibilityRole="alert">
            {formError}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default SignInForm;

const styles = StyleSheet.create({
  form: {
    marginBottom: 24,
    paddingHorizontal: THEME.spacing.gutter,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    rowGap: THEME.spacing.lg,
  },
  formAction: {
    marginBottom: 16,
    gap: 8,
  },
  formError: {
    color: THEME.colors.red,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
