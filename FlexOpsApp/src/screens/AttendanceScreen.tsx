import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { QrCode, Search, UserCheck } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { ListItem, SectionHeader } from "../components";
import { attendanceApi, membersApi } from "../api";
import { useTheme } from "../store/themeStore";

export default function AttendanceScreen() {
  const colors = useTheme();
  const styles = getStyles(colors); // 👈 styles ab colors ke saath dynamically banti hain

  const [search, setSearch] = useState("");
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayCheckIns: 0, activeNow: 0 });
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [manualId, setManualId] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [logs, attStats, allMembers] = await Promise.all([
        attendanceApi.today(),
        attendanceApi.stats(),
        membersApi.getAll(),
      ]);
      setCheckIns(logs);
      setStats(attStats);
      setTotalMembers(allMembers.length);
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

  const handleManualCheckin = async () => {
    if (!manualId.trim()) return;
    setCheckinLoading(true);
    try {
      await attendanceApi.checkin(manualId.trim(), "Manual");
      Alert.alert("Success", "Member checked in!");
      setManualId("");
      load();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setCheckinLoading(false);
    }
  };

  const pct =
    totalMembers > 0
      ? Math.round((stats.todayCheckIns / totalMembers) * 100)
      : 0;

  const filtered = checkIns.filter((c) =>
    c.memberId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

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
      <Text style={styles.title}>Attendance</Text>

      {/* Ring Card */}
      <View style={styles.ringCard}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Text style={styles.ringBig}>{pct}%</Text>
            <Text style={styles.ringSmall}>Today</Text>
          </View>
        </View>
        <View style={styles.ringMeta}>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.metaText}>
              {stats.todayCheckIns} Checked In
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.metaText}>{stats.activeNow} Inside Now</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Text style={styles.metaText}>{totalMembers} Total Members</Text>
          </View>
        </View>
      </View>

      {/* Manual Check-in */}
      <View style={styles.manualCard}>
        <Text style={styles.cardTitle}>Manual Check-in</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Enter Member ID..."
            placeholderTextColor={colors.textMuted}
            value={manualId}
            onChangeText={setManualId}
          />
          <TouchableOpacity
            style={styles.checkinBtn}
            onPress={handleManualCheckin}
            disabled={checkinLoading}
            activeOpacity={0.8}
          >
            {checkinLoading ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <UserCheck size={20} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search check-ins..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Check-in List */}
      <SectionHeader title={`Today's Check-ins (${checkIns.length})`} />
      <View style={styles.card}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No check-ins yet today</Text>
        ) : (
          filtered.map((c, i) => (
            <View key={c._id}>
              <ListItem
                name={c.memberId?.name || "Unknown"}
                sub={`${c.method} · ${new Date(c.checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
              />
              {i < filtered.length - 1 && <View style={styles.divider} />}
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
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    ringCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.lg,
    },
    ringOuter: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 12,
      borderColor: colors.border,
      borderTopColor: colors.primary,
      borderRightColor: colors.primary,
      borderBottomColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    ringInner: { alignItems: "center" },
    ringBig: { ...typography.h1, color: colors.textPrimary },
    ringSmall: { ...typography.caption, color: colors.textSecondary },
    ringMeta: { flex: 1, gap: spacing.sm },
    metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    dot: { width: 8, height: 8, borderRadius: 4 },
    metaText: { ...typography.body, color: colors.textPrimary },
    manualCard: {
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
      marginBottom: spacing.sm,
    },
    manualRow: { flexDirection: "row", gap: spacing.sm },
    manualInput: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
    },
    checkinBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.button,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
      marginTop: spacing.md,
    },
    searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
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
