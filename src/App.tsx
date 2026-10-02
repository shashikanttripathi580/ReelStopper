import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { THEME } from './theme/colors';
import { DayHistory, ReelSession, ScreenType, UserSettings } from './types';
import { StorageService } from './services/StorageService';
import { NativeBridge } from './services/NativeBridge';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PermissionScreen } from './screens/PermissionScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BreakReminderModal } from './components/BreakReminderModal';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [session, setSession] = useState<ReelSession>({
    currentCount: 0,
    breakThreshold: 50,
    maxReminder: 100,
    startTime: Date.now(),
    lastUpdated: Date.now(),
    isTracking: true,
  });
  const [todayTotal, setTodayTotal] = useState<number>(74);
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    trackingEnabled: true,
    breakThreshold: 50,
    maxReminder: 100,
    notificationsEnabled: true,
    hapticFeedback: true,
  });

  // Break reminder modal state
  const [activeModalMilestone, setActiveModalMilestone] = useState<50 | 100 | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const loadedSettings = await StorageService.getSettings();
    const loadedSession = await StorageService.getSession();
    const loadedToday = await StorageService.getTodayCount();
    const loadedHistory = await StorageService.getHistory();

    setSettings(loadedSettings);
    setSession(loadedSession);
    setTodayTotal(loadedToday || 74);
    setHistory(loadedHistory);
  };

  // Subscribe to native reel increment events from Accessibility Service
  useEffect(() => {
    const unsubscribe = NativeBridge.subscribeToReelIncrements(async (_event) => {
      const { session: newSession, todayTotal: newToday } =
        await StorageService.incrementReelCount(1);
      setSession(newSession);
      setTodayTotal(newToday);

      if (newSession.currentCount === 50) {
        setActiveModalMilestone(50);
      } else if (newSession.currentCount === 100) {
        setActiveModalMilestone(100);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleTracking = async () => {
    const nextState = !session.isTracking;
    const updatedSession = { ...session, isTracking: nextState };
    setSession(updatedSession);
    await StorageService.saveSession(updatedSession);

    if (nextState) {
      await NativeBridge.startTracking();
    } else {
      await NativeBridge.stopTracking();
    }
  };

  const handleResetSession = async () => {
    const reset = await StorageService.resetSession();
    await NativeBridge.resetSession();
    setSession(reset);
  };

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleClearHistory = async () => {
    await StorageService.clearAllHistory();
    const refreshed = await StorageService.getHistory();
    setHistory(refreshed);
    setTodayTotal(0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />
      <View style={styles.container}>
        {currentScreen === 'splash' && (
          <SplashScreen onFinish={() => setCurrentScreen('onboarding')} />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={() => setCurrentScreen('permissions')} />
        )}

        {currentScreen === 'permissions' && (
          <PermissionScreen onComplete={() => setCurrentScreen('dashboard')} />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            session={session}
            todayTotal={todayTotal}
            onToggleTracking={handleToggleTracking}
            onResetSession={handleResetSession}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen
            history={history}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSession={handleResetSession}
            onClearHistory={handleClearHistory}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}

        {/* Break Reminders (50 and 100 Reels) */}
        {activeModalMilestone && (
          <BreakReminderModal
            visible={true}
            milestone={activeModalMilestone}
            onTakeBreak={() => {
              setActiveModalMilestone(null);
            }}
            onContinueWatching={() => {
              setActiveModalMilestone(null);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
});
