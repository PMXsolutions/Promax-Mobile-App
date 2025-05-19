import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";

import AddForm from "@/modules/document/add-document-form";

const AddDocument = () => {
  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Add a document"} />

      <AddForm />
    </ScreenWrapper>
  );
};

export default AddDocument;
