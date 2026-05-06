export type DetectedOS = 'mac' | 'windows' | 'linux' | 'other';

const MAC_INDICATORS = /Mac|iPhone|iPod|iPad/i;
const WIN_INDICATORS = /Windows/i;
const LINUX_INDICATORS = /Linux/i;

type UserAgentData = {
  platform?: string;
};

/**
 * Detect the current operating system using userAgentData when available,
 * with progressive fallback to userAgent and finally deprecated platform.
 */
export function detectOS(): DetectedOS {
  if (typeof navigator === 'undefined') {
    return 'other';
  }

  const uaData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  if (uaData) {
    const ua: string = navigator.userAgent ?? '';
    const platformHint = uaData.platform ?? '';
    const combined = `${platformHint} ${ua}`;
    if (MAC_INDICATORS.test(combined)) return 'mac';
    if (WIN_INDICATORS.test(combined)) return 'windows';
    if (LINUX_INDICATORS.test(combined)) return 'linux';
    return 'other';
  }

  const ua = navigator.userAgent ?? '';
  if (MAC_INDICATORS.test(ua)) return 'mac';
  if (WIN_INDICATORS.test(ua)) return 'windows';
  if (LINUX_INDICATORS.test(ua)) return 'linux';

  const platform = (navigator as Navigator & { platform?: string }).platform ?? '';
  if (MAC_INDICATORS.test(platform)) return 'mac';
  if (WIN_INDICATORS.test(platform)) return 'windows';
  if (LINUX_INDICATORS.test(platform)) return 'linux';

  return 'other';
}

/** Returns true on macOS/iOS. Convenience for the common mac-vs-other split. */
export function isMac(): boolean {
  return detectOS() === 'mac';
}
