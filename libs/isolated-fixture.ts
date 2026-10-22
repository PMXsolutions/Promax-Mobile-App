import { isEmailUnconfirmedMessage } from "@/libs/login-message";
import { mileageSubmitDecision } from "@/libs/trip-mileage";

export { isEmailUnconfirmedMessage };

/**
 * In-memory disposable fixture for PromaxCare mobile Milestone A.
 * It does not open a socket, and it is not an EAS profile.
 * `development`, `preview`, and `production` stay on the production host.
 * Device, signing, and store decisions stay outside this module.
 *
 * Path methods follow the public client on this branch. Clock-in, clock-out,
 * and mileage are GET. The company service files were not hashed.
 */

export const PRODUCTION_API_HOST = "api.promaxcare.com.au";
export const FIXTURE_BASE_URL = "https://fixture.invalid/api";

export const FIXTURE_SESSION = {
  email: "fixture.staff@example.invalid",
  userId: "fixture-user",
  staffId: 900001,
  companyId: 900001,
  shiftId: 900001,
  reportId: 900001,
  documentId: 900001,
  messageId: 900001,
} as const;

const ABSENT_PREFIXES = [
  "/PBS",
  "/Invoice",
  "/PolicyDocuments",
  "/Sima",
  "/ShiftRosters/sima_",
  "/Attendances/generate_",
  "/Attendances/send_",
  "/ProgressNotes",
  "/IncidentReports",
  "/Tickets",
  "/StaffTrainings",
  "/StaffAttendances/get_all",
];

export type IsolatedBaseDecision =
  | { ok: true; baseUrl: string }
  | { ok: false; reason: "empty" | "production" | "unparsed" };

export function isolatedBaseUrlDecision(
  raw: string | null | undefined
): IsolatedBaseDecision {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { ok: false, reason: "empty" };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: "unparsed" };
  }
  if (url.hostname.toLowerCase() === PRODUCTION_API_HOST) {
    return { ok: false, reason: "production" };
  }
  return { ok: true, baseUrl: url.toString().replace(/\/$/, "") };
}

export type FixtureCall = {
  method: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
  platform?: string;
  deviceType?: string;
  offline?: boolean;
};

export type FixtureResult = {
  status: number;
  body: unknown;
};

type FixtureState = {
  clocked: Set<string>;
  reports: Set<string>;
  instagram: string;
  tokens: { token: string; userId: string; companyId: number }[];
  failStaffEdit: boolean;
};

function unavailable(): FixtureResult {
  return { status: 0, body: { kind: "unavailable", stored: false } };
}

function denied(): FixtureResult {
  return { status: 403, body: { kind: "denied", stored: false } };
}

function absent(): FixtureResult {
  return { status: 404, body: { kind: "absent", stored: false } };
}

function splitPath(path: string): { pathname: string; query: URLSearchParams } {
  const mark = path.indexOf("?");
  if (mark < 0) {
    return { pathname: path, query: new URLSearchParams() };
  }
  return {
    pathname: path.slice(0, mark),
    query: new URLSearchParams(path.slice(mark + 1)),
  };
}

function isFixtureStaff(value: string | null): boolean {
  return value === String(FIXTURE_SESSION.staffId);
}

function isFixtureUser(value: string | null): boolean {
  return value === FIXTURE_SESSION.userId;
}

