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

interface ShiftProps {
  activity: ShiftRosterType;
  clockInPending: boolean;
  clockIn: () => Promise<void>;
  clockOut: UseMutateFunction<AxiosResponse<any, any>, Error, void, unknown>;
  clockOutPending: boolean;
  now: Date;
}

const ShiftAction = ({
  activity,
  clockInPending,
  clockIn,
  clockOut,
  clockOutPending,
  now,
}: ShiftProps) => {
  return (
    <View style={styles.buttonCont}>
      {activity && (
        <>
          {getActivityDetailStatus(activity, now) === "Upcoming" ? (
            <View style={styles.footer}>
              <View
                style={{
                  backgroundColor: THEME.colors.secondary + "50",
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  // marginBottom: 20,
                }}
              >
                <Text
                  size="base"
                  weight="semiBold"
                  style={[
                    styles.cancelButtonText,
                    {
                      textAlign: "center",
                      color: THEME.colors.black,
                    },
                  ]}
                >
                  Not Started
                </Text>
              </View>
              <CustomButton
                bgVariant="light"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/shift/cancel",
                    params: {
                      id: activity?.shiftRosterId,
                    },
                  })
                }
                title="Request to Cancel Shift"
                textVariant="primary"
              />
            </View>
          ) : getActivityDetailStatus(activity, now) === "Clock-In" ? (
            <View style={styles.footer}>
              <CustomButton
                onPress={clockIn}
                disabled={clockInPending}
                loading={clockInPending}
                title="Clock In"
              />
              <CustomButton
                bgVariant="light"
                onPress={() =>
                  router.push({
                    pathname: "/(root)/shift/cancel",
                    params: {
                      id: activity?.shiftRosterId,
                    },
                  })
                }
                title="Request to Cancel Shift"
                textVariant="primary"
              />
            </View>
          ) : (
            <>
              <View
                style={{
                  backgroundColor:
                    getActivityDetailStatus(activity, now) === "Absent"
                      ? "#b91c1c"
                      : getActivityDetailStatus(activity, now) === "Present"
                      ? "#047857"
                      : "transparent",
                  display:
                    getActivityDetailStatus(activity, now) === "Absent"
                      ? "flex"
                      : getActivityDetailStatus(activity, now) === "Present"
                      ? "flex"
                      : "none",

                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 8,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      textAlign: "center",
                      color:
                        getActivityDetailStatus(activity, now) === "Absent"
                          ? "#fff"
                          : getActivityDetailStatus(activity, now) === "Present"
                          ? "#fff"
                          : "transparent",
                      display:
                        getActivityDetailStatus(activity, now) === "Absent"
                          ? "flex"
                          : getActivityDetailStatus(activity, now) === "Present"
                          ? "flex"
                          : "none",
                    },
                  ]}
                >
                  {getActivityDetailStatus(activity, now) === "Absent"
                    ? "Absent"
                    : getActivityDetailStatus(activity, now) === "Present"
                    ? "Shift Completed"
                    : getActivityDetailStatus(activity, now)}
                </Text>
              </View>

              {getActivityDetailStatus(activity, now) ===
                "Shift In progress" && (
                <>
                  {!activity?.isShiftReportSigned && (
                    <View style={styles.footer}>
                      <CustomButton
                        onPress={() =>
                          router.push({
                            pathname: "/(root)/report/create",
                            params: {
                              rosterId: activity?.shiftRosterId,
                            },
                          })
                        }
                        title="Fill Shift Report"
                      />
                    </View>
                  )}

                  {activity?.isShiftReportSigned && (
                    <View style={styles.footer}>
                      <CustomButton
                        bgVariant="light"
                        onPress={() =>
                          router.push({
                            pathname: "/(root)/report",
                            params: {
                              reportId: 0,
                              rosterId: activity?.shiftRosterId,
                            },
                          })
                        }
                        title="Edit Shift Report"
                        textVariant="primary"
                      />

                      <CustomButton
                        onPress={() => clockOut()}
                        disabled={clockOutPending}
                        loading={clockOutPending}
                        title="Clock Out"
                      />
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

export default ShiftAction;

const styles = StyleSheet.create({
  buttonCont: {
    paddingHorizontal: 20,
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

  footer: {
    paddingHorizontal: THEME.spacing.xs,
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
});
