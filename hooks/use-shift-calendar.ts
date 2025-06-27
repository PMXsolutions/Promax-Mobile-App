"use client";

import { useState, useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { AgendaProps, ShiftRosterType } from "@/types/shift";

interface UseShiftCalendarProps {
  shiftData: ShiftRosterType[];
  timezone?: string;
}

interface GroupedShifts {
  [date: string]: AgendaProps[];
}

export const useShiftCalendar = ({
  shiftData,
  timezone = "Australia/Sydney",
}: UseShiftCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  const formattedTime = (timeVal: Date) => {
    return formatInTimeZone(timeVal, timezone, "yyyy-MM-dd");
  };

  // Group shifts by date
  const groupedShifts = useMemo((): GroupedShifts => {
    const grouped: GroupedShifts = {};

    if (shiftData && Array.isArray(shiftData)) {
      shiftData.forEach((shift) => {
        const date = formattedTime(shift.dateFrom);
        if (!grouped[date]) {
          grouped[date] = [];
        }

        grouped[date].push({
          shiftRosterId: shift.shiftRosterId,
          staff: shift.staff.fullName,
          staffFirstName: shift.staff?.firstName,
          staffLastName: shift.staff?.middleName!,
          staffImage: shift.staff?.imageUrl!,
          client: shift.clients,
          activities: shift.activities,
          dateFrom: shift.dateFrom,
          dateTo: shift.dateTo,
          status: shift.status,
          isEnded: shift.isEnded,
          attendance: shift.attendance,
          image: shift.profile?.imageUrl,
        });
      });
    }

    return grouped;
  }, [shiftData, timezone]);

  // Get dates to display based on view mode
  const displayDates = useMemo(() => {
    if (viewMode === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else {
      return eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      });
    }
  }, [selectedDate, currentMonth, viewMode]);

  // Get shifts for selected date
  const selectedDateShifts = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return groupedShifts[dateKey] || [];
  }, [groupedShifts, selectedDate]);

  // Navigation functions
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth =
      direction === "next"
        ? addDays(currentMonth, 32)
        : addDays(currentMonth, -32);
    setCurrentMonth(startOfMonth(newMonth));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "week" ? "month" : "week"));
  };

  // Get shifts count for a specific date
  const getShiftsCountForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return groupedShifts[dateKey]?.length || 0;
  };

  // Check if date has shifts
  const hasShiftsOnDate = (date: Date) => {
    return getShiftsCountForDate(date) > 0;
  };

  return {
    // State
    selectedDate,
    currentMonth,
    viewMode,

    // Computed
    groupedShifts,
    displayDates,
    selectedDateShifts,

    // Actions
    navigateMonth,
    goToToday,
    selectDate,
    toggleViewMode,

    // Helpers
    getShiftsCountForDate,
    hasShiftsOnDate,
    formattedTime,
  };
};
