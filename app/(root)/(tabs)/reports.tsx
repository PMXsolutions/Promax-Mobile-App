import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import Header from "@/components/shared/header";
import { reportQuery } from "@/hooks/queries/report";
import ShiftReportCard from "@/components/shift/report/report-card";
import EmptyData from "@/components/shared/empty-data";
import Text from "@/components/shared/text";
import Search from "@/components/shared/search-bar";
import MiniLoader from "@/components/shared/mini-loader";

const Report = () => {
  const { staff } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (text: string) => {
    setSearchTerm(text);
    // You can fetch or filter results here based on `text`
  };

  const {
    data: report,
    isError: error,
    isRefetching,
    isPending: isLoading,
    refetch,
  } = reportQuery.useFetchStaffReport(staff?.staffId!);

  const onRefresh = async () => {
    await refetch();
  };

  const reportSorted =
    report?.sort(
      (a, b) =>
        new Date(b.shiftRoster?.dateCreated).getTime() -
        new Date(a.shiftRoster?.dateCreated).getTime()
    ) || [];

  const reportData = React.useMemo(() => {
    return reportSorted.filter((item) =>
      item?.shiftRoster?.clients
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, report]);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  if (error) {
    return <Text>Error fetching data</Text>;
  }
  return (
    <ScreenWrapper
      statusBgColor={THEME.colors.brand}
      bgColor={THEME.colors.brand}
      barStyle="light-content"
    >
      <MiniLoader visible={isLoading} />
      <View
        style={[
          // styles.header,
          { backgroundColor: THEME.colors.brand, paddingBottom: 10 },
        ]}
      >
        <Header
          name={`Shift Reports`}
          image={staff?.imageUrl!}
          opacityTitle={opacityTitle}
          translateTitle={translateTitle}
        />
      </View>
      <View style={styles.container}>
        <View
          style={{ marginVertical: 10, paddingHorizontal: THEME.spacing.md }}
        >
          <Search
            placeholder="Search for client name..."
            initialValue=""
            onSearch={handleSearch}
          />
        </View>
        {reportData?.length > 0 && (
          <FlatList
            data={reportData}
            keyExtractor={(item) => item.shiftReportId.toString()}
            renderItem={({ item }) => <ShiftReportCard item={item} />}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                progressBackgroundColor={"#fff"}
                colors={[THEME.colors.primary]}
                onRefresh={onRefresh}
              />
            }
          />
        )}

        {reportData?.length <= 0 &&
          searchTerm.trim().length < 1 &&
          !isLoading && <EmptyData />}
        {reportData?.length <= 0 && searchTerm.trim().length > 1 && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              size="lg"
              weight="semiBold"
              style={{
                color: THEME.colors.grayBg,
              }}
            >
              No Report found for "{searchTerm}"
            </Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  content: {
    // rowGap: THEME.spacing.lg,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    // marginTop: 10,
  },
});
