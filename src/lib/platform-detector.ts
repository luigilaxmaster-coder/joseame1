/**
 * Detects if the application is running in app mode (mobile app wrapper)
 * or web mode (browser)
 */
export function isAppMode(): boolean {
  // Check if running in a mobile app wrapper (Capacitor, React Native, etc.)
  // Common indicators:
  // 1. Capacitor app
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return true;
  }

  // 2. React Native WebView
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    return true;
  }

  // 3. Custom app indicator (can be set by app wrapper)
  if (typeof window !== 'undefined' && (window as any).__APP_MODE__) {
    return true;
  }

  // 4. Check user agent for common app wrappers
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (
      userAgent.includes('capacitor') ||
      userAgent.includes('cordova') ||
      userAgent.includes('react-native') ||
      userAgent.includes('webview')
    ) {
      return true;
    }
  }

  // Default to web mode
  return false;
}

/**
 * Detects if running on a mobile device (regardless of app or web)
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent
  );
}
