import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Target,
  UserCheck,
  AlertCircle,
  FileText,
  Dumbbell,
  RefreshCw,
} from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { useTheme } from "../store/themeStore";
import { membersApi, attendanceApi, plansApi } from "../api";
import AppAlert from "./AppAlert";

interface Props {
  member: any;
  visible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MemberDetailModal({ member, visible, onClose, onRefresh }: Props) {
  const colors = useTheme();
  const styles = getStyles(colors);

  const [checkingIn, setCheckingIn] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [renewVisible, setRenewVisible] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [renewPlanId, setRenewPlanId] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewMode, setRenewMode] = useState("Cash");
  const [renewing, setRenewing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info" | "confirm";
    title: string;
    message?: string;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  }>({ type: "info", title: "" });

  useEffect(() => {
    if (renewVisible && plans.length === 0) {
      plansApi.getAll().then(setPlans).catch(() => {});
    }
  }, [renewVisible]);

  if (!member) return null;

  const showAlert = (
    type: "success" | "error" | "warning" | "info" | "confirm",
    title: string,
    message?: string,
    onConfirm?: () => void,
    confirmLabel?: string,
    cancelLabel?: string,
  ) => {
    setAlertConfig({ type, title, message, onConfirm, confirmLabel, cancelLabel });
    setAlertVisible(true);
  };

