import { formatInTimeZone } from "date-fns-tz";
import { addDays, subMinutes, formatDate } from "date-fns";
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

// Recently updated: normalize roster end times so overnight/sleepover shifts stay active past midnight.
const getRosterDateRange = (
  activity: Pick<AgendaProps | ShiftRosterType, "dateFrom" | "dateTo"> & {
    isNightShift?: boolean;
  }
) => {
  const dateFrom = toDate(activity.dateFrom);
  let dateTo = toDate(activity.dateTo);

  if (activity.isNightShift || dateTo <= dateFrom) {
    dateTo = addDays(dateTo, 1);
  }

  return { dateFrom, dateTo };
};

export function getActivityStatus(activity: AgendaProps) {
  const nowInAustraliaTime = formatInTimeZone(
    new Date(),
    aus_timezone,
    activityTimestampFormat
  );
  const { dateFrom, dateTo } = getRosterDateRange(activity);
  const subMinDateFrom = subMinutes(dateFrom, 10);
  const activityDateFrom = formattedActivityTime(subMinDateFrom);
  const activityDateTo = formattedActivityTime(dateTo);

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
  const { dateFrom, dateTo } = getRosterDateRange(activity);
  const subMinDateFrom = subMinutes(dateFrom, 10);
  const activityDateFrom = formattedActivityTime(subMinDateFrom);
  const activityDateTo = formattedActivityTime(dateTo);

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
