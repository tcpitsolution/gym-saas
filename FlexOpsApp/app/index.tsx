import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Text,
  ActivityIndicator,
} from "react-native";
import {
  Menu,
  Home,
  CalendarCheck,
  Plus,
  Dumbbell,
  User,
} from "lucide-react-native";
import { spacing, typography } from "../src/theme/colors";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";
import LoginScreen from "../src/screens/LoginScreen";
import DrawerContent from "../src/components/DrawerContent";
import DashboardScreen from "../src/screens/DashboardScreen";
import AttendanceScreen from "../src/screens/AttendanceScreen";
import MembersScreen from "../src/screens/MembersScreen";
import PlansScreen from "../src/screens/PlansScreen";
import PaymentsScreen from "../src/screens/PaymentsScreen";
import AskAIScreen from "../src/screens/AskAIScreen";
import ExercisesScreen from "../src/screens/ExercisesScreen";
import ProfileScreen from "../src/screens/ProfileScreen";

type Screen =
  | "index"
  | "attendance"
  | "members"
  | "plans"
  | "payments"
  | "exercises"
  | "askai"
  | "profile";

const screenMap: Record<Screen, React.ComponentType> = {
  index: DashboardScreen,
  attendance: AttendanceScreen,
  members: MembersScreen,
  plans: PlansScreen,
  payments: PaymentsScreen,
  exercises: ExercisesScreen,
  askai: AskAIScreen,
  profile: ProfileScreen,
};

const screenTitles: Record<Screen, string> = {
  index: "Dashboard",
  attendance: "Attendance",
  members: "Members",
  plans: "Plans",
  payments: "Payments",
  exercises: "Exercises",
  askai: "Ask AI",
  profile: "Profile",
};

const bottomTabs = [
  { key: "index" as Screen, icon: Home, label: "Home" },
  { key: "attendance" as Screen, icon: CalendarCheck, label: "Attendance" },
  { key: "exercises" as Screen, icon: Dumbbell, label: "Videos" },
  { key: "profile" as Screen, icon: User, label: "Profile" },
];

export default function App() {
  const { token, isLoading, loadFromStorage } = useAuthStore();
  const { colors, loadTheme } = useThemeStore();
  const styles = getStyles(colors); // 👈 styles ab colors ke saath dynamically banti hain

  const [screen, setScreen] = useState<Screen>("index");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
    loadTheme();
  }, []);

  // Splash / loading
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.splashText}>FlexOps</Text>
      </View>
    );
  }

  // Not logged in → show Login
  if (!token) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <LoginScreen />
      </>
    );
  }

  const ActiveScreen = screenMap[screen];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Menu size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitles[screen]}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Active Screen */}
      <View style={styles.content}>
        <ActiveScreen />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomTabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = screen === tab.key;
          if (i === 2) {
            return (
              <React.Fragment key="fab-group">
                <TouchableOpacity
                  style={styles.fab}
                  onPress={() => setScreen("members")}
                  activeOpacity={0.8}
                >
                  <Plus size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabItem}
                  onPress={() => setScreen(tab.key)}
                >
                  <Icon
                    size={22}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          }
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setScreen(tab.key)}
            >
              <Icon
                size={22}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Drawer */}
      <Modal
        visible={drawerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            onPress={() => setDrawerOpen(false)}
            activeOpacity={1}
          />
          <View style={styles.drawer}>
            <DrawerContent
              activeScreen={screen}
              onNavigate={(s) => {
                setScreen(s as Screen);
                setDrawerOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 👇 Ab ye ek FUNCTION hai jo colors leta hai aur styles return karta hai
function getStyles(colors: any) {
  return StyleSheet.create({
    splash: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.md,
    },
    splashText: { ...typography.h1, color: colors.primary, letterSpacing: 2 },
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    content: { flex: 1 },
    bottomNav: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: spacing.sm,
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: spacing.xs,
      gap: 2,
    },
    tabLabel: { fontSize: 10, color: colors.textMuted },
    tabLabelActive: { color: colors.primary },
    fab: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    drawerOverlay: { flex: 1, flexDirection: "row" },
    drawerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    drawer: { width: "75%", maxWidth: 300 },
  });
}
