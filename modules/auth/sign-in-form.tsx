import { Pressable, StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";
import CustomButton from "@/components/shared/custom-button";
import Text from "@/components/shared/text";
import { Link, router } from "expo-router";
import { THEME } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { SigninFormSchema } from "./types";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInFormSchema } from "./validation";
import useAuthStore from "@/store/use-auth-store";
import { AuthService } from "@/services/auth";
import { FormInput, FormPasswordInput } from "@/components/wrapper";
import Checkbox from "@/components/shared/checkbox";
import { fontFamilyForStartup } from "@/libs/startup-fonts";
import {
  LoginFailure,
  classifyLoginError,
  emailAwaitingConfirmation,
  mailCooldownUntil,
  messageFromLoginPayload,
  missingTokenFailure,
  normalizeLoginEmail,
  readLoginErrorInput,
  roleDeniedFailure,
  sendIntentSurvivesOutcome,
  signInControlState,
  unreadableMailLimitFailure,
} from "@/libs/login-failure";
import {
  claimSignInSend,
  loadUnconfirmedEmails,
  persistUnconfirmedEmail,
  releaseSendIntent,
  saveMailCooldown,
  unconfirmedReadFailed,
} from "@/libs/login-mail-guard";
import {
  SingleFlightLock,
  acquireSingleFlight,
  releaseSingleFlight,
} from "@/libs/single-flight";

