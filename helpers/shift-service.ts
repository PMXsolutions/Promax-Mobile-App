import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { subMinutes, formatDate } from "date-fns";
import { AgendaProps, ShiftRosterType } from "@/types/shift";

const aus_timezone = "Australia/Sydney";
export const ROSTER_TIMEZONE = aus_timezone;
const activityTimestampFormat = "yyyy-MM-dd'T'HH:mm:ss";

const hasExplicitZone = (value: string) =>
  /(?:z|[+-]\d{2}:?\d{2})$/i.test(value.trim());

/**
 * Roster timestamps from the API are Australia/Sydney wall times and often
 * have no offset. Parsing those with `new Date` uses the phone timezone and
 * moves the shift onto the wrong day.
 */
export function parseRosterDateTime(
  value: Date | string | number | null | undefined
): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (value == null) return new Date(NaN);

  const raw = String(value).trim();
  if (!raw) return new Date(NaN);
  if (hasExplicitZone(raw)) return new Date(raw);

  const normalized = (raw.includes("T") ? raw : raw.replace(" ", "T")).replace(
    /\.\d+$/,
    ""
  );
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return fromZonedTime(`${normalized}T12:00:00`, aus_timezone);
  }
  return fromZonedTime(normalized, aus_timezone);
}

export function rosterDateKey(value: Date | string | number): string {
  return formatInTimeZone(parseRosterDateTime(value), aus_timezone, "yyyy-MM-dd");
}

export function addRosterDays(value: Date, days: number): Date {
  const [year, month, day] = rosterDateKey(value).split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return fromZonedTime(
    `${shifted.toISOString().slice(0, 10)}T12:00:00`,
    aus_timezone
  );
}

export function startOfRosterWeek(value: Date): Date {
  const noon = fromZonedTime(`${rosterDateKey(value)}T12:00:00`, aus_timezone);
  const isoWeekday = Number(formatInTimeZone(noon, aus_timezone, "i"));
  return addRosterDays(noon, -(isoWeekday - 1));
}

export function startOfRosterMonth(value: Date): Date {
  return fromZonedTime(`${rosterDateKey(value).slice(0, 7)}-01T12:00:00`, aus_timezone);
}

export function shiftIncludesTransport(activities?: string | null): boolean {
  return (activities || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .includes("transport");
}

// const date = new Date();

export const formattedAusTime = (timeVal: Date) => {
  return formatInTimeZone(timeVal, aus_timezone, "yyyy-MM-dd HH:mm");
};
export const formattedTime = (
  timeVal: Date | string | number | null | undefined,
  formatStr: string
) => {
  return formatInTimeZone(parseRosterDateTime(timeVal), aus_timezone, formatStr);
};

export const formattedDate = (timeVal: Date, formatStr: string) => {
  return formatDate(timeVal, formatStr);
};

const toDate = (timeVal: Date | string | number) => parseRosterDateTime(timeVal);

const formattedActivityTime = (timeVal: Date | string | number) =>
  formatInTimeZone(toDate(timeVal), aus_timezone, activityTimestampFormat);

export function getActivityStatus(activity: AgendaProps) {
  const nowInAustraliaTime = formatInTimeZone(
    new Date(),
    aus_timezone,
    activityTimestampFormat
  );
  const subMinDateFrom = subMinutes(toDate(activity?.dateFrom), 10);
  const activityDateFrom = formattedActivityTime(subMinDateFrom);
  const activityDateTo = formattedActivityTime(activity?.dateTo);

  if (activity.status === "Cancelled") {
    return "Cancelled";
  } else if (activityDateFrom > nowInAustraliaTime) {
    return "Upcoming";
  } else if (
    activityDateTo < nowInAustraliaTime &&
    activity.attendance &&
    activity.isEnded
  ) {
    return "Present";
  } else if (activityDateTo < nowInAustraliaTime && !activity.attendance) {
    return "Absent";
  } else if (
    activityDateTo < nowInAustraliaTime ||
    (activity.attendance && !activity.isEnded)
  ) {
    return "Shift In progress";
  } else if (activity.attendance && activity.isEnded) {
    return "Present";
  } else {
    return "Clock-In";
  }
}

export function getActivityDetailStatus(activity: ShiftRosterType, now: Date) {
  const nowInAustraliaTime = formatInTimeZone(
    now || new Date(),
    aus_timezone,
    activityTimestampFormat
  );
  const subMinDateFrom = subMinutes(toDate(activity?.dateFrom), 10);
  const activityDateFrom = formattedActivityTime(subMinDateFrom);
  const activityDateTo = formattedActivityTime(activity?.dateTo);

  if (activity.status === "Cancelled") {
    return "Cancelled";
  } else if (activityDateFrom > nowInAustraliaTime) {
    return "Upcoming";
  } else if (
    activityDateTo < nowInAustraliaTime &&
    activity.attendance &&
    activity.isEnded
  ) {
    return "Present";
  } else if (activityDateTo < nowInAustraliaTime && !activity.attendance) {
    return "Absent";
  } else if (
    activityDateTo < nowInAustraliaTime ||
    (activity.attendance && !activity.isEnded)
  ) {
    return "Shift In progress";
  } else if (activity.attendance && activity.isEnded) {
    return "Present";
  } else {
    return "Clock-In";
  }
}

export function convertTo12HourFormat(time24: any) {
  const [hours, minutes] = time24.split(":");
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Handle 0 as 12
  return `${hours12}:${minutes} ${period}`;
}
