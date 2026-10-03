/** Shared by the root layout (server) and lib/theme.js (client). */
export const THEME_STORAGE_KEY = 'nibras.theme';

/** Runs in <head> before first paint: applies a saved light/dark choice as data-theme on <html>. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
