import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { User, Lock, LogOut, Eye, EyeOff, ChevronRight, Shield } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const [showChangePass, setShowChangePass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Uses reset-password endpoint (email from token)
      await authApi.resetPassword(user?.email || '', newPassword);
      Alert.alert('Success', 'Password updated successfully!');
      setShowChangePass(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabel: Record<string, string> = {
    owner: 'Gym Owner',
    manager: 'Manager',
    trainer: 'Trainer',
    staff: 'Staff',
    superadmin: 'Super Admin',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Avatar + Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.ownerName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.ownerName || 'User'}</Text>
        <View style={styles.roleBadge}>
          <Shield size={12} color={colors.primary} />
          <Text style={styles.roleText}>{roleLabel[user?.role || ''] || user?.role}</Text>
        </View>
        {user?.gymName && <Text style={styles.gymName}>{user.gymName}</Text>}
      </View>

      {/* Info Rows */}
      <View style={styles.card}>
        <InfoRow icon={<User size={16} color={colors.primary} />} label="Name" value={user?.ownerName || '—'} />
        <View style={styles.divider} />
        <InfoRow icon={<Lock size={16} color={colors.primary} />} label="Email" value={user?.email || '—'} />
        <View style={styles.divider} />
        <InfoRow icon={<Shield size={16} color={colors.primary} />} label="Role" value={roleLabel[user?.role || ''] || '—'} />
        {user?.gymName && (
          <>
            <View style={styles.divider} />
            <InfoRow icon={<User size={16} color={colors.primary} />} label="Gym" value={user.gymName} />
          </>
        )}
      </View>

      {/* Change Password */}
      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => setShowChangePass(p => !p)}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={styles.actionIcon}>
            <Lock size={18} color={colors.primary} />
          </View>
          <Text style={styles.actionText}>Change Password</Text>
        </View>
        <ChevronRight size={18} color={colors.textMuted} style={{ transform: [{ rotate: showChangePass ? '90deg' : '0deg' }] }} />
      </TouchableOpacity>

      {showChangePass && (
        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setError(''); }}
            />
            <TouchableOpacity onPress={() => setShowNew(p => !p)}>
              {showNew ? <Eye size={16} color={colors.textMuted} /> : <EyeOff size={16} color={colors.textMuted} />}
            </TouchableOpacity>
          </View>

          <View style={[styles.inputBox, { marginTop: spacing.sm }]}>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
            />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)}>
              {showConfirm ? <Eye size={16} color={colors.textMuted} /> : <EyeOff size={16} color={colors.textMuted} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color={colors.textPrimary} size="small" />
              : <Text style={styles.saveBtnText}>Update Password</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <LogOut size={18} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: 12 },

  profileCard: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', gap: spacing.xs,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primary,
    marginBottom: spacing.xs,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  name: { ...typography.h2, color: colors.textPrimary },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryDark, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  roleText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  gymName: { ...typography.body, color: colors.textSecondary },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  infoIcon: {
    width: 32, height: 32, borderRadius: radius.icon,
    backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },

  actionRow: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionIcon: {
    width: 36, height: 36, borderRadius: radius.icon,
    backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center',
  },
  actionText: { ...typography.h3, color: colors.textPrimary },

  errorText: { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated, borderRadius: radius.button,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 48,
  },
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button,
    height: 46, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  saveBtnText: { ...typography.button, color: colors.textPrimary },

  logoutBtn: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.md, borderWidth: 1, borderColor: '#3D1515',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  logoutText: { ...typography.button, color: colors.error },
});
