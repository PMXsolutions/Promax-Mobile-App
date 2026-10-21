export type SessionStatusAction = "expire" | "keep";

/** 401 ends the session. 403 is one denied action and must keep the session. */
export function sessionActionForStatus(
  status: number | undefined
): SessionStatusAction {
  if (status === 401) return "expire";
  return "keep";
}
