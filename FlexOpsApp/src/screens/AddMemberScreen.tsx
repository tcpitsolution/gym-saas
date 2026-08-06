import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import AppAlert from "../components/AppAlert";
import { useNavigationStore } from "../store/navigationStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  User,
  Image as ImageIcon,
  Camera,
  ChevronDown,
  Calendar,
} from "lucide-react-native";
import { spacing, radius, typography } from "../theme/colors";
import { membersApi, plansApi, trainersApi, otpApi } from "../api";
import { useTheme } from "../store/themeStore";

const MAX_DIM = 500;

const JOIN_SOURCES = [
  "Walk-in",
  "Referral",
  "Instagram",
  "Facebook",
  "Google",
  "Other",
];
const PAYMENT_MODES = ["cash", "upi", "card", "online"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function AddMemberScreen() {
  const colors = useTheme();
  const styles = getStyles(colors);
  const { setScreen } = useNavigationStore();

  // ---- Photo ----
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  // ---- Personal Info ----
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [goal, setGoal] = useState("");
  const [joinSource, setJoinSource] = useState("");

  // ---- Email OTP verification ----
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpPopupVisible, setOtpPopupVisible] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Membership ----
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [startDateText, setStartDateText] = useState(formatDate(new Date()));
  const [startDateError, setStartDateError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // ---- Payment ----
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- AppAlert state ----
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    onConfirm?: () => void;
  }>({ type: "info", title: "" });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string,
    onConfirm?: () => void,
  ) => {
    setAlertConfig({ type, title, message, onConfirm });
    setAlertVisible(true);
  };

  // ---- generic dropdown modal state ----
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<
    { label: string; value: any }[]
  >([]);
  const pickerOnSelectRef = useRef<(v: any) => void>(() => {});
  const [pickerTitle, setPickerTitle] = useState("");

  const openPicker = (
    title: string,
    options: { label: string; value: any }[],
    onSelect: (v: any) => void,
  ) => {
    setPickerTitle(title);
    setPickerOptions(options);
    pickerOnSelectRef.current = onSelect;
    setPickerVisible(true);
  };

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([
        plansApi.getAll(),
        trainersApi.getAll(),
      ]);
      setPlans(p);
      setTrainers(t);
    } catch {}
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ---------- Phone (max 10 digits, numeric only) ----------
  const handlePhoneChange = (val: string) => {
    setPhone(val.replace(/\D/g, "").slice(0, 10));
  };

  const handleEmergencyContactChange = (val: string) => {
    setEmergencyContact(val.replace(/\D/g, "").slice(0, 10));
  };

  // ---------- Email OTP ----------
  const startCountdown = () => {
    setCountdown(120);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setEmailVerified(false);
  };

  const handleSendOtp = async () => {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      showAlert("warning", "Invalid Email", "Please enter a valid email address");
      return;
    }
    setOtpSending(true);
    try {
      await otpApi.send(email.trim());
      setOtpValue("");
      setOtpError("");
      setOtpPopupVisible(true);
      startCountdown();
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await otpApi.verify(email.trim(), otpValue);
      if (res.success) {
        setEmailVerified(true);
        setOtpPopupVisible(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setOtpError(res.message || "Invalid OTP");
      }
    } catch (err: any) {
      setOtpError(err.message || "Verification failed");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    try {
      await otpApi.send(email.trim());
      setOtpValue("");
      startCountdown();
    } catch {
      showAlert("error", "Error", "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  // ---------- Photo handling ----------
  const processAndSetPhoto = async (uri: string) => {
    setPhotoBusy(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_DIM } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );
      setPhoto(`data:image/jpeg;base64,${result.base64}`);
    } catch {
      showAlert("error", "Error", "Could not process photo, please try again");
    } finally {
      setPhotoBusy(false);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert("warning", "Permission Required", "Please allow gallery access to pick a photo");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.[0]) {
      processAndSetPhoto(res.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      showAlert("warning", "Permission Required", "Please allow camera access to take a photo");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.[0]) {
      processAndSetPhoto(res.assets[0].uri);
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!fullName.trim()) {
      showAlert("warning", "Required", "Please enter the member's full name");
      return;
    }
    if (phone.trim().length !== 10) {
      showAlert("warning", "Invalid Phone", "Phone number must be exactly 10 digits");
      return;
    }
    if (emergencyContact.trim().length > 0 && emergencyContact.trim().length !== 10) {
      showAlert("warning", "Invalid Emergency Contact", "Emergency contact must be exactly 10 digits");
      return;
    }
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      showAlert("warning", "Invalid Email", "Please enter a valid email address");
      return;
    }
    if (!selectedPlan) {
      showAlert("warning", "Required", "Please select a membership plan");
      return;
    }
    if (!agreed) {
      showAlert("warning", "Required", "Please accept the gym terms and conditions");
      return;
    }
    if (amountPaid && isNaN(Number(amountPaid))) {
      showAlert("warning", "Invalid Amount", "Please enter a valid numeric amount");
      return;
    }

    setSubmitting(true);
    try {
      const newMember = await membersApi.create({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        goal: goal.trim() || undefined,
        joinSource: joinSource || undefined,
        planId: selectedPlan._id,
        startDate: startDate.toISOString(),
        trainerId: selectedTrainer?._id || undefined,
        amount: amountPaid ? Number(amountPaid) : 0,
        mode: paymentMode,
        notes: notes.trim() || undefined,
        photo: photo || undefined,
        agreeTerms: agreed,
      });

      // If photo was provided, enroll face for recognition.
      if (photo && newMember?._id) {
        try {
          const enrollRes = await membersApi.enrollFace(newMember._id, photo);
          if (!enrollRes.success) {
            showAlert("warning", "Member Added", enrollRes.error || "Member added but face recognition failed.");
          }
        } catch {
          // enroll failed but member was added, don't block
        }
      }

      showAlert("success", "Member Added!", `${fullName} has been added successfully.`, () => setScreen("members"));
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Failed to add member, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* PHOTO */}
      <Text style={styles.sectionLabel}>PHOTO</Text>
      <View style={styles.photoRow}>
        <View style={styles.avatarBox}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarImg} />
          ) : (
            <User size={26} color={colors.primary} />
          )}
          {photoBusy && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.photoBtn, { backgroundColor: "rgba(255,90,54,0.1)" }]}
          onPress={pickFromLibrary}
          disabled={photoBusy}
        >
          <ImageIcon size={14} color={colors.primary} />
          <Text style={[styles.photoBtnText, { color: colors.primary }]}>
            Choose from Library
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.photoBtn, { backgroundColor: "rgba(45,212,196,0.1)" }]}
          onPress={takePhoto}
          disabled={photoBusy}
        >
          <Camera size={14} color="#2DD4C4" />
          <Text style={[styles.photoBtnText, { color: "#2DD4C4" }]}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* PERSONAL INFO */}
      <Text style={styles.sectionLabel}>PERSONAL INFO</Text>

      <Field label="Full Name" colors={colors}>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
        />
      </Field>

      <Field label="Phone" colors={colors}>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={handlePhoneChange}
        />
        {phone.length > 0 && phone.length < 10 && (
          <Text style={styles.fieldError}>Phone number must be 10 digits</Text>
        )}
      </Field>

      <Field label="Email (optional)" colors={colors}>
        <View style={styles.emailRow}>
          <TextInput
            style={[
              styles.input,
              { flex: 1 },
              emailVerified && { borderColor: "#2DD4C4" },
            ]}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={handleEmailChange}
          />
          {email.trim().length > 0 && !emailVerified && (
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleSendOtp}
              disabled={otpSending}
            >
              {otpSending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>
          )}
          {emailVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
            </View>
          )}
        </View>
        {email.trim().length > 0 && !EMAIL_REGEX.test(email.trim()) && (
          <Text style={styles.fieldError}>Please enter a valid email address</Text>
        )}
      </Field>

      <Field label="Emergency Contact" colors={colors}>
        <TextInput
          style={styles.input}
          placeholder="Emergency contact number"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
          value={emergencyContact}
          onChangeText={handleEmergencyContactChange}
        />
        {emergencyContact.length > 0 && emergencyContact.length < 10 && (
          <Text style={styles.fieldError}>Emergency contact must be 10 digits</Text>
        )}
      </Field>

      <Field label="Fitness Goal" colors={colors}>
        <TextInput
          style={styles.input}
          placeholder="Fitness goal"
          placeholderTextColor={colors.textMuted}
          value={goal}
          onChangeText={setGoal}
        />
      </Field>

      <Field label="Join Source" colors={colors}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() =>
            openPicker(
              "Join Source",
              JOIN_SOURCES.map((s) => ({ label: s, value: s })),
              setJoinSource,
            )
          }
        >
          <Text
            style={[
              styles.selectText,
              { color: joinSource ? colors.textPrimary : colors.textMuted },
            ]}
          >
            {joinSource || "Select source"}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </Field>

      {/* MEMBERSHIP */}
      <Text style={styles.sectionLabel}>MEMBERSHIP</Text>

      <Field label="Plan" colors={colors}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() =>
            openPicker(
              "Select a plan",
              plans.map((p) => ({
                label: `${p.name} · ₹${p.price}`,
                value: p,
              })),
              setSelectedPlan,
            )
          }
        >
          <Text
            style={[
              styles.selectText,
              { color: selectedPlan ? colors.textPrimary : colors.textMuted },
            ]}
          >
            {selectedPlan ? selectedPlan.name : "Select a plan"}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </Field>

      <Field label="Start Date" colors={colors}>
        <View style={styles.emailRow}>
          <TextInput
            style={[
              styles.input,
              { flex: 1 },
              startDateError ? { borderColor: colors.error } : {},
            ]}
            value={startDateText}
            onChangeText={(v) => {
              // auto-insert dashes: DD-MM-YYYY
              let clean = v.replace(/[^0-9]/g, "");
              if (clean.length > 2) clean = clean.slice(0, 2) + "-" + clean.slice(2);
              if (clean.length > 5) clean = clean.slice(0, 5) + "-" + clean.slice(5);
              clean = clean.slice(0, 10);
              setStartDateText(clean);
              setStartDateError("");
              // parse when full
              if (clean.length === 10) {
                const [dd, mm, yyyy] = clean.split("-").map(Number);
                const parsed = new Date(yyyy, mm - 1, dd);
                if (
                  !isNaN(parsed.getTime()) &&
                  parsed.getDate() === dd &&
                  parsed.getMonth() === mm - 1
                ) {
                  setStartDate(parsed);
                } else {
                  setStartDateError("Invalid date");
                }
              }
            }}
            placeholder="DD-MM-YYYY"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={10}
          />
          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={styles.calendarBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        {startDateError ? (
          <Text style={styles.fieldError}>{startDateError}</Text>
        ) : null}
        {showDatePicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowDatePicker(Platform.OS === "ios");
              if (d) {
                setStartDate(d);
                setStartDateText(formatDate(d));
                setStartDateError("");
              }
            }}
          />
        )}
      </Field>

      <Field label="Trainer (optional)" colors={colors}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() =>
            openPicker(
              "Assign trainer",
              trainers.map((t) => ({ label: t.name, value: t })),
              setSelectedTrainer,
            )
          }
        >
          <Text
            style={[
              styles.selectText,
              {
                color: selectedTrainer ? colors.textPrimary : colors.textMuted,
              },
            ]}
          >
            {selectedTrainer ? selectedTrainer.name : "Assign trainer"}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </Field>

      {/* PAYMENT */}
      <Text style={styles.sectionLabel}>PAYMENT</Text>

      <Field label="Amount Paid (₹)" colors={colors}>
        <TextInput
          style={styles.input}
          placeholder="Amount paid"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={amountPaid}
          onChangeText={setAmountPaid}
        />
      </Field>

      <Field label="Payment Mode" colors={colors}>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() =>
            openPicker(
              "Payment Mode",
              PAYMENT_MODES.map((m) => ({ label: m.charAt(0).toUpperCase() + m.slice(1), value: m })),
              setPaymentMode,
            )
          }
        >
          <Text style={[styles.selectText, { color: colors.textPrimary }]}>
            {paymentMode}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </Field>

      <Field label="Notes" colors={colors}>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Notes"
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Field>

      {/* Terms */}
      <TouchableOpacity
        style={styles.agreeRow}
        onPress={() => setAgreed(!agreed)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            agreed && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
        >
          {agreed && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.agreeText}>
          I agree that the member has accepted the{" "}
          <Text style={{ color: colors.primary }}>
            gym terms and conditions
          </Text>
          .
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Add Member</Text>
        )}
      </TouchableOpacity>

      {/* Generic picker modal used by all dropdowns above */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            <FlatList
              data={pickerOptions}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    pickerOnSelectRef.current(item.value);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No options available</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <AppAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmLabel="OK"
        onConfirm={() => {
          setAlertVisible(false);
          alertConfig.onConfirm?.();
        }}
      />

      {/* OTP Verification Modal */}
      <Modal
        visible={otpPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpPopupVisible(false)}
      >
        <View style={styles.otpBackdrop}>
          <View style={styles.otpCard}>
            <Text style={styles.otpTitle}>Verify Email</Text>
            <Text style={styles.otpSub}>
              OTP sent to{" "}
              <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
                {email}
              </Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  marginTop: spacing.md,
                  letterSpacing: 4,
                  textAlign: "center",
                },
              ]}
              placeholder="6-digit code"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otpValue}
              onChangeText={(v) =>
                setOtpValue(v.replace(/\D/g, "").slice(0, 6))
              }
              autoFocus
            />

            <View style={styles.otpMetaRow}>
              <Text
                style={{
                  fontSize: 12,
                  color: countdown === 0 ? colors.error : colors.textMuted,
                }}
              >
                {countdown > 0
                  ? `Expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                  : "OTP expired"}
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={countdown > 0 || resendLoading}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: countdown === 0 ? colors.primary : colors.textMuted,
                  }}
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>

            {otpError ? (
              <Text style={styles.fieldError}>{otpError}</Text>
            ) : null}

            <View style={styles.otpBtnRow}>
              <TouchableOpacity
                style={styles.otpCancelBtn}
                onPress={() => {
                  setOtpPopupVisible(false);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
              >
                <Text
                  style={{ color: colors.textSecondary, fontWeight: "600" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1 }]}
                onPress={handleVerifyOtp}
                disabled={otpVerifying}
              >
                {otpVerifying ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitText}>Verify →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          ...typography.caption,
          color: colors.textSecondary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    sectionLabel: {
      ...typography.caption,
      color: colors.textMuted,
      letterSpacing: 1,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      textTransform: "uppercase",
    },
    photoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    avatarBox: {
      width: 56,
      height: 56,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%" },
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
    },
    photoBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.button,
    },
    photoBtnText: { fontSize: 12, fontWeight: "600" },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 46,
    },
    notesInput: { height: 90, textAlignVertical: "top", paddingTop: 12 },
    selectBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 46,
    },
    selectText: { ...typography.body },
    fieldError: {
      fontSize: 11,
      color: colors.error,
      marginTop: 4,
    },
    emailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    verifyBtn: {
      paddingHorizontal: 14,
      height: 46,
      borderRadius: radius.button,
      backgroundColor: "rgba(255,90,54,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    verifyBtnText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    calendarBtn: {
      width: 46,
      height: 46,
      borderRadius: radius.button,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    verifiedBadge: {
      paddingHorizontal: 12,
      height: 46,
      borderRadius: radius.button,
      backgroundColor: "rgba(45,212,196,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    verifiedBadgeText: { color: "#2DD4C4", fontWeight: "700", fontSize: 12 },
    agreeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkMark: { color: "#fff", fontSize: 12, fontWeight: "700" },
    agreeText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.button,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.card,
      borderTopRightRadius: radius.card,
      padding: spacing.md,
      maxHeight: "60%",
    },
    modalTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    modalOption: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalOptionText: { ...typography.body, color: colors.textPrimary },
    modalEmpty: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.lg,
    },
    otpBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },
    otpCard: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    otpTitle: { ...typography.h3, color: colors.textPrimary },
    otpSub: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    otpMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.sm,
    },
    otpBtnRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    otpCancelBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
    },
  });
}
