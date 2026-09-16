/**
 * Native (Capacitor) bootstrap for the Roomie Finder mobile app.
 * Safe no-op when the app runs in a normal browser.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

/** Deep link path the Android app opens on launch. */
export const NATIVE_HOME_ROUTE = '/roomie-finder';

export const initNative = async (onDeepLink?: (path: string) => void) => {
  if (!isNative()) return;

  document.documentElement.classList.add('native-app');

  const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
    import('@capacitor/app'),
  ]);

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (nativePlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#163d35' });
    }
  } catch {
    /* status bar not available */
  }

  try {
    await SplashScreen.hide();
  } catch {
    /* splash not available */
  }

  // Deep links: nazarihomes.com/roomie-finder/... opens inside the app
  App.addListener('appUrlOpen', ({ url }) => {
    try {
      const parsed = new URL(url);
      onDeepLink?.(parsed.pathname + parsed.search);
    } catch {
      /* ignore malformed urls */
    }
  });

  // Android hardware back button: go back, or exit at the root
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else App.exitApp();
  });
};