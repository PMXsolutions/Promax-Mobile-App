import React from "react";
import { StyleSheet, View } from "react-native";
import { Agenda, DateData } from "react-native-calendars";
import { formatInTimeZone } from "date-fns-tz";
import { addDays, addMonths, isBefore, subMonths } from "date-fns";
import { customTheme, THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import { AgendaProps, ShiftRosterType } from "@/types/shift";
import ShiftItem from "@/components/shift/shift-item";
import { Fontisto } from "@expo/vector-icons";
import { RefreshControl } from "react-native";

interface Props {
  shiftData: ShiftRosterType[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  onRefresh: () => Promise<void>;
}

interface AgendaItems {
  [date: string]: AgendaProps[];
}

const ShiftCalendar: React.FC<Props> = ({
  shiftData,
  isLoading,
  isRefetching,
  onRefresh,
}) => {
  const [items, setItems] = React.useState<AgendaItems>({}); // Add proper typing to `items`.

  const aus_timezone = "Australia/Sydney";

  const formattedTime = (timeVal: Date) => {
    return formatInTimeZone(timeVal, aus_timezone, "yyyy-MM-dd"); // Ensure proper time formatting.
  };

  React.useEffect(() => {
    if (shiftData && Array.isArray(shiftData)) {
      loadItems(subMonths(new Date(), 1)); // Pass a Date object.
    }
  }, [shiftData]);

  const loadItems = (startDate: Date) => {
    const newItems: AgendaItems = {};

    if (shiftData && Array.isArray(shiftData)) {
      // Populate shifts into the items structure
      shiftData.forEach((shift) => {
        const date = formattedTime(new Date(shift.dateFrom)); // Ensure `dateFrom` is a Date object.
        if (!newItems[date]) {
          newItems[date] = [];
        }

        newItems[date].push({
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

      // Fill in empty dates.
      const endDate = addMonths(new Date(), 1);
      for (let m = startDate; isBefore(m, endDate); m = addDays(m, 1)) {
        const date = formattedTime(m);
        if (!newItems[date]) {
          newItems[date] = [];
        }
      }
    }

    // setItems(newItems);
    setItems((prevItems) => ({ ...prevItems, ...newItems }));
  };

  const renderItem = React.useCallback((item: AgendaProps) => {
    return <ShiftItem item={item} />;
  }, []);

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text size="md" weight="medium">
          No Shift
        </Text>
      </View>
    );
  };

  return (
    <Agenda
      contentContainerStyle={{ backgroundColor: THEME.colors.white }}
      // contentContainerStyle={{
      //   backgroundColor: THEME.colors.white,
      //   minHeight: 100,
      //   flexGrow: 1,
      // }}
      renderKnob={() => {
        return (
          <Fontisto name="caret-down" size={20} color={THEME.colors.grayBg} />
        );
      }}
      items={items}
      loadItemsForMonth={(day: DateData) => loadItems(new Date(day.dateString))} // Convert dateString to Date.
      selected={formattedTime(new Date())}
      renderItem={renderItem}
      renderEmptyDate={renderEmptyDate}
      pastScrollRange={1}
      futureScrollRange={1}
      displayLoadingIndicator={isLoading}
      ListEmptyComponent={renderEmptyDate}
      theme={customTheme}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          progressBackgroundColor={"#fff"}
          colors={[THEME.colors.primary]}
          onRefresh={onRefresh}
        />
      }
    />
  );
};

export default ShiftCalendar;

const styles = StyleSheet.create({
  emptyDate: {
    padding: THEME.spacing.sm,
    marginTop: 20,
    borderRadius: 5,
    marginRight: THEME.spacing.sm,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    justifyContent: "center",
    borderColor: THEME.colors.border,
  },
});
