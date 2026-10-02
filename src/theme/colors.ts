/**
 * ReelStopper Color Progression System
 *
 * Implements Section 8 & 13 of the PRD:
 * Transparent -> Green -> Yellow -> Orange -> Red
 */

export interface ReelColorStage {
  label: string;
  min: number;
  max: number;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  leafEmoji: string;
  meaning: string;
}

export const COLOR_STAGES: ReelColorStage[] = [
  {
    label: '0 Reels',
    min: 0,
    max: 0,
    textColor: 'rgba(161, 161, 170, 0.7)',
    bgColor: 'rgba(24, 24, 27, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    glowColor: 'transparent',
    leafEmoji: '🌱',
    meaning: 'Just started'
  },
  {
    label: '1–10 Reels',
    min: 1,
    max: 10,
    textColor: '#86EFAC', // Soft Green
    bgColor: 'rgba(20, 83, 45, 0.45)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
    glowColor: 'rgba(74, 222, 128, 0.2)',
    leafEmoji: '🌱',
    meaning: 'Low count'
  },
  {
    label: '11–25 Reels',
    min: 11,
    max: 25,
    textColor: '#4ADE80', // Green
    bgColor: 'rgba(21, 128, 61, 0.45)',
    borderColor: 'rgba(34, 197, 94, 0.6)',
    glowColor: 'rgba(34, 197, 94, 0.25)',
    leafEmoji: '🌿',
    meaning: 'Normal'
  },
  {
    label: '26–49 Reels',
    min: 26,
    max: 49,
    textColor: '#BEF264', // Lime / Yellow-Green
    bgColor: 'rgba(101, 163, 13, 0.45)',
    borderColor: 'rgba(163, 230, 53, 0.7)',
    glowColor: 'rgba(163, 230, 53, 0.3)',
    leafEmoji: '🌿',
    meaning: 'Approaching break'
  },
  {
    label: '50 Reels',
    min: 50,
    max: 50,
    textColor: '#FACC15', // Pure Yellow
    bgColor: 'rgba(161, 98, 7, 0.55)',
    borderColor: '#FACC15',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    leafEmoji: '🌾',
    meaning: 'Break reminder'
  },
  {
    label: '51–74 Reels',
    min: 51,
    max: 74,
    textColor: '#FB923C', // Warm Orange
    bgColor: 'rgba(194, 65, 12, 0.5)',
    borderColor: 'rgba(249, 115, 22, 0.75)',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    leafEmoji: '🍂',
    meaning: 'Continued scrolling'
  },
  {
    label: '75–99 Reels',
    min: 75,
    max: 99,
    textColor: '#F87171', // Orange-Red
    bgColor: 'rgba(185, 28, 28, 0.55)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    leafEmoji: '🍁',
    meaning: 'High count'
  },
  {
    label: '100+ Reels',
    min: 100,
    max: 99999,
    textColor: '#EF4444', // Solid Red
    bgColor: 'rgba(153, 27, 27, 0.65)',
    borderColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    leafEmoji: '🔴',
    meaning: 'Strong break reminder'
  }
];

export function getReelColorStage(count: number): ReelColorStage {
  for (const stage of COLOR_STAGES) {
    if (count >= stage.min && count <= stage.max) {
      return stage;
    }
  }
  return COLOR_STAGES[COLOR_STAGES.length - 1];
}

export const THEME = {
  background: '#09090B',
  surface: '#121217',
  card: '#18181B',
  border: '#27272A',
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  accentGreen: '#22C55E',
  accentYellow: '#FACC15',
  accentRed: '#EF4444',
  accentOrange: '#F97316'
};