  const daysLeft = member.membershipEnd
    ? Math.ceil((new Date(member.membershipEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const initials = member.name
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceApi.checkin(member._id);
      showAlert("success", "Checked In!", `${member.name} has been checked in successfully.`);
    } catch (err: any) {
      showAlert("error", "Check-in Failed", err.message || "Could not check in member.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/91${member.phone}`);
  };

  const handleRemoveConfirm = () => {
    showAlert(
      "confirm",
      "Remove Member",
      `Are you sure you want to remove "${member.name}"? This cannot be undone.`,
      handleRemove,
      "Remove",
      "Cancel",
    );
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await membersApi.delete(member._id);
      onRefresh();
      onClose();
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Failed to remove member.");
    } finally {
      setRemoving(false);
    }
  };

  const openRenew = () => {
    const currentPlanId = member.currentPlan?._id || member.currentPlan || "";
    setRenewPlanId(currentPlanId);
    setRenewAmount(member.currentPlan?.price?.toString() || "");
    setRenewMode("Cash");
    setRenewVisible(true);
  };

  const handleRenew = async () => {
    if (!renewPlanId) return showAlert("error", "Error", "Please select a plan.");
    if (!renewAmount) return showAlert("error", "Error", "Please enter amount.");
    setRenewing(true);
    try {
      await membersApi.renew(member._id, {
        planId: renewPlanId,
        amount: Number(renewAmount),
        mode: renewMode,
        startDate: new Date().toISOString(),
      });
      setRenewVisible(false);
      onRefresh();
      showAlert("success", "Renewed!", `${member.name}'s membership has been renewed.`);
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Renewal failed.");
    } finally {
      setRenewing(false);
    }
  };

  const fields = [
    { icon: <Phone size={14} color={colors.textMuted} />, label: "Phone", value: member.phone || "—" },
    { icon: <Mail size={14} color={colors.textMuted} />, label: "Email", value: member.email || "—" },
    { icon: <Dumbbell size={14} color={colors.textMuted} />, label: "Plan", value: member.currentPlan?.name || "—" },
    {
      icon: <Calendar size={14} color={colors.textMuted} />,
      label: "Start Date",
      value: member.membershipStart
        ? new Date(member.membershipStart).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—",
    },
    {
      icon: <Calendar size={14} color={colors.textMuted} />,
      label: "End Date",
      value: member.membershipEnd
        ? new Date(member.membershipEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—",
    },
    { icon: <UserCheck size={14} color={colors.textMuted} />, label: "Gender", value: member.gender || "—" },
    { icon: <Target size={14} color={colors.textMuted} />, label: "Goal", value: member.goal || "—" },
    { icon: <AlertCircle size={14} color={colors.textMuted} />, label: "Emergency", value: member.emergencyContact || "—" },
    { icon: <UserCheck size={14} color={colors.textMuted} />, label: "Join Source", value: member.joinSource || "—" },
    { icon: <FileText size={14} color={colors.textMuted} />, label: "Notes", value: member.notes || "—" },
  ];

  const statusColor =
    member.status === "active" ? colors.success :
    member.status === "expired" ? colors.error : colors.warning;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Member Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Avatar + name + status */}
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                {member.photo ? (
                  <Image source={{ uri: member.photo }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                    </Text>
                  </View>
                  {daysLeft !== null && (
                    <Text style={[styles.daysLeft, { color: daysLeft <= 7 ? colors.error : colors.textMuted }]}>
                      {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}
                onPress={handleCheckIn}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>✓ Check In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${colors.success}18`, borderColor: `${colors.success}40` }]}
                onPress={handleWhatsApp}
              >
                <Text style={[styles.actionBtnText, { color: colors.success }]}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}
                onPress={openRenew}
              >
                <RefreshCw size={12} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Renew</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${colors.error}18`, borderColor: `${colors.error}40` }]}
                onPress={handleRemoveConfirm}
                disabled={removing}
              >
                {removing ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Text style={[styles.actionBtnText, { color: colors.error }]}>Remove</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={styles.detailsCard}>
              {fields.map((f, i) => (
                <View key={f.label}>
                  <View style={styles.fieldRow}>
                    <View style={styles.fieldLeft}>
                      {f.icon}
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                    </View>
                    <Text style={styles.fieldValue} numberOfLines={2}>{f.value}</Text>
                  </View>
                  {i < fields.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <AppAlert
        visible={alertVisible}
        type={alertConfig.type === "confirm" ? "error" : alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmLabel={alertConfig.confirmLabel || "OK"}
        cancelLabel={alertConfig.cancelLabel}
        onConfirm={() => {
          setAlertVisible(false);
          alertConfig.onConfirm?.();
        }}
        onCancel={() => setAlertVisible(false)}
      />

      {/* Renew Modal */}
      <Modal visible={renewVisible} transparent animationType="fade" onRequestClose={() => setRenewVisible(false)}>
        <View style={styles.renewBackdrop}>
          <View style={styles.renewSheet}>
            <View style={styles.renewHeader}>
              <Text style={styles.renewTitle}>Renew Membership</Text>
              <TouchableOpacity onPress={() => setRenewVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.renewLabel}>Plan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {plans.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    onPress={() => { setRenewPlanId(p._id); setRenewAmount(p.price?.toString() || ""); }}
                    style={[styles.planChip, renewPlanId === p._id && styles.planChipActive]}
                  >
                    <Text style={[styles.planChipText, renewPlanId === p._id && { color: colors.primary }]}>
                      {p.name} · ₹{p.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.renewLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.renewInput}
              value={renewAmount}
              onChangeText={setRenewAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.renewLabel}>Payment Mode</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing.md }}>
              {["Cash", "UPI", "Card"].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setRenewMode(m)}
                  style={[styles.planChip, renewMode === m && styles.planChipActive]}
                >
                  <Text style={[styles.planChipText, renewMode === m && { color: colors.primary }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.renewBtn} onPress={handleRenew} disabled={renewing}>
              {renewing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.renewBtnText}>Confirm Renewal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
      borderWidth: 1,
      borderColor: colors.border,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: spacing.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "600",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    avatarWrap: {
      width: 64,
      height: 64,
      borderRadius: radius.card,
      overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%" },
    avatarFallback: {
      width: 64,
      height: 64,
      borderRadius: radius.card,
      backgroundColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitials: { ...typography.h2, color: colors.primary },
    profileInfo: { flex: 1 },
    memberName: { ...typography.h2, color: colors.textPrimary, marginBottom: 6 },
    statusRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    statusText: { ...typography.caption, fontWeight: "700" },
    daysLeft: { ...typography.caption },
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    actionBtn: {
      flex: 1,
      minWidth: "40%",
      flexDirection: "row",
      gap: 4,
      paddingVertical: 10,
      borderRadius: radius.button,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    actionBtnText: { ...typography.caption, fontWeight: "700" },
    detailsCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    fieldRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
    },
    fieldLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
    },
    fieldLabel: { ...typography.caption, color: colors.textMuted },
    fieldValue: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: "500",
      flex: 1,
      textAlign: "right",
    },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
    renewBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      padding: spacing.md,
    },
    renewSheet: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    renewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    renewTitle: { ...typography.h2, color: colors.textPrimary },
    renewLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 6 },
    renewInput: {
      height: 46,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      ...typography.body,
    },
    planChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    planChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}18` },
    planChipText: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
    renewBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
    },
    renewBtnText: { ...typography.body, color: "#fff", fontWeight: "700" },
  });
}
