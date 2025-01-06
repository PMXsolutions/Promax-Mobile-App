import { Animated, StyleSheet, View } from "react-native";
import React, { useRef } from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import { shiftQuery } from "@/hooks/queries/shift";
import ShiftCalendar from "@/modules/shift/shift-calendar";
import Header from "@/components/shared/header";

const Activity = () => {
  const { staff, user } = useAuthStore();
  const { data, isLoading, isError } = shiftQuery.useShiftRoster(
    staff?.staffId!
  );
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateHeader = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -80],
    extrapolate: "clamp",
  });
  const opacityTitle = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 40],
    extrapolate: "clamp",
  });
  // if (isLoading) {
  //   return <Loader name="2-curves" color={THEME.colors.secondary} />;
  // }

  return (
    <ScreenWrapper
      statusBgColor={THEME.colors.brand}
      bgColor={THEME.colors.brand}
      barStyle="light-content"
    >
      <View
        style={[
          // styles.header,
          { backgroundColor: THEME.colors.brand, paddingBottom: 10 },
        ]}
      >
        <Header
          name={`Welcome, ${staff?.firstName} ${staff?.surName}`}
          image={staff?.imageUrl!}
          role={user?.role!}
          opacityTitle={opacityTitle}
          translateTitle={translateTitle}
        />
        {/* <SearchBar openFilterModal={openFilterModal} /> */}
      </View>
      <View style={styles.container}>
        <ShiftCalendar
          isError={isError}
          isLoading={isLoading}
          shiftData={data || []}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  // header: {
  //   position: "absolute",
  //   width: "100%",
  //   zIndex: 1,
  //   height: 130,
  //   alignItems: "stretch",
  //   justifyContent: "flex-end",
  //   gap: 20,
  // },
});
