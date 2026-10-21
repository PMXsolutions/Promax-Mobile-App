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
  if (
    Number.isFinite(companyId) &&
    companyId > 0 &&
    Number.isFinite(sessionCompany) &&
    sessionCompany > 0 &&
    companyId !== sessionCompany
  ) {
    return false;
  }

  const owner = Number(document.userId);
  if (!Number.isFinite(owner) || owner <= 0) return true;

  const staffId = Number(session.staffId);
  const userId = Number(session.userId);
  return owner === staffId || (Number.isFinite(userId) && owner === userId);
}

export function shiftVisibleToSession(
  shift: { staffId?: number | null; companyID?: number | null } | null | undefined,
  session: { staffId?: number | null; companyId?: number | null }
): boolean {
  if (!shift) return false;

  const staffId = Number(shift.staffId);
  const sessionStaff = Number(session.staffId);
  if (Number.isFinite(staffId) && staffId > 0) {
    if (!Number.isFinite(sessionStaff) || staffId !== sessionStaff) return false;
  }

  const companyId = Number(shift.companyID);
  const sessionCompany = Number(session.companyId);
  if (
    Number.isFinite(companyId) &&
    companyId > 0 &&
    Number.isFinite(sessionCompany) &&
    sessionCompany > 0 &&
    companyId !== sessionCompany
  ) {
    return false;
  }

  return true;
}
