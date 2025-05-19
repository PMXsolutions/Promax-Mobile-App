import Text from "@/components/shared/text";
import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import SignInForm from "@/modules/auth/sign-in-form";
import { THEME } from "@/constants/theme";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { Pressable } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import KeyboardAwareWrapper from "@/components/wrapper/keyboard-aware-wrapper";

export default function Signin() {
  return (
    <ScreenWrapper barStyle="dark-content">
      <KeyboardAwareWrapper>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity
              style={{
                backgroundColor: THEME.colors.lightGray,
                padding: 2,
                borderRadius: 99,
                marginBottom: 10,
              }}
            >
              <Image
                alt="App Logo"
                resizeMode="contain"
                style={styles.headerImg}
                source={require("@/assets/images/adaptive-icon.png")}
              />
            </TouchableOpacity>

            <Text style={styles.title} size="2xl" weight="bold">
              Sign In to your Account
            </Text>

            <Text style={styles.subtitle} size="md" weight="semiBold">
              Welcome back! Please enter your details
            </Text>
          </View>
          <SignInForm />
        </ScrollView>
      </KeyboardAwareWrapper>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          justifyContent: "center",
        }}
      >
        <Text style={{ textAlign: "center" }} size="sm" weight="regular">
          Powered by:{" "}
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://promaxsolutions.com.au/")}
        >
          <Text weight="bold"> Promax IT Solutions</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
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
