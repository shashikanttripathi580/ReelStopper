import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { getReelColorStage } from '../theme/colors';

interface LeafIconProps {
  count: number;
  size?: number;
}

export const LeafIcon: React.FC<LeafIconProps> = ({ count, size = 20 }) => {
  const stage = getReelColorStage(count);

  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { fontSize: size }]}>
        {stage.leafEmoji}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  }
});
