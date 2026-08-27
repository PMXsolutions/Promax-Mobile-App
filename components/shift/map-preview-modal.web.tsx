import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TextInput, View } from "react-native";

import { ATTENDANCE_GEOFENCE_RADIUS_METERS } from "@/constants/attendance";
import CustomButton from "../shared/custom-button";
import Text from "../shared/text";

interface Props {
  visible: boolean;
  onClose: () => void;
  staffLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  clientLocation: { latitude: number; longitude: number };
  distance: number;
  threshold?: number;
  lightweight?: boolean;
  attendanceAction?: "clock in" | "clock out";
  onSubmitException?: (reason: string) => void;
  exceptionPending?: boolean;
}

const MapPreviewModal = ({
  visible,
  onClose,
  staffLocation,
  clientLocation,
  distance,
  threshold = ATTENDANCE_GEOFENCE_RADIUS_METERS,
  lightweight = false,
  attendanceAction = "clock in",
  onSubmitException,
  exceptionPending = false,
}: Props) => {
  const [exceptionReason, setExceptionReason] = useState("");
  const isInRange = distance <= threshold;
  const hasCoordinates =
    Number.isFinite(staffLocation?.latitude) &&
    Number.isFinite(staffLocation?.longitude) &&
    Number.isFinite(clientLocation?.latitude) &&
    Number.isFinite(clientLocation?.longitude);

  useEffect(() => {
    if (!visible) setExceptionReason("");
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityLabel={`${attendanceAction} location check`}
          style={styles.panel}
        >
          <Text weight="bold" style={styles.title}>
            Location check
          </Text>
          <View style={styles.mapFallback}>
            <Text weight="semiBold" style={styles.mapTitle}>
              Interactive map available in the iOS and Android app
            </Text>
            <Text style={styles.mapBody}>
              {hasCoordinates
                ? "Your current GPS position and the client location have both been checked."
                : "Location coordinates are not available."}
            </Text>
          </View>

          <Text style={styles.distanceLabel}>Distance to client</Text>
          <Text
            weight="bold"
            style={[
              styles.distanceValue,
              { color: isInRange ? "#167447" : "#b42318" },
            ]}
          >
            {Math.round(distance)} metres
          </Text>
          <Text
            weight="semiBold"
            style={[
              styles.feedback,
              { color: isInRange ? "#167447" : "#b42318" },
            ]}
          >
            {isInRange
              ? `Within the required range to ${attendanceAction}`
              : `Outside the ${attendanceAction} zone`}
          </Text>

          {!lightweight && staffLocation?.accuracy ? (
            <Text style={styles.accuracy}>
              GPS accuracy: ±{Math.round(staffLocation.accuracy)} metres
            </Text>
          ) : null}

          {!lightweight && !isInRange && onSubmitException ? (
            <View style={styles.exception}>
              <Text style={styles.help}>
                Explain why care must continue outside the client location. The
                reason and GPS position will be sent to the supervisor audit
                queue.
              </Text>
              <TextInput
                accessibilityLabel={`${attendanceAction} exception reason`}
                value={exceptionReason}
                onChangeText={setExceptionReason}
                placeholder="Required reason"
                multiline
                maxLength={500}
                editable={!exceptionPending}
                style={styles.input}
              />
              <CustomButton
                title={`${
                  attendanceAction === "clock in" ? "Clock In" : "Clock Out"
                } with Exception`}
                onPress={() => onSubmitException(exceptionReason)}
                disabled={!exceptionReason.trim()}
                loading={exceptionPending}
                bgVariant="danger"
              />
            </View>
          ) : null}

          {!lightweight ? (
            <CustomButton
              title="Close"
              onPress={onClose}
              bgVariant="outline"
              textVariant="primary"
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default MapPreviewModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(10, 24, 21, 0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    color: "#153f38",
    marginBottom: 14,
  },
  mapFallback: {
    minHeight: 120,
    padding: 18,
    borderWidth: 1,
    borderColor: "#dbe3df",
    borderRadius: 12,
    backgroundColor: "#f5f8f6",
    justifyContent: "center",
    marginBottom: 16,
  },
  mapTitle: { color: "#153f38", marginBottom: 6 },
  mapBody: { color: "#52645f", lineHeight: 20 },
  distanceLabel: { textAlign: "center", color: "#66736f" },
  distanceValue: { textAlign: "center", fontSize: 21, marginTop: 3 },
  feedback: { textAlign: "center", marginTop: 6 },
  accuracy: { textAlign: "center", color: "#66736f", marginTop: 6 },
  exception: { marginTop: 18, marginBottom: 12 },
  help: { color: "#4b5e59", lineHeight: 20, marginBottom: 8 },
  input: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: "#cbd5d1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#111827",
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
});
