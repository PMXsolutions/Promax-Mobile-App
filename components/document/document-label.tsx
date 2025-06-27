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
import { queryClient } from "@/libs/query";
import { showMessage } from "react-native-flash-message";
import { useMutation } from "@tanstack/react-query";
import { reportService } from "@/services/report";
import { router } from "expo-router";

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
        setStatusMessage
      );
    }
    setLoading(false);
  };

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      return reportService.handleDeleteDoc(item.documentId as number);
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: data?.message,
        type: "success",
      });

      return queryClient.invalidateQueries({
        queryKey: ["staffDocument"],
      });
    },

    onError: (error: any) => {
      console.log(error);

      showMessage({
        message: error.response?.data?.message,
        type: "danger",
      });
    },
  });

  const handleDocDelete = () => {
    onSubmit();
  };

  const aus_timezone = "Australia/Sydney";
  const date = new Date();
  const nowInAustraliaTime = formatInTimeZone(date, aus_timezone, "yyyy-MM-dd");

  const isExpired = item?.expirationDate! < nowInAustraliaTime;

  let status = item.status;
  const badgeColor = isExpired
    ? "#FEE2E2"
    : item.status === "Rejected"
    ? "#F3F4F6"
    : item.status === "Pending"
    ? "#FEF3C7"
    : item.status === "Accepted"
    ? "#D1FAE5"
    : undefined;

  const textColor = isExpired
    ? "#DC2626"
    : item.status === "Rejected"
    ? "#6B7280"
    : item.status === "Pending"
    ? "#D97706"
    : item.status === "Accepted"
    ? "#059669"
    : undefined;

  if (isExpired) status = "Expired";

  return (
    <View style={styles.wrap}>
      <TouchableWithoutFeedback onPress={onItemPress}>
        <View style={styles.contContainer}>
          <View style={styles.container}>
            <View style={styles.image}>
              <MaterialIcons
                name="description"
                size={28}
                color={THEME.colors.brand}
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                weight="semiBold"
                size="md"
                style={styles.title}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.documentName}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  badgeColor && { backgroundColor: badgeColor },
                ]}
              >
                <Text
                  weight="medium"
                  size="sm"
                  style={[styles.statusText, textColor && { color: textColor }]}
                >
                  {status}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.expandButton}>
            <Text weight="medium" size="xs" style={styles.expandText}>
              {expanded ? "Less" : "More"}
            </Text>
            <MaterialIcons
              name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color={THEME.colors.grayBg}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>

      <CollapsableContainer expanded={expanded}>
        <View style={styles.expandedContent}>
          {item?.expirationDate && item?.expirationDate.length > 5 && (
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Expires:{" "}
                {formattedTime(new Date(item.expirationDate), "d MMMM, yyyy")}
              </Text>
            </View>
          )}

          {item?.rejectReason && (
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={16} color="#DC2626" />
              <Text style={styles.infoText}>Reason: {item?.rejectReason}</Text>
            </View>
          )}

          {item?.documentUrl && (
            <View style={styles.actionsContainer}>
              <Text weight="semiBold" size="sm" style={styles.actionsTitle}>
                What would you like to do?
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleDownload}
                  style={[styles.actionButton, styles.downloadButton]}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={THEME.colors.white}
                      size="small"
                    />
                  ) : (
                    <>
                      <MaterialIcons
                        name="download"
                        size={20}
                        color={THEME.colors.white}
                      />
                      <Text weight="medium" size="sm" style={styles.buttonText}>
                        Download
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {item?.documentId && (
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/(root)/document/${item.documentId}`)
                    }
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <MaterialIcons
                      name="edit"
                      size={20}
                      color={THEME.colors.white}
                    />
                    <Text weight="medium" size="sm" style={styles.buttonText}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}

                {item?.documentId && (
                  <TouchableOpacity
                    onPress={handleDocDelete}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    {isPending ? (
                      <ActivityIndicator
                        color={THEME.colors.white}
                        size="small"
                      />
                    ) : (
                      <>
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color={THEME.colors.white}
                        />
                        <Text
                          weight="medium"
                          size="sm"
                          style={styles.buttonText}
                        >
                          Delete
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
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
    padding: 16,
  },
  container: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
    gap: 6,
  },
  title: {
    lineHeight: 20,
    color: "#1F2937",
  },
  expandButton: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  expandText: {
    color: "#6B7280",
    marginBottom: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 14,
    flex: 1,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionsTitle: {
    color: "#374151",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    minWidth: 90,
    justifyContent: "center",
  },
  downloadButton: {
    backgroundColor: THEME.colors.primary,
  },
  editButton: {
    backgroundColor: THEME.colors.grayBg,
  },
  deleteButton: {
    backgroundColor: THEME.colors.error,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
  },
});
