import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import Text from "@/components/shared/text";
import { policyService, StaffPolicy } from "@/services/policy";
import { THEME } from "@/constants/theme";

export default function MyPolicies() {
  const [rows, setRows] = useState<StaffPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const load = async () => { setLoading(true); try { setRows(await policyService.mine()); } catch { Alert.alert("Policies unavailable", "Please try again. Your shift is not affected."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const openPolicy = async (row: StaffPolicy) => {
    if (!row.policyUrl) return Alert.alert("File unavailable", "Ask your organisation to attach the current policy file.");
    setBusy(row.userPolicyConsentId);
    try { await policyService.viewed(row.userPolicyConsentId); await Linking.openURL(row.policyUrl); await load(); }
    catch { Alert.alert("Unable to open", "Please try again or contact your organisation."); }
    finally { setBusy(null); }
  };
  const acknowledge = async (row: StaffPolicy) => {
    setBusy(row.userPolicyConsentId);
    try { await policyService.acknowledge(row.userPolicyConsentId); await load(); Alert.alert("Acknowledged", "Your acknowledgement has been recorded with the policy version and time."); }
    catch { Alert.alert("Open the policy first", "Read the policy before acknowledging it."); }
    finally { setBusy(null); }
  };
  return <ScreenWrapper barStyle="dark-content"><HeaderWhite name="Policies for me" /><ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
    <View style={styles.hero}><MaterialCommunityIcons name="shield-check-outline" size={30} color="#99f6e4" /><View style={{ flex: 1 }}><Text size="xl" weight="bold" color="#fff">Read, understand, acknowledge</Text><Text size="sm" color="#dbeafe" style={{ marginTop: 5, lineHeight: 20 }}>Only policies assigned to your account and organisation appear here.</Text></View></View>
    {loading && !rows.length ? <ActivityIndicator color={THEME.colors.primary} size="large" /> : rows.length ? rows.map((row) => <View key={row.userPolicyConsentId} style={styles.card}><View style={styles.row}><View style={{ flex: 1 }}><Text weight="bold">{row.policyName}</Text><Text size="xs" color="#64748b" style={{ marginTop: 4 }}>{row.category || "Organisation policy"}{row.version ? ` · Version ${row.version}` : ""}</Text></View><View style={[styles.status, row.consent ? styles.done : styles.due]}><Text size="xs" weight="bold" color={row.consent ? "#047857" : "#92400e"}>{row.consent ? "ACKNOWLEDGED" : "ACTION DUE"}</Text></View></View><TouchableOpacity style={styles.open} disabled={busy !== null} onPress={() => void openPolicy(row)}><MaterialCommunityIcons name="file-eye-outline" size={20} color="#102a56" /><Text weight="semiBold" color="#102a56">Open and read policy</Text></TouchableOpacity>{!row.consent && <TouchableOpacity style={[styles.ack, !row.viewedDate && styles.disabled]} disabled={busy !== null || !row.viewedDate} onPress={() => void acknowledge(row)}><Text weight="bold" color="#fff">I have read and understood</Text></TouchableOpacity>}</View>) : <View style={styles.empty}><MaterialCommunityIcons name="file-check-outline" size={38} color="#94a3b8" /><Text weight="semiBold">No policies are awaiting you</Text></View>}
    <Text size="xs" color="#64748b" style={styles.note}>Policy viewing and acknowledgement are recorded separately from attendance and will never block clock-in or clock-out.</Text>
  </ScrollView></ScreenWrapper>;
}

const styles = StyleSheet.create({ page: { padding: 16, paddingBottom: 40, gap: 14 }, hero: { flexDirection: "row", gap: 14, borderRadius: 18, padding: 20, backgroundColor: "#111442" }, card: { gap: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff", padding: 16 }, row: { flexDirection: "row", alignItems: "flex-start", gap: 10 }, status: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }, done: { backgroundColor: "#d1fae5" }, due: { backgroundColor: "#fef3c7" }, open: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, borderColor: "#102a56", padding: 13 }, ack: { alignItems: "center", borderRadius: 12, backgroundColor: "#0f766e", padding: 14 }, disabled: { backgroundColor: "#94a3b8" }, empty: { alignItems: "center", gap: 10, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff", padding: 30 }, note: { textAlign: "center", lineHeight: 18 }, });
