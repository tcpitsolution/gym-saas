import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Check } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { plansApi } from "../api";
import { useTheme } from "../store/themeStore";

export default function PlansScreen() {
  const colors = useTheme();
  const styles = getStyles(colors); // 👈 styles ab colors ke saath dynamically banti hain

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await plansApi.getAll();
      setPlans(data);
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
      <Text style={styles.title}>Membership Plans</Text>
      <Text style={styles.sub}>Your gym's active plans</Text>

      {plans.length === 0 ? (
        <Text style={styles.empty}>No plans created yet</Text>
      ) : (
        plans.map((plan, idx) => (
          <View
            key={plan._id}
            style={[styles.planCard, idx === 0 && styles.planCardHighlight]}
          >
            <View style={styles.planHeader}>
              <View
                style={[
                  styles.planIcon,
                  {
                    backgroundColor:
                      idx === 0 ? colors.primaryDark : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.planInitial,
                    {
                      color: idx === 0 ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {plan.name[0]}
                </Text>
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text
                    style={[
                      styles.planPrice,
                      { color: idx === 0 ? colors.primary : colors.warning },
                    ]}
                  >
                    ₹{plan.price?.toLocaleString("en-IN")}
                  </Text>
                  <Text style={styles.planPeriod}>
                    / {plan.durationDays} days
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.featureRow}>
              <Check
                size={14}
                color={idx === 0 ? colors.primary : colors.success}
              />
              <Text style={styles.featureText}>
                Duration: {plan.durationDays} days
              </Text>
            </View>
            {plan.allowClasses && (
              <View style={styles.featureRow}>
                <Check
                  size={14}
                  color={idx === 0 ? colors.primary : colors.success}
                />
                <Text style={styles.featureText}>Group Classes Included</Text>
              </View>
            )}
          </View>
        ))
      )}
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
    title: { ...typography.h1, color: colors.textPrimary },
    sub: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      gap: spacing.sm,
    },
    planCardHighlight: { borderColor: colors.primary },
    planHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    planIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.icon,
      alignItems: "center",
      justifyContent: "center",
    },
    planInitial: { ...typography.h2 },
    planInfo: { flex: 1 },
    planName: { ...typography.h3, color: colors.textPrimary },
    priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
    planPrice: { ...typography.h2 },
    planPeriod: { ...typography.caption, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.border },
    featureRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    featureText: { ...typography.body, color: colors.textSecondary },
    empty: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });
}
