import {
  createIsolatedFixture,
  type FixtureCall,
} from "@/libs/isolated-fixture";

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

export function resetFixtureBridge() {
  fixture = createIsolatedFixture();
  calls.length = 0;
  mileageHold = null;
  releaseMileageHold = null;
  documentHold = null;
  releaseDocumentHold = null;
  documentHoldPath = "";
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
  extra?: Pick<FixtureCall, "platform" | "deviceType" | "offline">
) {
  calls.push({ method, path });
  if (method === "GET" && path.startsWith("/ShiftRosters/fill_mileage") && mileageHold) {
    await mileageHold;
  }
  if (method === "GET" && documentHold && path.startsWith(documentHoldPath)) {
    await documentHold;
  }
  const result = fixture.respond({
    method,
    path,
    body: recordBody(body),
    ...extra,
  });
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
  get: (path: string) => dispatch("GET", path),
  post: (path: string, body?: unknown) => dispatch("POST", path, body),
};

export const publicAxios = {
  get: (path: string) => dispatch("GET", path),
  post: (path: string, body?: unknown) => dispatch("POST", path, body),
};
