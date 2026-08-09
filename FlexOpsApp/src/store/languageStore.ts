import React from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi';

const translations = {
  en: {
    // Nav / Screens
    dashboard: 'Dashboard',
    attendance: 'Attendance',
    members: 'Members',
    plans: 'Plans',
    payments: 'Payments',
    exercises: 'Exercises',
    askai: 'Ask AI',
    profile: 'Profile',
    addMember: 'Add Member',

    // Dashboard
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    goodNight: 'Good Night',
    totalMembers: 'Total Members',
    activeMembers: 'Active Members',
    todayCheckIns: "Today's Check-ins",
    revenue: 'Revenue',
    pendingPayments: 'Pending Payments',
    expiringSoon: 'Expiring Soon',

    // Members
    allMembers: 'All Members',
    active: 'Active',
    expired: 'Expired',
    paused: 'Paused',
    searchMembers: 'Search members...',
    noMembers: 'No members found',
    addNewMember: 'Add New Member',
    memberSince: 'Member since',
    daysLeft: 'days left',
    expired_label: 'Expired',

    // Payments
    allPayments: 'All Payments',
    paid: 'Paid',
    pending: 'Pending',
    searchPayments: 'Search payments...',
    noPayments: 'No payments found',
    markPaid: 'Mark Paid',
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    online: 'Online',

    // Profile
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    gym: 'Gym',
    changePassword: 'Change Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    updatePassword: 'Update Password',
    appSettings: 'App Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    support: 'Support & Help',
    contactSupport: 'Contact Support',
    whatsappSupport: 'WhatsApp Support',
    appVersion: 'App Version',
    accountInfo: 'Account Info',
    lastLogin: 'Last Login',
    memberSince_profile: 'Member Since',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    logoutTitle: 'Logout',
    deleteAccount: 'Delete Account',
    deleteAccountConfirm: 'This will permanently delete your account and all data. This cannot be undone.',
    deleteAccountTitle: 'Delete Account',

    // Roles
    owner: 'Gym Owner',
    manager: 'Manager',
    trainer: 'Trainer',
    staff: 'Staff',
    superadmin: 'Super Admin',

    // Validation
    nameRequired: 'Name is required',
    currentPasswordRequired: 'Current password is required',
    passwordMin8: 'Password must be at least 8 characters',
    passwordUppercase: 'Password must contain an uppercase letter',
    passwordNumber: 'Password must contain a number',
    passwordSpecial: 'Password must contain a special character (!@#$%^&*)',
    passwordsNoMatch: 'Passwords do not match',
    passwordUpdated: 'Password updated successfully!',
    profileUpdated: 'Profile updated successfully!',

    // Common
    success: 'Success',
    error: 'Error',
    confirm: 'Confirm',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    checkIn: 'Check In',
    whatsapp: 'WhatsApp',
    remove: 'Remove',
    removeMember: 'Remove Member',
    removeMemberConfirm: 'Are you sure you want to remove this member?',
    checkedIn: 'Checked in successfully!',
    alreadyCheckedIn: 'Already checked in today',
    memberRemoved: 'Member removed',

    // Trainers
    trainers: 'Trainers',
    addTrainer: 'Add Trainer',
    trainerName: 'Full Name',
    trainerEmail: 'Email',
    trainerPhone: 'Phone',
    trainerAltPhone: 'Alternate Phone',
    trainerAddress: 'Address',
    trainerAadhar: 'Aadhar Number',
    trainerPan: 'PAN Number',
    trainerJoining: 'Joining Date',
    trainerPassword: 'Password',
    trainerAdded: 'Trainer added successfully!',
    trainerRemoved: 'Trainer removed',
    noTrainers: 'No trainers found',
    allTrainers: 'All Trainers',
    activeTrainers: 'Active',
    inactiveTrainers: 'Inactive',

    // Expiry alerts
    expiredMembers: 'Expired Members',
    expiringMembers: 'Expiring Soon',
    collectFees: 'Collect Fees',
    markPending: 'Mark Pending',
    renewNow: 'Renew Now',
    feesExpired: 'Fees Expired',
    expiresToday: 'Expires Today',
    daysLeftLabel: 'days left',
  },

  hi: {
    // Nav / Screens
    dashboard: 'डैशबोर्ड',
    attendance: 'उपस्थिति',
    members: 'सदस्य',
    plans: 'प्लान',
    payments: 'भुगतान',
    exercises: 'एक्सरसाइज',
    askai: 'AI से पूछें',
    profile: 'प्रोफ़ाइल',
    addMember: 'सदस्य जोड़ें',

    // Dashboard
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'नमस्ते',
    goodEvening: 'शुभ संध्या',
    goodNight: 'शुभ रात्रि',
    totalMembers: 'कुल सदस्य',
    activeMembers: 'सक्रिय सदस्य',
    todayCheckIns: 'आज की उपस्थिति',
    revenue: 'आय',
    pendingPayments: 'बकाया भुगतान',
    expiringSoon: 'जल्द समाप्त',

    // Members
    allMembers: 'सभी सदस्य',
    active: 'सक्रिय',
    expired: 'समाप्त',
    paused: 'रुका हुआ',
    searchMembers: 'सदस्य खोजें...',
    noMembers: 'कोई सदस्य नहीं मिला',
    addNewMember: 'नया सदस्य जोड़ें',
    memberSince: 'सदस्य बने',
    daysLeft: 'दिन बचे',
    expired_label: 'समाप्त',

    // Payments
    allPayments: 'सभी भुगतान',
    paid: 'भुगतान हुआ',
    pending: 'बकाया',
    searchPayments: 'भुगतान खोजें...',
    noPayments: 'कोई भुगतान नहीं मिला',
    markPaid: 'भुगतान करें',
    cash: 'नकद',
    upi: 'UPI',
    card: 'कार्ड',
    online: 'ऑनलाइन',

    // Profile
    editProfile: 'प्रोफ़ाइल संपादित करें',
    saveChanges: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    name: 'नाम',
    email: 'ईमेल',
    phone: 'फ़ोन',
    role: 'भूमिका',
    gym: 'जिम',
    changePassword: 'पासवर्ड बदलें',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    updatePassword: 'पासवर्ड अपडेट करें',
    appSettings: 'ऐप सेटिंग',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    support: 'सहायता',
    contactSupport: 'सहायता से संपर्क करें',
    whatsappSupport: 'WhatsApp सहायता',
    appVersion: 'ऐप संस्करण',
    accountInfo: 'खाता जानकारी',
    lastLogin: 'अंतिम लॉगिन',
    memberSince_profile: 'सदस्य बने',
    logout: 'लॉगआउट',
    logoutConfirm: 'क्या आप लॉगआउट करना चाहते हैं?',
    logoutTitle: 'लॉगआउट',
    deleteAccount: 'खाता हटाएं',
    deleteAccountConfirm: 'यह आपका खाता और सभी डेटा स्थायी रूप से हटा देगा। यह पूर्ववत नहीं किया जा सकता।',
    deleteAccountTitle: 'खाता हटाएं',

    // Roles
    owner: 'जिम मालिक',
    manager: 'प्रबंधक',
    trainer: 'ट्रेनर',
    staff: 'स्टाफ',
    superadmin: 'सुपर एडमिन',

    // Validation
    nameRequired: 'नाम आवश्यक है',
    currentPasswordRequired: 'वर्तमान पासवर्ड आवश्यक है',
    passwordMin8: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
    passwordUppercase: 'पासवर्ड में एक बड़ा अक्षर होना चाहिए',
    passwordNumber: 'पासवर्ड में एक अंक होना चाहिए',
    passwordSpecial: 'पासवर्ड में एक विशेष अक्षर होना चाहिए (!@#$%^&*)',
    passwordsNoMatch: 'पासवर्ड मेल नहीं खाते',
    passwordUpdated: 'पासवर्ड सफलतापूर्वक अपडेट हुआ!',
    profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!',

    // Common
    success: 'सफलता',
    error: 'त्रुटि',
    confirm: 'पुष्टि करें',
    ok: 'ठीक है',
    yes: 'हाँ',
    no: 'नहीं',
    loading: 'लोड हो रहा है...',
    checkIn: 'चेक इन',
    whatsapp: 'WhatsApp',
    remove: 'हटाएं',
    removeMember: 'सदस्य हटाएं',
    removeMemberConfirm: 'क्या आप इस सदस्य को हटाना चाहते हैं?',
    checkedIn: 'सफलतापूर्वक चेक इन हुआ!',
    alreadyCheckedIn: 'आज पहले से चेक इन है',
    memberRemoved: 'सदस्य हटाया गया',

    // Trainers
    trainers: 'ट्रेनर',
    addTrainer: 'ट्रेनर जोड़ें',
    trainerName: 'पूरा नाम',
    trainerEmail: 'ईमेल',
    trainerPhone: 'फ़ोन',
    trainerAltPhone: 'वैकल्पिक फ़ोन',
    trainerAddress: 'पता',
    trainerAadhar: 'आधार नंबर',
    trainerPan: 'PAN नंबर',
    trainerJoining: 'जॉइनिंग तारीख',
    trainerPassword: 'पासवर्ड',
    trainerAdded: 'ट्रेनर सफलतापूर्वक जोड़ा गया!',
    trainerRemoved: 'ट्रेनर हटाया गया',
    noTrainers: 'कोई ट्रेनर नहीं मिला',
    allTrainers: 'सभी ट्रेनर',
    activeTrainers: 'सक्रिय',
    inactiveTrainers: 'निष्क्रिय',

    // Expiry alerts
    expiredMembers: 'समाप्त सदस्य',
    expiringMembers: 'जल्द समाप्त',
    collectFees: 'फीस लें',
    markPending: 'बकाया करें',
    renewNow: 'नवीनीकरण करें',
    feesExpired: 'फीस समाप्त',
    expiresToday: 'आज समाप्त',
    daysLeftLabel: 'दिन बचे',
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',

  setLanguage: async (lang: Language) => {
    await AsyncStorage.setItem('language', lang);
    set({ language: lang });
  },

  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem('language');
    if (saved === 'en' || saved === 'hi') {
      set({ language: saved });
    }
  },
}));

function translate(lang: Language, key: TranslationKey): string {
  return (translations[lang] as any)[key] ?? (translations.en as any)[key] ?? key;
}

// Convenience hooks
export function useTranslation() {
  const language = useLanguageStore(s => s.language);
  const t = React.useCallback(
    (key: TranslationKey) => translate(language, key),
    [language],
  );
  return { t, language };
}
