import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  Linking,
} from "react-native";
import {
  User,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  ChevronRight,
  Shield,
  Phone,
  Sun,
  Moon,
  Globe,
  MessageCircle,
  Info,
  Trash2,
  Edit3,
  Check,
  X,
} from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { useTheme, useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { useNavigationStore } from "../store/navigationStore";
import { useLanguageStore, useTranslation } from "../store/languageStore";
import { authApi } from "../api";
import AppAlert from "../components/AppAlert";

const APP_VERSION = "1.0.0";
const SUPPORT_WHATSAPP = "https://wa.me/917508544679";

type AlertType = "success" | "error" | "warning" | "confirm";

function getAvatarLetters(name?: string, email?: string): string {
  const src = name?.trim() || email?.trim() || "";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length > 0)
    return parts[0][0].toUpperCase();
  return "U";
}

function validatePassword(pass: string, t: (k: any) => string): string | null {
  if (pass.length < 8) return t("passwordMin8");
  if (!/[A-Z]/.test(pass)) return t("passwordUppercase");
  if (!/[0-9]/.test(pass)) return t("passwordNumber");
  if (!/[!@#$%^&*]/.test(pass)) return t("passwordSpecial");
  return null;
}

export default function ProfileScreen() {
  const colors = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout, updateUser } = useAuthStore();
  const { setScreen } = useNavigationStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  // Edit profile
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.ownerName || "");
  const [editPhone, setEditPhone] = useState((user as any)?.phone || "");
  const [editLoading, setEditLoading] = useState(false);

  // Keep local edit fields in sync if user data refreshes elsewhere.
  // Guarded with equality checks so this never fires a setState when the
  // value hasn't actually changed (avoids infinite render loops if the
  // store ever returns a new `user` object reference on every render).
  const userOwnerName = user?.ownerName ?? "";
  const userPhone = (user as any)?.phone ?? "";
  useEffect(() => {
    if (!editMode) {
      setEditName(userOwnerName);
      setEditPhone(userPhone);
    }
  }, [userOwnerName, userPhone, editMode]);

  // Change password
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");

  // Alert state
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message?: string;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  }>({ visible: false, type: "success", title: "" });

  const showAlert = (
    type: AlertType,
    title: string,
    message?: string,
    onConfirm?: () => void,
    confirmLabel?: string,
    cancelLabel?: string,
  ) =>
    setAlert({
      visible: true,
      type,
      title,
      message,
      onConfirm,
      confirmLabel,
      cancelLabel,
    });

  const hideAlert = () => setAlert((a) => ({ ...a, visible: false }));

  const roleLabel: Record<string, string> = {
    owner: t("owner"),
    manager: t("manager"),
    trainer: t("trainer"),
    staff: t("staff"),
    superadmin: t("superadmin"),
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showAlert("error", t("error"), t("nameRequired"));
      return;
    }
    setEditLoading(true);
    try {
      await authApi.updateProfile({ ownerName: editName.trim(), phone: editPhone.trim() });
      updateUser({ ownerName: editName.trim(), phone: editPhone.trim() });
      setEditMode(false);
      showAlert("success", t("success"), t("profileUpdated"));
    } catch (err: any) {
      showAlert("error", t("error"), err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPassError("");
    if (!currentPassword) {
      setPassError(t("currentPasswordRequired"));
      return;
    }
    const validErr = validatePassword(newPassword, t);
    if (validErr) {
      setPassError(validErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError(t("passwordsNoMatch"));
      return;
    }

    setPassLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setShowChangePass(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert("success", t("success"), t("passwordUpdated"));
    } catch (err: any) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      "confirm",
      t("logoutTitle"),
      t("logoutConfirm"),
      async () => {
        hideAlert();
        await logout();
        setScreen("index");
      },
      t("logout"),
      t("cancel"),
    );
  };

  const handleDeleteAccount = () => {
    showAlert(
      "confirm",
      t("deleteAccountTitle"),
      t("deleteAccountConfirm"),
      () => {
        hideAlert();
        showAlert(
          "warning",
          "Contact Support",
          "Please contact support to delete your account.",
        );
      },
      t("yes"),
      t("cancel"),
    );
  };

  const s = makeStyles(colors);

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + Info ── */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {getAvatarLetters(user?.ownerName, user?.email)}
              </Text>
            </View>
            <TouchableOpacity
              style={s.editAvatarBtn}
              onPress={() => setEditMode(true)}
              activeOpacity={0.8}
            >
              <Edit3 size={14} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {editMode ? (
            <View style={{ width: "100%", gap: spacing.xs }}>
              <View style={s.editNameRow}>
                <TextInput
                  style={[
                    s.editNameInput,
                    {
                      color: colors.textPrimary,
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t("name")}
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
                <TouchableOpacity
                  style={s.editActionBtn}
                  onPress={handleSaveProfile}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <ActivityIndicator size="small" color={colors.success} />
                  ) : (
                    <Check size={18} color={colors.success} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.editActionBtn}
                  onPress={() => {
                    setEditMode(false);
                    setEditName(user?.ownerName || "");
                    setEditPhone((user as any)?.phone || "");
                  }}
                >
                  <X size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  s.editNameInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder={t("phone")}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <Text style={s.name}>{user?.ownerName || "User"}</Text>
          )}

          <View style={s.roleBadge}>
            <Shield size={12} color={colors.primary} />
            <Text style={s.roleText}>
              {roleLabel[user?.role || ""] || user?.role || "Member"}
            </Text>
          </View>
          {user?.gymName && <Text style={s.gymName}>{user.gymName}</Text>}
        </View>

        {/* ── Account Info ── */}
        <SectionCard title={t("accountInfo")} colors={colors}>
          <InfoRow
            icon={<User size={16} color={colors.primary} />}
            label={t("name")}
            value={user?.ownerName || "—"}
            colors={colors}
          />
          <Divider colors={colors} />
          <InfoRow
            icon={<Lock size={16} color={colors.primary} />}
            label={t("email")}
            value={user?.email || "—"}
            colors={colors}
          />
          <Divider colors={colors} />
          <InfoRow
            icon={<Phone size={16} color={colors.primary} />}
            label={t("phone")}
            value={(user as any)?.phone || "—"}
            colors={colors}
          />
          {(user as any)?.alternatePhone ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<Phone size={16} color={colors.primary} />}
                label="Alternate Phone"
                value={(user as any).alternatePhone}
                colors={colors}
              />
            </>
          ) : null}
          <Divider colors={colors} />
          <InfoRow
            icon={<Shield size={16} color={colors.primary} />}
            label={t("role")}
            value={roleLabel[user?.role || ""] || "—"}
            colors={colors}
          />
          {(user as any)?.address ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<User size={16} color={colors.primary} />}
                label="Address"
                value={(user as any).address}
                colors={colors}
              />
            </>
          ) : null}
          {(user as any)?.aadharNumber ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<Shield size={16} color={colors.primary} />}
                label="Aadhar Number"
                value={(user as any).aadharNumber}
                colors={colors}
              />
            </>
          ) : null}
          {(user as any)?.panNumber ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<Shield size={16} color={colors.primary} />}
                label="PAN Number"
                value={(user as any).panNumber}
                colors={colors}
              />
            </>
          ) : null}
          {(user as any)?.joiningDate ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<User size={16} color={colors.primary} />}
                label="Joining Date"
                value={new Date((user as any).joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                colors={colors}
              />
            </>
          ) : null}
          {user?.gymName && (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<User size={16} color={colors.primary} />}
                label={t("gym")}
                value={user.gymName}
                colors={colors}
              />
            </>
          )}
          {(user as any)?.gymAddress ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<User size={16} color={colors.primary} />}
                label="Gym Address"
                value={(user as any).gymAddress}
                colors={colors}
              />
            </>
          ) : null}
          {(user as any)?.gymPhone ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<Phone size={16} color={colors.primary} />}
                label="Gym Phone"
                value={(user as any).gymPhone}
                colors={colors}
              />
            </>
          ) : null}
          {(user as any)?.gymEmail ? (
            <>
              <Divider colors={colors} />
              <InfoRow
                icon={<Lock size={16} color={colors.primary} />}
                label="Gym Email"
                value={(user as any).gymEmail}
                colors={colors}
              />
            </>
          ) : null}
        </SectionCard>

        {/* ── Change Password ── */}
        <TouchableOpacity
          style={[
            s.actionRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => {
            setShowChangePass((p) => !p);
            setPassError("");
          }}
          activeOpacity={0.7}
        >
          <View style={s.actionLeft}>
            <View
              style={[s.actionIcon, { backgroundColor: colors.primaryDark }]}
            >
              <Lock size={18} color={colors.primary} />
            </View>
            <Text style={[s.actionText, { color: colors.textPrimary }]}>
              {t("changePassword")}
            </Text>
          </View>
          <ChevronRight
            size={18}
            color={colors.textMuted}
            style={{
              transform: [{ rotate: showChangePass ? "90deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>

        {showChangePass && (
          <View
            style={[
              s.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {passError ? (
              <Text style={[s.errorText, { color: colors.error }]}>
                {passError}
              </Text>
            ) : null}

            <PasswordInput
              placeholder={t("currentPassword")}
              value={currentPassword}
              onChangeText={(v: string) => {
                setCurrentPassword(v);
                setPassError("");
              }}
              show={showCurrent}
              onToggle={() => setShowCurrent((p) => !p)}
              colors={colors}
            />
            <PasswordInput
              placeholder={t("newPassword")}
              value={newPassword}
              onChangeText={(v: string) => {
                setNewPassword(v);
                setPassError("");
              }}
              show={showNew}
              onToggle={() => setShowNew((p) => !p)}
              colors={colors}
              style={{ marginTop: spacing.sm }}
            />
            <PasswordStrength password={newPassword} colors={colors} />
            <PasswordInput
              placeholder={t("confirmPassword")}
              value={confirmPassword}
              onChangeText={(v: string) => {
                setConfirmPassword(v);
                setPassError("");
              }}
              show={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
              colors={colors}
              style={{ marginTop: spacing.sm }}
            />

            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
              disabled={passLoading}
              activeOpacity={0.85}
            >
              {passLoading ? (
                <ActivityIndicator color={colors.textPrimary} size="small" />
              ) : (
                <Text style={[s.saveBtnText, { color: colors.textPrimary }]}>
                  {t("updatePassword")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── App Settings ── */}
        <SectionCard title={t("appSettings")} colors={colors}>
          {/* Dark Mode */}
          <View style={s.settingRow}>
            <View style={s.actionLeft}>
              <View
                style={[s.actionIcon, { backgroundColor: colors.primaryDark }]}
              >
                {isDark ? (
                  <Moon size={16} color={colors.primary} />
                ) : (
                  <Sun size={16} color={colors.primary} />
                )}
              </View>
              <Text style={[s.actionText, { color: colors.textPrimary }]}>
                {t("darkMode")}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryDark }}
              thumbColor={isDark ? colors.primary : colors.textMuted}
            />
          </View>

          <Divider colors={colors} />

          {/* Language */}
          <View style={s.settingRow}>
            <View style={s.actionLeft}>
              <View
                style={[s.actionIcon, { backgroundColor: colors.primaryDark }]}
              >
                <Globe size={16} color={colors.primary} />
              </View>
              <Text style={[s.actionText, { color: colors.textPrimary }]}>
                {t("language")}
              </Text>
            </View>
            <View style={s.langToggle}>
              <TouchableOpacity
                style={[
                  s.langBtn,
                  language === "en" && { backgroundColor: colors.primary },
                ]}
                onPress={() => setLanguage("en")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.langBtnText,
                    {
                      color:
                        language === "en"
                          ? colors.textPrimary
                          : colors.textMuted,
                    },
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.langBtn,
                  language === "hi" && { backgroundColor: colors.primary },
                ]}
                onPress={() => setLanguage("hi")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.langBtnText,
                    {
                      color:
                        language === "hi"
                          ? colors.textPrimary
                          : colors.textMuted,
                    },
                  ]}
                >
                  हि
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        {/* ── Support ── */}
        <SectionCard title={t("support")} colors={colors}>
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => Linking.openURL(SUPPORT_WHATSAPP)}
            activeOpacity={0.7}
          >
            <View style={s.actionLeft}>
              <View style={[s.actionIcon, { backgroundColor: "#0C5330" }]}>
                <MessageCircle size={16} color={colors.success} />
              </View>
              <Text style={[s.actionText, { color: colors.textPrimary }]}>
                {t("whatsappSupport")}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
          <Divider colors={colors} />
          <View style={s.settingRow}>
            <View style={s.actionLeft}>
              <View
                style={[s.actionIcon, { backgroundColor: colors.purpleBg }]}
              >
                <Info size={16} color={colors.purple} />
              </View>
              <Text style={[s.actionText, { color: colors.textPrimary }]}>
                {t("appVersion")}
              </Text>
            </View>
            <Text style={[s.versionText, { color: colors.textMuted }]}>
              v{APP_VERSION}
            </Text>
          </View>
        </SectionCard>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={colors.error} />
          <Text style={[s.logoutText, { color: colors.error }]}>
            {t("logout")}
          </Text>
        </TouchableOpacity>

        {/* ── Delete Account ── */}
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Trash2 size={14} color={colors.textMuted} />
          <Text style={[s.deleteText, { color: colors.textMuted }]}>
            {t("deleteAccount")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AppAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmLabel={alert.confirmLabel || t("ok")}
        cancelLabel={alert.cancelLabel}
        onConfirm={alert.onConfirm || hideAlert}
        onCancel={hideAlert}
      />
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  const s = React.useMemo(() => makeStyles(colors), [colors]);
  return (
    <View
      style={[
        s.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: any;
}) {
  const s = React.useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={s.infoRow}>
      <View style={[s.infoIcon, { backgroundColor: colors.primaryDark }]}>
        {icon}
      </View>
      <View style={s.infoContent}>
        <Text style={[s.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[s.infoValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.xs,
      }}
    />
  );
}

function PasswordInput({
  placeholder,
  value,
  onChangeText,
  show,
  onToggle,
  colors,
  style,
}: any) {
  const s = React.useMemo(() => makeStyles(colors), [colors]);
  return (
    <View
      style={[
        s.inputBox,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        style,
      ]}
    >
      <TextInput
        style={[s.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={onToggle}>
        {show ? (
          <Eye size={16} color={colors.textMuted} />
        ) : (
          <EyeOff size={16} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    </View>
  );
}

function PasswordStrength({
  password,
  colors,
}: {
  password: string;
  colors: any;
}) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const strengthColor =
    score <= 1
      ? colors.error
      : score === 2
        ? colors.warning
        : score === 3
          ? "#F5A623"
          : colors.success;
  const label =
    score <= 1
      ? "Weak"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : "Strong";

  return (
    <View style={{ marginTop: 6, gap: 4 }}>
      <View style={{ flexDirection: "row", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i < score ? strengthColor : colors.border,
            }}
          />
        ))}
      </View>
      <Text style={{ ...typography.caption, color: strengthColor }}>
        {label}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl, gap: 12 },

    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      gap: spacing.xs,
    },
    avatarWrap: { position: "relative", marginBottom: spacing.xs },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    avatarText: { fontSize: 30, fontWeight: "700", color: colors.primary },
    editAvatarBtn: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.surface,
    },
    editNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      width: "100%",
    },
    editNameInput: {
      flex: 1,
      height: 40,
      borderRadius: radius.button,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      ...typography.h3,
    },
    editActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceElevated,
    },
    name: { ...typography.h2, color: colors.textPrimary },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primaryDark,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    roleText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "600",
    },
    gymName: { ...typography.body, color: colors.textSecondary },

    card: {
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      gap: 2,
    },
    sectionTitle: {
      ...typography.caption,
      fontWeight: "700",
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
    },
    divider: { height: 1, marginVertical: spacing.xs },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    infoIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.icon,
      alignItems: "center",
      justifyContent: "center",
    },
    infoContent: { flex: 1 },
    infoLabel: { ...typography.caption },
    infoValue: { ...typography.body, fontWeight: "500" },

    actionRow: {
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    actionLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.icon,
      alignItems: "center",
      justifyContent: "center",
    },
    actionText: { ...typography.h3 },

    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },

    langToggle: {
      flexDirection: "row",
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    langBtn: { paddingHorizontal: 14, paddingVertical: 6 },
    langBtnText: { ...typography.caption, fontWeight: "700" },

    versionText: { ...typography.caption },

    errorText: { ...typography.caption, marginBottom: spacing.sm },
    inputBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: radius.button,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      height: 48,
    },
    input: { flex: 1, ...typography.body },
    saveBtn: {
      borderRadius: radius.button,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
    },
    saveBtnText: { ...typography.button },

    logoutBtn: {
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: "#3D1515",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    logoutText: { ...typography.button },

    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    deleteText: { ...typography.caption },
  });
}
