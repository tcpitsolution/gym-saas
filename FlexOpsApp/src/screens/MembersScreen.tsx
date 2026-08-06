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
} from "react-native";
import { Search, UserPlus } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { ListItem, Badge } from "../components";
import { membersApi } from "../api";
import { useTheme } from "../store/themeStore";
import { useNavigationStore } from "../store/navigationStore";
import MemberDetailModal from "../components/MemberDetailModal";

const tabs = ["All", "Active", "Expired", "Paused"];

export default function MembersScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const { setScreen } = useNavigationStore();

  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const status = tab === "All" ? undefined : tab.toLowerCase();
      const data = await membersApi.getAll({
        status,
        search: search || undefined,
      });
      setMembers(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => setScreen("addMember")}>
          <UserPlus size={18} color={colors.textPrimary} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

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

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xl }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.card}>
            {members.length === 0 ? (
              <Text style={styles.empty}>No members found</Text>
            ) : (
              members.map((m, i) => (
                <View key={m._id}>
                  <TouchableOpacity onPress={() => setSelectedMember(m)} activeOpacity={0.7}>
                    <ListItem
                      name={m.name}
                      sub={`${m.phone || m.email || ""} · ${m.currentPlan?.name || "No Plan"}`}
                      right={
                        <Badge
                          label={m.status === "active" ? "Active" : m.status === "expired" ? "Expired" : "Paused"}
                          type={m.status === "active" ? "active" : "inactive"}
                        />
                      }
                    />
                  </TouchableOpacity>
                  {i < members.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      <MemberDetailModal
        member={selectedMember}
        visible={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onRefresh={load}
      />
    </View>
  );
}

// Styles function — receives colors and returns StyleSheet
function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      paddingHorizontal: spacing.md,
      height: 36,
    },
    addBtnText: { ...typography.button, color: colors.textPrimary },
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
      marginBottom: spacing.md,
    },
    searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
    tabs: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
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
    divider: { height: 1, backgroundColor: colors.border },
    empty: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.lg,
    },
  });
}
