/** Human-readable device summary from a user-agent string (display only, never for decisions). */
export function describeDevice(userAgent, clientType, t) {
  if (clientType === 'MOBILE') return t('sessions.app');
  if (!userAgent) return t('sessions.unknownDevice');
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\//.test(userAgent)
      ? 'Opera'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : t('sessions.browser');
  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /iPhone|iPad/.test(userAgent)
      ? 'iOS'
      : /Mac OS X/.test(userAgent)
        ? 'macOS'
        : /Android/.test(userAgent)
          ? 'Android'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : null;
  return os ? t('sessions.browserOn', { browser, os }) : browser;
}
