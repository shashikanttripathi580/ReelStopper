import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor={THEME.background} />
          <View style={[styles.container, styles.errorContainer]}>
            <Text style={styles.errorEmoji}>🌱</Text>
            <Text style={styles.errorTitle}>ReelStopper</Text>
            <Text style={styles.errorSubtitle}>
              An unexpected issue occurred. Tap below to refresh and continue.
            </Text>
            <TouchableOpacity
              style={styles.errorButton}
              activeOpacity={0.8}
              onPress={() => this.setState({ hasError: false })}>
              <Text style={styles.errorButtonText}>Restart ReelStopper</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const MainApp: React.FC = () => {
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
    try {
      const loadedSettings = await StorageService.getSettings();
      const loadedSession = await StorageService.getSession();
      const loadedToday = await StorageService.getTodayCount();
      const loadedHistory = await StorageService.getHistory();

      setSettings(loadedSettings);
      setSession(loadedSession);
      setTodayTotal(loadedToday || 74);
      setHistory(loadedHistory);
    } catch (e) {
      console.warn('Failed to load initial data', e);
    }
  };

  // Subscribe to native reel increment events from Accessibility Service
  useEffect(() => {
    try {
      const unsubscribe = NativeBridge.subscribeToReelIncrements(async (_event) => {
        try {
          const { session: newSession, todayTotal: newToday } =
            await StorageService.incrementReelCount(1);
          setSession(newSession);
          setTodayTotal(newToday);

          if (newSession.currentCount === 50) {
            setActiveModalMilestone(50);
          } else if (newSession.currentCount === 100) {
            setActiveModalMilestone(100);
          }
        } catch (e) {
          console.warn('Error handling reel increment', e);
        }
      });

      return () => {
        try {
          unsubscribe();
        } catch (e) {
          // Ignore
        }
      };
    } catch (e) {
      console.warn('Error setting up reel subscription', e);
    }
  }, []);

  const handleToggleTracking = async () => {
    try {
      const nextState = !session.isTracking;
      const updatedSession = { ...session, isTracking: nextState };
      setSession(updatedSession);
      await StorageService.saveSession(updatedSession);

      if (nextState) {
        await NativeBridge.startTracking();
      } else {
        await NativeBridge.stopTracking();
      }
    } catch (e) {
      console.warn('Error toggling tracking', e);
    }
  };

  const handleResetSession = async () => {
    try {
      const reset = await StorageService.resetSession();
      await NativeBridge.resetSession();
      setSession(reset);
    } catch (e) {
      console.warn('Error resetting session', e);
    }
  };

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    try {
      setSettings(newSettings);
      await StorageService.saveSettings(newSettings);
    } catch (e) {
      console.warn('Error updating settings', e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await StorageService.clearAllHistory();
      const refreshed = await StorageService.getHistory();
      setHistory(refreshed);
      setTodayTotal(0);
    } catch (e) {
      console.warn('Error clearing history', e);
    }
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

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    maxWidth: 280,
  },
  errorButton: {
    backgroundColor: THEME.accentGreen,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  errorButtonText: {
    color: '#09090B',
    fontWeight: '700',
    fontSize: 15,
  },
});
