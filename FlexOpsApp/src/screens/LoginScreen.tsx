import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable,
  Image, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, TextInputProps, Modal,
} from 'react-native';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, X, Send } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';

type Step = 'login' | 'otp' | 'forgot' | 'reset';

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── InputField outside component so it never re-mounts ──────────────────────
interface InputFieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureEntry?: boolean;
  showToggle?: boolean;
  toggleSecure?: () => void;
  error?: string;
  keyboardType?: TextInputProps['keyboardType'];
}

function InputField({
  icon, placeholder, value, onChangeText,
  secureEntry, showToggle, toggleSecure, error, keyboardType,
}: InputFieldProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.inputWrap}>
      <Pressable
        style={[styles.inputBox, !!error && styles.inputBoxError]}
        onPress={() => inputRef.current?.focus()}
      >
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          underlineColorAndroid="transparent"
        />
        {showToggle && (
          <TouchableOpacity onPress={toggleSecure} style={styles.eyeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {secureEntry
              ? <EyeOff size={18} color={colors.textMuted} />
              : <Eye size={18} color={colors.textMuted} />}
          </TouchableOpacity>
        )}
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ── Demo Request Modal ───────────────────────────────────────────────────────
function DemoModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ gymName: '', ownerName: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.gymName.trim()) e.gymName = 'Gym name required';
    if (!form.ownerName.trim()) e.ownerName = 'Your name required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('https://gym-saas-piqu.onrender.com/api/admin/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setForm({ gymName: '', ownerName: '', email: '', phone: '', message: '' }); setErrors({}); }, 300);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={dStyles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={dStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={dStyles.header}>
              <View>
                <Text style={dStyles.title}>Request a Demo</Text>
                <Text style={dStyles.sub}>We'll set up your gym account</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={dStyles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {submitted ? (
              <View style={dStyles.successBox}>
                <Text style={dStyles.successIcon}>🎉</Text>
                <Text style={dStyles.successTitle}>Request Submitted!</Text>
                <Text style={dStyles.successSub}>We've received your request. Our team will contact you within 24 hours on your email and phone.</Text>
                <TouchableOpacity style={dStyles.doneBtn} onPress={handleClose}>
                  <Text style={dStyles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <DemoField label="Gym Name *" placeholder="e.g. FitZone Gym" value={form.gymName} onChangeText={v => set('gymName', v)} error={errors.gymName} />
                <DemoField label="Your Name *" placeholder="Owner / Manager name" value={form.ownerName} onChangeText={v => set('ownerName', v)} error={errors.ownerName} />
                <DemoField label="Email *" placeholder="your@email.com" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" error={errors.email} />
                <DemoField label="Phone *" placeholder="10-digit mobile number" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" error={errors.phone} />
                <DemoField label="Message (optional)" placeholder="Tell us about your gym..." value={form.message} onChangeText={v => set('message', v)} multiline />

                <TouchableOpacity style={dStyles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                  {loading
                    ? <ActivityIndicator color={colors.textPrimary} />
                    : <>
                        <Send size={16} color={colors.textPrimary} />
                        <Text style={dStyles.submitBtnText}>Submit Request</Text>
                      </>}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

interface DemoFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
}
function DemoField({ label, placeholder, value, onChangeText, error, keyboardType, multiline }: DemoFieldProps) {
  return (
    <View style={dStyles.fieldWrap}>
      <Text style={dStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[dStyles.fieldInput, multiline && dStyles.fieldInputMulti, !!error && dStyles.fieldInputError]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {!!error && <Text style={dStyles.fieldError}>{error}</Text>}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { setToken } = useAuthStore();

  const [step, setStep] = useState<Step>('login');
  const [demoVisible, setDemoVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fromForgot, setFromForgot] = useState(false);

  const clearErr = () => setErrors({});

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      if (res.otpRequired) {
        setFromForgot(false);
        setStep('otp');
      } else if (res.token) {
        await setToken(res.token);
      }
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) { setErrors({ otp: 'Enter valid OTP' }); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email.trim().toLowerCase(), otp.trim());
      if (fromForgot) {
        setStep('reset');
      } else {
        await setToken(res.token);
      }
    } catch (err: any) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim() || !isValidEmail(email)) { setErrors({ email: 'Enter a valid email' }); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setFromForgot(true);
      setOtp('');
      setStep('otp');
    } catch (err: any) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setErrors({ newPassword: 'Minimum 6 characters' }); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim().toLowerCase(), newPassword);
      Alert.alert('Success', 'Password reset! Please login.');
      setStep('login');
      setPassword(''); setOtp(''); setNewPassword(''); setFromForgot(false);
    } catch (err: any) {
      setErrors({ newPassword: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <DemoModal visible={demoVisible} onClose={() => setDemoVisible(false)} />
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>FlexOps</Text>
          <Text style={styles.tagline}>Gym Management Platform</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* LOGIN */}
          {step === 'login' && (
            <>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSub}>Sign in to your gym account</Text>

              {errors.general && (
                <View style={styles.alertBox}>
                  <Text style={styles.alertText}>{errors.general}</Text>
                </View>
              )}

              <InputField
                icon={<Mail size={18} color={colors.textMuted} />}
                placeholder="Email address"
                value={email}
                onChangeText={(t) => { setEmail(t); clearErr(); }}
                keyboardType="email-address"
                error={errors.email}
              />

              <InputField
                icon={<Lock size={18} color={colors.textMuted} />}
                placeholder="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); clearErr(); }}
                secureEntry={!showPass}
                showToggle
                toggleSecure={() => setShowPass(p => !p)}
                error={errors.password}
              />

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => { setStep('forgot'); clearErr(); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator color={colors.textPrimary} />
                  : <Text style={styles.primaryBtnText}>Sign In</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* OTP */}
          {step === 'otp' && (
            <>
              <TouchableOpacity style={styles.backBtn} onPress={() => { setStep(fromForgot ? 'forgot' : 'login'); clearErr(); }}>
                <ArrowLeft size={18} color={colors.textSecondary} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>Verify OTP</Text>
              <Text style={styles.cardSub}>OTP sent to {email}</Text>

              <InputField
                icon={<Lock size={18} color={colors.textMuted} />}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={(t) => { setOtp(t); clearErr(); }}
                keyboardType="number-pad"
                error={errors.otp}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator color={colors.textPrimary} />
                  : <Text style={styles.primaryBtnText}>Verify OTP</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* FORGOT */}
          {step === 'forgot' && (
            <>
              <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('login'); clearErr(); }}>
                <ArrowLeft size={18} color={colors.textSecondary} />
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSub}>Enter your registered email</Text>

              <InputField
                icon={<Mail size={18} color={colors.textMuted} />}
                placeholder="Email address"
                value={email}
                onChangeText={(t) => { setEmail(t); clearErr(); }}
                keyboardType="email-address"
                error={errors.email}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleForgot} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator color={colors.textPrimary} />
                  : <Text style={styles.primaryBtnText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* RESET */}
          {step === 'reset' && (
            <>
              <Text style={styles.cardTitle}>New Password</Text>
              <Text style={styles.cardSub}>Set a strong new password</Text>

              <InputField
                icon={<Lock size={18} color={colors.textMuted} />}
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); clearErr(); }}
                secureEntry={!showNewPass}
                showToggle
                toggleSecure={() => setShowNewPass(p => !p)}
                error={errors.newPassword}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator color={colors.textPrimary} />
                  : <Text style={styles.primaryBtnText}>Reset Password</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Request Demo Link */}
        <View style={styles.demoLinkRow}>
          <Text style={styles.demoLinkText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => setDemoVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.demoLink}>Request a Demo →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2025 FlexOps · Gym Management</Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.md, paddingVertical: spacing.xl },

  logoSection: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 80, height: 80, marginBottom: spacing.sm },
  brand: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, letterSpacing: 1 },
  tagline: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  cardSub: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },

  alertBox: {
    backgroundColor: '#3D1515', borderRadius: radius.button,
    padding: spacing.sm, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.error,
  },
  alertText: { ...typography.caption, color: colors.error },

  inputWrap: { marginBottom: spacing.md },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.button, borderWidth: 1, borderColor: colors.border,
    height: 54,
  },
  inputBoxError: { borderColor: colors.error },
  inputIcon: { paddingLeft: spacing.md, paddingRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    height: 54,
    paddingVertical: 0,
  },
  eyeBtn: { paddingHorizontal: spacing.md },
  errorText: { ...typography.caption, color: colors.error, marginTop: 4, marginLeft: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing.lg, marginTop: -spacing.xs },
  forgotText: { ...typography.caption, color: colors.primary },

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button,
    height: 52, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  backText: { ...typography.body, color: colors.textSecondary },

  footer: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  demoLinkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  demoLinkText: { ...typography.caption, color: colors.textMuted },
  demoLink: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});

// ── Demo Modal Styles ─────────────────────────────────────────────────────────
const dStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, paddingBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.border, maxHeight: '92%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '600' },
  fieldInput: {
    backgroundColor: colors.surfaceElevated, borderRadius: radius.button,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 48,
    fontSize: 15, color: colors.textPrimary,
  },
  fieldInputMulti: { height: 88, paddingTop: spacing.sm, textAlignVertical: 'top' },
  fieldInputError: { borderColor: colors.error },
  fieldError: { ...typography.caption, color: colors.error, marginTop: 3 },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button,
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginTop: spacing.xs,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  successBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  successIcon: { fontSize: 48 },
  successTitle: { ...typography.h2, color: colors.textPrimary },
  successSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    backgroundColor: colors.primary, borderRadius: radius.button,
    paddingHorizontal: spacing.xl, height: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm,
  },
  doneBtnText: { ...typography.button, color: colors.textPrimary },
});
