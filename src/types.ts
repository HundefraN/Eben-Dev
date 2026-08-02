export type ThemePreset = 'studio-light' | 'midnight-dark' | 'cyber-neon' | 'sunset-gold';

export interface ParallaxConfig {
  intensity: number;
  enable3dTilt: boolean;
  enableParticles: boolean;
  enableFloatingBadges: boolean;
  enableLightFollow: boolean;
  soundEnabled: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  tags: string[];
  gradient: string;
}

export interface FloatingBadge {
  id: string;
  label: string;
  iconName: string;
  xOffsetPct: number;
  yOffsetPct: number;
  depth: number;
  category: string;
}

export interface ProjectHighlight {
  id: string;
  title: string;
  category: string;
  metrics: string;
  description: string;
  tags: string[];
  demoUrl?: string;
  accentColor: string;
}

export interface CeoInfo {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experienceYears: string;
  phone: string;
  email: string;
  telegram: string;
}