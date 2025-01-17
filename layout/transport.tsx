import GoBack from "@/components/go-back";
import Map from "@/components/map/big-map";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
// import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TransportLayout = ({
  title,
  snapPoints,
  children,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
}) => {
  // const bottomSheetRef = useRef<BottomSheet>(null);
  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <View style={[styles.flexOne, styles.bgWhite]}>
        <View style={[styles.flexColumn, styles.bgBlue, styles.fullScreen]}>
          <View style={styles.headerContainer}>
            <GoBack />

            <Text size="lg" weight="semiBold" style={styles.titleText}>
              {title || "Go Back"}
            </Text>
          </View>

          <Map />

          <View style={styles.bottomSheetContent}>{children}</View>
        </View>

        {/* <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["50%"]}
          index={0}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            {children}
          </BottomSheetView>
        </BottomSheet> */}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  bgWhite: {
    backgroundColor: "white",
  },
  bgBlue: {
    backgroundColor: THEME.colors.brand, // Adjust this to match your blue
  },
  flexColumn: {
    flexDirection: "column",
  },
  fullScreen: {
    height: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 45,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  titleText: {
    marginLeft: 20,
    // Replace this with your font or remove if not used
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    overflow: "hidden",
    paddingBottom: 30, // Adjust this to match your needs
  },
});

export default TransportLayout;
