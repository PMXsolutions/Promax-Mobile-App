/**
 * PromaxCare mobile staff reads taken from the public PromaxCare web shell
 * `app.promaxcare.com.au` at 3:16pm Australia/Sydney on 22 October 2026
 * (`/assets/index-BV83UWOU.js`, meta `quality-surveys-2026-09-09`).
 * Paths are the staff menu calls in that file. Admin, company-wide, PBS,
 * invoice, and SIMA roster calls are refused here.
 * Signed-in web v2.14.19 is not in that file. A missing field stays a question.
 */

export type StaffSession = {
  staffId?: number | null;
  userId?: string | number | null;
  companyId?: number | null;
  staffName?: string | null;
};

export type StaffReadWorkflow =
  | "attendance"
  | "progress-note"
  | "timesheet"
  | "training"
  | "tickets"
  | "knowledge-base"
  | "incident-report";

export type StaffBlockedWorkflow =
  | "daily-report"
  | "pbs"
  | "sima"
  | "policies";

export type StaffWorkflowQuestion = {
  workflow: StaffBlockedWorkflow;
  question: string;
  recommendation: string;
};

export const STAFF_WORKFLOW_QUESTIONS: readonly StaffWorkflowQuestion[] = [
  {
    workflow: "daily-report",
    question:
      "Which request does the staff page /app/staff/daily-report (component eBe) send?",
    recommendation:
      "Keep My Attendance on /StaffAttendances/get_staff_attendances. Do not label those rows as a daily report. In this public file, the helper named fetchStaffDailyReport calls that same attendance URL. No separate daily-report write was found.",
  },
  {
    workflow: "pbs",
    question: "Does a frontline Staff role have My PBS in the signed-in web app?",
    recommendation:
      "Leave PBS out of the staff mobile app. In this public file, My PBS / Assigned PBS is a Support Coordinator item, and the client menu has its own My PBS. The /PBS routes manage a client file, including invoices.",
  },
  {
    workflow: "sima",
    question:
      "Which HTTP request does the staff page /app/communication/chat-with-sima send?",
    recommendation:
      "Do not call /ShiftRosters/sima_smart_roster_explain, /ShiftRosters/sima_auto_shiftreport, or /PBS/sima_summary for that chat row. Those are different tools. No /Sima chat post was present in this file.",
  },
  {
    workflow: "policies",
    question:
      "Which staff policy read matches the signed-in web app: /PolicyDocuments/get_user_policies or /PolicyDocuments/my-policies?",
    recommendation:
      "Leave codex/care-plan-intelligence-r1 unmerged. Its acknowledge and clarification posts are writes, and /client-care-plans/my-shift was not among the HTTP calls in this public file. The staff read in this file is /PolicyDocuments/get_user_policies?companyId&userId&consent.",
  },
];

const ADMIN_PREFIXES = [
  "/StaffAttendances/get_all_staff_attendances",
  "/Tickets/get_all_tickets",
  "/StaffTrainings/get_all_staff_trainings",
  "/Attendances/generate_all_staff_timesheet",
  "/Attendances/generate_staff_timesheet",
  "/ShiftRosters/send_timesheet",
  "/ShiftRosters/send_all_timesheet",
  "/IncidentReports/get_all",
  "/ProgressNotes/get_all_progressnote_by_company",
  "/PBS",
  "/Invoice",
];

export type StaffReadReady = {
  ok: true;
  workflow: StaffReadWorkflow;
  method: "GET";
  path: string;
  key: string;
  wrapper: "progressNote" | "timesheet" | null;
};

export type StaffReadRefusal = {
  ok: false;
  code: "missing-session" | "blocked" | "unknown";
  workflow: string;
  question?: string;
  recommendation?: string;
};

export type StaffReadRequest = StaffReadReady | StaffReadRefusal;

const READY = new Set<string>([
  "attendance",
  "progress-note",
  "timesheet",
  "training",
  "tickets",
  "knowledge-base",
  "incident-report",
]);

