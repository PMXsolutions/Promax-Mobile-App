import { StyleSheet, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import GoBack from "@/components/go-back";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import ChangePasswordForm from "@/modules/auth/change-password-form";

const ChangePassword = () => {
  const query = useLocalSearchParams();
  const email = query.email as unknown as string;
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <GoBack />

      <View style={styles.wrapper}>
        <View>
          <Text size="3xl" weight="semiBold" style={styles.title}>
            Change Password
          </Text>
          <Text size="md" weight="regular" style={styles.desc}>
            Enter the 6-digit code sent to your email and create a new password.{" "}
          </Text>
        </View>
        <ChangePasswordForm email={email} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.gutter,
  },
  wrapper: {
    marginTop: 10,
    rowGap: THEME.spacing.lg,
  },
  title: {
    marginBottom: THEME.spacing.sm,
    color: THEME.colors.dark,
  },
  desc: {
    lineHeight: 18,
    color: THEME.colors.neutral[300],
  },
});

export default ChangePassword;
