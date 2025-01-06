import { formatInTimeZone } from "date-fns-tz";
import { subMinutes, formatDate } from "date-fns";
import { AgendaProps, ShiftRosterType } from "@/types/shift";

const aus_timezone = "Australia/Sydney";
const date = new Date();

export const formattedAusTime = (timeVal: Date) => {
  return formatInTimeZone(timeVal, aus_timezone, "yyyy-MM-dd HH:mm");
};
export const formattedTime = (timeVal: Date, formatStr: string) => {
  return formatInTimeZone(timeVal, aus_timezone, formatStr);
};

export const formattedDate = (timeVal: Date, formatStr: string) => {
  return formatDate(timeVal, formatStr);
};

export function getActivityStatus(activity: AgendaProps) {
  const nowInAustraliaTime = formatInTimeZone(
    date,
    aus_timezone,
    "yyyy-MM-dd'T'HH:mm:ss"
  );
  const subMinDateFrom = subMinutes(activity?.dateFrom, 10);
  const activityDateFrom = formattedDate(
    subMinDateFrom,
    "yyyy-MM-dd'T'HH:mm:ss"
  );
  const activityDateTo = activity?.dateTo;

  if (activityDateFrom > nowInAustraliaTime) {
    return "Upcoming";
  } else if (activity.status === "Cancelled") {
    return "Cancelled";
  } else if (
    activityDateTo.toString() < nowInAustraliaTime &&
    activity.attendance &&
    activity.isEnded
  ) {
    return "Present";
  } else if (
    activityDateTo.toString() < nowInAustraliaTime &&
    !activity.attendance
  ) {
    return "Absent";
  } else if (
    activityDateTo.toString() < nowInAustraliaTime ||
    (activity.attendance && !activity.isEnded)
  ) {
    return "Shift In progress";
  } else if (activity.attendance && activity.isEnded) {
    return "Present";
  } else {
    return "Clock-In";
  }
}
export function getActivityDetailStatus(activity: ShiftRosterType) {
  const nowInAustraliaTime = formatInTimeZone(
    date,
    aus_timezone,
    "yyyy-MM-dd'T'HH:mm:ss"
  );
  const subMinDateFrom = subMinutes(activity?.dateFrom, 10);
  const activityDateFrom = formattedDate(
    subMinDateFrom,
    "yyyy-MM-dd'T'HH:mm:ss"
  );
  const activityDateTo = activity?.dateTo;

  if (activityDateFrom > nowInAustraliaTime) {
    return "Upcoming";
  } else if (activity.status === "Cancelled") {
    return "Cancelled";
  } else if (
    activityDateTo.toString() < nowInAustraliaTime &&
    activity.attendance &&
    activity.isEnded
  ) {
    return "Present";
  } else if (
    activityDateTo.toString() < nowInAustraliaTime &&
    !activity.attendance
  ) {
    return "Absent";
  } else if (
    activityDateTo.toString() < nowInAustraliaTime ||
    (activity.attendance && !activity.isEnded)
  ) {
    return "Shift In progress";
  } else if (activity.attendance && activity.isEnded) {
    return "Present";
  } else {
    return "Clock-In";
  }
}
