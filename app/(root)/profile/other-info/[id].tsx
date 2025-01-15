import React from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import KeyboardWrapper from "@/components/shared/keyboard-wrapper";
import { View } from "react-native";
import EditInfoForm from "@/modules/profile/edit-otherinfo-form";

const EditPersonalInfo = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Edit Other Information"} />
      <KeyboardWrapper>
        <EditInfoForm id={id} />
      </KeyboardWrapper>
    </ScreenWrapper>
  );
};

export default EditPersonalInfo;
