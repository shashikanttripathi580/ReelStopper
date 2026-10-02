export interface ReelSession {
  currentCount: number;
  breakThreshold: number; // default 50
  maxReminder: number;    // default 100
  startTime: number;
  lastUpdated: number;
  isTracking: boolean;
}

export interface DayHistory {
  date: string; // YYYY-MM-DD
  label: string; // "Today", "Yesterday", "Oct 30"
  count: number;
  sessionsCount: number;
}

export interface UserSettings {
  trackingEnabled: boolean;
  breakThreshold: number; // 25, 50, 75, 100
  maxReminder: number;    // 100
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
}

export type ScreenType =
  | 'splash'
  | 'onboarding'
  | 'permissions'
  | 'dashboard'
  | 'history'
  | 'settings';
