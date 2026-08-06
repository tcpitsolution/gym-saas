import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal,
  KeyboardAvoidingView, Platform, FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UserPlus, Trash2, Phone, Mail, Calendar, ChevronDown } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { useTheme } from "../store/themeStore";
import { trainersApi, otpApi } from "../api";
import AppAlert from "../components/AppAlert";

const EMPTY_FORM = {
  name: "", email: "", phone: "", alternatePhone: "",
  address: "", aadharNumber: "", panNumber: "",
  joiningDate: new Date(), password: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={fieldLabelStyle}>{label}</Text>
      {children}
    </View>
  );
}
const fieldLabelStyle = { fontSize: 12, fontWeight: "600" as const, color: "#9CA3AF", marginBottom: 6 };

export default function TrainersScreen() {
  const colors = useTheme();
  const s = getStyles(colors);

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // OTP
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Alert
  const [alert, setAlert] = useState<{
    visible: boolean; type: "success" | "error" | "warning" | "confirm";
    title: string; message?: string; onConfirm?: () => void;
  }>({ visible: false, type: "info" as any, title: "" });

  const showAlert = (
    type: "success" | "error" | "warning" | "confirm",
    title: string, message?: string, onConfirm?: () => void,
  ) => setAlert({ visible: true, type, title, message, onConfirm });

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCountdown = () => {
    setCountdown(120);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const load = useCallback(async () => {
    try { setTrainers(await trainersApi.getAll()); } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const handleSendOtp = async () => {
    if (!form.email) return;
    setOtpSending(true);
    setOtpError("");
    try {
      await otpApi.send(form.email);
      setOtpValue("");
      setOtpVisible(true);
      startCountdown();
    } catch {
      showAlert("error", "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    try {
      await otpApi.send(form.email);
      setOtpValue("");
      startCountdown();
    } catch {
      showAlert("error", "Error", "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { setOtpError("Enter 6-digit OTP"); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await otpApi.verify(form.email, otpValue);
      if (res.success) {
        setEmailVerified(true);
        setOtpVisible(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setOtpError("Invalid OTP");
      }
    } catch {
      setOtpError("Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) { setFormError("Name is required"); return; }
    if (!form.email.trim()) { setFormError("Email is required"); return; }
    if (!emailVerified) { setFormError("Please verify email first"); return; }
    if (!form.phone || form.phone.length < 10) { setFormError("Valid 10-digit phone required"); return; }
    if (!form.password || form.password.length < 8) { setFormError("Password must be at least 8 characters"); return; }
    setFormError("");
    setAdding(true);
    try {
      await trainersApi.create({
        ...form,
        joiningDate: form.joiningDate.toISOString().split("T")[0],
      });
      setForm(EMPTY_FORM);
      setEmailVerified(false);
      setShowForm(false);
      showAlert("success", "Trainer Added!", "Trainer added and welcome email sent.");
      load();
    } catch (err: any) {
      setFormError(err.message || "Failed to add trainer");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (trainer: any) => {
    showAlert("confirm", "Remove Trainer", `Remove ${trainer.name}? This cannot be undone.`, async () => {
      try {
        await trainersApi.delete(trainer._id);
        showAlert("success", "Trainer Removed");
        load();
      } catch (err: any) {
        showAlert("error", "Error", err.message || "Failed to remove trainer");
      }
    });
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: "Total", value: trainers.length, color: colors.textPrimary },
            { label: "Active", value: trainers.filter(t => t.active).length, color: colors.success },
            { label: "Inactive", value: trainers.filter(t => !t.active).length, color: colors.error },
          ].map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Add / Cancel button */}
        <TouchableOpacity
          style={[s.addBtn, showForm && s.addBtnCancel]}
          onPress={() => { setShowForm(v => !v); setFormError(""); }}
          activeOpacity={0.8}
        >
          {showForm
            ? <Text style={[s.addBtnText, { color: colors.textMuted }]}>Cancel</Text>
            : <><UserPlus size={16} color="#fff" /><Text style={s.addBtnText}>Add Trainer</Text></>
          }
        </TouchableOpacity>

        {/* ── Add Form ── */}
        {showForm && (
          <View style={s.formCard}>

            <Text style={s.sectionLabel}>BASIC INFO</Text>

            <Field label="Full Name *">
              <TextInput
                style={s.input}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
              />
            </Field>

            {/* Email + OTP */}
            <Field label="Email *">
              <View style={s.emailRow}>
                <TextInput
                  style={[s.input, { flex: 1 }, emailVerified && { borderColor: colors.success }]}
                  value={form.email}
                  onChangeText={v => { setForm(f => ({ ...f, email: v })); setEmailVerified(false); }}
                  placeholder="Email address"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {form.email.length > 0 && !emailVerified && (
                  <TouchableOpacity
                    style={s.verifyBtn}
                    onPress={handleSendOtp}
                    disabled={otpSending}
                    activeOpacity={0.8}
                  >
                    {otpSending
                      ? <ActivityIndicator size="small" color={colors.primary} />
                      : <Text style={s.verifyBtnText}>Verify</Text>
                    }
                  </TouchableOpacity>
                )}
                {emailVerified && (
                  <View style={s.verifiedBadge}>
                    <Text style={s.verifiedBadgeText}>✓ Verified</Text>
                  </View>
                )}
              </View>
            </Field>

            <Field label="Phone *">
              <TextInput
                style={s.input}
                value={form.phone}
                onChangeText={v => setForm(f => ({ ...f, phone: v.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="10-digit phone number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {form.phone.length > 0 && form.phone.length < 10 && (
                <Text style={s.fieldError}>Phone must be 10 digits</Text>
              )}
            </Field>

            <Field label="Alternate Phone">
              <TextInput
                style={s.input}
                value={form.alternatePhone}
                onChangeText={v => setForm(f => ({ ...f, alternatePhone: v.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="Alternate phone (optional)"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </Field>

            <Field label="Address">
              <TextInput
                style={s.input}
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                placeholder="Address (optional)"
                placeholderTextColor={colors.textMuted}
              />
            </Field>

            <View style={s.divider} />
            <Text style={s.sectionLabel}>DOCUMENTS</Text>

            <Field label="Aadhar Number">
              <TextInput
                style={s.input}
                value={form.aadharNumber}
                onChangeText={v => setForm(f => ({ ...f, aadharNumber: v.replace(/\D/g, "").slice(0, 12) }))}
                placeholder="12-digit Aadhar number"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={12}
              />
            </Field>

            <Field label="PAN Number">
              <TextInput
                style={s.input}
                value={form.panNumber}
                onChangeText={v => setForm(f => ({ ...f, panNumber: v.toUpperCase().slice(0, 10) }))}
                placeholder="PAN number"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                maxLength={10}
              />
            </Field>

            <Field label="Joining Date">
              <TouchableOpacity style={s.selectBox} onPress={() => Platform.OS !== "web" && setShowDatePicker(true)} activeOpacity={0.8}>
                <Text style={[s.selectText, { color: colors.textPrimary }]}>{formatDate(form.joiningDate)}</Text>
                <Calendar size={16} color={colors.textMuted} />
              </TouchableOpacity>
              {showDatePicker && Platform.OS !== "web" && (
                <DateTimePicker
                  value={form.joiningDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={(_, d) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (d) setForm(f => ({ ...f, joiningDate: d }));
                  }}
                />
              )}
            </Field>

            <View style={s.divider} />
            <Text style={s.sectionLabel}>LOGIN CREDENTIALS</Text>

            <Field label="Password *">
              <TextInput
                style={s.input}
                value={form.password}
                onChangeText={v => setForm(f => ({ ...f, password: v }))}
                placeholder="Min 8 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
              {form.password.length > 0 && form.password.length < 8 && (
                <Text style={s.fieldError}>Password must be at least 8 characters</Text>
              )}
            </Field>

            {formError ? (
              <View style={s.errorBox}>
                <Text style={s.errorBoxText}>{formError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.submitBtn, adding && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.85}
            >
              {adding
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.submitBtnText}>Add Trainer →</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ── Trainer List ── */}
        {trainers.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏋️</Text>
            <Text style={s.emptyText}>No trainers yet</Text>
            <Text style={s.emptySubtext}>Add your first trainer above</Text>
          </View>
        ) : (
          trainers.map(trainer => (
            <View key={trainer._id} style={s.trainerCard}>
              <View style={s.trainerRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>
                    {trainer.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={s.trainerInfo}>
                  <View style={s.trainerNameRow}>
                    <Text style={s.trainerName}>{trainer.name}</Text>
                    <View style={[s.badge, trainer.active ? s.badgeActive : s.badgeInactive]}>
                      <Text style={[s.badgeText, { color: trainer.active ? colors.success : colors.error }]}>
                        {trainer.active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <View style={s.metaRow}>
                    <Mail size={11} color={colors.textMuted} />
                    <Text style={s.metaText}>{trainer.email}</Text>
                  </View>
                  {trainer.phone && (
                    <View style={s.metaRow}>
                      <Phone size={11} color={colors.textMuted} />
                      <Text style={s.metaText}>{trainer.phone}</Text>
                    </View>
                  )}
                  {trainer.joiningDate && (
                    <View style={s.metaRow}>
                      <Calendar size={11} color={colors.textMuted} />
                      <Text style={s.metaText}>
                        Joined {new Date(trainer.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(trainer)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── OTP Modal ── */}
      <Modal visible={otpVisible} transparent animationType="fade" onRequestClose={() => setOtpVisible(false)}>
        <View style={s.otpBackdrop}>
          <View style={[s.otpCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.otpTitle, { color: colors.textPrimary }]}>Verify Email</Text>
            <Text style={[s.otpSub, { color: colors.textSecondary }]}>
              OTP sent to <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>{form.email}</Text>
            </Text>

            <TextInput
              style={[s.input, s.otpInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
              value={otpValue}
              onChangeText={v => setOtpValue(v.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />

            <View style={s.otpMetaRow}>
              <Text style={{ fontSize: 12, color: countdown === 0 ? colors.error : colors.textMuted }}>
                {countdown > 0
                  ? `Expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                  : "OTP expired"}
              </Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={countdown > 0 || resendLoading}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: countdown === 0 ? colors.primary : colors.textMuted }}>
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>

            {otpError ? <Text style={s.fieldError}>{otpError}</Text> : null}

            <View style={s.otpBtnRow}>
              <TouchableOpacity
                style={[s.otpCancelBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                onPress={() => { setOtpVisible(false); if (timerRef.current) clearInterval(timerRef.current); }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.submitBtn, { flex: 1 }, (otpLoading || otpValue.length !== 6) && { opacity: 0.6 }]}
                onPress={handleVerifyOtp}
                disabled={otpLoading || otpValue.length !== 6}
                activeOpacity={0.85}
              >
                {otpLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.submitBtnText}>Verify →</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AppAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmLabel={alert.type === "confirm" ? "Remove" : "OK"}
        cancelLabel={alert.type === "confirm" ? "Cancel" : undefined}
        onConfirm={() => {
          const cb = alert.onConfirm;
          setAlert(a => ({ ...a, visible: false }));
          cb?.();
        }}
        onCancel={() => setAlert(a => ({ ...a, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
    statCard: {
      flex: 1, backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: "center",
    },
    statValue: { ...typography.h2, fontWeight: "800" },
    statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

    addBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: spacing.xs, backgroundColor: colors.primary, borderRadius: radius.button,
      paddingVertical: 14, marginBottom: spacing.md,
    },
    addBtnCancel: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
    addBtnText: { ...typography.button, color: "#fff", fontWeight: "700" },

    formCard: {
      backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, borderColor: colors.border,
      padding: spacing.md, marginBottom: spacing.md,
    },
    sectionLabel: {
      fontSize: 11, fontWeight: "700", letterSpacing: 1.2,
      color: colors.textMuted, marginBottom: spacing.md, textTransform: "uppercase",
    },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

    input: {
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 46,
    },
    selectBox: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      backgroundColor: colors.surfaceElevated, borderRadius: radius.button,
      borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 46,
    },
    selectText: { ...typography.body },
    emailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    verifyBtn: {
      height: 46, paddingHorizontal: 14, borderRadius: radius.button,
      backgroundColor: "rgba(255,90,54,0.15)", alignItems: "center", justifyContent: "center",
    },
    verifyBtnText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    verifiedBadge: {
      height: 46, paddingHorizontal: 12, borderRadius: radius.button,
      backgroundColor: "rgba(45,212,196,0.12)", alignItems: "center", justifyContent: "center",
    },
    verifiedBadgeText: { color: "#2DD4C4", fontWeight: "700", fontSize: 12 },
    fieldError: { fontSize: 11, color: colors.error, marginTop: 4 },
    errorBox: {
      backgroundColor: `${colors.error}10`, borderWidth: 1, borderColor: `${colors.error}30`,
      borderRadius: radius.button, padding: spacing.sm, marginBottom: spacing.sm,
    },
    errorBoxText: { fontSize: 13, color: colors.error },
    submitBtn: {
      backgroundColor: colors.primary, borderRadius: radius.button,
      paddingVertical: 14, alignItems: "center", justifyContent: "center",
    },
    submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

    // Trainer cards
    trainerCard: {
      backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: 10,
    },
    trainerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    avatar: {
      width: 46, height: 46, borderRadius: 23,
      backgroundColor: colors.primaryDark, alignItems: "center", justifyContent: "center",
    },
    avatarText: { color: colors.primary, fontWeight: "800", fontSize: 14 },
    trainerInfo: { flex: 1 },
    trainerNameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: 4 },
    trainerName: { ...typography.body, color: colors.textPrimary, fontWeight: "700", flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
    badgeActive: { backgroundColor: `${colors.success}15`, borderColor: `${colors.success}40` },
    badgeInactive: { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` },
    badgeText: { fontSize: 10, fontWeight: "700" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
    metaText: { ...typography.caption, color: colors.textMuted },

    empty: { alignItems: "center", paddingVertical: spacing.xl * 2 },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyText: { ...typography.h3, color: colors.textSecondary, marginBottom: 4 },
    emptySubtext: { ...typography.caption, color: colors.textMuted },

    // OTP modal
    otpBackdrop: {
      flex: 1, backgroundColor: "rgba(0,0,0,0.75)",
      alignItems: "center", justifyContent: "center", padding: spacing.lg,
    },
    otpCard: {
      width: "100%", maxWidth: 360, borderRadius: radius.card,
      borderWidth: 1, padding: spacing.lg,
    },
    otpTitle: { ...typography.h3, marginBottom: 4 },
    otpSub: { ...typography.caption, marginBottom: spacing.md },
    otpInput: { textAlign: "center", fontSize: 22, letterSpacing: 10, marginBottom: spacing.sm },
    otpMetaRow: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: spacing.sm,
    },
    otpBtnRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
    otpCancelBtn: {
      flex: 1, alignItems: "center", justifyContent: "center",
      borderRadius: radius.button, borderWidth: 1, paddingVertical: 14,
    },
  });
}
