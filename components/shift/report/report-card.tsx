import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { ShiftReport } from "@/types/report";
import { formattedTime } from "@/helpers/shift-service";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import { router } from "expo-router";

const ShiftReportCard = ({ item }: { item: ShiftReport }) => {
  return (
    <>
      <View style={styles.wrap}>
        <TouchableWithoutFeedback
          onPress={() =>
            router.push({
              pathname: "/(root)/report",
              params: {
                reportId: item.shiftReportId,
                rosterId: item.shiftRosterId,
              },
            })
          }
        >
          <View style={styles.contContainer}>
            <View style={styles.container}>
              <View style={styles.image}>
                <Icon
                  name={"file-document-edit"}
                  size={25}
                  color={THEME.colors.grayBg}
                />
              </View>

              <View style={styles.textContainer}>
                <Text
                  weight="semiBold"
                  size="md"
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.shiftRoster?.clients}
                </Text>
                <Text style={styles.text} size="sm">
                  Date: {formattedTime(item?.dateCreated, "d MMM, yyyy")}
                </Text>
                <Text style={styles.text} size="sm">
                  Date Modified:{" "}
                  {formattedTime(item?.dateModified, "d MMM, yyyy")}
                </Text>
              </View>
            </View>
            <View style={styles.iconButton}>
              <Icon
                name={"chevron-right"}
                size={20}
                color={THEME.colors.grayBg}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderColor: THEME.colors.lightGray,
    borderWidth: 0.5,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },

  contContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: THEME.colors.lightGray,
  },
  container: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.light,
  },
  textContainer: { justifyContent: "space-around", flex: 1, gap: 2 },
  details: { margin: 10 },
  title: {
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  text: { opacity: 0.7 },
  iconButton: {
    borderWidth: 1,
    padding: 4,
    borderRadius: 5,
    borderColor: THEME.colors.lightGray,
  },
});

export default ShiftReportCard;
