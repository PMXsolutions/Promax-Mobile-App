export interface ReportValidationInput {
  goal_Progress: string;
  isIncident: boolean;
  details_IfIsIncipient: string;
}

export type ReportValidation =
  | { ok: true }
  | { ok: false; message: string };

const GOAL_MINIMUM = 100;

export function validateReportForm(
  form: ReportValidationInput
): ReportValidation {
  const cleanedGoalProgress = form.goal_Progress.replace(/\s/g, "");

  if (!form.goal_Progress || cleanedGoalProgress.length < GOAL_MINIMUM) {
    return {
      ok: false,
      message:
        "Please provide at least 100 characters for 'Support plan progress and activities'.",
    };
  }

  if (form.isIncident && !form.details_IfIsIncipient.trim()) {
    return {
      ok: false,
      message: "Please provide incident details before submitting.",
    };
  }

  return { ok: true };
}
