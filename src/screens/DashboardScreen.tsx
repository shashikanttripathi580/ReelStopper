import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { THEME, getReelColorStage } from '../theme/colors';
import { LeafIcon } from '../components/LeafIcon';
import { ReelSession } from '../types';

interface DashboardScreenProps {
  session: ReelSession;
  todayTotal: number;
  onToggleTracking: () => void;
  onResetSession: () => void;
  onNavigate: (screen: 'history' | 'settings') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  session,
  todayTotal,
  onToggleTracking,
  onResetSession,
  onNavigate,
}) => {
  const stage = getReelColorStage(session.currentCount);
  const untilBreak = Math.max(0, session.breakThreshold - session.currentCount);
  const untilMax = Math.max(0, session.maxReminder - session.currentCount);

  const confirmReset = () => {
    Alert.alert(
      'Reset Counter',
      'Reset your current reel count to 0?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetSession },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandEmoji}>🌱</Text>
            <Text style={styles.brandTitle}>ReelStopper</Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onNavigate('history')}>
              <Text style={styles.iconButtonEmoji}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onNavigate('settings')}>
              <Text style={styles.iconButtonEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Counter Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: stage.bgColor,
              borderColor: stage.borderColor,
            },
          ]}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: session.isTracking
                    ? THEME.accentGreen
                    : THEME.textMuted,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {session.isTracking ? 'Tracking Active' : 'Tracking Paused'}
            </Text>
          </View>

          <View style={styles.leafWrapper}>
            <LeafIcon count={session.currentCount} size={44} />
          </View>

          <View style={styles.countWrapper}>
            <Text style={[styles.mainCount, { color: stage.textColor }]}>
              {session.currentCount}
            </Text>
            <Text style={styles.countDenominator}>
              / {session.maxReminder}
            </Text>
          </View>

          <Text style={styles.countLabel}>Reels Watched</Text>
          <Text style={[styles.stageBadge, { color: stage.textColor }]}>
            {stage.meaning}
          </Text>

          {/* Threshold countdown meters */}
          <View style={styles.milestoneRow}>
            <View style={styles.milestoneBox}>
              <Text style={styles.milestoneNum}>
                {session.currentCount >= session.breakThreshold ? 'Reached' : untilBreak}
              </Text>
              <Text style={styles.milestoneLabel}>until break (50)</Text>
            </View>
            <View style={styles.milestoneDivider} />
            <View style={styles.milestoneBox}>
              <Text style={styles.milestoneNum}>
                {session.currentCount >= session.maxReminder ? 'Reached' : untilMax}
              </Text>
              <Text style={styles.milestoneLabel}>until 100 reminder</Text>
            </View>
          </View>
        </View>

        {/* Tracking Control Action */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: session.isTracking ? '#27272A' : THEME.accentGreen,
              borderColor: session.isTracking ? '#3F3F46' : 'transparent',
              borderWidth: session.isTracking ? 1 : 0,
            },
          ]}
          activeOpacity={0.85}
          onPress={onToggleTracking}>
          <Text
            style={[
              styles.primaryButtonText,
              { color: session.isTracking ? '#F4F4F5' : '#09090B' },
            ]}>
            {session.isTracking ? 'Pause Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        {/* Today's Total Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>Today's Total</Text>
              <Text style={styles.summarySubtitle}>Cumulative reels viewed</Text>
            </View>
            <Text style={styles.summaryCount}>{todayTotal} reels</Text>
          </View>
        </View>

        {/* Quick Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          activeOpacity={0.7}
          onPress={confirmReset}>
          <Text style={styles.resetButtonText}>Reset Current Count (0 reels)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonEmoji: {
    fontSize: 18,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 26,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  leafWrapper: {
    marginBottom: 8,
  },
  countWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  mainCount: {
    fontSize: 68,
    fontWeight: '900',
    letterSpacing: -1,
  },
  countDenominator: {
    fontSize: 22,
    color: THEME.textMuted,
    fontWeight: '700',
    marginLeft: 6,
  },
  countLabel: {
    fontSize: 15,
    color: THEME.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  stageBadge: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  milestoneRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  milestoneBox: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneNum: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  milestoneLabel: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
  },
  milestoneDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.border,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  summarySubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.accentGreen,
  },
  resetButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: '600',
  },
});
