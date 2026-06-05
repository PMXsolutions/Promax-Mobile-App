import { ReportFormState } from "@/types/report";
import { getReportFormValidationError } from "@/modules/report/report-validation";

const validReportForm: ReportFormState = {
  urgentMatters: "",
  medicationGiven: "",
  medicationSigned: "",
  medicationAvailable: "",
  medicatioErrors: "",
  isMealManagementPlan: true,
  details_IfNotMealMaganagementPlan: "",
  isDrinkingProblem: false,
  details_IfProblemExist: "",
  isHealthIssues: false,
  details_IfHealthIssuesExist: "",
  goal_Progress:
    "Staff supported the participant with planned activities and documented meaningful progress toward support plan goals today.",
  contactFamily: "",
  isIncident: false,
  details_IfIsIncipient: "",
  isBehaviourConcerned: false,
  details_ifIsBehaviourConcerned: "",
};

// Recently updated: validate compliance-critical report form guardrails.
describe("getReportFormValidationError", () => {
  it("requires meaningful support plan progress", () => {
    expect(
      getReportFormValidationError({
        ...validReportForm,
        goal_Progress: "too short",
      })
    ).toContain("100 characters");
  });

  it("requires details for enabled incident-adjacent toggles", () => {
    expect(
      getReportFormValidationError({
        ...validReportForm,
        isHealthIssues: true,
      })
    ).toContain("health and well-being");
  });

  it("accepts a complete compliant report", () => {
    expect(getReportFormValidationError(validReportForm)).toBeNull();
  });
});
