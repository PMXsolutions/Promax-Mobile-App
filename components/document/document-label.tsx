import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { formatInTimeZone } from "date-fns-tz";
import { CollapsableContainer } from "../wrapper/collapsible-wrapper";
import { DocumentData } from "@/types/report";
import { THEME } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { formattedTime } from "@/helpers/shift-service";
import Text from "../shared/text";
import { downloadAndSaveDocument } from "@/utils/file-utils";

export const DocumentLabel = ({ item }: { item: Partial<DocumentData> }) => {
  const [expanded, setExpanded] = useState(false);

  const onItemPress = () => {
    setExpanded(!expanded);
  };
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    if (item) {
      await downloadAndSaveDocument(
        item.documentUrl || "https://pdfobject.com/pdf/sample.pdf",
        `${item.documentName}.pdf`,
        setStatusMessage // Pass the status updater function
      );
    }
    setLoading(false);
  };

  const aus_timezone = "Australia/Sydney";
  const date = new Date();
  const nowInAustraliaTime = formatInTimeZone(date, aus_timezone, "yyyy-MM-dd");

  const isExpired = item?.expirationDate! < nowInAustraliaTime;

  let status = item.status;
  let statusBadgeStyle = styles.statusBadge;
  let statusTextStyle = styles.statusText;

  if (isExpired) {
    status = "Expired";
    statusBadgeStyle = {
      ...styles.statusBadge,
      backgroundColor: THEME.colors.red,
    };
    statusTextStyle = { color: THEME.colors.white };
  } else if (item.status === "Rejected") {
    statusBadgeStyle = {
      ...styles.statusBadge,
      backgroundColor: THEME.colors.lightGray,
    };
    statusTextStyle = { color: THEME.colors.black };
  } else if (item.status === "Pending") {
    statusBadgeStyle = {
      ...styles.statusBadge,
      backgroundColor: THEME.colors.secondary,
    };
    statusTextStyle = { color: THEME.colors.black };
  } else if (item.status === "Accepted") {
    statusBadgeStyle = {
      ...styles.statusBadge,
      backgroundColor: "green",
    };
    statusTextStyle = { color: THEME.colors.white };
  }

  return (
    <View style={styles.wrap}>
      <TouchableWithoutFeedback
        onPress={onItemPress}
        // onLongPress={() => navigation.navigate("UploadDocument")}
      >
        <View style={styles.contContainer}>
          <View style={styles.container}>
            <View style={styles.image}>
              <MaterialIcons
                name={"description"}
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
                {item.documentName}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View style={statusBadgeStyle}>
                  <Text weight="regular" size="sm" style={statusTextStyle}>
                    {status}
                  </Text>
                </View>
              </View>
              {/* <Text style={styles.text}>{item.status}</Text> */}
            </View>
          </View>
          <View style={styles.iconButton}>
            {loading ? (
              <ActivityIndicator color={THEME.colors.white} />
            ) : (
              <MaterialIcons
                name={expanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                size={20}
                color={THEME.colors.grayBg}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
      <CollapsableContainer expanded={expanded}>
        <View style={{ paddingVertical: 5 }}>
          {item?.expirationDate && item?.expirationDate.length > 5 && (
            <Text style={[styles.details, styles.text]}>
              Date Expired:{" "}
              {formattedTime(new Date(item.expirationDate), "d MMMM, yyyy")}
            </Text>
          )}
          {item?.rejectReason && (
            <Text style={[styles.details, styles.text]}>
              Reason: {item?.rejectReason}
            </Text>
          )}

          {item?.documentUrl && (
            <View style={styles.downloadContainer}>
              <TouchableOpacity
                onPress={handleDownload}
                style={styles.downloadButton}
              >
                <MaterialIcons
                  name="download"
                  size={24}
                  color={THEME.colors.white}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CollapsableContainer>
    </View>
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
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.light,
  },
  textContainer: { justifyContent: "space-around", flex: 1, gap: 4 },
  details: { marginHorizontal: 10, marginVertical: 3 },
  title: {
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  text: { opacity: 0.7, fontStyle: "normal" },
  iconButton: {
    borderWidth: 1,
    padding: 4,
    borderRadius: 5,
    borderColor: THEME.colors.lightGray,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  statusText: {},

  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 150,
    paddingHorizontal: 10,
    backgroundColor: "#000",
  },
  downloadContainer: {
    flexDirection: "row",
    // justifyContent: "flex-end", // Aligns the button to the right
    alignItems: "center", // Vertically aligns the button
    paddingHorizontal: 10, // Optional: Adjust spacing
    marginTop: 5,
  },

  downloadButton: {
    width: 40,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20, // Makes it a circular button
    backgroundColor: THEME.colors.grayBg,
  },
});
