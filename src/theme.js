import { createContext, useContext } from 'react';

// ---------- theming (day / night) ----------

export const DAY_COLORS = {
  bg: '#FFFFFF',
  recessed: '#F4F5F7',
  primary: '#0B2545',
  primaryTint: '#E8EDF3',
  secondary: '#1D4E75',
  accent: '#B08A4E',
  accentTint: '#F6EFE2',
  text: '#101820',
  textMuted: '#5C6672',
  border: '#E3E6EA',
  complete: '#2F7D5A',
  action: '#B4780E',
  problem: '#B3261E',
  future: '#B7BFC7',
};

export const NIGHT_COLORS = {
  ...DAY_COLORS,
  bg: '#16233C',
  recessed: '#0A1424',
  primaryTint: 'rgba(29,78,117,0.35)',
  accentTint: 'rgba(176,138,78,0.22)',
  text: '#EDF1F5',
  textMuted: '#9FB0BE',
  border: 'rgba(255,255,255,0.14)',
  future: '#48525E',
};

export const ColorContext = createContext(DAY_COLORS);
export function useColors() {
  return useContext(ColorContext);
}

export const FONT_DISPLAY = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
export const FONT_BODY = { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" };
export const FONT_MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
