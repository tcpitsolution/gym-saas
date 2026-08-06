import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { spacing, radius, typography } from "../theme/colors";
import { useTheme } from "../store/themeStore";

// ─── StatCard ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}
export function StatCard({ label, value, icon, style }: StatCardProps) {
  const colors = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={[styles.statCard, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statRow}>
        <Text style={styles.statValue}>{value}</Text>
        {icon && <View style={styles.statIcon}>{icon}</View>}
      </View>
    </View>
  );
}

// ─── IconCircle ──────────────────────────────────────────────────────────────
interface IconCircleProps {
  icon: React.ReactNode;
  bg: string;
  size?: number;
}
export function IconCircle({ icon, bg, size = 48 }: IconCircleProps) {
  const colors = useTheme();
  const styles = getStyles(colors);
  return (
    <View
      style={[
        styles.iconCircle,
        { backgroundColor: bg, width: size, height: size },
      ]}
    >
      {icon}
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  type?: "active" | "inactive" | "premium" | "warning";
}
export function Badge({ label, type = "active" }: BadgeProps) {
  const colors = useTheme();
  const styles = getStyles(colors);
  const badgeStyles: Record<string, { bg: string; text: string }> = {
    active: { bg: colors.successBg, text: colors.success },
    inactive: { bg: "#3D1515", text: colors.error },
    premium: { bg: colors.primaryDark, text: colors.primary },
    warning: { bg: "#3D2E10", text: colors.warning },
  };
  const s = badgeStyles[type];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
    </View>
  );
}

// ─── ListItem ────────────────────────────────────────────────────────────────
interface ListItemProps {
  avatar?: string;
  name: string;
  sub: string;
  right?: React.ReactNode;
}
export function ListItem({ name, sub, right }: ListItemProps) {
  const colors = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.listItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name[0]}</Text>
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{name}</Text>
        <Text style={styles.listSub}>{sub}</Text>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

// ─── PrimaryButton ───────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}
export function PrimaryButton({ label, onPress, style }: PrimaryButtonProps) {
  const colors = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  const colors = useTheme();
  const styles = getStyles(colors);
  return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

function getStyles(colors: any) {
  return StyleSheet.create({
    // StatCard
    statCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statValue: { ...typography.h2, color: colors.textPrimary },
    statIcon: {},

    // IconCircle
    iconCircle: {
      borderRadius: radius.icon,
      alignItems: "center",
      justifyContent: "center",
    },

    // Badge
    badge: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    badgeText: { ...typography.caption, fontWeight: "600" },

    // ListItem
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { ...typography.h3, color: colors.primary },
    listInfo: { flex: 1 },
    listName: { ...typography.h3, color: colors.textPrimary },
    listSub: { ...typography.caption, color: colors.textSecondary },

    // PrimaryButton
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: { ...typography.button, color: colors.textPrimary },

    // SectionHeader
    sectionHeader: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "600",
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
  });
}
