import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef } from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import Header from "@/components/shared/header";
import { reportQuery } from "@/hooks/queries/report";
import { DocumentData } from "@/types/report";
import { documentNames } from "@/constants/profile-data";
import { DocumentLabel } from "@/components/document/document-label";
import MiniLoader from "@/components/shared/mini-loader";
import Search from "@/components/shared/search-bar";
import EmptyData from "@/components/shared/empty-data";
import Text from "@/components/shared/text";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const Document = () => {
  const { staff } = useAuthStore();
  const [searchTerm, setSearchTerm] = React.useState("");
  const handleSearch = (text: string) => {
    setSearchTerm(text.trim());
    // You can fetch or filter results here based on `text`
  };

  const {
    data: documentData,
    isError,
    isRefetching,
    refetch,
    isPending: isLoading,
  } = reportQuery.useFetchStaffDocument(staff?.staffId as number);
  const onRefresh = async () => {
    await refetch();
  };

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
  const [filteredData, setFilteredData] = React.useState<
    Partial<DocumentData>[]
  >([]);

  React.useEffect(() => {
    if (documentData) {
      const mergedData = documentNames.map((documentName, index) => {
        const fetchedDoc = documentData.find(
          (doc) => doc.documentName === documentName
        );
        return {
          id: index.toString(),
          documentName,
          documentId: fetchedDoc?.documentId,
          documentUrl: fetchedDoc?.documentUrl || "", // Default to empty string if not found
          status: fetchedDoc?.status || "Not Submitted",
          implementationDate: fetchedDoc?.implementationDate || "N/A",
          expirationDate: fetchedDoc?.expirationDate,
          dateModified: fetchedDoc?.dateModified || "N/A",
          rejectReason: fetchedDoc?.rejectReason,
        };
      });

      // Add documents from result that are not in documentNames
      const additionalDocs = documentData
        .filter((doc) => !documentNames.includes(doc.documentName))
        .map((doc, index) => ({
          id: (mergedData.length + index).toString(),
          documentName: doc.documentName,
          documentUrl: doc.documentUrl,
          documentId: doc?.documentId,
          status: doc.status as string,
          implementationDate: doc.implementationDate || "N/A",
          expirationDate: doc.expirationDate || "N/A",
          dateModified: doc.dateModified || "N/A",
          rejectReason: doc.rejectReason,
        }));

      // Combine both arrays
      const finalData = [...mergedData, ...additionalDocs];
      setFilteredData(finalData);
    }
  }, [documentData]);

  const docData = React.useMemo(() => {
    return filteredData.filter((item) =>
      item?.documentName!.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, filteredData]);

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
          name={`Documents`}
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
            placeholder="Search for document name..."
            initialValue=""
            onSearch={handleSearch}
          />
        </View>
        {docData?.length > 0 && (
          <FlatList
            data={docData}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => <DocumentLabel item={item} />}
            contentContainerStyle={{ ...styles.content, paddingBottom: 30 }}
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

        {!isLoading &&
          documentData &&
          documentData?.length <= 0 &&
          searchTerm.trim().length < 1 && <EmptyData />}
        {docData?.length <= 0 && searchTerm.trim().length > 0 && (
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
              No Document found for "{searchTerm}"
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push("/(root)/document/add-document")}
        >
          <MaterialIcons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default Document;

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
  floatingButton: {
    position: "absolute",
    bottom: 10,
    right: THEME.spacing.md,
    width: 55,
    height: 55,
    backgroundColor: THEME.colors.primary, // Same color as the previous button
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: THEME.colors.grayBg,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
