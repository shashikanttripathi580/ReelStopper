import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../theme/colors';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    emoji: '🌱',
    title: 'Awareness, Not Control',
    description:
      'Endless reel feeds have no natural stopping point. ReelStopper gently counts reels while you scroll without forcing you to stop.',
  },
  {
    emoji: '🟢🟡🔴',
    title: 'Gradual Color Growth',
    description:
      'The counter starts translucent and soft green. At 50 reels it turns yellow with a gentle reminder, and at 100 reels it turns red.',
  },
  {
    emoji: '🔒',
    title: '100% Local & Private',
    description:
      'No account, no cloud servers, no video recording. All count statistics stay strictly on your device.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badgeContainer}>
          <Text style={styles.slideEmoji}>{slide.emoji}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlide ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
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
    padding: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  slideEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 36,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: THEME.accentGreen,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#3F3F46',
  },
  footer: {
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: THEME.accentGreen,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '700',
  },
});