const SignInForm = () => {
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<LoginFailure | null>(null);
  const [heldEmail, setHeldEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(true);
  const flight = useRef<SingleFlightLock>({ held: false });
  const form = useForm<SigninFormSchema>({
    resolver: zodResolver(signInFormSchema),
  });
  const authstore = useAuthStore();

  const rememberMailLimit = async (email: string) => {
    await saveMailCooldown({
      email,
      untilIso: mailCooldownUntil(new Date()),
    });
  };

  const applyFailure = (email: string, rejected: LoginFailure) => {
    if (rejected.kind === "mail_rate_limited") {
      setHeldEmail(normalizeLoginEmail(email));
    } else {
      setHeldEmail(null);
    }
    setFailure(rejected);
  };

  const onSignIn = async (data: SigninFormSchema) => {
    await loadUnconfirmedEmails();
    if (unconfirmedReadFailed()) {
      setFailure(unreadableMailLimitFailure());
      return;
    }
    if (emailAwaitingConfirmation(data.email)) {
      router.navigate(
        `/(auth)/otp-verification/${encodeURIComponent(data.email)}`
      );
      return;
    }

    if (!acquireSingleFlight(flight.current)) return;

    setLoading(true);
    setFailure(null);
    authstore.clearSessionNotice();

    try {
      const claim = await claimSignInSend(data.email, new Date());
      if (!claim.send) {
        applyFailure(data.email, claim.failure);
        return;
      }

      const response = await AuthService.loginUser(data);
      const status =
        response?.response?.status ||
        response?.Response?.Status ||
        response?.status;
      const userProfile = response?.userProfile || response?.UserProfile;
      const staffProfile = response?.staffProfile || response?.StaffProfile;
      const accessToken = userProfile?.token || userProfile?.Token;
      const bodyMessage = messageFromLoginPayload(response);

      if (String(status).toLowerCase() === "success" && userProfile) {
        const role = userProfile?.role || userProfile?.Role;
        if (role !== "Staff") {
          await releaseSendIntent(data.email);
          setFailure(roleDeniedFailure());
          return;
        }
        if (!accessToken) {
          await releaseSendIntent(data.email);
          setFailure(missingTokenFailure());
          return;
        }
        await releaseSendIntent(data.email);
        authstore.login(userProfile, staffProfile, accessToken);
        router.replace("/(root)/(tabs)");
        return;
      }

      const rejected = classifyLoginError({
        message: bodyMessage || "Unable to sign in.",
      });
      if (rejected.kind === "mail_rate_limited") {
        await rememberMailLimit(data.email);
      }
      if (rejected.kind === "email_unconfirmed") {
        await persistUnconfirmedEmail(data.email);
      }
      if (!sendIntentSurvivesOutcome(rejected.kind)) {
        await releaseSendIntent(data.email);
      }
      applyFailure(data.email, rejected);
      if (rejected.navigateToOtp) {
        router.navigate(
          `/(auth)/otp-verification/${encodeURIComponent(data.email)}`
        );
      }
    } catch (error: unknown) {
      const rejected = classifyLoginError(readLoginErrorInput(error));
      if (rejected.kind === "mail_rate_limited") {
        await rememberMailLimit(data.email);
      }
      if (rejected.kind === "email_unconfirmed") {
        await persistUnconfirmedEmail(data.email);
      }
      if (!sendIntentSurvivesOutcome(rejected.kind)) {
        await releaseSendIntent(data.email);
      }
      applyFailure(data.email, rejected);
      if (rejected.navigateToOtp) {
        router.navigate(
          `/(auth)/otp-verification/${encodeURIComponent(data.email)}`
        );
      }
    } finally {
      releaseSingleFlight(flight.current);
      setLoading(false);
    }
  };

  const handleFormSubmit: SubmitHandler<SigninFormSchema> = (formData) => {
    void onSignIn(formData);
  };

  const emailValue = form.watch("email") ?? "";
  const control = signInControlState({
    failure,
    email: emailValue,
    heldEmail,
  });

  const openExistingCode = () => {
    const email = normalizeLoginEmail(emailValue);
    if (!email) return;
    router.navigate(
      `/(auth)/otp-verification/${encodeURIComponent(email)}?holdMail=1`
    );
  };

  const sessionExpired = authstore.sessionNotice === "expired";

  return (
    <View style={styles.form}>
      {sessionExpired && !failure ? (
        <View
          style={styles.notice}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          testID="sign-in-session-expired"
        >
          <Text weight="bold" size="sm">
            Session expired
          </Text>
          <Text size="sm">
            Your session expired. Sign in again. Nothing on this screen was
            submitted.
          </Text>
        </View>
      ) : null}

      <FormInput
        keyboardType="email-address"
        control={form.control}
        name="email"
        label="Email"
        placeholder="Enter your email"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        testID="sign-in-email"
        accessibilityLabel="Email"
        icon={<Feather name={"mail"} size={20} color={THEME.colors.grayBg} />}
      />
      <FormPasswordInput
        control={form.control}
        name="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="password"
        textContentType="password"
        testID="sign-in-password"
        accessibilityLabel="Password"
        icon={<Feather name={"lock"} size={20} color={THEME.colors.grayBg} />}
      />

      <View style={styles.row}>
        <Checkbox checked={checked} onChange={setChecked} label="Remember me" />

        <Link
          href="/(auth)/forgot-password"
          accessibilityRole="link"
          accessibilityLabel="Forgot password"
          style={{
            color: THEME.colors.primary,
            fontSize: 14,
            fontFamily: fontFamilyForStartup(THEME.fontFamily.medium),
            minHeight: 44,
            textAlignVertical: "center",
          }}
        >
          Forgot password?
        </Link>
      </View>

      {failure ? (
        <View
          style={styles.notice}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          testID="sign-in-error"
        >
          <Text weight="bold" size="sm">
            {failure.title}
          </Text>
          <Text size="sm">{failure.message}</Text>
        </View>
      ) : null}

      {control.offerExistingCode ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enter a confirmation code you already have"
          testID="sign-in-existing-code"
          onPress={openExistingCode}
          style={styles.codeLink}
        >
          <Text size="sm" weight="bold" style={{ color: THEME.colors.primary }}>
            Enter a code you already have. This does not send another email.
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.formAction}>
        <CustomButton
          title={loading ? "Signing in" : "Sign in"}
          accessibilityLabel={
            loading
              ? "Signing in"
              : control.submitEnabled
                ? "Sign in"
                : "Sign in held. This address will not be sent again until the hour ends."
          }
          testID="sign-in-submit"
          onPress={form.handleSubmit(handleFormSubmit)}
          loading={loading}
          disabled={loading || !control.submitEnabled}
        />
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
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notice: {
    backgroundColor: THEME.colors.toastBg.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  codeLink: {
    minHeight: 44,
    justifyContent: "center",
  },
});
