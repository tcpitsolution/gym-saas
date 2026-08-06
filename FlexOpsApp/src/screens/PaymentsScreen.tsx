import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { TrendingUp, TrendingDown, CheckCircle } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { Badge, SectionHeader } from "../components";
import { paymentsApi } from "../api";
import { useTheme } from "../store/themeStore";
import { useNavigationStore } from "../store/navigationStore";
import AppAlert from "../components/AppAlert";

const tabs = ["All", "Paid", "Pending"];

export default function PaymentsScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const { screen } = useNavigationStore();

  const [tab, setTab] = useState("All");
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    collectedTotal: 0,
    pendingTotal: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const status = tab === "All" ? undefined : tab.toLowerCase();
      const [data, sum] = await Promise.all([
        paymentsApi.getAll({ status }),
        paymentsApi.summary(),
      ]);
      setPayments(data);
      setSummary(sum);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [tab]);

  // Re-fetch every time this screen becomes active
  useEffect(() => {
    if (screen === "payments") {
      setLoading(true);
      load();
    }
  }, [screen]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await paymentsApi.markPaid(id);
      load();
    } catch (err: any) {
      setAlertMsg(err.message || "Failed to mark as paid");
      setAlertVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>Payments</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: colors.success }]}>
          <TrendingUp size={20} color={colors.success} />
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            ₹{summary.collectedTotal.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.error }]}>
          <TrendingDown size={20} color={colors.error} />
          <Text style={styles.summaryLabel}>
            Pending ({summary.pendingCount})
          </Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            ₹{summary.pendingTotal.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      <SectionHeader title={`Transactions (${payments.length})`} />
      <View style={styles.card}>
        {payments.length === 0 ? (
          <Text style={styles.empty}>No transactions found</Text>
        ) : (
          payments.map((p, i) => (
            <View key={p._id}>
              <View style={styles.txRow}>
                <View style={styles.txAvatar}>
                  <Text style={styles.txAvatarText}>
                    {p.memberId?.name?.[0] || "?"}
                  </Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>
                    {p.memberId?.name || "Unknown"}
                  </Text>
                  <Text style={styles.txSub}>
                    {p.planId?.name || "Plan"} ·{" "}
                    {new Date(p.date || p.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" },
                    )}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>
                    ₹{p.amount?.toLocaleString("en-IN")}
                  </Text>
                  {p.status === "pending" ? (
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(p._id)}
                      style={styles.markPaidBtn}
                    >
                      <CheckCircle size={14} color={colors.success} />
                      <Text style={styles.markPaidText}>Mark Paid</Text>
                    </TouchableOpacity>
                  ) : (
                    <Badge label="Paid" type="active" />
                  )}
                </View>
              </View>
              {i < payments.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>
      <AppAlert
        visible={alertVisible}
        type="error"
        title="Error"
        message={alertMsg}
        confirmLabel="OK"
        onConfirm={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
}

// Styles function — receives colors and returns StyleSheet
function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    summaryRow: { flexDirection: "row", gap: 12, marginBottom: spacing.md },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      gap: spacing.xs,
    },
    summaryLabel: { ...typography.caption, color: colors.textSecondary },
    summaryValue: { ...typography.h2 },
    tabs: { flexDirection: "row", gap: spacing.sm },
    tab: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabActive: {
      backgroundColor: colors.primaryDark,
      borderColor: colors.primary,
    },
    tabText: { ...typography.body, color: colors.textSecondary },
    tabTextActive: { color: colors.primary, fontWeight: "600" },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    txRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    txAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
    },
    txAvatarText: { ...typography.h3, color: colors.primary },
    txInfo: { flex: 1 },
    txName: { ...typography.h3, color: colors.textPrimary },
    txSub: { ...typography.caption, color: colors.textSecondary },
    txRight: { alignItems: "flex-end", gap: 4 },
    txAmount: { ...typography.h3, color: colors.textPrimary },
    markPaidBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
    markPaidText: { ...typography.caption, color: colors.success },
    divider: { height: 1, backgroundColor: colors.border },
    empty: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.lg,
    },
  });
}
