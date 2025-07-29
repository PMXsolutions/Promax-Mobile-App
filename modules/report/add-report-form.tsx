import { Image, ScrollView, StyleSheet, Switch, View } from "react-native";
import React, { useState } from "react";
import { THEME } from "@/constants/theme";
import ReportFormHeader from "@/components/shift/report/report-header";
import TextInput from "@/components/shared/input";
import { ReportFormState } from "@/types/report";
import Text from "@/components/shared/text";
import CustomSwitch from "@/components/shift/report/report-setting";
import CustomButton from "@/components/shared/custom-button";
import useAuthStore from "@/store/use-auth-store";
import { useMutation } from "@tanstack/react-query";
import { reportService } from "@/services/report";
import { showMessage } from "react-native-flash-message";
import { router } from "expo-router";
import { queryClient } from "@/libs/query";
import { shiftQuery } from "@/hooks/queries/shift";
import MiniLoader from "@/components/shared/mini-loader";
import KeyboardAwareWrapper from "@/components/wrapper/keyboard-aware-wrapper";

const AddReportForm = ({ rosterId }: { rosterId: string }) => {
  const { user } = useAuthStore();

  const { data: shift, isLoading } = shiftQuery.useShiftDetail(
    Number(rosterId)
  );

  // Update the `useState` to match the type
  const [form, setForm] = useState({
    urgentMatters: "",
    medicationGiven: "",
    medicationSigned: "",
    medicationAvailable: "",
    medicatioErrors: "",
    isMealManagementPlan: true,
    details_IfNotMealMaganementPlan: "",
    isDrinkingProblem: false,
    details_IfProblemExist: "",
    isHealthIssues: false,
    details_IfHealthIssuesExist: "",
    goal_Progress: "",
    contactFamily: "",
    isIncident: false,
    details_IfIsIncipient: "",
    isBehaviourConcerned: false,
    details_ifIsBehaviourConcerned: "",
  });

  const handleInputChange = <K extends keyof ReportFormState>(
    name: K,
    value: ReportFormState[K]
  ) => {
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { mutate: onSubmit, isPending } = useMutation({
    mutationFn: async () => {
      const reqBody = {
        companyID: user?.companyId,
        shiftRosterId: rosterId,
        ...form,
      };
      return await reportService.submitShiftForm(
        user?.userId as string,
        reqBody
      );
    },
    onSuccess: ({ data }) => {
      showMessage({
        message: data.message,
        type: "success",
      });
      router.push("/(root)/(tabs)");
      return queryClient.invalidateQueries({
        queryKey: ["shifts"],
      });
    },

    onError: (error: any) => {
      showMessage({
        message: error.response?.data?.message,
        type: "danger",
      });
    },
  });

  const handleFormSubmit = () => {
    const cleanedGoalProgress = form.goal_Progress.replace(/\s/g, "");

    if (!form.goal_Progress || cleanedGoalProgress.length < 100) {
      showMessage({
        message:
          "Please provide at least 100 characters for 'Support plan progress and activities'.",
        type: "danger",
      });
      return;
    }

    onSubmit(); // Call mutation only if valid
  };

  return (
    <KeyboardAwareWrapper>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MiniLoader visible={isLoading} title="Loading Report.." />
        {shift && <ReportFormHeader item={shift} />}
        <View style={{ gap: THEME.spacing.sm, marginVertical: 10 }}>
          <Text size="md" weight="bold" style={{ color: THEME.colors.red }}>
            URGENT MATTER ALERTS:
          </Text>

          <View style={{ rowGap: THEME.spacing.lg }}>
            <TextInput
              label="Urgent Matters?"
              value={form.urgentMatters}
              onChangeText={(value) =>
                handleInputChange("urgentMatters", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
              placeholder="Type here..."
            />
            <TextInput
              label="Medications Given"
              value={form.medicationGiven}
              onChangeText={(value) =>
                handleInputChange("medicationGiven", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
              placeholder="Type here..."
            />

            <TextInput
              label="Medications Signed For"
              value={form.medicationSigned}
              onChangeText={(value) =>
                handleInputChange("medicationSigned", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
              placeholder="Type here..."
            />

            <TextInput
              label="Medications Available for the Next 30 days"
              value={form.medicationAvailable}
              onChangeText={(value) =>
                handleInputChange("medicationAvailable", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
              placeholder="Type here..."
            />
            <TextInput
              label="Medication Errors"
              value={form.medicatioErrors}
              onChangeText={(value) =>
                handleInputChange("medicatioErrors", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
              placeholder="Type here..."
            />
            {/* section 1 */}
            <View>
              <CustomSwitch
                label={
                  <Text size="md" weight="bold">
                    Meals:
                    <Text style={{ fontWeight: "400" }}>
                      {" "}
                      Were they given in line with the participant's mealtime
                      management plan?
                    </Text>
                  </Text>
                }
                value={form.isMealManagementPlan}
                onValueChange={(value) =>
                  handleInputChange("isMealManagementPlan", value)
                }
              />

              {form.isMealManagementPlan === false && (
                <TextInput
                  label="Details if Not Meal Management Plan"
                  value={form.details_IfNotMealMaganementPlan}
                  onChangeText={(value) =>
                    handleInputChange("details_IfNotMealMaganementPlan", value)
                  }
                  multiline
                  containerStyle={styles.inputContainerStyle}
                  style={styles.inputStyle}
                  placeholder="Type here..."
                />
              )}
            </View>
            {/* section 2 */}
            <View>
              <CustomSwitch
                label={
                  <Text size="md" weight="bold">
                    <Text style={{ fontWeight: "400" }}>
                      Did the participant experience any eating or drinking
                      problems?
                    </Text>
                  </Text>
                }
                value={form.isDrinkingProblem}
                onValueChange={(value) =>
                  handleInputChange("isDrinkingProblem", value)
                }
              />

              {form.isDrinkingProblem && (
                <TextInput
                  label="Details if there's a drinking problem"
                  value={form.details_IfProblemExist}
                  onChangeText={(value) =>
                    handleInputChange("details_IfProblemExist", value)
                  }
                  multiline
                  containerStyle={styles.inputContainerStyle}
                  style={styles.inputStyle}
                  placeholder="Type here..."
                />
              )}
            </View>
            {/* section 3 */}
            <View>
              <CustomSwitch
                label={
                  <Text size="md" weight="bold">
                    <Text style={{ fontWeight: "400" }}>
                      Did the participant experience any Health and well-being
                      issues?
                    </Text>
                  </Text>
                }
                value={form.isHealthIssues}
                onValueChange={(value) =>
                  handleInputChange("isHealthIssues", value)
                }
              />

              {form.isHealthIssues && (
                <TextInput
                  label="Details if there's a drinking problem"
                  value={form.details_IfHealthIssuesExist}
                  onChangeText={(value) =>
                    handleInputChange("details_IfHealthIssuesExist", value)
                  }
                  multiline
                  containerStyle={styles.inputContainerStyle}
                  style={styles.inputStyle}
                  placeholder="Type here..."
                />
              )}
            </View>

            {/* section 4 */}
            <TextInput
              label="Support plan progress and activities:"
              placeholder="Provide details of goal progress and activities"
              value={form.goal_Progress}
              onChangeText={(value) =>
                handleInputChange("goal_Progress", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
            />
            <Text style={{ textAlign: "right", fontSize: 12, color: "gray" }}>
              {form.goal_Progress.replace(/\s/g, "").length} / 100 characters
              (excluding spaces)
            </Text>
            {/* section 5 */}
            <TextInput
              label="Provide any details of contact with family and friends:"
              placeholder="Contact Details"
              value={form.contactFamily}
              onChangeText={(value) =>
                handleInputChange("contactFamily", value)
              }
              numberOfLines={4}
              multiline
              containerStyle={styles.inputContainerStyle}
              style={styles.inputStyle}
              textAlign="left"
            />

            {/* section 6 */}
            <View>
              <CustomSwitch
                label={
                  <Text size="md" weight="bold">
                    <Text style={{ fontWeight: "400" }}>
                      {" "}
                      Is there any Incident?
                    </Text>
                  </Text>
                }
                value={form.isIncident}
                onValueChange={(value) =>
                  handleInputChange("isIncident", value)
                }
              />

              {form.isIncident && (
                <TextInput
                  label="Details if there's incident"
                  value={form.details_IfIsIncipient}
                  onChangeText={(value) =>
                    handleInputChange("details_IfIsIncipient", value)
                  }
                  multiline
                  containerStyle={styles.inputContainerStyle}
                  style={styles.inputStyle}
                  placeholder="Type here..."
                />
              )}
            </View>
            {/* section 7 */}
            <View>
              <CustomSwitch
                label={
                  <Text size="md" weight="bold">
                    <Text style={{ fontWeight: "400" }}>
                      Is there any behaviour of concern?
                    </Text>
                  </Text>
                }
                value={form.isBehaviourConcerned}
                onValueChange={(value) =>
                  handleInputChange("isBehaviourConcerned", value)
                }
              />

              {form.isBehaviourConcerned && (
                <TextInput
                  label="Details if there's behaviour of concern"
                  value={form.details_ifIsBehaviourConcerned}
                  onChangeText={(value) =>
                    handleInputChange("details_ifIsBehaviourConcerned", value)
                  }
                  multiline
                  containerStyle={styles.inputContainerStyle}
                  style={styles.inputStyle}
                  placeholder="Type here..."
                />
              )}
            </View>

            <View>
              <Text size="md" weight="bold">
                Signature
              </Text>

              {shift?.staff?.signatureUrl && (
                <Image
                  source={{ uri: shift?.staff.signatureUrl }}
                  style={styles.signatureImage}
                />
              )}
            </View>
            <View style={{ marginBottom: 16 }}>
              <CustomButton
                title={"Submit"}
                onPress={() => handleFormSubmit()}
                loading={isPending}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAwareWrapper>
  );
};

export default AddReportForm;

const styles = StyleSheet.create({
  content: {
    //
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    // marginTop: 10,
  },
  inputStyle: { height: 80, textAlignVertical: "top" },
  inputContainerStyle: {
    width: "100%",
    height: 80,
    alignItems: "flex-start",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: THEME.spacing.md,
  },
  signatureImage: {
    marginTop: 10,
    width: 140,
    paddingHorizontal: 10,
    height: 80,
    resizeMode: "contain",
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f4f4f4",
  },
});
