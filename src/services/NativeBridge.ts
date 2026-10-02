import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const ReelStopperModule = NativeModules?.ReelStopperModule as any;

export interface ReelEventPayload {
  count: number;
  app: string;
  timestamp: number;
}

class NativeBridgeService {
  private eventEmitter: any = null;

  constructor() {
    if (Platform.OS === 'android' && ReelStopperModule) {
      try {
        this.eventEmitter = new NativeEventEmitter(ReelStopperModule);
      } catch (e) {
        // Fallback for mock environments
        this.eventEmitter = null;
      }
    }
  }

  async isAccessibilityPermissionGranted(): Promise<boolean> {
    if (Platform.OS === 'android' && ReelStopperModule) {
      return await ReelStopperModule.isAccessibilityPermissionGranted();
    }
    return false;
  }

  openAccessibilitySettings(): void {
    if (Platform.OS === 'android' && ReelStopperModule) {
      ReelStopperModule.openAccessibilitySettings();
    }
  }

  async isOverlayPermissionGranted(): Promise<boolean> {
    if (Platform.OS === 'android' && ReelStopperModule) {
      return await ReelStopperModule.isOverlayPermissionGranted();
    }
    return true;
  }

  openOverlaySettings(): void {
    if (Platform.OS === 'android' && ReelStopperModule) {
      ReelStopperModule.openOverlaySettings();
    }
  }

  async startTracking(): Promise<boolean> {
    if (Platform.OS === 'android' && ReelStopperModule) {
      return await ReelStopperModule.startTracking();
    }
    return true;
  }

  async stopTracking(): Promise<boolean> {
    if (Platform.OS === 'android' && ReelStopperModule) {
      return await ReelStopperModule.stopTracking();
    }
    return true;
  }

  async resetSession(): Promise<number> {
    if (Platform.OS === 'android' && ReelStopperModule) {
      return await ReelStopperModule.resetSession();
    }
    return 0;
  }

  async getCurrentCount(): Promise<number> {
    if (Platform.OS === 'android' && ReelStopperModule) {
      return await ReelStopperModule.getCurrentCount();
    }
    return 0;
  }

  subscribeToReelIncrements(callback: (data: ReelEventPayload) => void): () => void {
    if (this.eventEmitter) {
      const subscription = this.eventEmitter.addListener('onReelIncremented', callback);
      return () => subscription.remove();
    }
    return () => {};
  }
}

export const NativeBridge = new NativeBridgeService();
