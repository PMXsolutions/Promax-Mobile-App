import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import Text from "@/components/shared/text";
import ErrorState from "@/components/shared/error-state";
import useAuthStore from "@/store/use-auth-store";
import { THEME } from "@/constants/theme";
import {
  STAFF_READ_LABELS,
  StaffReadWorkflow,
  StaffWorkflowRow,
} from "@/libs/staff-workflow-contract";
import { loadStaffWorkflow } from "@/services/staff-workflows";
import { staffRowAccessibility } from "@/libs/staff-work-a11y";

const LABELS = STAFF_READ_LABELS as Record<string, string>;

function messageFor(code: string) {
  if (code === "denied") return "This staff read is not available for the signed-in account.";
  if (code === "missing-session") return "Sign in again before opening this staff list.";
  if (code === "unexpected-shape") return "The staff list came back in an unexpected shape, so nothing was shown.";
  if (code === "blocked" || code === "unknown") return "This staff workflow is not opened from the mobile app yet.";
  return "This staff list could not be loaded. Nothing was saved.";
}

export default function StaffWorkflowList() {
  const { workflow } = useLocalSearchParams<{ workflow: string }>();
  const name = LABELS[workflow] ?? "Staff work";
  const { staff, user } = useAuthStore();
  const [rows, setRows] = useState<StaffWorkflowRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await loadStaffWorkflow(workflow, {
      staffId: staff?.staffId,
      userId: user?.userId,
      companyId: user?.companyId,
      staffName: staff?.fullName || user?.fullName,
    });
    if (!result.ok) {
      setRows([]);
      setError(messageFor(result.code));
    } else {
      setRows(result.rows);
    }
    setLoading(false);
  }, [workflow, staff?.staffId, staff?.fullName, user?.userId, user?.companyId, user?.fullName]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name={name} />
      {loading ? (
        <ActivityIndicator
          color={THEME.colors.primary}
          style={styles.loader}
          accessibilityLabel="Loading staff list"
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.page}
          ListEmptyComponent={
            <Text style={styles.empty} accessibilityRole="text">
              No records for this signed-in staff member.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row} {...staffRowAccessibility(item)}>
              <Text weight="semiBold">{item.title}</Text>
              {item.detail ? (
                <Text size="sm" style={styles.detail}>
                  {item.detail}
                </Text>
              ) : null}
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  page: { padding: 16, gap: 10 },
  empty: { padding: 16, lineHeight: 20 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 4,
  },
  detail: { color: "#475569" },
});
