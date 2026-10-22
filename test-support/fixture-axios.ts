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

export function resetFixtureBridge() {
  fixture = createIsolatedFixture();
  calls.length = 0;
}

export function armStaffEditFailure() {
  fixture.armStaffEditFailure();
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
