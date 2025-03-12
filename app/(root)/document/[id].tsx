import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { useLocalSearchParams } from "expo-router";
import EditForm from "@/modules/document/edit-document-form";
import { reportQuery } from "@/hooks/queries/report";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";

const EditDocument = () => {
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;
  const { isLoading } = reportQuery.useFetchStaffDocumentDetail(Number(id));

  if (isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Document.."
      />
    );
  }

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
