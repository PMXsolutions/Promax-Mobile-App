import React from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import KeyboardWrapper from "@/components/shared/keyboard-wrapper";
import { View } from "react-native";

const EditPersonalInfo = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Edit Emergency Contact"} />
      <KeyboardWrapper>
        <View></View>
        {/* <EditProfileForm id={id} /> */}
      </KeyboardWrapper>
    </ScreenWrapper>
  );
};

export default EditPersonalInfo;
