import { formatInTimeZone } from "date-fns-tz";
import { subMinutes } from "date-fns";
import { AgendaProps, ShiftRosterType } from "@/types/shift";

const aus_timezone = "Australia/Sydney";
const comparableDateFormat = "yyyy-MM-dd'T'HH:mm:ss";

// const date = new Date();

export const formattedAusTime = (timeVal: Date) => {
  return formatInTimeZone(timeVal, aus_timezone, "yyyy-MM-dd HH:mm");
};
export const formattedTime = (timeVal: Date, formatStr: string) => {
  return formatInTimeZone(timeVal, aus_timezone, formatStr);
};

export const formattedDate = (timeVal: Date, formatStr: string) => {
  return formatInTimeZone(timeVal, aus_timezone, formatStr);
};

type ShiftDateValue = Date | string | number;
type ShiftStatusInput = Pick<
  ShiftRosterType,
  "dateFrom" | "dateTo" | "status" | "attendance" | "isEnded"
>;

const toSydneyComparable = (date: ShiftDateValue) =>
  formatInTimeZone(date, aus_timezone, comparableDateFormat);

const resolveActivityStatus = (activity: ShiftStatusInput, now: Date) => {
  if (activity.status === "Cancelled") {
    return "Cancelled";
  }

  const activityDateFrom = toSydneyComparable(subMinutes(activity.dateFrom, 10));
  const activityDateTo = toSydneyComparable(activity.dateTo);
  const nowInAustraliaTime = toSydneyComparable(now);

  if (activityDateFrom > nowInAustraliaTime) {
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
};

export function getActivityStatus(activity: AgendaProps) {
  return resolveActivityStatus(activity, new Date());
}

export function getActivityDetailStatus(activity: ShiftRosterType, now: Date) {
  return resolveActivityStatus(activity, now || new Date());
}

export function convertTo12HourFormat(time24: any) {
  const [hours, minutes] = time24.split(":");
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Handle 0 as 12
  return `${hours12}:${minutes} ${period}`;
}