export function createIsolatedFixture() {
  const state: FixtureState = {
    clocked: new Set(),
    reports: new Set(),
    instagram: "fixture-handle",
    tokens: [],
    failStaffEdit: false,
  };

  function respond(call: FixtureCall): FixtureResult {
    if (call.offline) return unavailable();

    const { pathname, query } = splitPath(call.path);
    if (ABSENT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return absent();
    }

    if (pathname === "/Account/auth_login" && call.method === "POST") {
      const password = String(call.body?.password ?? call.body?.Password ?? "");
      if (password === "unconfirmed") {
        return {
          status: 401,
          body: { message: "email not confirmed" },
        };
      }
      if (password === "wrong") {
        return { status: 401, body: { message: "invalid login attempt" } };
      }
      if (password === "mail-limit") {
        return {
          status: 429,
          body: {
            message: "Error sending mail. Too many mails sent. Retry in One hour time.",
          },
        };
      }
      if (password !== "fixture") return denied();
      return {
        status: 200,
        body: {
          status: "success",
          userId: FIXTURE_SESSION.userId,
          staffId: FIXTURE_SESSION.staffId,
          companyId: FIXTURE_SESSION.companyId,
          email: FIXTURE_SESSION.email,
          userProfile: {
            role: "Staff",
            token: "fixture-token",
            userId: FIXTURE_SESSION.userId,
            companyId: FIXTURE_SESSION.companyId,
          },
          staffProfile: {
            staffId: FIXTURE_SESSION.staffId,
            firstName: "Fixture",
          },
        },
      };
    }

    if (pathname === "/Account/forgot_password" && call.method === "GET") {
      return { status: 200, body: { mailed: false } };
    }
    if (pathname === "/Account/reset_password" && call.method === "POST") {
      return { status: 200, body: { mailed: false, reset: true } };
    }

    if (pathname === "/ShiftRosters/get_shifts_by_user" && call.method === "GET") {
      if (!isFixtureStaff(query.get("staff"))) return denied();
      return {
        status: 200,
        body: {
          shiftRoster: [
            {
              shiftRosterId: FIXTURE_SESSION.shiftId,
              staffId: FIXTURE_SESSION.staffId,
              companyId: FIXTURE_SESSION.companyId,
              status: "Confirmed",
              isEnded: false,
              isShiftReportSigned: false,
              dateFrom: "2026-10-22T09:00:00",
              dateTo: "2026-10-22T17:00:00",
              clients: [],
              activities: [],
              attendance: null,
              staff: {
                fullName: "Fixture Staff",
                firstName: "Fixture",
                middleName: "",
                imageUrl: "",
              },
              profile: { imageUrl: "" },
            },
          ],
        },
      };
    }

    if (pathname === `/ShiftRosters/${FIXTURE_SESSION.shiftId}` && call.method === "GET") {
      return {
        status: 200,
        body: {
          shiftRosterId: FIXTURE_SESSION.shiftId,
          staffId: FIXTURE_SESSION.staffId,
          companyId: FIXTURE_SESSION.companyId,
        },
      };
    }

    if (pathname === "/ShiftRosters/fill_mileage" && call.method === "GET") {
      if (query.get("shiftId") !== String(FIXTURE_SESSION.shiftId)) return denied();
      const decision = mileageSubmitDecision(
        query.get("startKm") ?? "",
        query.get("endKm") ?? ""
      );
      if (!decision.ok) {
        return { status: 422, body: { stored: false, message: decision.message } };
      }
      return {
        status: 200,
        body: { stored: true, startKm: decision.startKm, endKm: decision.endKm },
      };
    }

    if (pathname.startsWith("/ShiftRosters/") && call.method === "GET") {
      return denied();
    }

    if (pathname === "/Attendances/clock_in" && call.method === "GET") {
      if (!isFixtureUser(query.get("userId"))) return denied();
      if (query.get("shiftId") !== String(FIXTURE_SESSION.shiftId)) return denied();
      const key = `${query.get("userId")}:${query.get("shiftId")}`;
      if (state.clocked.has(key)) {
        return { status: 409, body: { kind: "duplicate", stored: false } };
      }
      state.clocked.add(key);
      return { status: 200, body: { clocked: true, stored: true } };
    }

    if (pathname === "/Attendances/clock_out" && call.method === "GET") {
      if (!isFixtureUser(query.get("userId"))) return denied();
      if (query.get("shiftId") !== String(FIXTURE_SESSION.shiftId)) return denied();
      return { status: 200, body: { clockedOut: true } };
    }

    if (pathname === "/ShiftReports/get_staff_shiftreports" && call.method === "GET") {
      if (!isFixtureStaff(query.get("staffId"))) return denied();
      return {
        status: 200,
        body: [{ id: FIXTURE_SESSION.reportId, staffId: FIXTURE_SESSION.staffId }],
      };
    }

    if (pathname === "/ShiftReports/get_shiftreport_details" && call.method === "GET") {
      if (query.get("id") !== String(FIXTURE_SESSION.reportId)) return denied();
      if (query.get("shiftId") !== String(FIXTURE_SESSION.shiftId)) return denied();
      return {
        status: 200,
        body: { id: FIXTURE_SESSION.reportId, shiftId: FIXTURE_SESSION.shiftId },
      };
    }

    if (
      (pathname === "/ShiftReports/add_shiftreport" ||
        pathname === `/ShiftReports/edit/${FIXTURE_SESSION.reportId}`) &&
      call.method === "POST"
    ) {
      if (!isFixtureUser(query.get("userId"))) return denied();
      const key = pathname;
      if (state.reports.has(key)) {
        return { status: 409, body: { kind: "duplicate", stored: false } };
      }
      state.reports.add(key);
      return { status: 200, body: { id: FIXTURE_SESSION.reportId, stored: true } };
    }

    if (pathname === "/Documents/get_all_staff_documents" && call.method === "GET") {
      if (!isFixtureStaff(query.get("staffId"))) return denied();
      return {
        status: 200,
        body: [
          {
            id: FIXTURE_SESSION.documentId,
            staffId: FIXTURE_SESSION.staffId,
            companyId: FIXTURE_SESSION.companyId,
          },
        ],
      };
    }

    if (
      pathname === `/Documents/get_document/${FIXTURE_SESSION.documentId}` &&
      call.method === "GET"
    ) {
      return {
        status: 200,
        body: {
          id: FIXTURE_SESSION.documentId,
          companyId: FIXTURE_SESSION.companyId,
          userId: FIXTURE_SESSION.staffId,
        },
      };
    }

    if (
      (pathname === "/Documents/add_document" ||
        pathname === `/Documents/edit/${FIXTURE_SESSION.documentId}` ||
        pathname === `/Documents/delete/${FIXTURE_SESSION.documentId}`) &&
      call.method === "POST"
    ) {
      if (pathname === "/Documents/add_document" && !isFixtureUser(query.get("userId"))) {
        return denied();
      }
      if (
        pathname.startsWith("/Documents/edit/") &&
        !isFixtureUser(query.get("userId"))
      ) {
        return denied();
      }
      return { status: 200, body: { id: FIXTURE_SESSION.documentId, stored: true } };
    }

    if (pathname === `/Staffs/${FIXTURE_SESSION.staffId}` && call.method === "GET") {
      return {
        status: 200,
        body: {
          staffId: FIXTURE_SESSION.staffId,
          companyId: FIXTURE_SESSION.companyId,
          instagram: state.instagram,
          linkedIn: "",
          facebook: "",
          youtube: "",
          twitter: "",
        },
      };
    }

    if (
      pathname === `/Companies/get_company/${FIXTURE_SESSION.companyId}` &&
      call.method === "GET"
    ) {
      return {
        status: 200,
        body: { company: { companyId: FIXTURE_SESSION.companyId } },
      };
    }

    if (pathname === `/Staffs/edit/${FIXTURE_SESSION.staffId}` && call.method === "POST") {
      if (!isFixtureUser(query.get("userId"))) return denied();
      if (call.body?.fail === true || state.failStaffEdit) {
        state.failStaffEdit = false;
        return {
          status: 500,
          body: {
            saved: false,
            message: "Could not save",
            instagram: state.instagram,
          },
        };
      }
      const next = call.body?.instagram;
      if (typeof next === "string") state.instagram = next;
      return { status: 200, body: { saved: true, instagram: state.instagram } };
    }

    if (
      pathname === "/StaffAvailibilities/get_staff_availabilities" &&
      call.method === "GET"
    ) {
      if (!isFixtureStaff(query.get("staffId"))) return denied();
      return { status: 200, body: [] };
    }

    if (
      (pathname === "/StaffAvailibilities/add_staff_availability" ||
        pathname.startsWith("/StaffAvailibilities/edit/") ||
        pathname.startsWith("/StaffAvailibilities/delete/")) &&
      call.method === "POST"
    ) {
      const staffId = call.body?.staffId;
      const companyId = call.body?.companyID ?? call.body?.companyId;
      if (staffId != null && Number(staffId) !== FIXTURE_SESSION.staffId) return denied();
      if (companyId != null && Number(companyId) !== FIXTURE_SESSION.companyId) {
        return denied();
      }
      if (pathname === "/StaffAvailibilities/add_staff_availability") {
        if (!isFixtureUser(query.get("userId"))) return denied();
      }
      return { status: 200, body: { stored: true } };
    }

    if (pathname === "/Messages/inbox" && call.method === "GET") {
      if (!isFixtureUser(query.get("userId"))) return denied();
      return {
        status: 200,
        body: { message: [{ id: FIXTURE_SESSION.messageId }] },
      };
    }

    if (pathname === `/Messages/${FIXTURE_SESSION.messageId}` && call.method === "GET") {
      return { status: 200, body: { id: FIXTURE_SESSION.messageId } };
    }

    if (pathname === "/DeviceTokens/add_token" && call.method === "POST") {
      const token = call.body?.Device_Token;
      const userId = call.body?.UserId;
      const companyId = call.body?.CompanyId;
      const android =
        call.platform === "android" &&
        call.deviceType === "android" &&
        typeof token === "string" &&
        token.length > 0;
      if (!android || userId !== FIXTURE_SESSION.userId) {
        return { status: 403, body: { stored: false } };
      }
      if (Number(companyId) !== FIXTURE_SESSION.companyId) {
        return { status: 403, body: { stored: false } };
      }
      state.tokens.push({
        token,
        userId: FIXTURE_SESSION.userId,
        companyId: FIXTURE_SESSION.companyId,
      });
      return { status: 200, body: { stored: true } };
    }

    if (pathname.startsWith("/Staffs/") || pathname.startsWith("/Companies/")) {
      return denied();
    }

    return absent();
  }

  return {
    respond,
    armStaffEditFailure: () => {
      state.failStaffEdit = true;
    },
    snapshot: () => ({
      instagram: state.instagram,
      tokens: state.tokens.map((item) => item.token),
      clocked: state.clocked.size,
      reports: state.reports.size,
    }),
  };
}
