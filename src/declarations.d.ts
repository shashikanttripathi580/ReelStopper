/**
 * Global Ambient Type Declarations for ReelStopper
 * Ensures IDE and TypeScript compiler resolve React, React Native, and AsyncStorage types cleanly.
 */

declare module 'react' {
  export = React;
}

declare namespace React {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => any;
  export function useState<T>(initial: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initial?: T): { current: T };
}

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
  };
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const Modal: any;
  export const Switch: any;
  export const Animated: any;
  export const SafeAreaView: any;
  export const StatusBar: any;
  export const Alert: {
    alert(title: string, message?: string, buttons?: any[], options?: any): void;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  };
  export const NativeModules: {
    ReelStopperModule?: any;
    [key: string]: any;
  };
  export class NativeEventEmitter {
    constructor(nativeModule?: any);
    addListener(eventType: string, listener: (...args: any[]) => any): { remove: () => void };
  }
  export const AppRegistry: {
    registerComponent(appKey: string, componentProvider: () => any): void;
  };
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
  };
  export default AsyncStorage;
}
