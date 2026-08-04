export const darkColors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#1F1F1F',
  border: '#2A2A2A',

  primary: '#FF6B00',
  primaryDark: '#3D2410',
  primaryGradientEnd: '#FF8C3D',

  success: '#0F9D58',
  successBg: '#0C5330',
  purple: '#8B6CFF',
  purpleBg: '#2E2342',
  error: '#E53935',
  warning: '#F5A623',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
};

export const lightColors = {
  background: '#F2F4F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F8F9FB',
  border: '#E2E8F0',

  primary: '#FF6B00',
  primaryDark: '#FFE8D6',
  primaryGradientEnd: '#FF8C3D',

  success: '#0F9D58',
  successBg: '#D4F5E5',
  purple: '#8B6CFF',
  purpleBg: '#EDE9FF',
  error: '#E53935',
  warning: '#F5A623',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
};

// Default export — screens import this, themeStore overrides at runtime
export let colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  card: 16,
  button: 12,
  pill: 20,
  icon: 14,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 14, fontWeight: '600' as const },
};
