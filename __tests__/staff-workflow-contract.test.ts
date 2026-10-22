jest.mock("@/libs/axiosInstance", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import {
  resetStaffWorkflowLoads,
  loadStaffWorkflow,
} from "@/services/staff-workflows";
import {
  rowsFromPayload,
  staffReadRequest,
  STAFF_WORKFLOW_QUESTIONS,
} from "@/libs/staff-workflow-contract";

const session = {
  staffId: 9,
  userId: "user-9",
  companyId: 3,
  staffName: "Amina Cole",
};

describe("PromaxCare mobile staff read contract", () => {
  beforeEach(() => {
    resetStaffWorkflowLoads();
  });

  it("reads only the signed-in staff attendance, training, timesheet, and incidents", () => {
    expect(staffReadRequest("attendance", session)).toMatchObject({
      ok: true,
      path: "/StaffAttendances/get_staff_attendances?staffId=9",
    });
    expect(staffReadRequest("training", session)).toMatchObject({
      path: "/StaffTrainings/get_staff_trainings?staffId=9",
    });
    expect(staffReadRequest("timesheet", session)).toMatchObject({
      path: "/Attendances/load_timesheets?companyId=3&staffId=9",
      wrapper: "timesheet",
    });
    expect(staffReadRequest("incident-report", session)).toMatchObject({
      path: "/IncidentReports/filter_report?companyId=3&clientId=&staffId=9",
    });
    expect(staffReadRequest("tickets", session)).toMatchObject({
      path: "/Tickets/get_user_tickets?userId=user-9",
    });
    expect(staffReadRequest("knowledge-base", session)).toMatchObject({
      path: "/Tickets/get_knowledgebase",
    });
    expect(staffReadRequest("progress-note", session)).toMatchObject({
      path: "/ProgressNotes/get_progressnote_by_user?staffname=Amina%20Cole&profileId=",
      wrapper: "progressNote",
    });
  });

  it("refuses a missing staff id, a company-wide list, and a blank name", () => {
    const other = staffReadRequest("attendance", { ...session, staffId: 0 });
    expect(other.ok).toBe(false);
    expect(staffReadRequest("incident-report", { ...session, companyId: null }).ok).toBe(false);
    expect(staffReadRequest("progress-note", { ...session, staffName: "  " }).ok).toBe(false);
    expect(staffReadRequest("tickets", { ...session, userId: "" }).ok).toBe(false);

    const paths = [
      "attendance",
      "training",
      "timesheet",
      "incident-report",
      "tickets",
      "knowledge-base",
      "progress-note",
    ].map((workflow) => {
      const request = staffReadRequest(workflow, session);
      return request.ok ? request.path : "";
    });
    const denied = [
      "get_all_staff_attendances",
      "get_all_tickets",
      "get_all_staff_trainings",
      "generate_all_staff_timesheet",
      "generate_staff_timesheet",
      "send_timesheet",
      "get_all?",
      "/PBS",
      "/Invoice",
    ];
    for (const path of paths) {
      for (const fragment of denied) {
        expect(path.includes(fragment)).toBe(false);
      }
    }
  });

  it("keeps daily report, PBS, SIMA, and policy writes as questions", () => {
    for (const item of STAFF_WORKFLOW_QUESTIONS) {
      const result = staffReadRequest(item.workflow, session);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe("blocked");
        expect(result.question).toBe(item.question);
      }
    }
    expect(staffReadRequest("surveys", session)).toMatchObject({
      ok: false,
      code: "unknown",
    });
  });

  it("reads the progress-note and timesheet wrappers and rejects a shapeless payload", () => {
    expect(
      rowsFromPayload(
        { progressNote: [{ progressNoteId: 4, title: "Morning", dateCreated: "2026-10-22" }] },
        "progressNote"
      )
    ).toEqual({
      ok: true,
      rows: [{ id: "4", title: "Morning", detail: "2026-10-22" }],
    });
    expect(rowsFromPayload({ timesheet: null }, "timesheet")).toEqual({
      ok: true,
      rows: [],
    });
    expect(rowsFromPayload({ unexpected: true }, null)).toEqual({
      ok: false,
      code: "unexpected-shape",
    });
  });

  it("sends one read for two callers and does not keep the result afterwards", async () => {
    let release: (value: { data: unknown }) => void = () => undefined;
    const pending = new Promise<{ data: unknown }>((resolve) => {
      release = resolve;
    });
    const get = jest.fn(() => pending);

    const first = loadStaffWorkflow("attendance", session, get);
    const second = loadStaffWorkflow("attendance", session, get);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/StaffAttendances/get_staff_attendances?staffId=9");
    release({
      data: [{ staffAttendanceId: 12, title: "Shift", status: "Submitted" }],
    });
    await expect(first).resolves.toMatchObject({ ok: true, rows: [{ id: "12", title: "Shift" }] });
    await expect(second).resolves.toMatchObject({ ok: true });

    get.mockResolvedValueOnce({ data: [] });
    await loadStaffWorkflow("attendance", session, get);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("reports denial and an unreachable read without storing a row", async () => {
    const denied = jest.fn().mockRejectedValue({ response: { status: 403 } });
    await expect(loadStaffWorkflow("training", session, denied)).resolves.toEqual({
      ok: false,
      code: "denied",
      workflow: "training",
    });

    const offline = jest.fn().mockRejectedValue(new Error("offline"));
    await expect(loadStaffWorkflow("knowledge-base", session, offline)).resolves.toEqual({
      ok: false,
      code: "unavailable",
      workflow: "knowledge-base",
    });
    expect(offline).toHaveBeenCalledWith("/Tickets/get_knowledgebase");
  });
});
