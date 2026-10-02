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
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.isAccessibilityPermissionGranted) {
        return await ReelStopperModule.isAccessibilityPermissionGranted();
      }
    } catch (e) {
      console.warn('NativeBridge: isAccessibilityPermissionGranted error', e);
    }
    return false;
  }

  openAccessibilitySettings(): void {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.openAccessibilitySettings) {
        ReelStopperModule.openAccessibilitySettings();
      }
    } catch (e) {
      console.warn('NativeBridge: openAccessibilitySettings error', e);
    }
  }

  async isOverlayPermissionGranted(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.isOverlayPermissionGranted) {
        return await ReelStopperModule.isOverlayPermissionGranted();
      }
    } catch (e) {
      console.warn('NativeBridge: isOverlayPermissionGranted error', e);
    }
    return true;
  }

  openOverlaySettings(): void {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.openOverlaySettings) {
        ReelStopperModule.openOverlaySettings();
      }
    } catch (e) {
      console.warn('NativeBridge: openOverlaySettings error', e);
    }
  }

  async startTracking(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.startTracking) {
        return await ReelStopperModule.startTracking();
      }
    } catch (e) {
      console.warn('NativeBridge: startTracking error', e);
    }
    return true;
  }

  async stopTracking(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.stopTracking) {
        return await ReelStopperModule.stopTracking();
      }
    } catch (e) {
      console.warn('NativeBridge: stopTracking error', e);
    }
    return true;
  }

  async resetSession(): Promise<number> {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.resetSession) {
        return await ReelStopperModule.resetSession();
      }
    } catch (e) {
      console.warn('NativeBridge: resetSession error', e);
    }
    return 0;
  }

  async getCurrentCount(): Promise<number> {
    try {
      if (Platform.OS === 'android' && ReelStopperModule?.getCurrentCount) {
        return await ReelStopperModule.getCurrentCount();
      }
    } catch (e) {
      console.warn('NativeBridge: getCurrentCount error', e);
    }
    return 0;
  }

  subscribeToReelIncrements(callback: (data: ReelEventPayload) => void): () => void {
    try {
      if (this.eventEmitter) {
        const subscription = this.eventEmitter.addListener('onReelIncremented', callback);
        return () => {
          try {
            subscription.remove();
          } catch (e) {
            // Ignore
          }
        };
      }
    } catch (e) {
      console.warn('NativeBridge: subscribe error', e);
    }
    return () => {};
  }
}

export const NativeBridge = new NativeBridgeService();
