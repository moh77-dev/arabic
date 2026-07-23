import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Read a recorded-audio URI into a base64 string, cross-platform.
 *
 * On native the recording is a file:// URI that expo-file-system reads directly. On web it's a
 * blob: URL that FileSystem can't read — so we fetch the blob and decode it with FileReader. Getting
 * this wrong is why web voice input silently failed.
 */
export async function audioUriToBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return dataUrl.split(',')[1] ?? ''; // strip the "data:...;base64," prefix
  }
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

/** Best-effort audio mime type for the current platform's recorder (used so Whisper gets the right extension). */
export function recordingMimeType(): string {
  return Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
}
