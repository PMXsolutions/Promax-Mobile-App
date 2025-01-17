import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import KeyboardWrapper from "@/components/shared/keyboard-wrapper";
import AddForm from "@/modules/document/add-document-form";

const AddDocument = () => {
  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Add a document"} />
      <KeyboardWrapper>
        <AddForm />
      </KeyboardWrapper>
    </ScreenWrapper>
  );
};

export default AddDocument;
