import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { getReelColorStage } from '../theme/colors';
import { LeafIcon } from './LeafIcon';

interface ReelCounterPillProps {
  count: number;
  onPress?: () => void;
}

export const ReelCounterPill: React.FC<ReelCounterPillProps> = ({ count, onPress }) => {
  const stage = getReelColorStage(count);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      // Subtle micro-animation when count increments (PRD Section 15)
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: count === 50 || count === 100 ? 1.25 : 1.12,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [count]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Watched ${count} reels. Current stage: ${stage.meaning}`}>
      <Animated.View
        style={[
          styles.pillContainer,
          {
            backgroundColor: stage.bgColor,
            borderColor: stage.borderColor,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
        <LeafIcon count={count} size={18} />
        <Text style={[styles.counterText, { color: stage.textColor }]}>
          {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 44,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.3,
  }
});
