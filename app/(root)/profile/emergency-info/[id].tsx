import React from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import EditEmergencyForm from "@/modules/profile/edit-emergency-form";

const EditPersonalInfo = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Edit Emergency Contact"} />

      <EditEmergencyForm id={id} />
    </ScreenWrapper>
  );
};

export default EditPersonalInfo;
