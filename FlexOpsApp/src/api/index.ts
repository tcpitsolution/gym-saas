import AsyncStorage from '@react-native-async-storage/async-storage';

// export const BASE_URL = 'https://gym-saas-piqu.onrender.com/api'; // Production
export const BASE_URL = 'http://192.168.1.11:5000/api'; // Local testing

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await AsyncStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token?: string; otpRequired?: boolean; email?: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    ),

  verifyOtp: (email: string, otp: string) =>
    request<{ token: string }>('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }, false),

  forgotPassword: (email: string) =>
    request<{ success: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false),

  resetPassword: (email: string, newPassword: string) =>
    request<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    }, false),
};

// ─── Members ──────────────────────────────────────────────────────────────────
export const membersApi = {
  getAll: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/members${q ? '?' + q : ''}`);
  },
  getOne: (id: string) => request<any>(`/members/${id}`),
  create: (data: any) =>
    request<any>('/members', { method: 'POST', body: JSON.stringify(data) }),
  renew: (id: string, data: any) =>
    request<any>(`/members/${id}/renew`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/members/${id}`, { method: 'DELETE' }),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  checkin: (memberId: string, method = 'Manual') =>
    request<any>('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ memberId, method }),
    }),
  today: () => request<any[]>('/attendance/today'),
  stats: () => request<{ todayCheckIns: number; activeNow: number; blocked: number }>('/attendance/stats'),
  memberHistory: (id: string) => request<any[]>(`/attendance/member/${id}`),
};

// ─── Plans ────────────────────────────────────────────────────────────────────
export const plansApi = {
  getAll: () => request<any[]>('/plans'),
  create: (data: any) =>
    request<any>('/plans', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: (params?: { search?: string; mode?: string; status?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/payments${q ? '?' + q : ''}`);
  },
  summary: () =>
    request<{
      collectedTotal: number;
      pendingTotal: number;
      pendingCount: number;
      overdueTotal: number;
      transactionCount: number;
    }>('/payments/summary'),
  markPaid: (id: string) =>
    request<any>(`/payments/${id}/mark-paid`, { method: 'PATCH' }),
};

// ─── Trainers ─────────────────────────────────────────────────────────────────
export const trainersApi = {
  getAll: () => request<any[]>('/trainers'),
  create: (data: any) =>
    request<any>('/trainers', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/trainers/${id}`, { method: 'DELETE' }),
};
