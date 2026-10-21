import React from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { useLocalSearchParams } from "expo-router";
import EditForm from "@/modules/document/edit-document-form";
import { reportQuery } from "@/hooks/queries/report";
import Loader from "@/components/shared/loader";
import { THEME } from "@/constants/theme";
import ErrorState from "@/components/shared/error-state";
import Text from "@/components/shared/text";
import useAuthStore from "@/store/use-auth-store";
import { documentOwnedBySession } from "@/libs/staff-record";
import { View } from "react-native";

const EditDocument = () => {
  const { user, staff } = useAuthStore();
  const query = useLocalSearchParams();

  const id = query.id as unknown as string;
  const { data, isLoading, isError, refetch } =
    reportQuery.useFetchStaffDocumentDetail(Number(id));

  if (isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Document.."
      />
    );
  }

  if (
    data &&
    !documentOwnedBySession(data, {
      companyId: user?.companyId,
      staffId: staff?.staffId,
      userId: user?.userId,
    })
  ) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Document"} />
        <View style={{ padding: 24 }}>
          <Text>This document is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !data) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Edit Document"} />
        <ErrorState
          message="This document could not be loaded."
          onRetry={() => {
            void refetch();
          }}
        />
      </ScreenWrapper>
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
