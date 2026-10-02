import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface BreakReminderModalProps {
  visible: boolean;
  milestone: 50 | 100;
  onTakeBreak: () => void;
  onContinueWatching: () => void;
}

export const BreakReminderModal: React.FC<BreakReminderModalProps> = ({
  visible,
  milestone,
  onTakeBreak,
  onContinueWatching,
}) => {
  const isHundred = milestone === 100;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onContinueWatching}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isHundred
                  ? 'rgba(239, 68, 68, 0.18)'
                  : 'rgba(250, 204, 21, 0.18)',
                borderColor: isHundred ? '#EF4444' : '#FACC15',
              },
            ]}>
            <Text
              style={[
                styles.badgeText,
                { color: isHundred ? '#EF4444' : '#FACC15' },
              ]}>
              {isHundred ? '🔴 100 reels' : '🌱 50 reels'}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isHundred ? "You've watched 100 reels." : 'Time for a break?'}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {isHundred
              ? 'Consider taking a longer break and giving your mind some rest.'
              : "You've watched 50 reels. Take a short break."}
          </Text>

          {/* Action: Take a Break */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: isHundred ? '#EF4444' : '#22C55E' },
            ]}
            activeOpacity={0.85}
            onPress={onTakeBreak}>
            <Text style={styles.primaryButtonText}>Take a Break</Text>
          </TouchableOpacity>

          {/* Action: Continue Watching */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={onContinueWatching}>
            <Text style={styles.secondaryButtonText}>Continue Watching</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#18181B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F4F4F5',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 26,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '500',
  },
});
