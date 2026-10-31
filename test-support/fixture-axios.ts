import {
  createIsolatedFixture,
  FIXTURE_SESSION,
  type FixtureCall,
} from "@/libs/isolated-fixture";
import useAuthStore from "@/store/use-auth-store";

/**
 * Test-only axios stand-in. It forwards the real service calls into the
 * in-memory fixture and never opens a socket.
 */

type Fixture = ReturnType<typeof createIsolatedFixture>;

let fixture: Fixture = createIsolatedFixture();
const calls: { method: "GET" | "POST"; path: string }[] = [];
let mileageHold: Promise<void> | null = null;
let releaseMileageHold: (() => void) | null = null;
let documentHold: Promise<void> | null = null;
let releaseDocumentHold: (() => void) | null = null;
let documentHoldPath = "";
let notificationHold: Promise<void> | null = null;
let releaseNotificationHold: (() => void) | null = null;
let notificationHoldPath = "";
let reportHold: Promise<void> | null = null;
let releaseReportHold: (() => void) | null = null;
let reportHoldPath = "";

export function resetFixtureBridge() {
  fixture = createIsolatedFixture();
  calls.length = 0;
  mileageHold = null;
  releaseMileageHold = null;
  documentHold = null;
  releaseDocumentHold = null;
  documentHoldPath = "";
  notificationHold = null;
  releaseNotificationHold = null;
  notificationHoldPath = "";
  reportHold = null;
  releaseReportHold = null;
  reportHoldPath = "";
}

export function armStaffEditFailure() {
  fixture.armStaffEditFailure();
}

export function armMileageFailure() {
  fixture.armMileageFailure();
}

export function holdNextMileage() {
  mileageHold = new Promise<void>((resolve) => {
    releaseMileageHold = resolve;
  });
}

export function releaseMileage() {
  releaseMileageHold?.();
  mileageHold = null;
  releaseMileageHold = null;
}

export function armDocumentListFailure() {
  fixture.armDocumentListFailure();
}

export function armEmptyDocumentList() {
  fixture.armEmptyDocumentList();
}

export function armDocumentDetailFailure() {
  fixture.armDocumentDetailFailure();
}

export function armDocumentOwnershipMismatch() {
  fixture.armDocumentOwnershipMismatch();
}

function holdDocument(path: string) {
  documentHoldPath = path;
  documentHold = new Promise<void>((resolve) => {
    releaseDocumentHold = resolve;
  });
}

export function holdNextDocumentList() {
  holdDocument("/Documents/get_all_staff_documents");
}

export function holdNextDocumentDetail() {
  holdDocument("/Documents/get_document/");
}

export function releaseDocument() {
  releaseDocumentHold?.();
  documentHold = null;
  releaseDocumentHold = null;
  documentHoldPath = "";
}

export function armNotificationListFailure() {
  fixture.armNotificationListFailure();
}

export function armNotificationDetailFailure() {
  fixture.armNotificationDetailFailure();
}

export function armNotificationOwnershipMismatch() {
  fixture.armNotificationOwnershipMismatch();
}

function holdNotification(path: string) {
  notificationHoldPath = path;
  notificationHold = new Promise<void>((resolve) => {
    releaseNotificationHold = resolve;
  });
}

export function holdNextNotificationList() {
  holdNotification("/Messages/inbox");
}

export function holdNextNotificationDetail() {
  holdNotification(`/Messages/${FIXTURE_SESSION.messageId}`);
}

export function releaseNotification() {
  releaseNotificationHold?.();
  notificationHold = null;
  releaseNotificationHold = null;
  notificationHoldPath = "";
}

export function armRosterFailure() {
  fixture.armRosterFailure();
}

export function armEmptyRoster() {
  fixture.armEmptyRoster();
}

export function armRosterExpiry() {
  fixture.armRosterExpiry();
}

export function armStaffReportListFailure() {
  fixture.armStaffReportListFailure();
}

export function armEmptyStaffReports() {
  fixture.armEmptyStaffReports();
}

export function armReportDetailFailure() {
  fixture.armReportDetailFailure();
}

export function armReportSaveFailure() {
  fixture.armReportSaveFailure();
}

export function armCancelFailure() {
  fixture.armCancelFailure();
}

export function armShiftDetailFailure() {
  fixture.armShiftDetailFailure();
}

export function armShiftDetailMismatch() {
  fixture.armShiftDetailMismatch();
}

function holdReport(path: string) {
  reportHoldPath = path;
  reportHold = new Promise<void>((resolve) => {
    releaseReportHold = resolve;
  });
}

export function holdNextRoster() {
  holdReport("/ShiftRosters/get_shifts_by_user");
}

export function holdNextStaffReports() {
  holdReport("/ShiftReports/get_staff_shiftreports");
}

export function holdNextReportDetail() {
  holdReport("/ShiftReports/get_shiftreport_details");
}

export function holdNextReportSave() {
  holdReport("/ShiftReports/edit/");
}

export function holdNextReportCreate() {
  holdReport("/ShiftReports/add_shiftreport");
}

export function holdNextCancellation() {
  holdReport("/ShiftRosters/shift_cancellation");
}

export function holdNextShiftDetail() {
  holdReport(`/ShiftRosters/${FIXTURE_SESSION.shiftId}`);
}

export function releaseReport() {
  releaseReportHold?.();
  reportHold = null;
  releaseReportHold = null;
  reportHoldPath = "";
}

export function fixtureSnapshot() {
  return fixture.snapshot();
}

export function fixtureCalls() {
  return calls.slice();
}

function recordBody(body: unknown): Record<string, unknown> | undefined {
  if (body == null) return undefined;
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const record: Record<string, unknown> = {};
    const parts = (body as FormData & { _parts?: [string, unknown][] })._parts;
    if (Array.isArray(parts)) {
      for (const [key, value] of parts) record[key] = value;
      return record;
    }
    body.forEach((value, key) => {
      record[key] = typeof value === "string" ? value : String(value);
    });
    return record;
  }
  if (typeof body === "object") return body as Record<string, unknown>;
  return undefined;
}

async function dispatch(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
  extra?: Pick<FixtureCall, "platform" | "deviceType" | "offline">,
  authenticated = false
) {
  calls.push({ method, path });
  if (method === "GET" && path.startsWith("/ShiftRosters/fill_mileage") && mileageHold) {
    await mileageHold;
  }
  if (method === "GET" && documentHold && path.startsWith(documentHoldPath)) {
    await documentHold;
  }
  if (method === "GET" && notificationHold && path.startsWith(notificationHoldPath)) {
    await notificationHold;
  }
  if (reportHold && path.startsWith(reportHoldPath)) {
    await reportHold;
  }
  const result = fixture.respond({
    method,
    path,
    body: recordBody(body),
    ...extra,
  });
  if (authenticated && result.status === 401) {
    void useAuthStore.getState().logout();
  }
  if (result.status >= 200 && result.status < 300) {
    return { data: result.body, status: result.status };
  }
  const error = new Error("Isolated fixture response") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };
  error.isAxiosError = true;
  error.response = { status: result.status, data: result.body };
  throw error;
}

export const axiosInstance = {
  get: (path: string) => dispatch("GET", path, undefined, undefined, true),
  post: (path: string, body?: unknown) =>
    dispatch("POST", path, body, undefined, true),
};

export const publicAxios = {
  get: (path: string) => dispatch("GET", path),
  post: (path: string, body?: unknown) => dispatch("POST", path, body),
};
