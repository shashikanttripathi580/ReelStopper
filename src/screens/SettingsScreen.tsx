import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { THEME } from '../theme/colors';
import { UserSettings } from '../types';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetSession: () => void;
  onClearHistory: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetSession,
  onClearHistory,
  onBack,
}) => {
  const thresholds = [25, 50, 75, 100];

  const handleToggleTracking = (value: boolean) => {
    onUpdateSettings({ ...settings, trackingEnabled: value });
  };

  const handleToggleNotifications = (value: boolean) => {
    onUpdateSettings({ ...settings, notificationsEnabled: value });
  };

  const handleSelectThreshold = (th: number) => {
    onUpdateSettings({ ...settings, breakThreshold: th });
  };

  const confirmClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will remove all stored day records permanently from this phone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: onClearHistory },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tracking Section */}
        <Text style={styles.sectionHeader}>TRACKING</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Enable Reel Tracking</Text>
              <Text style={styles.rowDesc}>Detects short video scroll events</Text>
            </View>
            <Switch
              value={settings.trackingEnabled}
              onValueChange={handleToggleTracking}
              trackColor={{ false: '#3F3F46', true: THEME.accentGreen }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Break Threshold Section */}
        <Text style={styles.sectionHeader}>BREAK THRESHOLD</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Choose when the first yellow break reminder triggers:
          </Text>
          <View style={styles.thresholdButtons}>
            {thresholds.map((th) => {
              const isSelected = settings.breakThreshold === th;
              return (
                <TouchableOpacity
                  key={th}
                  style={[
                    styles.thBtn,
                    isSelected && styles.thBtnSelected,
                  ]}
                  onPress={() => handleSelectThreshold(th)}>
                  <Text
                    style={[
                      styles.thBtnText,
                      isSelected && styles.thBtnTextSelected,
                    ]}>
                    {th} reels
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowMeta}>
              <Text style={styles.rowTitle}>Local Reminders</Text>
              <Text style={styles.rowDesc}>
                Alert at 50 and 100 reels (no internet required)
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#3F3F46', true: THEME.accentGreen }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <Text style={styles.sectionHeader}>DATA & PRIVACY</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={onResetSession}>
            <Text style={styles.actionRowTitle}>Reset Current Session</Text>
            <Text style={styles.actionRowChevron}>→</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={confirmClearHistory}>
            <Text style={[styles.actionRowTitle, { color: THEME.accentRed }]}>
              Clear Local History
            </Text>
            <Text style={styles.actionRowChevron}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About Card */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>ReelStopper MVP v1.0</Text>
          <Text style={styles.aboutText}>
            Local-only, privacy-first digital awareness tool. No telemetry, no backend, no subscriptions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    width: 60,
  },
  backText: {
    color: THEME.accentGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 16,
  },
  cardDesc: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMeta: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  thresholdButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  thBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
  },
  thBtnSelected: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderColor: '#FACC15',
  },
  thBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  thBtnTextSelected: {
    color: '#FACC15',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  actionRowChevron: {
    fontSize: 16,
    color: THEME.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 4,
  },
  aboutCard: {
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
