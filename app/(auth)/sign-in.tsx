import Text from "@/components/shared/text";
import React from "react";

import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import SignInForm from "@/modules/auth/sign-in-form";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { THEME } from "@/constants/theme";
import { Link } from "expo-router";

export default function Signin() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <ScrollView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={{
                backgroundColor: THEME.colors.lightGray,
                padding: 5,
                borderRadius: 99,
                marginBottom: 10,
              }}
            >
              <Image
                alt="App Logo"
                resizeMode="contain"
                style={styles.headerImg}
                source={require("@/assets/images/splash-icon1.png")}
              />
            </TouchableOpacity>

            <Text style={styles.title} size="3xl" weight="bold">
              Sign In to your Account
            </Text>

            <Text style={styles.subtitle} size="md" weight="semiBold">
              Welcome back! Please enter your details
            </Text>
          </View>
          <SignInForm />
        </KeyboardAvoidingView>
      </ScrollView>

      {/* <TouchableOpacity
        onPress={() => {
          // handle link
        }}
      >
        <Text style={styles.formFooter}>
          Don't have an account?{" "}
          <Text style={{ textDecorationLine: "underline" }}>Sign up</Text>
        </Text>
      </TouchableOpacity> */}

      <Text style={{ textAlign: "center" }} size="sm" weight="regular">
        Powered by:{" "}
        <Link
          href={"https://promaxsolutions.com.au/"}
          style={{ fontFamily: THEME.fontFamily.semiBold }}
        >
          Promax IT Solutions
        </Link>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    color: "#1D2A32",
    marginBottom: 6,
  },
  subtitle: {
    color: "#929292",
  },
  /** Header */
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: "center",
  },
});
