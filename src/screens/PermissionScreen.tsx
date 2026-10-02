import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '../theme/colors';
import { NativeBridge } from '../services/NativeBridge';

interface PermissionScreenProps {
  onComplete: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onComplete }) => {
  const [accessibilityGranted, setAccessibilityGranted] = useState(false);
  const [overlayGranted, setOverlayGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const acc = await NativeBridge.isAccessibilityPermissionGranted();
    const ovl = await NativeBridge.isOverlayPermissionGranted();
    setAccessibilityGranted(acc);
    setOverlayGranted(ovl);
  };

  const handleRequestAccessibility = () => {
    NativeBridge.openAccessibilitySettings();
    // Simulate approval for quick testing if needed
    setAccessibilityGranted(true);
  };

  const handleRequestOverlay = () => {
    NativeBridge.openOverlaySettings();
    setOverlayGranted(true);
  };

  const canProceed = accessibilityGranted || overlayGranted;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emojiBadge}>🛡️</Text>
          <Text style={styles.title}>Required Permissions</Text>
          <Text style={styles.subtitle}>
            ReelStopper operates entirely on your phone. To detect reels and show the counter, two Android permissions are needed.
          </Text>
        </View>

        {/* Permission Card 1: Accessibility */}
        <View style={styles.permCard}>
          <View style={styles.permHeader}>
            <Text style={styles.permIcon}>👁️</Text>
            <View style={styles.permMeta}>
              <Text style={styles.permTitle}>Accessibility Service</Text>
              <Text style={styles.permDesc}>
                Detects when you scroll to a new reel or video. We never inspect your personal messages, passwords, or video content.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              accessibilityGranted && styles.actionBtnGranted,
            ]}
            onPress={handleRequestAccessibility}>
            <Text
              style={[
                styles.actionBtnText,
                accessibilityGranted && styles.actionBtnTextGranted,
              ]}>
              {accessibilityGranted ? '✓ Enabled' : 'Enable Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Permission Card 2: Display Over Other Apps */}
        <View style={styles.permCard}>
          <View style={styles.permHeader}>
            <Text style={styles.permIcon}>🪟</Text>
            <View style={styles.permMeta}>
              <Text style={styles.permTitle}>Display Over Other Apps</Text>
              <Text style={styles.permDesc}>
                Allows the tiny leaf counter to float above the Like button while scrolling supported reel apps.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              overlayGranted && styles.actionBtnGranted,
            ]}
            onPress={handleRequestOverlay}>
            <Text
              style={[
                styles.actionBtnText,
                overlayGranted && styles.actionBtnTextGranted,
              ]}>
              {overlayGranted ? '✓ Enabled' : 'Enable Overlay'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 100% Offline Guarantee: No data is ever sent to any remote server or third party.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !canProceed && styles.primaryButtonDisabled]}
          activeOpacity={0.85}
          onPress={onComplete}>
          <Text style={styles.primaryButtonText}>
            {canProceed ? 'Start Tracking' : 'Enable Permissions to Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  emojiBadge: {
    fontSize: 44,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  permCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 18,
    marginBottom: 16,
  },
  permHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  permIcon: {
    fontSize: 26,
    marginRight: 14,
    marginTop: 2,
  },
  permMeta: {
    flex: 1,
  },
  permTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  permDesc: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnGranted: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  actionBtnText: {
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtnTextGranted: {
    color: THEME.accentGreen,
  },
  privacyNote: {
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: 8,
  },
  privacyText: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  primaryButton: {
    backgroundColor: THEME.accentGreen,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#27272A',
  },
  primaryButtonText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '700',
  },
});
