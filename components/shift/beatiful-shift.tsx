import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Text from "../shared/text";
import { AgendaProps } from "@/types/shift";
import { FlashList } from "@shopify/flash-list";
import UpdatedShiftItem from "./updated-shift-item";
import { formatInTimeZone } from "date-fns-tz";
import {
  addRosterDays,
  rosterDateKey,
  startOfRosterMonth,
  startOfRosterWeek,
  ROSTER_TIMEZONE,
} from "@/helpers/shift-service";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
const CALENDAR_HEIGHT = 100;
const ROW_HEIGHT = 370;
interface Props {
  shiftData: AgendaProps[];
  isRefetching: boolean;
  onRefresh: () => Promise<void>;
}
type SupportedFormat = "MMMM yyyy" | "EEEE, MMMM d" | "EEE" | "d" | "HH:mm";

const BeautifulCalendarAgenda: React.FC<Props> = ({
  shiftData,
  isRefetching,
  onRefresh,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");

  const animatedHeight = useSharedValue(CALENDAR_HEIGHT);
  // Format time helper;
  const formatDate = (date: Date, format: SupportedFormat) =>
    formatInTimeZone(date, ROSTER_TIMEZONE, format);

  const isSameDay = (a: Date, b: Date) => rosterDateKey(a) === rosterDateKey(b);
  const isToday = (date: Date) => rosterDateKey(date) === rosterDateKey(new Date());
  const isBefore = (a: Date, b: Date) => rosterDateKey(a) < rosterDateKey(b);
  const getRosterDateKey = (date: Date | string | number) => rosterDateKey(date);

  const groupedShifts = useMemo(() => {
    const grouped: { [date: string]: AgendaProps[] } = {};
    shiftData.forEach((shift) => {
      const dateKey = getRosterDateKey(shift.dateFrom);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(shift);
    });
    return grouped;
  }, [shiftData]);

  const displayDates = useMemo(() => {
    if (viewMode === "week") {
      const start = startOfRosterWeek(selectedDate);
      return Array.from({ length: 7 }, (_, i) => addRosterDays(start, i));
    } else {
      const start = startOfRosterMonth(selectedDate);
      const [year, month] = rosterDateKey(start).split("-").map(Number);
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const sundayIndex =
        Number(formatInTimeZone(start, ROSTER_TIMEZONE, "i")) % 7;
      const totalCells = Math.ceil((sundayIndex + daysInMonth) / 7) * 7;
      const firstDate = addRosterDays(start, -sundayIndex);

      return Array.from({ length: totalCells }, (_, i) =>
        addRosterDays(firstDate, i)
      );
    }
  }, [selectedDate, viewMode]);
  const calendarRows = useMemo(() => {
    return viewMode === "month" ? displayDates.length / 7 : 1;
  }, [displayDates, viewMode]);

  const selectedDateShifts = useMemo(() => {
    const key = getRosterDateKey(selectedDate);
    return groupedShifts[key] || [];
  }, [groupedShifts, selectedDate]);

  const navigateDate = (direction: "next" | "prev") => {
    const increment = direction === "next" ? 1 : -1;

    const newDate =
      viewMode === "week"
        ? addRosterDays(selectedDate, 7 * increment)
        : addRosterDays(startOfRosterMonth(selectedDate), 32 * increment);

    setSelectedDate(newDate);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    const newMode = viewMode === "week" ? "month" : "week";
    setViewMode(newMode);

    requestAnimationFrame(() => {
      const targetHeight =
        newMode === "month" ? calendarRows * ROW_HEIGHT : CALENDAR_HEIGHT;
      animatedHeight.value = withSpring(targetHeight);
    });
  };

  const animatedCalendarStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const renderShiftItem = ({ item }: { item: AgendaProps }) => (
    <UpdatedShiftItem item={item} />
  );
  const renderEmptyShifts = () => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: THEME.spacing.xxl,
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.lg,
        marginTop: THEME.spacing.md,
      }}
    >
      <View
        style={{
          backgroundColor: THEME.colors.gray[100],
          borderRadius: THEME.borderRadius.full,
          padding: THEME.spacing.lg,
          marginBottom: THEME.spacing.md,
        }}
      >
        <Feather name="calendar" size={32} color={THEME.colors.gray[400]} />
      </View>
      <Text
        weight="semiBold"
        style={{
          fontSize: 18,
          color: THEME.colors.gray[600],
          marginBottom: THEME.spacing.xs,
        }}
      >
        No shifts scheduled
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: THEME.colors.gray[500],
          textAlign: "center",
        }}
      >
        Enjoy your day off on {formatDate(selectedDate, "EEEE, MMMM d")}
      </Text>
    </View>
  );

  const DateCell = ({ date }: { date: Date }) => {
    const key = getRosterDateKey(date);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);
    const isPast = isBefore(date, new Date()) && !isCurrentDay;
    const hasShifts = (groupedShifts[key] || []).length > 0;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDate(date);
          if (viewMode === "month") {
            setViewMode("week");

            // Optionally reset height animation to week view
            animatedHeight.value = withSpring(CALENDAR_HEIGHT);
          }
        }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: THEME.spacing.md,
          marginHorizontal: 2,
          borderRadius: THEME.borderRadius.md,
          backgroundColor: isSelected
            ? THEME.colors.primary
            : isCurrentDay
            ? THEME.colors.primary + "20"
            : "transparent",
          minHeight: 70,
          position: "relative",
        }}
        activeOpacity={0.7}
      >
        <Text
          weight={isSelected ? "bold" : "semiBold"}
          style={{
            fontSize: 18,

            color: isSelected
              ? THEME.colors.white
              : isCurrentDay
              ? THEME.colors.primary
              : isPast
              ? THEME.colors.gray[400]
              : THEME.colors.black,
            marginBottom: 2,
          }}
        >
          {formatDate(date, "d")}
        </Text>

        <Text
          weight="medium"
          style={{
            fontSize: 12,
            color: isSelected
              ? THEME.colors.white + "CC"
              : isPast
              ? THEME.colors.gray[400]
              : THEME.colors.gray[600],
          }}
        >
          {formatDate(date, "EEE")}
        </Text>

        {hasShifts && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: isSelected
                ? THEME.colors.white
                : THEME.colors.secondary,
              borderRadius: THEME.borderRadius.full,
              minWidth: 20,
              height: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              weight="bold"
              style={{
                color: isSelected ? THEME.colors.primary : THEME.colors.white,
                fontSize: 10,
              }}
            >
              {groupedShifts[key].length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.grayBg }}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.white} />

      {/* Header */}
      <View
        style={{
          backgroundColor: THEME.colors.white,
          paddingHorizontal: THEME.spacing.md,
          paddingVertical: THEME.spacing.md,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: THEME.spacing.xs,
            }}
          >
            <TouchableOpacity
              onPress={() => navigateDate("prev")}
              style={{
                padding: THEME.spacing.sm,
                borderRadius: THEME.borderRadius.sm,
                backgroundColor: THEME.colors.gray[100],
              }}
            >
              <Feather
                name="chevron-left"
                size={20}
                color={THEME.colors.primary}
              />
            </TouchableOpacity>

            <Text
              weight="bold"
              style={{
                fontSize: 18,
                color: THEME.colors.black,
                // minWidth: 120,
                textAlign: "center",
              }}
            >
              {formatDate(selectedDate, "MMMM yyyy")}
            </Text>

            <TouchableOpacity
              onPress={() => navigateDate("next")}
              style={{
                padding: THEME.spacing.sm,
                borderRadius: THEME.borderRadius.sm,
                backgroundColor: THEME.colors.gray[100],
              }}
            >
              <Feather
                name="chevron-right"
                size={20}
                color={THEME.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              paddingHorizontal: THEME.spacing.md,
              paddingVertical: THEME.spacing.sm,
              borderRadius: THEME.borderRadius.sm,
              backgroundColor: THEME.colors.primary + "20",
              flexDirection: "row",
              alignItems: "center",
              gap: THEME.spacing.xs,
            }}
            onPress={toggleViewMode}
          >
            <Feather name="calendar" size={16} color={THEME.colors.primary} />
            <Text
              weight="semiBold"
              style={{
                fontSize: 14,
                color: THEME.colors.primary,
              }}
            >
              {viewMode === "week" ? "Week" : "Month"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar */}
      <Animated.View style={[styles.calendar, animatedCalendarStyle]}>
        {viewMode === "week" ? (
          <View style={{ flexDirection: "row", padding: 12 }}>
            {displayDates.map((date) => (
              <DateCell key={date.toISOString()} date={date} />
            ))}
          </View>
        ) : (
          <View style={{ flexWrap: "wrap", flexDirection: "row", padding: 12 }}>
            {displayDates.map((date) => (
              <View style={{ width: `${100 / 7}%` }} key={date.toISOString()}>
                <DateCell date={date} />
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Selected Date Header */}
      <View
        style={{
          backgroundColor: THEME.colors.white,
          padding: THEME.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: THEME.colors.grayBg,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          weight="semiBold"
          style={{ fontSize: 18, color: THEME.colors.black }}
        >
          {formatDate(selectedDate, "EEEE, MMMM d")}
        </Text>
        {selectedDateShifts.length > 0 && (
          <View
            style={{
              backgroundColor: THEME.colors.primary + "20",
              paddingHorizontal: THEME.spacing.sm,
              paddingVertical: THEME.spacing.xs,
              borderRadius: THEME.borderRadius.sm,
              flexDirection: "row",
              alignItems: "center",
              gap: THEME.spacing.xs,
            }}
          >
            <Feather name="users" size={14} color={THEME.colors.primary} />
            <Text
              weight="semiBold"
              style={{
                fontSize: 14,
                color: THEME.colors.primary,
              }}
            >
              {selectedDateShifts.length} shift
              {selectedDateShifts.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>

      {/* Shift List */}

      <View style={styles.shiftsContainer}>
        <FlashList
          ListHeaderComponent={() =>
            !isRefetching && (
              <Text
                style={{
                  textAlign: "center",
                  paddingBottom: 8,
                  color: THEME.colors.gray[400],
                  fontSize: 12,
                }}
              >
                Pull down to refresh
              </Text>
            )
          }
          data={selectedDateShifts}
          renderItem={renderShiftItem}
          keyExtractor={(shift: AgendaProps) => shift.shiftRosterId.toString()}
          estimatedItemSize={80}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyShifts}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              progressBackgroundColor="#fff"
              colors={[THEME.colors.primary]}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={styles.shiftsContent}
        />
      </View>
    </View>
  );
};

export default BeautifulCalendarAgenda;
const THEME = {
  colors: {
    primary: "#030637", // Indigo
    secondary: "#FCBA34", // Pink
    success: "#10b981", // Green
    warning: "#f59e0b", // Amber
    error: "#ef4444", // Red
    white: "#ffffff",
    black: "#1f2937",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    grayBg: "#e5e7eb",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
const styles = StyleSheet.create({
  shiftsContainer: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.gray[100],
  },
  shiftsContent: {
    paddingHorizontal: THEME.spacing.md,
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: THEME.spacing.sm,
    marginHorizontal: 2,
    borderRadius: 8,
    minHeight: 60,
  },
  monthDateItem: {
    minHeight: 40,
  },
  selectedDateItem: {
    backgroundColor: THEME.colors.primary,
  },
  todayDateItem: {
    backgroundColor: THEME.colors.secondary,
  },
  dateNumber: {
    color: THEME.colors.success,
  },
  selectedDateText: {
    color: THEME.colors.white,
  },
  todayDateText: {
    color: THEME.colors.white,
  },
  pastDateText: {
    color: THEME.colors.grayBg,
  },
  calendar: {
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.grayBg,
  },
  calendarContent: {
    paddingHorizontal: THEME.spacing.xs,
  },
  dayName: {
    color: THEME.colors.grayBg,
    marginTop: 2,
  },
  selectedDayName: {
    color: THEME.colors.white,
  },
  shiftIndicator: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  selectedShiftIndicator: {
    backgroundColor: THEME.colors.white,
  },

  selectedShiftCount: {
    color: THEME.colors.primary,
  },
});
