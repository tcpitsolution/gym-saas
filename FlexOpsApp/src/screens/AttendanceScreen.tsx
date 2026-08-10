import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Search, UserCheck, ScanFace, X } from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { ListItem, SectionHeader } from "../components";
import { attendanceApi, membersApi } from "../api";
import { useTheme } from "../store/themeStore";
import { useNavigationStore } from "../store/navigationStore";
import AppAlert from "../components/AppAlert";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const OVAL_W = SCREEN_W * 0.75;
const OVAL_H = SCREEN_H * 0.45;

export default function AttendanceScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const { setScreen, params, clearParams } = useNavigationStore();

  const [search, setSearch] = useState("");
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayCheckIns: 0, activeNow: 0 });
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Camera
  const [scanVisible, setScanVisible] = useState(false);
  // Note: facing is fixed to "front" since face attendance always uses the
  // front camera. Flip button was removed along with it — add back if needed.
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const isBusyRef = useRef(false);
  const scanDoneRef = useRef(false);
  const cameraReadyRef = useRef(false);

  type ScanStatus =
    | "scanning" // camera preview showing, waiting for capture to start
    | "processing" // photo taken, waiting for backend response
    | "success"
    | "already"
    | "unknown";
  const [scanStatus, setScanStatus] = useState<ScanStatus>("scanning");
  const [matchedMember, setMatchedMember] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // AppAlert
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({ visible: false, type: "info", title: "" });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string,
  ) => setAlert({ visible: true, type, title, message });

  const load = useCallback(async () => {
    try {
      const [logs, attStats, members] = await Promise.all([
        attendanceApi.today(),
        attendanceApi.stats(),
        membersApi.getAll(),
      ]);
      setCheckIns(logs);
      setStats(attStats);
      setAllMembers(members);
      setTotalMembers(members.length);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-open camera when navigated here with autoScan param
  useEffect(() => {
    if (params?.autoScan) {
      openFaceScan();
      clearParams();
    }
  }, [params?.autoScan]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleManualCheckin = async (memberId: string, memberName: string) => {
    setCheckinLoading(true);
    setShowSuggestions(false);
    setManualSearch(memberName);
    try {
      await attendanceApi.checkin(memberId, "Manual");
      showAlert(
        "success",
        "Checked In!",
        `${memberName} checked in successfully.`,
      );
      setManualSearch("");
      load();
    } catch (err: any) {
      showAlert("error", "Check-in Failed", err.message);
    } finally {
      setCheckinLoading(false);
    }
  };

  const suggestions =
    manualSearch.trim().length > 0
      ? allMembers
          .filter((m) =>
            m.name.toLowerCase().includes(manualSearch.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  const openFaceScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        showAlert(
          "warning",
          "Camera Permission Required",
          "Please allow camera access to use face attendance.",
        );
        return;
      }
    }
    setMatchedMember(null);
    setScanStatus("scanning");
    isBusyRef.current = false;
    scanDoneRef.current = false;
    cameraReadyRef.current = false;
    setIsProcessing(false);
    setScanVisible(true);
  };

  const closeFaceScan = () => {
    isBusyRef.current = true; // stop any pending scan
    scanDoneRef.current = true;
    setScanVisible(false);
  };

  // Takes exactly ONE photo and waits for the backend result.
  // Will not run again until retryScan() is called manually.
  const scanFace = useCallback(async () => {
    if (isBusyRef.current || scanDoneRef.current || !cameraRef.current) return;
    isBusyRef.current = true;
    setIsProcessing(true);
    setScanStatus("processing");
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.25,
        base64: true,
        skipProcessing: true,
      });
      const data = await attendanceApi.faceScan(
        `data:image/jpeg;base64,${photo.base64}`,
      );

      if (!data.matched) {
        // No match — stop here and show the "not recognized" screen.
        // No automatic retry; user must tap "Try Again".
        scanDoneRef.current = true;
        setIsProcessing(false);
        setScanStatus("unknown");
        return;
      }

      // Matched
      scanDoneRef.current = true;
      setMatchedMember(data.member);
      setScanStatus(data.alreadyCheckedIn ? "already" : "success");
      load();
    } catch {
      // Network/backend error — let the user retry manually rather than
      // looping automatically.
      scanDoneRef.current = true;
      setIsProcessing(false);
      setScanStatus("unknown");
    }
  }, [load]);

  // Fires once when the camera view is ready — this is what triggers the
  // single automatic capture (replaces the old onFacesDetected / interval
  // approach, which isn't supported by this expo-camera version).
  const handleCameraReady = useCallback(() => {
    if (cameraReadyRef.current) return; // guard against duplicate fires
    cameraReadyRef.current = true;
    scanFace();
  }, [scanFace]);

  // Auto-close after success/already
  useEffect(() => {
    if (scanStatus === "success" || scanStatus === "already") {
      const t = setTimeout(() => setScanVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [scanStatus]);

  // Manually triggered by the "Try Again" button — takes exactly one more
  // photo, no automatic repeats after this either.
  const retryScan = () => {
    setMatchedMember(null);
    isBusyRef.current = false;
    scanDoneRef.current = false;
    setIsProcessing(false);
    setScanStatus("scanning");
    scanFace();
  };

  const goAddMember = () => {
    setScanVisible(false);
    setScreen("addMember");
  };

  const pct =
    totalMembers > 0
      ? Math.round((stats.todayCheckIns / totalMembers) * 100)
      : 0;

  const filtered = checkIns.filter((c) =>
    c.memberId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
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
        <Text style={styles.title}>Attendance</Text>

        {/* Face Scan Card */}
        <TouchableOpacity
          style={styles.scanCard}
          activeOpacity={0.85}
          onPress={openFaceScan}
        >
          <View style={styles.scanIconWrap}>
            <ScanFace size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanTitle}>Scan Attendance</Text>
            <Text style={styles.scanSub}>
              Auto check-in via face recognition
            </Text>
          </View>
        </TouchableOpacity>

        {/* Stats Ring */}
        <View style={styles.ringCard}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringBig}>{pct}%</Text>
              <Text style={styles.ringSmall}>Today</Text>
            </View>
          </View>
          <View style={styles.ringMeta}>
            <View style={styles.metaRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.metaText}>
                {stats.todayCheckIns} Checked In
              </Text>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <Text style={styles.metaText}>{stats.activeNow} Inside Now</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.dot, { backgroundColor: colors.border }]} />
              <Text style={styles.metaText}>{totalMembers} Total Members</Text>
            </View>
          </View>
        </View>

        {/* Manual Check-in */}
        <View style={styles.manualCard}>
          <Text style={styles.cardTitle}>Manual Check-in</Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.manualInput}
              placeholder="Search member by name..."
              placeholderTextColor={colors.textMuted}
              value={manualSearch}
              onChangeText={(t) => {
                setManualSearch(t);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {checkinLoading && (
              <ActivityIndicator
                color={colors.primary}
                size="small"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          {showSuggestions && suggestions.length > 0 && (
            <View
              style={[
                styles.suggestionBox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              {suggestions.map((m) => (
                <TouchableOpacity
                  key={m._id}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => handleManualCheckin(m._id, m.name)}
                  activeOpacity={0.7}
                >
                  <UserCheck size={14} color={colors.primary} />
                  <Text
                    style={[
                      styles.suggestionText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {m.name}
                  </Text>
                  <Text
                    style={[styles.suggestionSub, { color: colors.textMuted }]}
                  >
                    {m.phone}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search check-ins..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <SectionHeader title={`Today's Check-ins (${checkIns.length})`} />
        <View style={styles.card}>
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No check-ins yet today</Text>
          ) : (
            filtered.map((c, i) => (
              <View key={c._id}>
                <ListItem
                  name={c.memberId?.name || "Unknown"}
                  sub={`${c.method} · ${new Date(c.checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                />
                {i < filtered.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Face Scan Modal ── */}
      <Modal
        visible={scanVisible}
        animationType="slide"
        onRequestClose={closeFaceScan}
      >
        <View style={styles.modalContainer}>
          {/* Camera view with oval overlay */}
          {(scanStatus === "scanning" || scanStatus === "processing") && (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
                onCameraReady={handleCameraReady}
              />

              <View style={styles.overlay}>
                {/* Oval - green when processing, orange otherwise */}
                <View
                  style={[
                    styles.faceFrame,
                    {
                      borderColor: isProcessing ? "#22c55e" : colors.primary,
                      shadowColor: isProcessing ? "#22c55e" : colors.primary,
                    },
                  ]}
                />

                <View style={styles.hintBox}>
                  {isProcessing ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#22c55e" />
                      <Text style={[styles.hintText, { color: "#22c55e" }]}>
                        Attendance processing...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.hintText}>
                      Position your face inside the oval
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Success */}
          {scanStatus === "success" && matchedMember && (
            <View style={styles.resultCenter}>
              <View
                style={[
                  styles.resultCircle,
                  {
                    backgroundColor: "rgba(34,197,94,0.15)",
                    borderColor: "#22c55e",
                  },
                ]}
              >
                <Text style={[styles.resultIcon, { color: "#22c55e" }]}>✓</Text>
              </View>
              <Text style={styles.resultTitle}>Checked In!</Text>
              <Text style={styles.resultName}>{matchedMember.name}</Text>
              <Text style={styles.resultSub}>Attendance marked for today</Text>
            </View>
          )}

          {/* Already checked in */}
          {scanStatus === "already" && matchedMember && (
            <View style={styles.resultCenter}>
              <View
                style={[
                  styles.resultCircle,
                  {
                    backgroundColor: "rgba(245,166,35,0.15)",
                    borderColor: "#F5A623",
                  },
                ]}
              >
                <Text style={[styles.resultIcon, { color: "#F5A623" }]}>!</Text>
              </View>
              <Text style={styles.resultTitle}>Already Checked In</Text>
              <Text style={styles.resultName}>{matchedMember.name}</Text>
              <Text style={styles.resultSub}>
                Attendance was already marked today
              </Text>
            </View>
          )}

          {/* Unknown face — no match found. Offers Add Member (for new
              people) and Try Again (manual retry, no auto-loop). */}
          {scanStatus === "unknown" && (
            <View style={styles.resultCenter}>
              <View
                style={[
                  styles.resultCircle,
                  {
                    backgroundColor: "rgba(229,57,53,0.15)",
                    borderColor: colors.error,
                  },
                ]}
              >
                <Text style={[styles.resultIcon, { color: colors.error }]}>
                  ?
                </Text>
              </View>
              <Text style={styles.resultTitle}>Face Not Recognized</Text>
              <Text style={styles.resultSub}>
                Face could not be matched. If this is an existing member, try
                better lighting or a different angle. If they're new, add them
                below.
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={goAddMember}
                activeOpacity={0.85}
              >
                <Text style={styles.addBtnText}>+ Add as New Member</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={retryScan}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={closeFaceScan}>
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      <AppAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmLabel="OK"
        onConfirm={() => setAlert((a) => ({ ...a, visible: false }))}
      />
    </>
  );
}

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
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    scanCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: spacing.md,
    },
    scanIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
    },
    scanTitle: { ...typography.h3, color: colors.textPrimary },
    scanSub: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    ringCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.lg,
    },
    ringOuter: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 12,
      borderColor: colors.border,
      borderTopColor: colors.primary,
      borderRightColor: colors.primary,
      borderBottomColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    ringInner: { alignItems: "center" },
    ringBig: { ...typography.h1, color: colors.textPrimary },
    ringSmall: { ...typography.caption, color: colors.textSecondary },
    ringMeta: { flex: 1, gap: spacing.sm },
    metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    dot: { width: 8, height: 8, borderRadius: 4 },
    metaText: { ...typography.body, color: colors.textPrimary },
    manualCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 12,
    },
    cardTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    manualRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
    manualInput: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
    },
    suggestionBox: {
      borderWidth: 1,
      borderRadius: radius.card,
      marginTop: spacing.xs,
      overflow: "hidden",
    },
    suggestionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
    },
    suggestionText: { ...typography.body, flex: 1 },
    suggestionSub: { ...typography.caption },
    checkinBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.button,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
      marginTop: spacing.md,
    },
    searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    divider: { height: 1, backgroundColor: colors.border },
    empty: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.md,
    },

    // ── Modal ──
    modalContainer: { flex: 1, backgroundColor: "#000" },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    faceFrame: {
      width: OVAL_W,
      height: OVAL_H,
      borderRadius: OVAL_W / 2,
      borderWidth: 3,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 14,
      elevation: 10,
    },
    hintBox: {
      marginTop: 24,
      backgroundColor: "rgba(0,0,0,0.5)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    hintText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    closeBtn: {
      position: "absolute",
      top: 50,
      left: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
    },

    // ── Result screens ──
    resultCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0d0d0d",
      padding: 24,
    },
    resultCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    resultIcon: { fontSize: 44, fontWeight: "700" },
    resultTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
    },
    resultName: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: "600",
      marginTop: 8,
      textAlign: "center",
    },
    resultSub: {
      color: "#999",
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 20,
    },
    addBtn: {
      marginTop: 28,
      backgroundColor: colors.primary,
      paddingVertical: 13,
      paddingHorizontal: 32,
      borderRadius: 12,
    },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    retryBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 20 },
    retryBtnText: { color: "#999", fontSize: 14, fontWeight: "600" },
  });
}
