import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME, getReelColorStage } from '../theme/colors';
import { DayHistory } from '../types';

interface HistoryScreenProps {
  history: DayHistory[];
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack }) => {
  const maxCount = Math.max(100, ...history.map((h) => h.count));

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          All awareness data is stored 100% locally on this device.
        </Text>

        <View style={styles.listCard}>
          {history.map((item, index) => {
            const stage = getReelColorStage(item.count);
            const percentage = Math.min(100, Math.round((item.count / maxCount) * 100));

            return (
              <View
                key={item.date || index}
                style={[
                  styles.historyItem,
                  index < history.length - 1 && styles.borderBottom,
                ]}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </View>
                  <View style={styles.countWrapper}>
                    <Text style={[styles.itemCount, { color: stage.textColor }]}>
                      {item.count}
                    </Text>
                    <Text style={styles.countUnit}> reels</Text>
                  </View>
                </View>

                {/* Visual bar */}
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: stage.textColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
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
  subtitle: {
    fontSize: 13,
    color: THEME.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  historyItem: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  itemDate: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  countWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  itemCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  countUnit: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  barBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
