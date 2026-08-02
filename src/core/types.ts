import type { MotionValue } from 'motion/react';

export type ThemeMode = 'light' | 'dark';

/** The four narrative stages the experience moves through. */
export const STAGES = ['home', 'work', 'founder', 'contact'] as const;
export type StageId = (typeof STAGES)[number];

export interface StageMeta {
  id: StageId;
  label: string;
  /** Short line the companion says when the stage becomes active. */
  greeting: string;
  /** Which side the supporting panel occupies, so the character can face it. */
  side: 'none' | 'left' | 'right';
}

export interface Viewport {
  width: number;
  height: number;
  /** < 768px — character docks, panels go full-bleed. */
  isMobile: boolean;
  /** < 1120px — connector threads and orbit ring are simplified. */
  isCompact: boolean;
  isTouch: boolean;
  isPortrait: boolean;
}

/** A point in viewport space, published every frame by the companion. */
export interface AnchorPoint {
  x: number;
  y: number;
}

export interface AnchorMap {
  /** Just above the character's head — where speech attaches. */
  head: AnchorPoint;
  /** The gesturing hand for the current pose — where light threads originate. */
  hand: AnchorPoint;
  /** Centre of mass — used by the backdrop key light and mote attraction. */
  core: AnchorPoint;
  /** Ground contact point, for the contact shadow. */
  feet: AnchorPoint;
  /** Overall on-screen scale of the character, so threads can scale with her. */
  scale: number;
}

/** A UI element wired to the companion by a light thread. */
export interface CompanionLink {
  id: string;
  el: HTMLElement;
  /** Higher = drawn brighter and thicker. */
  weight: number;
  active: boolean;
}

export type CompanionReaction =
  | { kind: 'nod' }
  | { kind: 'cheer' }
  | { kind: 'point'; side: 'left' | 'right' }
  | { kind: 'pulse' };

export interface PointerChannel {
  /** Normalised −1…1 across the viewport, spring-smoothed. */
  xr: MotionValue<number>;
  yr: MotionValue<number>;
  /** Absolute smoothed pixel position. */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** Unsmoothed latest values, for imperative readers inside RAF loops. */
  raw: { x: number; y: number; xr: number; yr: number; active: boolean };
}

export interface ServiceItem {
  id: string;
  title: string;
  summary: string;
  detail: string;
  iconName: string;
  tags: string[];
  /** One-liner the companion says when this service is hovered. */
  quip: string;
}

export interface CapabilityChip {
  id: string;
  label: string;
  iconName: string;
  /** Position on the orbit ring, in degrees. */
  angle: number;
  detail: string;
  quip: string;
}

/** Evidence the build exists: a recording, or a screenshot of the live thing. */
export interface ProjectProof {
  kind: 'video' | 'image';
  /**
   * Any share link — YouTube, Vimeo, Loom, Drive, or a direct file URL.
   * `resolveMedia()` works out how to render it.
   */
  url: string;
  /** Overrides the provider thumbnail. Needed wherever one can't be derived. */
  poster?: string;
  /** Portrait sources (phone captures) get a tall frame rather than letterboxing. */
  orientation?: 'landscape' | 'portrait';
  /** Verb on the card's proof plate — "Watch the demo", "View the site". */
  label: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectHighlight {
  id: string;
  title: string;
  discipline: string;
  /** What I actually did on it. Rendered as the leading, accented tag. */
  role: string;
  status: { label: string; tone: 'live' | 'building' | 'shipped' };
  description: string;
  tags: string[];
  year: string;
  quip: string;
  proof: ProjectProof;
  /** Somewhere public to go, where there is somewhere public to go. */
  link?: ProjectLink;
}

export interface FounderInfo {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experienceYears: string;
  location: string;
  phone: string;
  email: string;
  telegram: string;
  disciplines: { label: string; value: number; caption: string }[];
}
