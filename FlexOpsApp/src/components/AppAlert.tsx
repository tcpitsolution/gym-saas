import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../store/themeStore";
import { radius, spacing, typography } from "../theme/colors";

type AlertType = "success" | "error" | "warning" | "info" | "confirm";

interface AppAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const TYPE_CONFIG: Record<AlertType, { color: string; icon: string }> = {
  success: { color: "#2DD4C4", icon: "✓" },
  error:   { color: "#ff6b6b", icon: "✕" },
  warning: { color: "#f59e0b", icon: "⚠" },
  info:    { color: "#60a5fa", icon: "i" },
  confirm: { color: "#ff6b6b", icon: "!" },
};

export default function AppAlert({
  visible,
  type = "info",
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
  onCancel,
}: AppAlertProps) {
  const colors = useTheme();
  const cfg = TYPE_CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel ?? onConfirm}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

          {/* Icon badge */}
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: `${cfg.color}20`, borderColor: `${cfg.color}40` },
            ]}
          >
            <Text style={[styles.iconText, { color: cfg.color }]}>
              {cfg.icon}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>

          {message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}

          <View style={styles.btnRow}>
            {cancelLabel && onCancel ? (
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.cancelBtn,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.btnText, { color: colors.textSecondary }]}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                {
                  backgroundColor: `${cfg.color}18`,
                  borderColor: `${cfg.color}50`,
                  flex: cancelLabel ? 1 : undefined,
                  minWidth: cancelLabel ? undefined : 120,
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, { color: cfg.color }]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    ...typography.h3,
    marginBottom: 6,
  },
  message: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  btnRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {},
  confirmBtn: {},
  btnText: {
    ...typography.button,
    fontWeight: "700",
  },
});
