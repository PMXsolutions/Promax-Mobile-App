export function isOwnStaffRecord(
  routeId: string | number | null | undefined,
  sessionStaffId: number | null | undefined
): boolean {
  if (routeId == null || routeId === "" || sessionStaffId == null) return false;
  const requested = Number(routeId);
  if (!Number.isFinite(requested) || requested <= 0) return false;
  return requested === Number(sessionStaffId);
}
