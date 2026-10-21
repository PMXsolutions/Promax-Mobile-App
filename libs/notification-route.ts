export function pathForNotificationData(
  data: Record<string, unknown> | undefined
): string {
  const raw = data?.shiftRosterId ?? data?.shiftId;
  const shiftId =
    typeof raw === "number" || typeof raw === "string" ? Number(raw) : NaN;

  if (Number.isFinite(shiftId) && shiftId > 0) {
    return `/(root)/shift?id=${shiftId}`;
  }

  return "/(root)/notification";
}
