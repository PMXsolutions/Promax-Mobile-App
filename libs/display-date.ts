import { formattedTime } from "@/helpers/shift-service";

export function displaySydneyDate(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formattedTime(date, "d MMMM, yyyy");
}
