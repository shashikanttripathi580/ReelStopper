import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayHistory, ReelSession, UserSettings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: '@reelstopper_settings',
  CURRENT_SESSION: '@reelstopper_current_session',
  HISTORY: '@reelstopper_history',
  TODAY_COUNT: '@reelstopper_today_count',
  LAST_DATE: '@reelstopper_last_date'
};

const DEFAULT_SETTINGS: UserSettings = {
  trackingEnabled: true,
  breakThreshold: 50,
  maxReminder: 100,
  notificationsEnabled: true,
  hapticFeedback: true
};

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class StorageService {
  static async getSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  static async getSession(): Promise<ReelSession> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load session', e);
    }
    return {
      currentCount: 0,
      breakThreshold: 50,
      maxReminder: 100,
      startTime: Date.now(),
      lastUpdated: Date.now(),
      isTracking: true
    };
  }

  static async saveSession(session: ReelSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save session', e);
    }
  }

  static async incrementReelCount(delta: number = 1): Promise<{ session: ReelSession; todayTotal: number }> {
    const session = await this.getSession();
    const today = getTodayString();
    let todayCount = await this.getTodayCount();

    session.currentCount += delta;
    session.lastUpdated = Date.now();
    todayCount += delta;

    await this.saveSession(session);
    await AsyncStorage.setItem(STORAGE_KEYS.TODAY_COUNT, String(todayCount));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
    await this.updateHistoryForToday(todayCount);

    return { session, todayTotal: todayCount };
  }

  static async resetSession(): Promise<ReelSession> {
    const settings = await this.getSettings();
    const newSession: ReelSession = {
      currentCount: 0,
      breakThreshold: settings.breakThreshold,
      maxReminder: settings.maxReminder,
      startTime: Date.now(),
      lastUpdated: Date.now(),
      isTracking: settings.trackingEnabled
    };
    await this.saveSession(newSession);
    return newSession;
  }

  static async getTodayCount(): Promise<number> {
    try {
      const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DATE);
      const today = getTodayString();
      if (lastDate !== today) {
        // New day started: reset today counter
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.TODAY_COUNT, '0');
        return 0;
      }
      const countStr = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_COUNT);
      return countStr ? parseInt(countStr, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  static async getHistory(): Promise<DayHistory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to get history', e);
    }
    // Default seed history matching PRD example
    return [
      { date: getTodayString(), label: 'Today', count: 74, sessionsCount: 3 },
      { date: '2026-10-01', label: 'Yesterday', count: 91, sessionsCount: 4 },
      { date: '2026-09-30', label: 'Oct 30', count: 63, sessionsCount: 2 },
      { date: '2026-09-29', label: 'Oct 29', count: 48, sessionsCount: 2 }
    ];
  }

  static async updateHistoryForToday(todayCount: number): Promise<void> {
    try {
      const history = await this.getHistory();
      const todayStr = getTodayString();
      const existingTodayIndex = history.findIndex(h => h.date === todayStr);

      if (existingTodayIndex >= 0) {
        history[existingTodayIndex].count = todayCount;
      } else {
        history.unshift({
          date: todayStr,
          label: 'Today',
          count: todayCount,
          sessionsCount: 1
        });
      }
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to update history', e);
    }
  }

  static async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
      await AsyncStorage.setItem(STORAGE_KEYS.TODAY_COUNT, '0');
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  }
}
