import { Alert, Platform } from 'react-native';

/**
 * React Native's `Alert.alert` silently no-ops on web (react-native-web has no implementation),
 * so any flow gated on it — e.g. a confirm dialog before leaving a lesson — just does nothing
 * when tapped. These wrap `window.confirm`/`window.alert` on web and the real native Alert
 * everywhere else, so the same call site works on every platform.
 */
export function confirmAsync(opts: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm(`${opts.title}\n\n${opts.message}`) : true);
  }
  return new Promise((resolve) => {
    Alert.alert(opts.title, opts.message, [
      { text: opts.cancelLabel ?? 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: opts.confirmLabel ?? 'OK', style: opts.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}

export function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
