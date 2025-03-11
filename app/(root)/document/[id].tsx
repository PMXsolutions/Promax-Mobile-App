import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import KeyboardWrapper from "@/components/shared/keyboard-wrapper";
import { useLocalSearchParams } from "expo-router";
import EditForm from "@/modules/document/edit-document-form";

const EditDocument = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Edit Document"} />
      {/* <KeyboardWrapper> */}
      <EditForm id={id} />
      {/* <AddForm /> */}
      {/* </KeyboardWrapper> */}
    </ScreenWrapper>
  );
};

export default EditDocument;
