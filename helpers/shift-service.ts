import { formatInTimeZone } from "date-fns-tz";
import { subMinutes, formatDate } from "date-fns";
import { AgendaProps, ShiftRosterType } from "@/types/shift";

const aus_timezone = "Australia/Sydney";
const activityTimestampFormat = "yyyy-MM-dd'T'HH:mm:ss";

// const date = new Date();

export const formattedAusTime = (timeVal: Date) => {
  return formatInTimeZone(timeVal, aus_timezone, "yyyy-MM-dd HH:mm");
};
export const formattedTime = (timeVal: Date, formatStr: string) => {
  return formatInTimeZone(timeVal, aus_timezone, formatStr);
};

export const formattedDate = (timeVal: Date, formatStr: string) => {
  return formatDate(timeVal, formatStr);
};

const toDate = (timeVal: Date | string | number) =>
  timeVal instanceof Date ? timeVal : new Date(timeVal);

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
