'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY as STORAGE_KEY } from './theme-script';

/**
 * Light / dark / system theme. The choice lives in localStorage and is applied as
 * `data-theme` on <html> (tokens.css keys off it). "system" removes the attribute so
 * prefers-color-scheme decides. THEME_SCRIPT (theme-script.js) applies it before first paint.
 */
export const THEMES = ['light', 'dark', 'system'];
const EVENT = 'nibras:theme';

function read() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function apply(theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function setTheme(theme) {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the choice still applies for this page view.
  }
  apply(theme);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback) {
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      apply(read());
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage); // other tabs
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

/** Current theme choice ('light' | 'dark' | 'system'); 'system' during SSR. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'system');
  // React resets <html> attributes on the dev StrictMode remount; re-apply before paint (no-op in production).
  useLayoutEffect(() => apply(read()), []);
  return theme;
}
