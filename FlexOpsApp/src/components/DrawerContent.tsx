import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, Brain,
  CalendarCheck, ClipboardList, LogOut,
} from 'lucide-react-native';
import { spacing, typography, darkColors } from '../theme/colors';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const sections = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, screen: 'index' },
      { label: 'Attendance', icon: CalendarCheck, screen: 'attendance' },
    ],
  },
  {
    title: 'MEMBERS',
    items: [
      { label: 'Members', icon: Users, screen: 'members' },
      { label: 'Plans', icon: ClipboardList, screen: 'plans' },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { label: 'Payments', icon: CreditCard, screen: 'payments' },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { label: 'Exercises', icon: Dumbbell, screen: 'exercises' },
      { label: 'Ask AI', icon: Brain, screen: 'askai' },
    ],
  },
];

interface DrawerContentProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function DrawerContent({ activeScreen, onNavigate }: DrawerContentProps) {
  const { isDark, colors, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primaryDark }]}>
          <Dumbbell size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>FlexOps</Text>
          <Text style={[styles.logoSub, { color: colors.textSecondary }]}>Gym Management</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Nav Sections */}
      {sections.map(section => (
        <View key={section.title}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
          {section.items.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.navItem, isActive && { backgroundColor: colors.surfaceElevated }]}
                onPress={() => onNavigate(item.screen)}
                activeOpacity={0.7}
              >
                {isActive && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
                <Icon size={18} color={isActive ? colors.primary : colors.textSecondary} />
                <Text style={[styles.navLabel, { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && { fontWeight: '600' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Dark Mode Toggle */}
        <View style={styles.darkModeRow}>
          <View style={styles.darkModeLeft}>
            <Text style={{ fontSize: 16 }}>{isDark ? '🌙' : '☀️'}</Text>
            <Text style={[styles.darkModeText, { color: colors.textSecondary }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.textPrimary}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.xl },
  logoSection: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  logoIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoText: { ...typography.h3 },
  logoSub: { ...typography.caption },
  divider: { height: 1, marginHorizontal: spacing.md },
  sectionTitle: {
    ...typography.caption, fontWeight: '600', letterSpacing: 1,
    paddingHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.xs,
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12, position: 'relative',
  },
  activeBar: {
    position: 'absolute', left: 0, top: 6, bottom: 6,
    width: 3, borderRadius: 2,
  },
  navLabel: { ...typography.body },
  bottom: { marginTop: 'auto', paddingBottom: spacing.xl },
  darkModeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  darkModeText: { ...typography.body },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  logoutText: { ...typography.body },
});
