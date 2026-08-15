import { StyleSheet, View } from "react-native";
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
import { Alert } from "react-native";

const SignInForm = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<SigninFormSchema>({
    resolver: zodResolver(signInFormSchema),
  });
  const authstore = useAuthStore();
  // const clearAll = async () => {
  //   try {
  //     await AsyncStorage.clear();
  //   } catch (e) {
  //     // clear error
  //   }

  //   console.log("Done.");
  // };

  const onSignIn = async (data: SigninFormSchema) => {
    setLoading(true);
    try {
      const response = await AuthService.loginUser(data);

      if (response?.response?.status === "Success") {
        const userProfile = response?.userProfile;
        const staffProfile = response?.staffProfile;
        const accessToken = response?.userProfile.token;
        if (userProfile?.role === "Staff") {
          authstore.login(userProfile, staffProfile, accessToken);
          router.push("/(root)/(tabs)");
          // showMessage({
          //   message: `Welcome back ${userProfile?.firstName}`,
          //   type: "success",
          // });
        } else {
          Alert.alert(
            "Info",
            "Thank you for your interest in our mobile app. At this time, the app is exclusively available for staff members. In the meantime, you can continue to access our web platform for all your needs."
          );
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message === "User Not Found") {
        showMessage({
          message: "User not found",
          type: "danger",
        });
      } else if (error.response?.data?.message === "Email Not Confirmed") {
        showMessage({
          message: error.response?.data?.message,
          type: "danger",
        });
        router.navigate(`/(auth)/otp-verification/${data.email}`);
      } else if (
        error.response?.data?.message ===
        "Email Not Confirmed. An OTP has been sent to your mail to confirm your email"
      ) {
        showMessage({
          message: error.response?.data?.message,
          type: "danger",
        });
        router.navigate(`/(auth)/otp-verification/${data.email}`);
      } else if (error.response?.data?.message === "Invalid Login Attempt") {
        showMessage({
          message: "Incorrect Email or Password",
          type: "danger",
        });
      } else {
        showMessage({
          message: error.response?.data?.message || "Unable to login!",
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit: SubmitHandler<SigninFormSchema> = (data) => {
    onSignIn(data);
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
          onPress={form.handleSubmit(handleFormSubmit)}
          loading={loading}
          disabled={loading}
        />
      </View>
      {/* <Button onPress={clearAll}>Clear All</Button> */}
    </View>
  );
};

export default SignInForm;

const styles = StyleSheet.create({
  /** Form */
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
  },

  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.15,
  },
  actions: {
    rowGap: THEME.spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
