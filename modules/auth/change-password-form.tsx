import CustomButton from "@/components/shared/custom-button";
import Text from "@/components/shared/text";
import { FormInput, FormPasswordInput } from "@/components/wrapper";
import { THEME } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { isAxiosError } from "axios";

import { ChangePasswordSchema } from "./types";
import { changePasswordSchema } from "./validation";
import { AuthService } from "@/services/auth";

const ChangePasswordForm = ({ email }: { email: string }) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const newPassword = form.watch("new_password");

  const onSubmitPasswordChange = async (data: ChangePasswordSchema) => {
    setIsSubmitting(true);
    try {
      const response = await AuthService.resetPassword(email, data);
      showMessage({
        message: response?.message || "Password updated securely",
        description: "Sign in with your new password.",
        type: "success",
      });
      form.reset();
      router.replace("/(auth)/sign-in");
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      showMessage({
        message: message || "Unable to update password",
        description: "Check the six-digit code and try again.",
        type: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  useEffect(() => {
    if (newPassword) {
      const strength = calculatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const getRequirementColor = (requirement: boolean) => {
    if (newPassword === "") return THEME.colors.neutral["300"];
    return requirement ? THEME.colors.success : THEME.colors.error;
  };

  const getStrengthDescription = () => {
    if (newPassword === "") return "";
    if (passwordStrength <= 1) return "Very weak password";
    if (passwordStrength <= 2) return "Weak password";
    if (passwordStrength <= 3) return "Good password";
    if (passwordStrength >= 4) return "Strong password";
    return "";
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FormInput
        name="old_password"
        label={"Code"}
        control={form.control}
        placeholder={"Enter 6 digit code"}
        keyboardType="number-pad"
      />
      <FormPasswordInput
        name="new_password"
        label={"New Password"}
        control={form.control}
        placeholder={"Enter new password"}
        onChangeText={(password) => {
          calculatePasswordStrength(password);
        }}
      />
      {newPassword && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthIndicator}>
            {[1, 2, 3, 4, 5].map((index) => (
              <View
                key={index}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      index <= passwordStrength
                        ? passwordStrength <= 2
                          ? THEME.colors.error
                          : passwordStrength >= 4
                          ? THEME.colors.apply
                          : THEME.colors.success
                        : THEME.colors.neutral["300"],
                    opacity: index <= passwordStrength ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.strengthDescription}>
            <Text>{getStrengthDescription()}</Text>
            {/* <View style={styles.requirementTitle}>
              <Text>{"must contain:"}</Text>
            </View> */}
          </Text>

          <View style={styles.requirements}>
            {[
              {
                test: /[A-Z]/.test(newPassword),
                text: "At least 1 uppercase",
              },
              { test: /[0-9]/.test(newPassword), text: "At least 1 number" },
              {
                test: newPassword.length >= 8,
                text: "At least 8 characters",
              },
            ].map((req, index) => (
              <View key={index} style={styles.requirementRow}>
                <MaterialCommunityIcons
                  name={"check-circle"}
                  size={20}
                  color={getRequirementColor(req.test)}
                />
                <Text style={[styles.requirement]}>{req.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <FormPasswordInput
        name="confirm_new_password"
        label={"Confirm New Password"}
        control={form.control}
        placeholder={"Confirm new password"}
      />
      <CustomButton
        onPress={form.handleSubmit(onSubmitPasswordChange)}
        loading={isSubmitting}
        disabled={isSubmitting}
        title="Update Password"
      />
    </ScrollView>
  );
};
export default ChangePasswordForm;

const styles = StyleSheet.create({
  content: {
    rowGap: THEME.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: THEME.spacing.sm + 4,
    rowGap: THEME.spacing.md,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: "bold",
    marginLeft: THEME.spacing.md,
  },
  strengthIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 4,
  },
  strengthContainer: {
    marginTop: -18,
    rowGap: THEME.spacing.xs,
  },
  strengthBar: {
    borderRadius: 2,
    width: "19%",
  },
  strengthDescription: {
    fontSize: THEME.fontSize.sm,
    marginTop: THEME.spacing.xs,
    fontWeight: "bold",
    flexDirection: "column",
  },
  requirementTitle: {
    fontSize: THEME.fontSize.sm,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
    fontWeight: "bold",
  },

  requirements: {
    rowGap: THEME.spacing.xs,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.xs,
  },
  requirement: {
    fontSize: THEME.fontSize.sm,
    marginLeft: THEME.spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: THEME.spacing.sm + 4,
  },
});
