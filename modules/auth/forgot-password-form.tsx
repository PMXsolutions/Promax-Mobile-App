import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { FormInput } from "@/components/wrapper";
import { THEME } from "@/constants/theme";
import { forgotPasswordSchema } from "./validation";
import CustomButton from "@/components/shared/custom-button";
import Text from "@/components/shared/text";
import { showMessage } from "react-native-flash-message";
import { AuthService } from "@/services/auth";
import { ForgotpasswordSchema } from "./types";
import Feather from "@expo/vector-icons/Feather";

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotpasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onforgetPassword = async (payload: ForgotpasswordSchema) => {
    setLoading(true);

    try {
      const response = await AuthService.forgotPassword(payload);
      if (response?.status === "Success") {
        router.navigate(`/(auth)/change-password/${payload.email}`);
        form.reset();
        showMessage({
          message: response.message,
          description: "A verification code has been sent to your email",
          type: "success",
        });

        setLoading(false);
      }
    } catch (error: any) {
      if (error instanceof Error) {
        showMessage({
          message: error.name,
          type: "danger",
        });
      }
      showMessage({
        message: error.response?.data?.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit: SubmitHandler<ForgotpasswordSchema> = (data) => {
    onforgetPassword(data);
  };

  return (
    <View style={styles.wrapper}>
      <FormInput
        control={form.control}
        name="email"
        label="Email"
        keyboardType="email-address"
        placeholder="Enter your email"
        autoCapitalize="none"
        icon={<Feather name={"mail"} size={22} color={THEME.colors.grayBg} />}
      />

      <View>
        <CustomButton
          onPress={form.handleSubmit(handleFormSubmit)}
          loading={loading}
          title="Send"
        />

        <View style={styles.footer}>
          <Text>Remember your password?</Text>
          <Link style={styles.link} href="/(auth)/sign-in">
            Login
          </Link>
        </View>
      </View>
    </View>
  );
};
export default ForgotPasswordForm;

const styles = StyleSheet.create({
  wrapper: {
    rowGap: THEME.spacing.lg,
  },
  footer: {
    flexDirection: "row",
    gap: THEME.spacing.sm,
    justifyContent: "center",
    marginTop: THEME.spacing.lg,
  },
  link: {
    color: THEME.colors.primary,
    fontFamily: THEME.fontFamily.medium,
  },
});
