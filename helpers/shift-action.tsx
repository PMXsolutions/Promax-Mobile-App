import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { getActivityDetailStatus } from "./shift-service";
import { ShiftRosterType } from "@/types/shift";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

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
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                //   onPress={() =>
                //     navigation.navigate("ShiftCancel", {
                //       shiftId: activity.shiftRosterId,
                //     })
                //   }
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: THEME.colors.error },
                  ]}
                >
                  Request to Cancel Shift
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clockIn}
                disabled={clockInPending}
                style={styles.clockInButton}
              >
                {clockInPending ? (
                  <ActivityIndicator size={"small"} />
                ) : (
                  <Text
                    size="lg"
                    weight="semiBold"
                    style={styles.clockInButtonText}
                  >
                    Clock In
                  </Text>
                )}
              </TouchableOpacity>
            </>
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
                      <TouchableOpacity
                        style={styles.cancelButton}
                        //   onPress={() =>
                        //     navigation.navigate("EditReportForm", {
                        //       shift: activity,
                        //     })
                        //   }
                      >
                        <Text style={styles.cancelButtonText}>
                          Edit Shift Report
                        </Text>
                      </TouchableOpacity>

                      {/* <Button title={" Clock Out"} loading={clockOutPending} /> */}
                      <TouchableOpacity
                        style={styles.clockInButton}
                        onPress={() => clockOut()}
                        disabled={clockOutPending}
                      >
                        {clockOutPending ? (
                          <ActivityIndicator size={"small"} />
                        ) : (
                          <Text style={styles.clockInButtonText}>
                            Clock Out
                          </Text>
                        )}
                      </TouchableOpacity>
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
