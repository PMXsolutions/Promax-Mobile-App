import { StyleSheet, View } from "react-native";
import React from "react";
import { getActivityDetailStatus } from "./shift-service";
import { ShiftRosterType } from "@/types/shift";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import CustomButton from "@/components/shared/custom-button";
import { router } from "expo-router";
import { showMessage } from "react-native-flash-message";

type KnownStatus =
  | "Not Started"
  | "Absent"
  | "Present"
  | "Shift Completed"
  | "Shift In progress"
  | "Cancelled";
interface ShiftProps {
  activity: ShiftRosterType;
  clockInPending: boolean;
  distanceCheckLoading?: boolean;
  clockIn: () => Promise<void>;
  clockOut: UseMutateFunction<AxiosResponse<any, any>, Error, void, unknown>;
  clockOutPending: boolean;
  now: Date;
}

// 2. Define the config object with strong typing
const statusConfigs: Record<
  KnownStatus,
  {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  "Not Started": {
    bgColor: THEME.colors.secondary + "20",
    textColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary + "40",
    icon: "⏰",
  },
  Absent: {
    bgColor: "#fef2f2",
    textColor: "#dc2626",
    borderColor: "#fecaca",
    icon: "❌",
  },
  Present: {
    bgColor: "#f0fdf4",
    textColor: "#16a34a",
    borderColor: "#bbf7d0",
    icon: "✅",
  },
  "Shift Completed": {
    bgColor: "#f0fdf4",
    textColor: "#16a34a",
    borderColor: "#bbf7d0",
    icon: "✅",
  },
  "Shift In progress": {
    bgColor: "#fef3c7",
    textColor: "#d97706",
    borderColor: "#fed7aa",
    icon: "🔄",
  },
  Cancelled: {
    bgColor: "#fecaca",
    textColor: "#dc2626",
    borderColor: "#ef4444",
    icon: "❌",
  },
};

// 3. Type guard for KnownStatus
function isKnownStatus(status: string): status is KnownStatus {
  return status in statusConfigs;
}

// 4. Safely return config based on status
export const getStatusConfig = (status: string) => {
  if (isKnownStatus(status)) {
    return statusConfigs[status];
  }

  // Default fallback config for unknown status
  return {
    bgColor: "transparent",
    textColor: THEME.colors.black,
    borderColor: "transparent",
    icon: "",
  };
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Text style={[styles.statusText, { color: config.textColor }]}>
        {status}
      </Text>
    </View>
  );
};

const ShiftAction = ({
  activity,
  clockInPending,
  distanceCheckLoading = false,
  clockIn,
  clockOut,
  clockOutPending,
  now,
}: ShiftProps) => {
  const status = getActivityDetailStatus(activity, now);
  const reportComplete = Boolean(activity?.isShiftReportSigned || activity?.reportId);

  const navigateToCancel = () => {
    router.push({
      pathname: "/(root)/shift/cancel",
      params: { id: activity?.shiftRosterId },
    });
  };

  const navigateToReport = () => {
    // Recently updated: route by report existence to avoid duplicate shift reports from stale signed flags.
    const isEdit = Boolean(activity?.reportId);

    if (isEdit && !activity?.reportId) {
      showMessage({
        message: "Unable to open this shift report. Please refresh and try again.",
        type: "danger",
      });
      return;
    }

    router.push({
      pathname: isEdit ? "/(root)/report" : "/(root)/report/create",
      params: isEdit
        ? { reportId: activity?.reportId, rosterId: activity?.shiftRosterId }
        : { rosterId: activity?.shiftRosterId },
    });
  };

  if (!activity) return null;

  return (
    <View style={styles.container}>
      {/* Status Badge - Always visible when there's a meaningful status */}
      {status !== "Clock-In" && (
        <View style={styles.statusContainer}>
          <StatusBadge
            status={
              status === "Present"
                ? "Shift Completed"
                : status === "Upcoming"
                ? "Not Started"
                : status
            }
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {status === "Upcoming" && (
          <>
            <Text style={styles.infoText}>
              Your shift hasn't started yet. You can request to cancel if
              needed.
            </Text>
            <CustomButton
              bgVariant="light"
              onPress={navigateToCancel}
              title="Request to Cancel Shift"
              textVariant="primary"
            />
          </>
        )}

        {status === "Clock-In" && (
          <>
            <CustomButton
              onPress={clockIn}
              disabled={clockInPending || distanceCheckLoading}
              loading={clockInPending || distanceCheckLoading}
              title="Clock In"
            />
            <CustomButton
              bgVariant="light"
              onPress={navigateToCancel}
              title="Request to Cancel Shift"
              textVariant="primary"
            />
          </>
        )}

        {status === "Shift In progress" && (
          <>
            {!reportComplete ? (
              <>
                <Text style={styles.infoText}>
                  Please fill out your shift report before clocking out.
                </Text>
                <CustomButton
                  onPress={navigateToReport}
                  title="Fill Shift Report"
                />
              </>
            ) : (
              <>
                <Text style={styles.infoText}>
                  Your shift report is complete. You can now clock out or edit
                  your report.
                </Text>
                <CustomButton
                  bgVariant="light"
                  onPress={navigateToReport}
                  title="Edit Shift Report"
                  textVariant="primary"
                />
                <CustomButton
                  onPress={() => clockOut()}
                  disabled={clockOutPending}
                  loading={clockOutPending}
                  title="Clock Out"
                />
              </>
            )}
          </>
        )}

        {(status === "Absent" || status === "Present") && (
          <Text style={styles.infoText}>
            {status === "Absent"
              ? "This shift was marked as absent. Contact your supervisor if this is incorrect."
              : "Great job! Your shift has been completed successfully."}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ShiftAction;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  actionContainer: {
    gap: THEME.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  // Legacy styles for backward compatibility
  buttonCont: {
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  clockInButton: {
    backgroundColor: THEME.colors.primary,
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  clockInButtonText: {
    color: "#fff",
  },
  cancelButtonText: {
    color: THEME.colors.grayBg,
  },
  cancelButton: {
    marginBottom: 10,
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
});
