import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, Brain,
  CalendarCheck, ClipboardList, LogOut, UserCog, Lock,
} from 'lucide-react-native';
import { spacing, typography } from '../theme/colors';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../store/languageStore';
import AppAlert from './AppAlert';

interface DrawerContentProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function DrawerContent({ activeScreen, onNavigate }: DrawerContentProps) {
  const { isDark, colors, toggleTheme } = useThemeStore();
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();
  const features = user?.features || {};

  const [lockAlert, setLockAlert] = useState(false);

  // feature key → drawer screen key mapping
  const featureKey: Record<string, string> = {
    members: 'members',
    payments: 'payments',
    trainers: 'trainers',
    exercises: 'exercises',
    askai: 'askai',
  };

  const isLocked = (screen: string): boolean => {
    const fk = Object.keys(featureKey).find(k => featureKey[k] === screen);
    if (!fk) return false;
    return features[fk as keyof typeof features] === false;
  };

  const handleNav = (screen: string) => {
    if (isLocked(screen)) {
      setLockAlert(true);
      return;
    }
    onNavigate(screen);
  };

  const sections = [
    {
      title: 'MAIN',
      items: [
        { labelKey: 'dashboard', icon: LayoutDashboard, screen: 'index' },
        { labelKey: 'attendance', icon: CalendarCheck, screen: 'attendance' },
      ],
    },
    {
      title: 'MEMBERS',
      items: [
        { labelKey: 'members', icon: Users, screen: 'members' },
        { labelKey: 'plans', icon: ClipboardList, screen: 'plans' },
        { labelKey: 'trainers', icon: UserCog, screen: 'trainers' },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        { labelKey: 'payments', icon: CreditCard, screen: 'payments' },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { labelKey: 'exercises', icon: Dumbbell, screen: 'exercises' },
        { labelKey: 'askai', icon: Brain, screen: 'askai' },
      ],
    },
  ];

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
            const locked = isLocked(item.screen);
            return (
              <TouchableOpacity
                key={item.labelKey}
                style={[styles.navItem, isActive && { backgroundColor: colors.surfaceElevated }]}
                onPress={() => handleNav(item.screen)}
                activeOpacity={0.7}
              >
                {isActive && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
                <Icon size={18} color={locked ? colors.textMuted : isActive ? colors.primary : colors.textSecondary} />
                <Text style={[
                  styles.navLabel,
                  { color: locked ? colors.textMuted : isActive ? colors.primary : colors.textSecondary },
                  isActive && { fontWeight: '600' },
                ]}>
                  {t(item.labelKey as any)}
                </Text>
                {locked && <Lock size={13} color={colors.textMuted} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

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

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* Powered by */}
        <View style={styles.poweredRow}>
          <Text style={[styles.poweredText, { color: colors.textMuted }]}>Powered by </Text>
          <Text
            style={[styles.poweredLink, { color: colors.primary }]}
            onPress={() => {
              const { Linking } = require('react-native');
              Linking.openURL('https://tcpitsolution.click');
            }}
          >
            TCP IT Solution
          </Text>
        </View>
      </View>

      <AppAlert
        visible={lockAlert}
        type="warning"
        title="Feature Locked 🔒"
        message="This feature is not available in your current plan. Please contact admin to unlock it."
        confirmLabel="OK"
        onConfirm={() => setLockAlert(false)}
      />
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
  poweredRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: spacing.sm, paddingBottom: spacing.xs,
  },
  poweredText: { ...typography.caption },
  poweredLink: { ...typography.caption, fontWeight: '700', textDecorationLine: 'underline' },
});
