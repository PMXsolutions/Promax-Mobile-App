import { ReportFormState } from "@/types/report";

// Recently updated: shared compliance checks for shift report create/edit flows.
export const getReportFormValidationError = (
  form: ReportFormState
): string | null => {
  const cleanedGoalProgress = form.goal_Progress.replace(/\s/g, "");

  if (!form.goal_Progress || cleanedGoalProgress.length < 100) {
    return "Please provide at least 100 characters for 'Support plan progress and activities'.";
  }

  if (
    !form.isMealManagementPlan &&
    !form.details_IfNotMealMaganagementPlan.trim()
  ) {
    return "Please provide details when meals were not given in line with the mealtime management plan.";
  }

  if (form.isDrinkingProblem && !form.details_IfProblemExist.trim()) {
    return "Please provide details for eating or drinking problems before submitting.";
  }

  if (form.isHealthIssues && !form.details_IfHealthIssuesExist.trim()) {
    return "Please provide health and well-being issue details before submitting.";
  }

  if (form.isIncident && !form.details_IfIsIncipient.trim()) {
    return "Please provide incident details before submitting.";
  }

  if (
    form.isBehaviourConcerned &&
    !form.details_ifIsBehaviourConcerned.trim()
  ) {
    return "Please provide behaviour of concern details before submitting.";
  }

  return null;
};