function positiveId(value: number | string | null | undefined): number | null {
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function text(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function sessionFromAuth(input: StaffSession): StaffSession {
  return {
    staffId: positiveId(input.staffId),
    userId: text(input.userId == null ? null : String(input.userId)),
    companyId: positiveId(input.companyId),
    staffName: text(input.staffName),
  };
}

function blocked(workflow: string): StaffReadRefusal {
  const match = STAFF_WORKFLOW_QUESTIONS.find((item) => item.workflow === workflow);
  if (!match) {
    return { ok: false, code: "unknown", workflow };
  }
  return {
    ok: false,
    code: "blocked",
    workflow,
    question: match.question,
    recommendation: match.recommendation,
  };
}

function missing(workflow: string): StaffReadRefusal {
  return { ok: false, code: "missing-session", workflow };
}

function ready(
  workflow: StaffReadWorkflow,
  path: string,
  wrapper: StaffReadReady["wrapper"]
): StaffReadReady {
  if (ADMIN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`))) {
    throw new Error(`Refused admin path for ${workflow}`);
  }
  return {
    ok: true,
    workflow,
    method: "GET",
    path,
    key: `${workflow}:${path}`,
    wrapper,
  };
}

export function staffReadRequest(
  workflow: string,
  sessionInput: StaffSession
): StaffReadRequest {
  if (!READY.has(workflow)) return blocked(workflow);
  const session = sessionFromAuth(sessionInput);
  const staffId = session.staffId;
  const companyId = session.companyId;

  switch (workflow as StaffReadWorkflow) {
    case "attendance":
      if (staffId == null) return missing(workflow);
      return ready(
        "attendance",
        `/StaffAttendances/get_staff_attendances?staffId=${staffId}`,
        null
      );
    case "training":
      if (staffId == null) return missing(workflow);
      return ready(
        "training",
        `/StaffTrainings/get_staff_trainings?staffId=${staffId}`,
        null
      );
    case "progress-note":
      if (session.staffName == null) return missing(workflow);
      return ready(
        "progress-note",
        `/ProgressNotes/get_progressnote_by_user?staffname=${encodeURIComponent(session.staffName)}&profileId=`,
        "progressNote"
      );
    case "timesheet":
      if (staffId == null || companyId == null) return missing(workflow);
      return ready(
        "timesheet",
        `/Attendances/load_timesheets?companyId=${companyId}&staffId=${staffId}`,
        "timesheet"
      );
    case "incident-report":
      if (staffId == null || companyId == null) return missing(workflow);
      return ready(
        "incident-report",
        `/IncidentReports/filter_report?companyId=${companyId}&clientId=&staffId=${staffId}`,
        null
      );
    case "tickets":
      if (session.userId == null) return missing(workflow);
      return ready(
        "tickets",
        `/Tickets/get_user_tickets?userId=${encodeURIComponent(session.userId)}`,
        null
      );
    case "knowledge-base":
      if (staffId == null) return missing(workflow);
      return ready("knowledge-base", "/Tickets/get_knowledgebase", null);
    default:
      return blocked(workflow);
  }
}

export type StaffWorkflowRow = {
  id: string;
  title: string;
  detail: string;
};

const ID_KEYS = [
  "staffAttendanceId",
  "progressNoteId",
  "incidentReportId",
  "ticketId",
  "userTicketId",
  "staffTrainingId",
  "trainingId",
  "knowledgeBaseId",
  "knowledgebaseId",
  "id",
];

const TITLE_KEYS = [
  "title",
  "subject",
  "name",
  "trainingName",
  "ticketSubject",
  "knowledgeBaseTitle",
  "fullName",
];

const DETAIL_KEYS = [
  "status",
  "dateCreated",
  "createdDate",
  "date",
  "fromDate",
  "dateFrom",
];

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function field(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

export function rowsFromPayload(
  payload: unknown,
  wrapper: StaffReadReady["wrapper"]
): { ok: true; rows: StaffWorkflowRow[] } | { ok: false; code: "unexpected-shape" } {
  let listSource: unknown = payload;
  if (wrapper) {
    const body = record(payload);
    if (!body || !(wrapper in body)) {
      if (payload == null) return { ok: true, rows: [] };
      return { ok: false, code: "unexpected-shape" };
    }
    listSource = body[wrapper];
  } else {
    const body = record(payload);
    if (body && Array.isArray(body.data)) listSource = body.data;
  }

  if (listSource == null) return { ok: true, rows: [] };
  const items = Array.isArray(listSource) ? listSource : [listSource];
  const rows: StaffWorkflowRow[] = [];
  for (const item of items) {
    const row = record(item);
    if (!row) return { ok: false, code: "unexpected-shape" };
    const id = field(row, ID_KEYS);
    if (!id) return { ok: false, code: "unexpected-shape" };
    rows.push({
      id,
      title: field(row, TITLE_KEYS) ?? "Record",
      detail: field(row, DETAIL_KEYS) ?? "",
    });
  }
  return { ok: true, rows };
}

export const STAFF_READ_LABELS: Record<StaffReadWorkflow, string> = {
  attendance: "My Attendance",
  "progress-note": "My Progress Note",
  timesheet: "My Timesheet",
  training: "Training",
  tickets: "My Tickets",
  "knowledge-base": "Knowledge Base",
  "incident-report": "My Incident Report",
};
