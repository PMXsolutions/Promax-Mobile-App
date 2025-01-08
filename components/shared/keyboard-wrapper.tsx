import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

const KeyboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={{ flex: 1 }}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
export default KeyboardWrapper;
