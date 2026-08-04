import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Users,
  CreditCard,
  TrendingUp,
  Brain,
  QrCode,
  UserPlus,
} from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import {
  StatCard,
  IconCircle,
  ListItem,
  Badge,
  SectionHeader,
} from "../components";
import { membersApi, attendanceApi, paymentsApi } from "../api";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../store/themeStore";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const colors = useTheme();
  const styles = getStyles(colors); // 👈 styles ab colors ke saath dynamically banti hain

  const [stats, setStats] = useState({
    todayCheckIns: 0,
    activeNow: 0,
    blocked: 0,
  });
  const [members, setMembers] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState({
    collectedTotal: 0,
    pendingTotal: 0,
  });
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [attStats, recentMembers, allMembers, pSummary] = await Promise.all(
        [
          attendanceApi.stats(),
          membersApi.getAll({ status: "active" }),
          membersApi.getAll(),
          paymentsApi.summary(),
        ],
      );
      setStats(attStats);
      setMembers(recentMembers.slice(0, 4));
      setTotalMembers(allMembers.length);
      setPaymentSummary(pSummary);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const pct =
    totalMembers > 0
      ? Math.round((stats.todayCheckIns / totalMembers) * 100)
      : 0;

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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.gymName}>{user?.gymName || "FlexOps Gym"}</Text>
        </View>
        <View style={styles.avatar}>
          <Text
            style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}
          >
            {user?.ownerName?.[0] || "A"}
          </Text>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Members"
          value={String(totalMembers)}
          icon={
            <IconCircle
              icon={<Users size={18} color={colors.primary} />}
              bg={colors.primaryDark}
              size={36}
            />
          }
          style={styles.statHalf}
        />
        <StatCard
          label="Active Today"
          value={String(stats.todayCheckIns)}
          icon={
            <IconCircle
              icon={<TrendingUp size={18} color={colors.success} />}
              bg={colors.successBg}
              size={36}
            />
          }
          style={styles.statHalf}
        />
        <StatCard
          label="Revenue Collected"
          value={`₹${paymentSummary.collectedTotal.toLocaleString("en-IN")}`}
          icon={
            <IconCircle
              icon={<CreditCard size={18} color={colors.warning} />}
              bg="#3D2E10"
              size={36}
            />
          }
          style={styles.statFull}
        />
      </View>

      {/* Attendance Ring */}
      <View style={styles.attendanceCard}>
        <Text style={styles.cardTitle}>Today's Attendance</Text>
        <View style={styles.ringContainer}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringValue}>{stats.todayCheckIns}</Text>
              <Text style={styles.ringLabel}>/ {totalMembers}</Text>
            </View>
          </View>
          <View style={styles.ringStats}>
            <Text style={styles.ringPercent}>{pct}%</Text>
            <Text style={styles.ringSubtext}>Members checked in today</Text>
            <Text
              style={[
                styles.ringSubtext,
                { color: colors.success, marginTop: 4 },
              ]}
            >
              {stats.activeNow} currently inside
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.quickActions}>
        {[
          {
            label: "Add Member",
            icon: <UserPlus size={22} color={colors.primary} />,
            bg: colors.primaryDark,
          },
          {
            label: "Scan QR",
            icon: <QrCode size={22} color={colors.success} />,
            bg: colors.successBg,
          },
          {
            label: "Payments",
            icon: <CreditCard size={22} color={colors.warning} />,
            bg: "#3D2E10",
          },
          {
            label: "Ask AI",
            icon: <Brain size={22} color={colors.purple} />,
            bg: colors.purpleBg,
          },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={styles.quickAction}
            activeOpacity={0.7}
          >
            <IconCircle icon={a.icon} bg={a.bg} />
            <Text style={styles.quickLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Members */}
      <SectionHeader title="Recent Active Members" />
      <View style={styles.card}>
        {members.length === 0 ? (
          <Text style={styles.empty}>No active members</Text>
        ) : (
          members.map((m, i) => (
            <View key={m._id}>
              <ListItem
                name={m.name}
                sub={`${m.currentPlan?.name || "Plan"} · Expires ${new Date(m.membershipEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                right={
                  <Badge
                    label={m.status === "active" ? "Active" : "Inactive"}
                    type={m.status === "active" ? "active" : "inactive"}
                  />
                }
              />
              {i < members.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// 👇 Ab ye ek FUNCTION hai jo colors leta hai aur styles return karta hai
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    greeting: { ...typography.caption, color: colors.textSecondary },
    gymName: { ...typography.h1, color: colors.textPrimary },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
    },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    statHalf: { flex: 1, minWidth: "45%" },
    statFull: { width: "100%" },
    attendanceCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 12,
    },
    cardTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    ringContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.lg,
    },
    ringOuter: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 10,
      borderColor: colors.border,
      borderTopColor: colors.primary,
      borderRightColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    ringInner: { alignItems: "center" },
    ringValue: { ...typography.h2, color: colors.textPrimary },
    ringLabel: { ...typography.caption, color: colors.textSecondary },
    ringStats: { flex: 1 },
    ringPercent: { ...typography.h2, color: colors.primary },
    ringSubtext: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    quickActions: { flexDirection: "row", justifyContent: "space-between" },
    quickAction: { alignItems: "center", gap: spacing.xs },
    quickLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    divider: { height: 1, backgroundColor: colors.border },
    empty: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.md,
    },
  });
}
