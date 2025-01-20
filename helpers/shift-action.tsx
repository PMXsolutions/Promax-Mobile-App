import { StyleSheet, TouchableOpacity, View } from "react-native";
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
}

const ShiftAction = ({
  activity,
  clockInPending,
  clockIn,
  clockOut,
  clockOutPending,
}: ShiftProps) => {
  return (
    <View style={styles.buttonCont}>
      {activity && (
        <>
          {getActivityDetailStatus(activity) === "Upcoming" ? (
            <View
              style={{
                backgroundColor: THEME.colors.secondary,
                borderRadius: 5,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
                marginBottom: 20,
              }}
            >
              <Text
                size="lg"
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
          ) : getActivityDetailStatus(activity) === "Clock-In" ? (
            <View style={{ gap: THEME.spacing.md }}>
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
              <CustomButton
                onPress={clockIn}
                disabled={clockInPending}
                loading={clockInPending}
                title="Clock In"
              />
            </View>
          ) : (
            <>
              <View
                style={{
                  // backgroundColor:
                  //   getActivityDetailStatus(activity) === "Absent"
                  //     ? "#fee2e2"
                  //     : getActivityDetailStatus(activity) === "Present"
                  //     ? "#f0fdf4"
                  //     : "transparent",
                  // borderWidth: 1,

                  backgroundColor:
                    getActivityDetailStatus(activity) === "Absent"
                      ? "#b91c1c"
                      : getActivityDetailStatus(activity) === "Present"
                      ? "#047857"
                      : "transparent",
                  display:
                    getActivityDetailStatus(activity) === "Absent"
                      ? "flex"
                      : getActivityDetailStatus(activity) === "Present"
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
                        getActivityDetailStatus(activity) === "Absent"
                          ? "#fff"
                          : getActivityDetailStatus(activity) === "Present"
                          ? "#fff"
                          : "transparent",
                      display:
                        getActivityDetailStatus(activity) === "Absent"
                          ? "flex"
                          : getActivityDetailStatus(activity) === "Present"
                          ? "flex"
                          : "none",
                    },
                  ]}
                >
                  {getActivityDetailStatus(activity)}
                </Text>
              </View>

              {getActivityDetailStatus(activity) === "Shift In progress" && (
                <>
                  {!activity?.isShiftReportSigned && (
                    <TouchableOpacity
                      style={styles.clockInButton}
                      // onPress={() =>
                      //   navigation.navigate("ReportForm", { shift: activity })
                      // }
                    >
                      <Text style={styles.clockInButtonText}>
                        Fill Shift Report
                      </Text>
                    </TouchableOpacity>
                  )}

                  {activity?.isShiftReportSigned && (
                    <>
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
                    </>
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
});
