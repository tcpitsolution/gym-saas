import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking,
} from "react-native";
import {
  Users, CreditCard, TrendingUp, Brain, ScanFace, UserPlus,
  AlertCircle, Clock, Star, Zap, Shield, BarChart2, Smartphone, Award,
} from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { StatCard, IconCircle, ListItem, Badge, SectionHeader } from "../components";
import { membersApi, attendanceApi, paymentsApi } from "../api";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../store/themeStore";
import { useNavigationStore } from "../store/navigationStore";
import AppAlert from "../components/AppAlert";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const colors = useTheme();
  const s = getStyles(colors);
  const { setScreen } = useNavigationStore();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning ☀️";
    if (h < 17) return "Good Afternoon 🌤️";
    if (h < 21) return "Good Evening 🌆";
    return "Good Night 🌙";
  };

  const [stats, setStats] = useState({ todayCheckIns: 0, activeNow: 0, blocked: 0 });
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [expiredMembers, setExpiredMembers] = useState<any[]>([]);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState({ collectedTotal: 0, pendingTotal: 0 });
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [renewLoading, setRenewLoading] = useState<string | null>(null);
  const [showAllAttendance, setShowAllAttendance] = useState(false);

  // Alert
  const [alert, setAlert] = useState<{
    visible: boolean; type: "success" | "error" | "warning" | "info";
    title: string; message?: string;
  }>({ visible: false, type: "info", title: "" });
  const showAlert = (type: "success" | "error" | "warning" | "info", title: string, message?: string) =>
    setAlert({ visible: true, type, title, message });

  const load = useCallback(async () => {
    try {
      const [attStats, todayAtt, active, all, pSummary, expired, expiring] = await Promise.all([
        attendanceApi.stats(),
        attendanceApi.today(),
        membersApi.getAll({ status: "active" }),
        membersApi.getAll(),
        paymentsApi.summary(),
        membersApi.getAll({ status: "expired" }),
        membersApi.getAll({ status: "active" }),
      ]);
      setStats(attStats);
      setTodayLogs(todayAtt);
      setRecentMembers(active.slice(0, 4));
      setTotalMembers(all.length);
      setPaymentSummary(pSummary);
      setExpiredMembers(expired.slice(0, 5));
      // Filter active members expiring within 7 days
      const soon = expiring.filter((m: any) => {
        if (!m.membershipEnd) return false;
        const days = Math.ceil((new Date(m.membershipEnd).getTime() - Date.now()) / 86400000);
        return days >= 0 && days <= 7;
      }).slice(0, 5);
      setExpiringMembers(soon);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const pct = totalMembers > 0 ? Math.round((stats.todayCheckIns / totalMembers) * 100) : 0;

  // Mark a renewal payment as collected (paid)
  const handleCollect = async (member: any) => {
    setRenewLoading(member._id + "_collect");
    try {
      // Create a renewal with the same plan, mark as paid
      await membersApi.renew(member._id, {
        planId: member.currentPlan?._id,
        startDate: new Date().toISOString(),
        amount: member.currentPlan?.price || 0,
        mode: "cash",
      });
      showAlert("success", "Fees Collected!", `${member.name}'s membership has been renewed.`);
      load();
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Failed to collect fees");
    } finally {
      setRenewLoading(null);
    }
  };

  // Mark renewal as pending payment
  const handleMarkPending = async (member: any) => {
    setRenewLoading(member._id + "_pending");
    try {
      await membersApi.renew(member._id, {
        planId: member.currentPlan?._id,
        startDate: new Date().toISOString(),
        amount: 0,
        mode: "cash",
        status: "pending",
      });
      showAlert("info", "Marked Pending", `${member.name}'s renewal marked as pending payment.`);
      load();
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Failed to mark pending");
    } finally {
      setRenewLoading(null);
    }
  };

  const quickActions = [
    { label: "Add Member", icon: <UserPlus size={22} color={colors.primary} />, bg: colors.primaryDark, onPress: () => setScreen("addMember") },
    { label: "Attendance", icon: <ScanFace size={22} color={colors.success} />, bg: colors.successBg, onPress: () => setScreen("attendance", { autoScan: true }) },
    { label: "Payments", icon: <CreditCard size={22} color={colors.warning} />, bg: "#3D2E10", onPress: () => setScreen("payments") },
    { label: "Ask AI", icon: <Brain size={22} color={colors.purple} />, bg: colors.purpleBg, onPress: () => setScreen("askai") },
  ];

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.gymName}>{user?.gymName || "FlexOps Gym"}</Text>
          </View>
          <View style={s.avatar}>
            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}>
              {user?.ownerName?.[0]?.toUpperCase() || "A"}
            </Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={s.statsGrid}>
          <StatCard
            label="Total Members" value={String(totalMembers)}
            icon={<IconCircle icon={<Users size={18} color={colors.primary} />} bg={colors.primaryDark} size={36} />}
            style={s.statHalf}
          />
          <StatCard
            label="Active Today" value={String(stats.todayCheckIns)}
            icon={<IconCircle icon={<TrendingUp size={18} color={colors.success} />} bg={colors.successBg} size={36} />}
            style={s.statHalf}
          />
          <StatCard
            label="Revenue Collected" value={`₹${paymentSummary.collectedTotal.toLocaleString("en-IN")}`}
            icon={<IconCircle icon={<CreditCard size={18} color={colors.warning} />} bg="#3D2E10" size={36} />}
            style={s.statHalf}
          />
          <StatCard
            label="Pending Fees" value={`₹${paymentSummary.pendingTotal.toLocaleString("en-IN")}`}
            icon={<IconCircle icon={<AlertCircle size={18} color={colors.error} />} bg="rgba(229,57,53,0.15)" size={36} />}
            style={s.statHalf}
          />
        </View>

        {/* Attendance Card */}
        <View style={s.attendanceCard}>
          <View style={s.attCardHeader}>
            <Text style={s.cardTitle}>Today's Attendance</Text>
            <View style={s.attBadge}>
              <Text style={s.attBadgeText}>{stats.todayCheckIns} checked in</Text>
            </View>
          </View>

          {/* Ring + summary */}
          <View style={s.ringContainer}>
            <View style={s.ringOuter}>
              <View style={s.ringInner}>
                <Text style={s.ringValue}>{stats.todayCheckIns}</Text>
                <Text style={s.ringLabel}>/ {totalMembers}</Text>
              </View>
            </View>
            <View style={s.ringStats}>
              <Text style={s.ringPercent}>{pct}%</Text>
              <Text style={s.ringSubtext}>Members checked in today</Text>
              <Text style={[s.ringSubtext, { color: colors.success, marginTop: 4 }]}>
                {stats.activeNow} currently inside
              </Text>
            </View>
          </View>

          {/* Today's check-in list */}
          {todayLogs.length > 0 && (
            <>
              <View style={s.attDivider} />
              {(showAllAttendance ? todayLogs : todayLogs.slice(0, 5)).map((log, i) => {
                const member = log.memberId;
                const name = member?.name || "Unknown";
                const time = new Date(log.checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                return (
                  <View key={log._id}>
                    <View style={s.attRow}>
                      <View style={s.attAvatar}>
                        <Text style={s.attAvatarText}>{name[0]?.toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.attName}>{name}</Text>
                        {member?.phone ? <Text style={s.attSub}>{member.phone}</Text> : null}
                      </View>
                      <Text style={s.attTime}>{time}</Text>
                    </View>
                    {i < (showAllAttendance ? todayLogs : todayLogs.slice(0, 5)).length - 1 && <View style={s.divider} />}
                  </View>
                );
              })}
              {todayLogs.length > 5 && (
                <TouchableOpacity
                  style={s.viewAllBtn}
                  onPress={() => setShowAllAttendance(v => !v)}
                >
                  <Text style={[s.viewAllText, { color: colors.primary }]}>
                    {showAllAttendance ? "Show less ↑" : `View all ${todayLogs.length} →`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {todayLogs.length === 0 && (
            <Text style={[s.empty, { marginTop: spacing.sm }]}>No check-ins yet today</Text>
          )}
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={s.quickActions}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={s.quickAction} activeOpacity={0.7} onPress={a.onPress}>
              <IconCircle icon={a.icon} bg={a.bg} />
              <Text style={s.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Expired Members ── */}
        {expiredMembers.length > 0 && (
          <>
            <SectionHeader title={`Fees Expired (${expiredMembers.length})`} />
            <View style={[s.alertCard, { borderColor: `${colors.error}40` }]}>
              <View style={s.alertCardHeader}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={[s.alertCardTitle, { color: colors.error }]}>
                  These members' fees have expired — collect or mark pending
                </Text>
              </View>
              {expiredMembers.map((m, i) => (
                <View key={m._id}>
                  <View style={s.expiryRow}>
                    <View style={s.expiryAvatar}>
                      <Text style={[s.expiryAvatarText, { color: colors.error }]}>
                        {m.name?.[0]?.toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View style={s.expiryInfo}>
                      <Text style={s.expiryName}>{m.name}</Text>
                      <Text style={s.expirySub}>
                        {m.currentPlan?.name || "Plan"} · Expired {
                          m.membershipEnd
                            ? new Date(m.membershipEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                            : "—"
                        }
                      </Text>
                    </View>
                    <View style={s.expiryBtns}>
                      <TouchableOpacity
                        style={[s.feeBtn, { backgroundColor: `${colors.success}18`, borderColor: `${colors.success}40` }]}
                        onPress={() => handleCollect(m)}
                        disabled={renewLoading === m._id + "_collect"}
                        activeOpacity={0.8}
                      >
                        {renewLoading === m._id + "_collect"
                          ? <ActivityIndicator size="small" color={colors.success} />
                          : <Text style={[s.feeBtnText, { color: colors.success }]}>Collected</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.feeBtn, { backgroundColor: `${colors.warning}18`, borderColor: `${colors.warning}40` }]}
                        onPress={() => handleMarkPending(m)}
                        disabled={renewLoading === m._id + "_pending"}
                        activeOpacity={0.8}
                      >
                        {renewLoading === m._id + "_pending"
                          ? <ActivityIndicator size="small" color={colors.warning} />
                          : <Text style={[s.feeBtnText, { color: colors.warning }]}>Pending</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {i < expiredMembers.length - 1 && <View style={s.divider} />}
                </View>
              ))}
              {expiredMembers.length >= 5 && (
                <TouchableOpacity onPress={() => setScreen("members")} style={s.viewAllBtn}>
                  <Text style={[s.viewAllText, { color: colors.primary }]}>View all expired →</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* ── Expiring Soon ── */}
        {expiringMembers.length > 0 && (
          <>
            <SectionHeader title={`Expiring Soon (${expiringMembers.length})`} />
            <View style={[s.alertCard, { borderColor: `${colors.warning}40` }]}>
              <View style={s.alertCardHeader}>
                <Clock size={16} color={colors.warning} />
                <Text style={[s.alertCardTitle, { color: colors.warning }]}>
                  These members expire within 7 days
                </Text>
              </View>
              {expiringMembers.map((m, i) => {
                const days = Math.ceil((new Date(m.membershipEnd).getTime() - Date.now()) / 86400000);
                return (
                  <View key={m._id}>
                    <View style={s.expiryRow}>
                      <View style={[s.expiryAvatar, { backgroundColor: `${colors.warning}18` }]}>
                        <Text style={[s.expiryAvatarText, { color: colors.warning }]}>
                          {m.name?.[0]?.toUpperCase() || "?"}
                        </Text>
                      </View>
                      <View style={s.expiryInfo}>
                        <Text style={s.expiryName}>{m.name}</Text>
                        <Text style={s.expirySub}>
                          {m.currentPlan?.name || "Plan"} · {days === 0 ? "Expires today" : `${days}d left`}
                        </Text>
                      </View>
                      <View style={s.expiryBtns}>
                        <TouchableOpacity
                          style={[s.feeBtn, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}
                          onPress={() => handleCollect(m)}
                          disabled={renewLoading === m._id + "_collect"}
                          activeOpacity={0.8}
                        >
                          {renewLoading === m._id + "_collect"
                            ? <ActivityIndicator size="small" color={colors.primary} />
                            : <Text style={[s.feeBtnText, { color: colors.primary }]}>Renew</Text>}
                        </TouchableOpacity>
                      </View>
                    </View>
                    {i < expiringMembers.length - 1 && <View style={s.divider} />}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Recent Active Members */}
        <SectionHeader title="Recent Active Members" />
        <View style={s.card}>
          {recentMembers.length === 0 ? (
            <Text style={s.empty}>No active members</Text>
          ) : (
            recentMembers.map((m, i) => (
              <View key={m._id}>
                <TouchableOpacity onPress={() => setScreen("members")} activeOpacity={0.7}>
                  <ListItem
                    name={m.name}
                    sub={`${m.currentPlan?.name || "Plan"} · Expires ${new Date(m.membershipEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                    right={<Badge label={m.status === "active" ? "Active" : "Inactive"} type={m.status === "active" ? "active" : "inactive"} />}
                  />
                </TouchableOpacity>
                {i < recentMembers.length - 1 && <View style={s.divider} />}
              </View>
            ))
          )}
        </View>

        {/* ── Gym Health Score ── */}
        <GymHealthScore
          totalMembers={totalMembers}
          todayCheckIns={stats.todayCheckIns}
          pendingFees={paymentSummary.pendingTotal}
          collectedFees={paymentSummary.collectedTotal}
          expiredCount={expiredMembers.length}
          colors={colors}
          s={s}
        />

        {/* ── Daily Pro Tips ── */}
        <ProTipsSection colors={colors} s={s} />

        {/* ── App Features Showcase ── */}
        <FeaturesShowcase colors={colors} s={s} setScreen={setScreen} />

        {/* ── Motivational Banner ── */}
        <MotivationalBanner gymName={user?.gymName} colors={colors} s={s} />

      </ScrollView>

      <AppAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmLabel="OK"
        onConfirm={() => setAlert(a => ({ ...a, visible: false }))}
      />
    </>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    greeting: { ...typography.caption, color: colors.textSecondary },
    gymName: { ...typography.h1, color: colors.textPrimary },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center" },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    statHalf: { flex: 1, minWidth: "45%" },
    attendanceCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: 12 },
    attCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    cardTitle: { ...typography.h3, color: colors.textPrimary },
    attBadge: { backgroundColor: `${colors.success}18`, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: `${colors.success}40` },
    attBadgeText: { fontSize: 11, fontWeight: "700", color: colors.success },
    ringContainer: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
    ringOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 10, borderColor: colors.border, borderTopColor: colors.primary, borderRightColor: colors.primary, alignItems: "center", justifyContent: "center" },
    ringInner: { alignItems: "center" },
    ringValue: { ...typography.h2, color: colors.textPrimary },
    ringLabel: { ...typography.caption, color: colors.textSecondary },
    ringStats: { flex: 1 },
    ringPercent: { ...typography.h2, color: colors.primary },
    ringSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
    attDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    attRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 6 },
    attAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: `${colors.success}18`, alignItems: "center", justifyContent: "center" },
    attAvatarText: { fontSize: 13, fontWeight: "700", color: colors.success },
    attName: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
    attSub: { ...typography.caption, color: colors.textMuted },
    attTime: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
    quickActions: { flexDirection: "row", justifyContent: "space-between" },
    quickAction: { alignItems: "center", gap: spacing.xs },
    quickLabel: { ...typography.caption, color: colors.textSecondary, textAlign: "center" },

    // Expiry cards
    alertCard: {
      backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, padding: spacing.md, marginBottom: 4,
    },
    alertCardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
    alertCardTitle: { ...typography.caption, fontWeight: "600", flex: 1 },
    expiryRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, gap: spacing.sm },
    expiryAvatar: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: "rgba(229,57,53,0.12)",
      alignItems: "center", justifyContent: "center",
    },
    expiryAvatarText: { ...typography.h3, fontWeight: "700" },
    expiryInfo: { flex: 1 },
    expiryName: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
    expirySub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    expiryBtns: { flexDirection: "row", gap: 6 },
    feeBtn: {
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: radius.button, borderWidth: 1,
      alignItems: "center", justifyContent: "center",
      minWidth: 70,
    },
    feeBtnText: { fontSize: 11, fontWeight: "700" },
    viewAllBtn: { paddingTop: spacing.sm, alignItems: "center" },
    viewAllText: { ...typography.caption, fontWeight: "600" },

    card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
    divider: { height: 1, backgroundColor: colors.border },
    empty: { ...typography.body, color: colors.textMuted, textAlign: "center", paddingVertical: spacing.md },

    // Health Score
    healthCard: {
      backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, borderColor: colors.border,
      padding: spacing.md, marginBottom: 4,
    },
    healthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    healthTitle: { ...typography.h3, color: colors.textPrimary },
    healthScoreBig: { fontSize: 42, fontWeight: "900", color: colors.primary },
    healthScoreLabel: { ...typography.caption, color: colors.textMuted },
    healthBarBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: spacing.sm },
    healthBarFill: { height: 8, borderRadius: 4 },
    healthRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
    healthStat: { alignItems: "center", flex: 1 },
    healthStatVal: { ...typography.h3, color: colors.textPrimary, fontWeight: "700" },
    healthStatLabel: { ...typography.caption, color: colors.textMuted, textAlign: "center" },

    // Tips
    tipCard: {
      borderRadius: radius.card, padding: spacing.md,
      borderWidth: 1, marginBottom: 4,
    },
    tipHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
    tipTitle: { ...typography.h3, color: colors.textPrimary },
    tipText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
    tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
    tipRow: { flexDirection: "row", gap: spacing.sm, marginBottom: 8 },

    // Features
    featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
    featureItem: {
      width: "47%", borderRadius: radius.card,
      padding: spacing.md, borderWidth: 1,
    },
    featureIcon: {
      width: 40, height: 40, borderRadius: 12,
      alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
    },
    featureName: { ...typography.body, color: colors.textPrimary, fontWeight: "700", marginBottom: 2 },
    featureDesc: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },

    // Motivational
    motivCard: {
      borderRadius: radius.card * 1.5, padding: spacing.lg,
      borderWidth: 1, alignItems: "center", marginBottom: spacing.xl,
    },
    motivEmoji: { fontSize: 40, marginBottom: spacing.sm },
    motivTitle: { ...typography.h2, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.xs },
    motivSub: { ...typography.body, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: spacing.lg },
    motivBtn: {
      paddingHorizontal: spacing.xl, paddingVertical: 12,
      borderRadius: radius.button, backgroundColor: colors.primary,
    },
    motivBtnText: { ...typography.button, color: "#fff", fontWeight: "700" },
  });
}

// ── Gym Health Score Component ──
function GymHealthScore({ totalMembers, todayCheckIns, pendingFees, collectedFees, expiredCount, colors, s }: any) {
  const attendancePct = totalMembers > 0 ? (todayCheckIns / totalMembers) * 100 : 0;
  const revenuePct = (collectedFees + pendingFees) > 0 ? (collectedFees / (collectedFees + pendingFees)) * 100 : 100;
  const expiryPenalty = Math.min(expiredCount * 5, 30);
  const score = Math.round(Math.min(100, (attendancePct * 0.4) + (revenuePct * 0.4) + 20 - expiryPenalty));
  const scoreColor = score >= 75 ? colors.success : score >= 50 ? colors.warning : colors.error;
  const scoreLabel = score >= 75 ? "Excellent 🏆" : score >= 50 ? "Good 👍" : "Needs Attention ⚠️";

  return (
    <>
      <SectionHeader title="Gym Health Score" />
      <View style={s.healthCard}>
        <View style={s.healthHeader}>
          <View>
            <Text style={[s.healthScoreBig, { color: scoreColor }]}>{score}</Text>
            <Text style={s.healthScoreLabel}>{scoreLabel}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Award size={36} color={scoreColor} />
            <Text style={[s.healthScoreLabel, { marginTop: 4 }]}>out of 100</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={s.healthBarBg}>
          <View style={[s.healthBarFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
        </View>

        {/* 3 stats */}
        <View style={s.healthRow}>
          <View style={s.healthStat}>
            <Text style={[s.healthStatVal, { color: colors.primary }]}>{Math.round(attendancePct)}%</Text>
            <Text style={s.healthStatLabel}>Attendance{"\n"}Rate</Text>
          </View>
          <View style={[{ width: 1, backgroundColor: colors.border }]} />
          <View style={s.healthStat}>
            <Text style={[s.healthStatVal, { color: colors.success }]}>{Math.round(revenuePct)}%</Text>
            <Text style={s.healthStatLabel}>Collection{"\n"}Rate</Text>
          </View>
          <View style={[{ width: 1, backgroundColor: colors.border }]} />
          <View style={s.healthStat}>
            <Text style={[s.healthStatVal, { color: expiredCount > 0 ? colors.error : colors.success }]}>{expiredCount}</Text>
            <Text style={s.healthStatLabel}>Expired{"\n"}Members</Text>
          </View>
        </View>
      </View>
    </>
  );
}

// ── Daily Pro Tips Component ──
const ALL_TIPS = [
  {
    icon: "💡", color: "#f59e0b",
    title: "Boost Retention",
    tips: [
      "Send WhatsApp reminders 3 days before membership expires.",
      "Offer a 10% discount on early renewals to reward loyalty.",
      "Celebrate member milestones — 1 month, 3 months, 1 year.",
    ],
  },
  {
    icon: "📈", color: "#2DD4C4",
    title: "Grow Revenue",
    tips: [
      "Introduce quarterly plans — members commit longer, you earn more.",
      "Upsell personal training sessions to active members.",
      "Track pending dues daily and follow up within 48 hours.",
    ],
  },
  {
    icon: "🏋️", color: "#a78bfa",
    title: "Member Experience",
    tips: [
      "Keep the gym clean and well-lit — first impressions matter.",
      "Play energetic music during peak hours (6–9 AM, 5–8 PM).",
      "Ask for feedback monthly and act on at least one suggestion.",
    ],
  },
  {
    icon: "🤖", color: "#FF5A36",
    title: "Use AI Smartly",
    tips: [
      "Ask AI who hasn't visited in 2 weeks — reach out to them.",
      "Use AI to predict which members might churn next month.",
      "Get AI-generated fitness tips to share with your members.",
    ],
  },
];

function ProTipsSection({ colors, s }: any) {
  const tip = ALL_TIPS[new Date().getDay() % ALL_TIPS.length];
  return (
    <>
      <SectionHeader title="Pro Tip of the Day" />
      <View style={[s.tipCard, { backgroundColor: colors.surface, borderColor: `${tip.color}30` }]}>
        <View style={s.tipHeader}>
          <Text style={{ fontSize: 24 }}>{tip.icon}</Text>
          <Text style={[s.tipTitle, { color: tip.color }]}>{tip.title}</Text>
        </View>
        {tip.tips.map((t, i) => (
          <View key={i} style={s.tipRow}>
            <View style={[s.tipDot, { backgroundColor: tip.color }]} />
            <Text style={[s.tipText, { flex: 1 }]}>{t}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

// ── Features Showcase Component ──
function FeaturesShowcase({ colors, s, setScreen }: any) {
  const features = [
    {
      icon: <ScanFace size={20} color="#2DD4C4" />, bg: "rgba(45,212,196,0.12)",
      name: "Face Attendance", desc: "Auto check-in with face scan — no manual entry needed.",
      screen: "attendance", border: "rgba(45,212,196,0.2)",
    },
    {
      icon: <Brain size={20} color="#a78bfa" />, bg: "rgba(167,139,250,0.12)",
      name: "AI Assistant", desc: "Ask anything about your gym — revenue, members, tips.",
      screen: "askai", border: "rgba(167,139,250,0.2)",
    },
    {
      icon: <BarChart2 size={20} color="#f59e0b" />, bg: "rgba(245,158,11,0.12)",
      name: "Smart Reports", desc: "Revenue trends, churn analysis & member insights.",
      screen: null, border: "rgba(245,158,11,0.2)",
    },
    {
      icon: <Shield size={20} color="#FF5A36" />, bg: "rgba(255,90,54,0.12)",
      name: "Secure & Fast", desc: "Your data is encrypted and backed up automatically.",
      screen: null, border: "rgba(255,90,54,0.2)",
    },
    {
      icon: <Zap size={20} color="#2DD4C4" />, bg: "rgba(45,212,196,0.12)",
      name: "Instant Alerts", desc: "Get notified when fees expire or members are at risk.",
      screen: null, border: "rgba(45,212,196,0.2)",
    },
    {
      icon: <Smartphone size={20} color="#a78bfa" />, bg: "rgba(167,139,250,0.12)",
      name: "Mobile First", desc: "Manage your gym from anywhere, anytime on your phone.",
      screen: null, border: "rgba(167,139,250,0.2)",
    },
  ];

  return (
    <>
      <SectionHeader title="Why FlexOps?" />
      <View style={s.featureGrid}>
        {features.map((f) => (
          <TouchableOpacity
            key={f.name}
            style={[s.featureItem, { backgroundColor: colors.surface, borderColor: f.border }]}
            activeOpacity={f.screen ? 0.7 : 1}
            onPress={() => f.screen && setScreen(f.screen)}
          >
            <View style={[s.featureIcon, { backgroundColor: f.bg }]}>{f.icon}</View>
            <Text style={s.featureName}>{f.name}</Text>
            <Text style={s.featureDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

// ── Motivational Banner Component ──
function MotivationalBanner({ gymName, colors, s }: any) {
  const banners = [
    { emoji: "🏆", title: "You're Building Something Great", sub: "Every member who walks in is a life you're helping transform. Keep going!" },
    { emoji: "💪", title: "Consistency Beats Perfection", sub: "The best gym owners show up every day. Your dedication inspires your members." },
    { emoji: "🚀", title: "Growth Starts Here", sub: "Track, improve, repeat. FlexOps gives you the data to make smarter decisions." },
    { emoji: "⭐", title: "Your Gym, Your Legacy", sub: "Every great gym started with one owner who refused to give up. That's you." },
  ];
  const banner = banners[new Date().getDay() % banners.length];

  return (
    <>
      <SectionHeader title="Daily Motivation" />
      <View style={[s.motivCard, { backgroundColor: colors.surface, borderColor: `${colors.primary}30` }]}>
        <Text style={s.motivEmoji}>{banner.emoji}</Text>
        <Text style={s.motivTitle}>{banner.title}</Text>
        <Text style={s.motivSub}>{banner.sub}</Text>
        <TouchableOpacity
          style={s.motivBtn}
          activeOpacity={0.8}
          onPress={() => Linking.openURL("https://tcpitsolution.click")}
        >
          <Text style={s.motivBtnText}>Powered by TCP IT Solution →</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
