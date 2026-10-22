import {
  STAFF_READ_LABELS,
  STAFF_WORKFLOW_QUESTIONS,
  StaffReadWorkflow,
  StaffWorkflowRow,
} from "@/libs/staff-workflow-contract";

export function staffReadAccessibility(workflow: StaffReadWorkflow) {
  const label = STAFF_READ_LABELS[workflow];
  return {
    accessibilityRole: "button" as const,
    accessibilityLabel: label,
    accessibilityHint: "Opens a read-only list. Nothing is saved from this screen.",
  };
}

export function staffBlockedAccessibility(workflow: string, question: string) {
  return {
    accessible: true,
    accessibilityRole: "text" as const,
    accessibilityLabel: `${workflow} is unavailable. ${question}`,
  };
}

export function staffRowAccessibility(row: StaffWorkflowRow) {
  const detail = row.detail ? `. ${row.detail}` : "";
  return {
    accessible: true,
    accessibilityRole: "text" as const,
    accessibilityLabel: `${row.title}${detail}`,
  };
}

export function blockedStaffWorkflows() {
  return STAFF_WORKFLOW_QUESTIONS.map((item) => ({
    ...item,
    ...staffBlockedAccessibility(item.workflow, item.question),
  }));
}
