import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import { THEME } from "@/constants/theme";
import ShiftCancelForm from "@/modules/shift/shift-cancel-form";
import useAuthStore from "@/store/use-auth-store";
import { shiftQuery } from "@/hooks/queries/shift";
import { shiftListedForSession } from "@/libs/staff-record";
import Loader from "@/components/shared/loader";
import Text from "@/components/shared/text";
import ErrorState from "@/components/shared/error-state";

const ShiftCancel = () => {
  const query = useLocalSearchParams();
  const { user, staff, isAuthenticated, token } = useAuthStore();
  const [formOpen, setFormOpen] = useState(false);
  const id = query.id as unknown as string;
  const staffId = Number(staff?.staffId);
  const sessionOpen =
    isAuthenticated &&
    Boolean(token) &&
    Number.isFinite(staffId) &&
    staffId > 0;
  const rosterQuery = shiftQuery.useShiftRoster(sessionOpen ? staffId : 0);
  const listed = shiftListedForSession(rosterQuery.data, Number(id), {
    staffId: staff?.staffId,
    companyId: user?.companyId,
  });

  useEffect(() => {
    if (sessionOpen && listed && !rosterQuery.isLoading && !rosterQuery.isError) {
      setFormOpen(true);
    }
  }, [sessionOpen, listed, rosterQuery.isLoading, rosterQuery.isError]);

  if (!sessionOpen && !formOpen) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Cancel Shift"} />
        <View style={{ padding: 24 }}>
          <Text>Your sign-in has ended, so this cancellation was not opened.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (sessionOpen && rosterQuery.isLoading) {
    return (
      <Loader
        name="2-curves"
        color={THEME.colors.secondary}
        title="Loading Shift.."
      />
    );
  }

  if (sessionOpen && rosterQuery.isError) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Cancel Shift"} />
        <ErrorState
          message="This shift could not be loaded."
          onRetry={() => {
            void rosterQuery.refetch();
          }}
        />
      </ScreenWrapper>
    );
  }

  if (sessionOpen && !listed) {
    return (
      <ScreenWrapper barStyle="dark-content">
        <HeaderWhite name={"Cancel Shift"} />
        <View style={{ padding: 24 }}>
          <Text>This shift is not assigned to your sign-in.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={"Cancel Shift"} />
      {!sessionOpen && (
        <View style={{ padding: 24 }}>
          <Text>
            Your sign-in has ended. The typed reason is still on this screen and was not sent.
          </Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ShiftCancelForm shiftId={Number(id)} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ShiftCancel;

const styles = StyleSheet.create({
  content: {
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
  },
});
