import axiosInstance from "@/libs/axiosInstance";
import {
  rowsFromPayload,
  sessionFromAuth,
  staffReadRequest,
  StaffReadRefusal,
  StaffSession,
  StaffWorkflowRow,
} from "@/libs/staff-workflow-contract";

export type StaffLoadResult =
  | {
      ok: true;
      workflow: string;
      path: string;
      rows: StaffWorkflowRow[];
    }
  | StaffReadRefusal
  | { ok: false; code: "unexpected-shape" | "denied" | "unavailable"; workflow: string };

type GetJson = (path: string) => Promise<{ data: unknown }>;

const loads = new Map<string, Promise<StaffLoadResult>>();

const defaultGet: GetJson = (path) => axiosInstance.get(path);

export function resetStaffWorkflowLoads() {
  loads.clear();
}

async function fetchStaffRead(
  workflow: string,
  path: string,
  wrapper: "progressNote" | "timesheet" | null,
  get: GetJson
): Promise<StaffLoadResult> {
  try {
    const response = await get(path);
    const rows = rowsFromPayload(response.data, wrapper);
    if (!rows.ok) return { ok: false, code: rows.code, workflow };
    return { ok: true, workflow, path, rows: rows.rows };
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401 || status === 403) {
      return { ok: false, code: "denied", workflow };
    }
    return { ok: false, code: "unavailable", workflow };
  }
}

export function loadStaffWorkflow(
  workflow: string,
  sessionInput: StaffSession,
  get: GetJson = defaultGet
): Promise<StaffLoadResult> {
  const request = staffReadRequest(workflow, sessionFromAuth(sessionInput));
  if (!request.ok) return Promise.resolve(request);

  const existing = loads.get(request.key);
  if (existing) return existing;

  const pending = fetchStaffRead(workflow, request.path, request.wrapper, get).finally(
    () => {
      if (loads.get(request.key) === pending) loads.delete(request.key);
    }
  );
  loads.set(request.key, pending);
  return pending;
}
