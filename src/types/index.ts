// Type definitions for the Melanie project

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  isFloating: boolean;
  floatAngle: number;
  floatSpeed: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface AppConfig {
  colors: ColorScheme;
  title: string;
  subtitle: string;
}

export const APP_COLORS: ColorScheme = {
  primary: '#0097B2',
  secondary: '#70A6B0',
  background: '#FFFFFF',
  accent: '#e8cd8c',
} as const;

export const APP_CONFIG: AppConfig = {
  colors: APP_COLORS,
  title: 'Hier entsteht gerade etwas großartiges!',
  subtitle: 'Wir arbeiten an etwas Besonderem. Schauen Sie bald wieder vorbei.',
} as const;