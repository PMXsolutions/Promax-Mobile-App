export type SessionStatusAction = "expire" | "keep";

/** 401 ends the session. 403 is one denied action and must keep the session. */
export function sessionActionForStatus(
  status: number | undefined
): SessionStatusAction {
  if (status === 401) return "expire";
  return "keep";
}

function httpStatusOf(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { response?: { status?: unknown } }).response?.status;
  return typeof status === "number" ? status : undefined;
}

/**
 * Queries retry three times unless the status ends the session.
 * A 401 must not be sent again. Mutations are not given a retry here.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (sessionActionForStatus(httpStatusOf(error)) === "expire") return false;
  return failureCount < 3;
}
