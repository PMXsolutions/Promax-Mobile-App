export function isOwnStaffRecord(
  routeId: string | number | null | undefined,
  sessionStaffId: number | null | undefined
): boolean {
  if (routeId == null || routeId === "" || sessionStaffId == null) return false;
  const requested = Number(routeId);
  if (!Number.isFinite(requested) || requested <= 0) return false;
  return requested === Number(sessionStaffId);
}

export function documentOwnedBySession(
  document: { companyId?: number | null; userId?: number | null } | null | undefined,
  session: {
    companyId?: number | null;
    staffId?: number | null;
    userId?: string | number | null;
  }
): boolean {
  if (!document) return false;

  const companyId = Number(document.companyId);
  const sessionCompany = Number(session.companyId);
  if (!Number.isFinite(companyId) || companyId <= 0) return false;
  if (!Number.isFinite(sessionCompany) || sessionCompany <= 0) return false;
  if (companyId !== sessionCompany) return false;

  const owner = Number(document.userId);
  const staffId = Number(session.staffId);
  const userId = Number(session.userId);
  if (Number.isFinite(owner) && owner > 0) {
    return owner === staffId || (Number.isFinite(userId) && owner === userId);
  }

  return true;
}

export function reportListedForSession(
  roster:
    | {
        shiftRosterId?: number | null;
        reportId?: number | null;
        staffId?: number | null;
        companyID?: number | null;
      }[]
    | null
    | undefined,
  shiftId: number,
  reportId: number,
  session: { staffId?: number | null; companyId?: number | null }
): boolean {
  if (!shiftListedForSession(roster, shiftId, session) || !Array.isArray(roster)) {
    return false;
  }
  const requested = Number(reportId);
  if (!Number.isFinite(requested) || requested <= 0) return false;
  return roster.some(
    (item) =>
      Number(item.shiftRosterId) === Number(shiftId) &&
      Number(item.reportId) === requested &&
      shiftVisibleToSession(item, session)
  );
}

export function notificationListedForSession(
  messages: { messageId?: number | null }[] | null | undefined,
  messageId: number
): boolean {
  const id = Number(messageId);
  if (!Number.isFinite(id) || id <= 0 || !Array.isArray(messages)) return false;
  return messages.some((item) => Number(item.messageId) === id);
}

export function notificationCompanyMatches(
  message: { companyId?: string | number | null } | null | undefined,
  sessionCompanyId: number | null | undefined
): boolean {
  if (!message) return false;
  const companyId = Number(message.companyId);
  const sessionCompany = Number(sessionCompanyId);
  if (!Number.isFinite(companyId) || companyId <= 0) return true;
  if (!Number.isFinite(sessionCompany) || sessionCompany <= 0) return false;
  return companyId === sessionCompany;
}

export function shiftListedForSession(
  roster:
    | { shiftRosterId?: number | null; staffId?: number | null; companyID?: number | null }[]
    | null
    | undefined,
  shiftId: number,
  session: { staffId?: number | null; companyId?: number | null }
): boolean {
  const id = Number(shiftId);
  if (!Number.isFinite(id) || id <= 0 || !Array.isArray(roster)) return false;
  return roster.some(
    (item) =>
      Number(item.shiftRosterId) === id && shiftVisibleToSession(item, session)
  );
}

export function shiftVisibleToSession(
  shift: { staffId?: number | null; companyID?: number | null } | null | undefined,
  session: { staffId?: number | null; companyId?: number | null }
): boolean {
  if (!shift) return false;

  const staffId = Number(shift.staffId);
  const sessionStaff = Number(session.staffId);
  if (!Number.isFinite(staffId) || staffId <= 0) return false;
  if (!Number.isFinite(sessionStaff) || staffId !== sessionStaff) return false;

  const companyId = Number(shift.companyID);
  const sessionCompany = Number(session.companyId);
  if (!Number.isFinite(companyId) || companyId <= 0) return false;
  if (!Number.isFinite(sessionCompany) || sessionCompany <= 0) return false;
  return companyId === sessionCompany;
}
