import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, TextInput, Switch,
} from "react-native";
import { Check, Plus, X, Trash2, ChevronDown, ChevronUp } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { plansApi } from "../api";
import { useTheme } from "../store/themeStore";
import AppAlert from "../components/AppAlert";

export default function PlansScreen() {
  const colors = useTheme();
  const s = getStyles(colors);

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [price, setPrice] = useState("");
  const [allowClasses, setAllowClasses] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  // Alert
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "confirm";
    title: string;
    message?: string;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  }>({ visible: false, type: "success", title: "" });

  const showAlert = (
    type: "success" | "error" | "warning" | "confirm",
    title: string,
    message?: string,
    onConfirm?: () => void,
    confirmLabel?: string,
    cancelLabel?: string,
  ) => setAlert({ visible: true, type, title, message, onConfirm, confirmLabel, cancelLabel });

  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  const load = useCallback(async () => {
    try {
      const data = await plansApi.getAll();
      setPlans(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const resetForm = () => {
    setName(""); setDurationDays(""); setPrice("");
    setAllowClasses(true); setFormError(""); setShowForm(false);
  };

  const handleAdd = async () => {
    setFormError("");
    if (!name.trim()) { setFormError("Plan name is required"); return; }
    if (!durationDays || Number(durationDays) <= 0) { setFormError("Duration must be greater than 0"); return; }
    if (!price || Number(price) <= 0) { setFormError("Price must be greater than 0"); return; }

    setAdding(true);
    try {
      await plansApi.create({
        name: name.trim(),
        durationDays: Number(durationDays),
        price: Number(price),
        allowClasses,
      });
      resetForm();
      load();
      showAlert("success", "Plan Added!", `"${name.trim()}" has been created successfully.`);
    } catch (err: any) {
      setFormError(err.message || "Failed to add plan");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteConfirm = (plan: any) => {
    showAlert(
      "confirm",
      "Delete Plan",
      `Are you sure you want to delete "${plan.name}"? Members on this plan won't be affected.`,
      async () => {
        hideAlert();
        try {
          await plansApi.delete(plan._id);
          load();
          showAlert("success", "Deleted", `"${plan.name}" has been removed.`);
        } catch (err: any) {
          showAlert("error", "Error", err.message || "Failed to delete plan");
        }
      },
      "Delete", "Cancel",
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
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
            <Text style={s.title}>Membership Plans</Text>
            <Text style={s.sub}>{plans.length} plan{plans.length !== 1 ? "s" : ""} active</Text>
          </View>
          <TouchableOpacity
            style={[s.addBtn, showForm && { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => { setShowForm(p => !p); setFormError(""); }}
            activeOpacity={0.8}
          >
            {showForm
              ? <X size={18} color={colors.textMuted} />
              : <Plus size={18} color={colors.textPrimary} />}
            <Text style={[s.addBtnText, showForm && { color: colors.textMuted }]}>
              {showForm ? "Cancel" : "Add Plan"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Plan Form */}
        {showForm && (
          <View style={s.formCard}>
            <View style={s.formAccent} />
            <Text style={s.formTitle}>New Plan</Text>

            <Field label="Plan Name" colors={colors}>
              <TextInput
                style={s.input}
                placeholder="e.g. Monthly, Quarterly..."
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={v => { setName(v); setFormError(""); }}
              />
            </Field>

            <View style={s.formRow}>
              <View style={{ flex: 1 }}>
                <Field label="Duration (Days)" colors={colors}>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. 30"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={durationDays}
                    onChangeText={v => { setDurationDays(v.replace(/\D/g, "")); setFormError(""); }}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Price (₹)" colors={colors}>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. 1500"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={price}
                    onChangeText={v => { setPrice(v.replace(/\D/g, "")); setFormError(""); }}
                  />
                </Field>
              </View>
            </View>

            <View style={s.switchRow}>
              <View>
                <Text style={s.switchLabel}>Group Classes Included</Text>
                <Text style={s.switchSub}>Members can attend group sessions</Text>
              </View>
              <Switch
                value={allowClasses}
                onValueChange={setAllowClasses}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={allowClasses ? colors.primary : colors.textMuted}
              />
            </View>

            {formError ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{formError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.submitBtn, adding && { opacity: 0.7 }]}
              onPress={handleAdd}
              disabled={adding}
              activeOpacity={0.85}
            >
              {adding
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.submitBtnText}>Add Plan →</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTitle}>No plans yet</Text>
            <Text style={s.emptySub}>Tap "Add Plan" to create your first membership plan.</Text>
          </View>
        ) : (
          plans.map((plan, idx) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              highlight={idx === 0}
              colors={colors}
              onDelete={() => handleDeleteConfirm(plan)}
            />
          ))
        )}
      </ScrollView>

      <AppAlert
        visible={alert.visible}
        type={alert.type === "confirm" ? "error" : alert.type}
        title={alert.title}
        message={alert.message}
        confirmLabel={alert.confirmLabel || "OK"}
        cancelLabel={alert.cancelLabel}
        onConfirm={alert.onConfirm || hideAlert}
        onCancel={hideAlert}
      />
    </>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, highlight, colors, onDelete }: {
  plan: any; highlight: boolean; colors: any; onDelete: () => void;
}) {
  const s = getStyles(colors);
  const perDay = plan.durationDays > 0 ? Math.round(plan.price / plan.durationDays) : 0;

  return (
    <View style={[s.planCard, highlight && { borderColor: colors.primary }]}>
      {highlight && <View style={s.planAccent} />}

      <View style={s.planHeader}>
        <View style={[s.planIcon, { backgroundColor: highlight ? colors.primaryDark : colors.surfaceElevated }]}>
          <Text style={[s.planInitial, { color: highlight ? colors.primary : colors.textSecondary }]}>
            {plan.name?.[0]?.toUpperCase() || "P"}
          </Text>
        </View>
        <View style={s.planInfo}>
          <Text style={s.planName}>{plan.name}</Text>
          <View style={s.priceRow}>
            <Text style={[s.planPrice, { color: highlight ? colors.primary : colors.warning }]}>
              ₹{plan.price?.toLocaleString("en-IN")}
            </Text>
            <Text style={s.planPeriod}>/ {plan.durationDays} days</Text>
          </View>
        </View>
        <TouchableOpacity style={s.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
          <Trash2 size={15} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      <View style={s.featuresRow}>
        <View style={s.featureItem}>
          <Check size={13} color={highlight ? colors.primary : colors.success} />
          <Text style={s.featureText}>{plan.durationDays} days duration</Text>
        </View>
        <View style={[s.perDayBadge, { backgroundColor: highlight ? colors.primaryDark : colors.surfaceElevated }]}>
          <Text style={[s.perDayText, { color: highlight ? colors.primary : colors.textSecondary }]}>
            ₹{perDay}/day
          </Text>
        </View>
      </View>

      {plan.allowClasses && (
        <View style={s.featureItem}>
          <Check size={13} color={highlight ? colors.primary : colors.success} />
          <Text style={s.featureText}>Group classes included</Text>
        </View>
      )}
    </View>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 6, fontWeight: "600" }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },

    header: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: spacing.lg,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    addBtn: {
      flexDirection: "row", alignItems: "center", gap: spacing.xs,
      backgroundColor: colors.primary, borderRadius: radius.button,
      paddingHorizontal: spacing.md, height: 38,
      borderWidth: 1, borderColor: colors.primary,
    },
    addBtnText: { ...typography.button, color: colors.textPrimary },

    // Form
    formCard: {
      backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, borderColor: colors.border,
      padding: spacing.md, marginBottom: spacing.md,
      overflow: "hidden",
    },
    formAccent: {
      position: "absolute", top: 0, left: 0, right: 0, height: 3,
      backgroundColor: colors.primary,
    },
    formTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xs },
    formRow: { flexDirection: "row", gap: spacing.sm },
    input: {
      ...typography.body, color: colors.textPrimary,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.button, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: spacing.md, height: 46,
    },
    switchRow: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.button, borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    switchLabel: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
    switchSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    errorBox: {
      backgroundColor: "rgba(229,57,53,0.08)", borderRadius: radius.button,
      borderWidth: 1, borderColor: "rgba(229,57,53,0.25)",
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
    },
    errorText: { ...typography.caption, color: colors.error },
    submitBtn: {
      backgroundColor: colors.primary, borderRadius: radius.button,
      height: 48, alignItems: "center", justifyContent: "center",
    },
    submitBtnText: { ...typography.button, color: "#fff", fontSize: 15 },

    // Plan card
    planCard: {
      backgroundColor: colors.surface, borderRadius: radius.card,
      borderWidth: 1, borderColor: colors.border,
      padding: spacing.md, marginBottom: 12,
      overflow: "hidden", gap: spacing.sm,
    },
    planAccent: {
      position: "absolute", top: 0, left: 0, right: 0, height: 3,
      backgroundColor: colors.primary,
    },
    planHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    planIcon: {
      width: 48, height: 48, borderRadius: radius.icon,
      alignItems: "center", justifyContent: "center",
    },
    planInitial: { ...typography.h2 },
    planInfo: { flex: 1 },
    planName: { ...typography.h3, color: colors.textPrimary },
    priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 2 },
    planPrice: { ...typography.h2 },
    planPeriod: { ...typography.caption, color: colors.textSecondary },
    deleteBtn: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: "rgba(229,57,53,0.1)",
      alignItems: "center", justifyContent: "center",
    },
    divider: { height: 1, backgroundColor: colors.border },
    featuresRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    featureItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    featureText: { ...typography.body, color: colors.textSecondary },
    perDayBadge: {
      paddingHorizontal: spacing.sm, paddingVertical: 3,
      borderRadius: radius.pill,
    },
    perDayText: { ...typography.caption, fontWeight: "700" },

    // Empty
    emptyBox: { alignItems: "center", paddingVertical: spacing.xl * 2 },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
    emptySub: { ...typography.body, color: colors.textMuted, textAlign: "center" },
  });
}
