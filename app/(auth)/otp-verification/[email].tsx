import GoBack from "@/components/go-back";
import CustomButton from "@/components/shared/custom-button";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import { publicAxios } from "@/libs/axiosInstance";
import Timer from "@/modules/auth/timer";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Platform, Pressable, TextInput, View } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { showMessage } from "react-native-flash-message";
import { SafeAreaView } from "react-native-safe-area-context";

const CELL_COUNT = 6;

interface RenderCellParams {
  index: number;
  symbol: string | undefined;
  isFocused: boolean;
}

interface UseBlurOnFulfillParams {
  value: string;
  cellCount: number;
}

interface UseClearByFocusCellParams {
  value: string;
  setValue: (value: string) => void;
}

const OtpVerfication: React.FC = () => {
  const query = useLocalSearchParams();
  const email = query.email as unknown as string;
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [expired, setExpired] = useState(false);
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(59);
  const [loading, setLoading] = useState(false);

  const codeRef = useBlurOnFulfill({
    value: code,
    cellCount: CELL_COUNT,
  } as UseBlurOnFulfillParams);

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  } as UseClearByFocusCellParams);

  useEffect(() => {
    if (code.length === 6 && !expired) {
      // API call to verify OTP
      verifyCode();
    }
  }, [code]);

  const resetTimer = () => {
    setMinutes(2);
    setSeconds(59);
  };
  const resendCode = async () => {
    if (expired) {
      setError("");
      try {
        const { data } = await publicAxios.get("/Account/resend_otp", {
          params: { email },
        });
        if (data.status === "Success") {
          showMessage({
            type: "success",
            message: data.message,
          });
          resetTimer();
          setExpired(false);
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
        setMinutes(0);
        setSeconds(0);
        setExpired(true);
        setLoading(false);
      }
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      alert("Incomplete code");
      return;
    }
    const postData = {
      email,
      otp: code,
    };
    setError("");
    setLoading(true);
    try {
      const { data } = await publicAxios.post("/Account/post_otp", postData);
      showMessage({
        type: "success",
        message: data.message,
      });
      if (data.requiresPasswordSetup) {
        router.push(`/(auth)/change-password/${email}`);
      } else {
        router.push("/(auth)/sign-in");
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
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
    }
  };
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <GoBack />

      <View style={styles.wrapper}>
        <View>
          <Text size="2xl" weight="semiBold" style={styles.title}>
            Verification Code
          </Text>
          <Text size="md" weight="semiBold" style={styles.subtitle}>
            Confirm the email sent to <Text weight="bold">{email}</Text> and
            enter the verification code. Code expires in{" "}
            <Timer
              initialMinutes={minutes}
              initialSeconds={seconds}
              onExpire={() => setExpired(true)}
            />
          </Text>
        </View>

        <View style={{ rowGap: THEME.spacing.xl }}>
          <CodeField
            ref={codeRef}
            {...props}
            value={code}
            onChangeText={setCode}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            InputComponent={TextInput}
            textContentType="oneTimeCode"
            autoComplete={
              Platform.OS === "android" ? "sms-otp" : "one-time-code"
            }
            testID="my-code-input"
            renderCell={({ index, symbol, isFocused }: RenderCellParams) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <Text size="md" weight="medium" style={styles.cellText}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              </View>
            )}
          />

          <View>
            <CustomButton
              title="Verify"
              onPress={verifyCode}
              loading={loading}
            />

            {error && (
              <Text
                size="md"
                weight="medium"
                style={{
                  color: THEME.colors.error,
                  marginTop: THEME.spacing.md,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            )}

            {expired && (
              <View style={styles.footer}>
                <Text>Didn't receive any code?</Text>
                <Pressable onPress={resendCode}>
                  <Text
                    size="md"
                    weight="bold"
                    style={{ color: THEME.colors.primary }}
                  >
                    Resend OTP
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
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
    marginTop: 28,
    rowGap: THEME.spacing.xl,
  },
  title: {
    marginBottom: THEME.spacing.sm,
    color: THEME.colors.dark,
  },
  subtitle: {
    color: "#929292",
  },
  cell: {
    width: 45,
    height: 45,
    borderRadius: 8,
    fontSize: THEME.fontSize.lg,
    borderWidth: 1.2,
    borderColor: THEME.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    textAlign: "center",
    color: THEME.colors.neutral[300],
    fontSize: THEME.fontSize.lg,
    fontFamily: THEME.fontFamily.medium,
  },
  focusCell: {
    borderColor: THEME.colors.primary,
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

export default OtpVerfication;
