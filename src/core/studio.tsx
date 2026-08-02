import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMotionValue, useSpring, useReducedMotion, type MotionValue } from 'motion/react';
import type {
  AnchorMap,
  CompanionLink,
  CompanionReaction,
  PointerChannel,
  StageId,
  ThemeMode,
  Viewport,
} from './types';
import { STAGES } from './types';
import { soundFx } from '../utils/audio';

/* ------------------------------------------------------------------ */
/* Viewport                                                            */
/* ------------------------------------------------------------------ */

function readViewport(): Viewport {
  if (typeof window === 'undefined') {
    return {
      width: 1440,
      height: 900,
      isMobile: false,
      isCompact: false,
      isTouch: false,
      isPortrait: false,
    };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isMobile: width < 768,
    isCompact: width < 1120,
    isTouch: window.matchMedia('(hover: none)').matches,
    isPortrait: height > width,
  };
}

/* ------------------------------------------------------------------ */
/* Speech + reaction bus                                               */
/* ------------------------------------------------------------------ */

export interface SpeechLine {
  id: number;
  text: string;
  /** Higher priority interrupts a line that is already showing. */
  priority: number;
  ttl: number;
}

type SpeechListener = (line: SpeechLine | null) => void;
type ReactionListener = (reaction: CompanionReaction) => void;

class CompanionBus {
  private speechListeners = new Set<SpeechListener>();
  private reactionListeners = new Set<ReactionListener>();
  private current: SpeechLine | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private seq = 0;

  onSpeech(fn: SpeechListener) {
    this.speechListeners.add(fn);
    fn(this.current);
    return () => {
      this.speechListeners.delete(fn);
    };
  }

  onReaction(fn: ReactionListener) {
    this.reactionListeners.add(fn);
    return () => {
      this.reactionListeners.delete(fn);
    };
  }

  say(text: string, { priority = 1, ttl = 4200 } = {}) {
    if (this.current && this.current.priority > priority && this.current.text !== text) return;
    if (this.current?.text === text) return;
    this.current = { id: ++this.seq, text, priority, ttl };
    this.speechListeners.forEach((fn) => fn(this.current));
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hush(), ttl);
  }

  hush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.current = null;
    this.speechListeners.forEach((fn) => fn(null));
  }

  react(reaction: CompanionReaction) {
    this.reactionListeners.forEach((fn) => fn(reaction));
  }
}

/* ------------------------------------------------------------------ */
/* Link registry — widgets tethered to the companion by light threads  */
/* ------------------------------------------------------------------ */

class LinkRegistry {
  private links = new Map<string, CompanionLink>();
  private listeners = new Set<() => void>();
  private snapshot: CompanionLink[] = [];

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  /** Stable snapshot of the currently active links, for useSyncExternalStore. */
  getSnapshot = () => this.snapshot;

  private publish() {
    this.snapshot = [...this.links.values()].filter((l) => l.active);
    this.listeners.forEach((fn) => fn());
  }

  register(link: CompanionLink) {
    this.links.set(link.id, link);
    if (link.active) this.publish();
  }

  setActive(id: string, active: boolean, weight = 1) {
    const link = this.links.get(id);
    if (!link || (link.active === active && link.weight === weight)) return;
    link.active = active;
    link.weight = weight;
    this.publish();
  }

  remove(id: string) {
    const was = this.links.get(id)?.active;
    this.links.delete(id);
    if (was) this.publish();
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface StudioValue {
  pointer: PointerChannel;
  /** Continuous stage value (springs between integers) for parallax reads. */
  stageFlow: MotionValue<number>;
  stage: number;
  stageId: StageId;
  goTo: (index: number, opts?: { silent?: boolean }) => void;
  step: (delta: number) => void;
  viewport: Viewport;
  reduceMotion: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  sound: boolean;
  toggleSound: () => void;
  anchors: React.MutableRefObject<AnchorMap>;
  links: LinkRegistry;
  bus: CompanionBus;
  /** Element the character should turn toward; falls back to the pointer. */
  setGaze: (el: HTMLElement | null) => void;
  gaze: React.MutableRefObject<HTMLElement | null>;
  navLocked: React.MutableRefObject<boolean>;
  setNavLocked: (locked: boolean) => void;
  /** Which side a full-screen overlay occupies, so she can step out of its way. */
  overlay: 'none' | 'left' | 'right';
  setOverlay: (side: 'none' | 'left' | 'right') => void;
}

const StudioContext = createContext<StudioValue | null>(null);

export function useStudio(): StudioValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

const THEME_KEY = 'eben-theme';
const SOUND_KEY = 'eben-sound';

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReduced = useReducedMotion();
  const reduceMotion = !!prefersReduced;

  /* ---- viewport ---- */
  const [viewport, setViewport] = useState<Viewport>(readViewport);

  useLayoutEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setViewport(readViewport());
        // Mobile browsers report a 100vh that includes the collapsing URL bar.
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
      });
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);

  /* ---- theme ---- */
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document === 'undefined') return 'light';
    return (document.documentElement.getAttribute('data-theme') as ThemeMode) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable — theme simply won't persist */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);

  /* ---- sound (off by default; hover chimes nobody asked for are hostile) ---- */
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === 'on';
    } catch {
      return false;
    }
  });

  const toggleSound = useCallback(() => {
    setSound((s) => {
      const next = !s;
      try {
        localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
      } catch {
        /* ignore */
      }
      if (next) soundFx.playClickChime();
      return next;
    });
  }, []);

  const soundRef = useRef(sound);
  soundRef.current = sound;

  /* ---- pointer ---- */
  const rawPointer = useRef({ x: 0, y: 0, xr: 0, yr: 0, active: false });
  const xrSource = useMotionValue(0);
  const yrSource = useMotionValue(0);
  const pxSource = useMotionValue(0);
  const pySource = useMotionValue(0);

  const springCfg = useMemo(
    () =>
      reduceMotion
        ? { stiffness: 1000, damping: 100, mass: 0.1 }
        : { stiffness: 130, damping: 26, mass: 0.55 },
    [reduceMotion],
  );

  const xr = useSpring(xrSource, springCfg);
  const yr = useSpring(yrSource, springCfg);
  const px = useSpring(pxSource, springCfg);
  const py = useSpring(pySource, springCfg);

  useEffect(() => {
    const update = (clientX: number, clientY: number) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (clientX / w) * 2 - 1;
      const ny = (clientY / h) * 2 - 1;
      // Mutated in place: consumers hold a reference to this exact object.
      const raw = rawPointer.current;
      raw.x = clientX;
      raw.y = clientY;
      raw.xr = nx;
      raw.yr = ny;
      raw.active = true;
      xrSource.set(nx);
      yrSource.set(ny);
      pxSource.set(clientX);
      pySource.set(clientY);
    };

    const onPointerMove = (e: PointerEvent) => update(e.clientX, e.clientY);
    const onPointerLeave = () => {
      rawPointer.current.active = false;
      xrSource.set(0);
      yrSource.set(0);
    };

    // Seed at centre so nothing snaps on first move.
    pxSource.set(window.innerWidth / 2);
    pySource.set(window.innerHeight / 2);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [xrSource, yrSource, pxSource, pySource]);

  const pointer = useMemo<PointerChannel>(
    () => ({ xr, yr, px, py, raw: rawPointer.current }),
    [xr, yr, px, py],
  );

  /* ---- stage ---- */
  const [stage, setStage] = useState(0);
  const stageSource = useMotionValue(0);
  const stageFlow = useSpring(
    stageSource,
    reduceMotion
      ? { stiffness: 900, damping: 90, mass: 0.2 }
      : { stiffness: 88, damping: 20, mass: 0.9 },
  );

  const stageRef = useRef(stage);
  stageRef.current = stage;

  const bus = useMemo(() => new CompanionBus(), []);
  const links = useMemo(() => new LinkRegistry(), []);
  const gaze = useRef<HTMLElement | null>(null);
  const navLocked = useRef(false);
  const lastNav = useRef(0);

  const anchors = useRef<AnchorMap>({
    head: { x: 0, y: 0 },
    hand: { x: 0, y: 0 },
    core: { x: 0, y: 0 },
    feet: { x: 0, y: 0 },
    scale: 1,
  });

  const goTo = useCallback(
    (index: number, opts?: { silent?: boolean }) => {
      const next = Math.max(0, Math.min(STAGES.length - 1, index));
      setStage((prev) => {
        if (prev === next) return prev;
        stageSource.set(next);
        lastNav.current = Date.now();
        if (!opts?.silent && soundRef.current) soundFx.playParallaxSwoosh();
        bus.react(
          next === 1 ? { kind: 'point', side: 'right' }
            : next === 2 ? { kind: 'point', side: 'left' }
            : next === 3 ? { kind: 'nod' }
            : { kind: 'pulse' },
        );
        return next;
      });
    },
    [bus, stageSource],
  );

  const step = useCallback(
    (delta: number) => {
      goTo(stageRef.current + delta);
    },
    [goTo],
  );

  const setGaze = useCallback((el: HTMLElement | null) => {
    gaze.current = el;
  }, []);

  const setNavLocked = useCallback((locked: boolean) => {
    navLocked.current = locked;
  }, []);

  const [overlay, setOverlay] = useState<'none' | 'left' | 'right'>('none');

  /* ---- navigation input: wheel, keys, swipe ---- */
  useEffect(() => {
    const COOLDOWN = 620;

    /** True when the pointer sits over a scroller that can still absorb the delta. */
    const absorbedByScroller = (target: EventTarget | null, deltaY: number) => {
      let node = target as HTMLElement | null;
      while (node && node !== document.body) {
        if (node.dataset?.scroller !== undefined) {
          const { scrollTop, scrollHeight, clientHeight } = node;
          const atTop = scrollTop <= 1;
          const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
          if (scrollHeight > clientHeight + 4 && ((deltaY > 0 && !atBottom) || (deltaY < 0 && !atTop))) {
            return true;
          }
        }
        node = node.parentElement;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (navLocked.current) return;
      if (absorbedByScroller(e.target, e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastNav.current < COOLDOWN) return;
      if (Math.abs(e.deltaY) < 12) return;
      goTo(stageRef.current + (e.deltaY > 0 ? 1 : -1));
    };

    const onKey = (e: KeyboardEvent) => {
      if (navLocked.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const map: Record<string, () => void> = {
        ArrowDown: () => goTo(stageRef.current + 1),
        PageDown: () => goTo(stageRef.current + 1),
        ArrowRight: () => goTo(stageRef.current + 1),
        ArrowUp: () => goTo(stageRef.current - 1),
        PageUp: () => goTo(stageRef.current - 1),
        ArrowLeft: () => goTo(stageRef.current - 1),
        Home: () => goTo(0),
        End: () => goTo(STAGES.length - 1),
      };
      const action = map[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    let startY = 0;
    let startX = 0;
    let startTarget: EventTarget | null = null;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
      startX = e.touches[0]?.clientX ?? 0;
      startTarget = e.target;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (navLocked.current) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dy = startY - touch.clientY;
      const dx = startX - touch.clientX;
      if (Math.abs(dy) < 56 || Math.abs(dx) > Math.abs(dy)) return;
      if (absorbedByScroller(startTarget, dy)) return;
      if (Date.now() - lastNav.current < COOLDOWN) return;
      goTo(stageRef.current + (dy > 0 ? 1 : -1));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [goTo]);

  const value = useMemo<StudioValue>(
    () => ({
      pointer,
      stageFlow,
      stage,
      stageId: STAGES[stage],
      goTo,
      step,
      viewport,
      reduceMotion,
      theme,
      toggleTheme,
      sound,
      toggleSound,
      anchors,
      links,
      bus,
      setGaze,
      gaze,
      navLocked,
      setNavLocked,
      overlay,
      setOverlay,
    }),
    [
      pointer, stageFlow, stage, goTo, step, viewport, reduceMotion,
      theme, toggleTheme, sound, toggleSound, links, bus, setGaze, setNavLocked, overlay,
    ],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

let linkSeq = 0;

/**
 * Tethers an element to the companion with a light thread.
 * Returns handlers to spread onto the element so hovering lights the thread up.
 */
export function useCompanionLink(options?: { weight?: number; quip?: string; alwaysOn?: boolean }) {
  const { links, bus, setGaze, viewport } = useStudio();
  const elRef = useRef<HTMLElement | null>(null);
  const idRef = useRef(`link-${++linkSeq}`);
  const { weight = 1, quip, alwaysOn = false } = options ?? {};
  const latest = useRef({ weight, alwaysOn });
  latest.current = { weight, alwaysOn };

  // A callback ref, not an effect: panels mount their DOM a render *after* the
  // hook first runs, and an effect keyed on props would never see that element.
  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (elRef.current === el) return;
      const id = idRef.current;
      if (elRef.current) links.remove(id);
      elRef.current = el;
      if (el) {
        links.register({ id, el, weight: latest.current.weight, active: latest.current.alwaysOn });
      }
    },
    [links],
  );

  useEffect(() => {
    if (elRef.current) links.setActive(idRef.current, alwaysOn, weight);
  }, [links, alwaysOn, weight]);

  const engage = useCallback(() => {
    if (viewport.isTouch) return;
    links.setActive(idRef.current, true, weight);
    setGaze(elRef.current);
    if (quip) bus.say(quip, { priority: 2, ttl: 3600 });
  }, [links, setGaze, bus, quip, weight, viewport.isTouch]);

  const release = useCallback(() => {
    if (!alwaysOn) links.setActive(idRef.current, false, weight);
    setGaze(null);
  }, [links, setGaze, alwaysOn, weight]);

  return {
    ref: ref as (el: any) => void,
    linkProps: {
      onMouseEnter: engage,
      onMouseLeave: release,
      onFocus: engage,
      onBlur: release,
    },
  };
}

/** Convenience wrapper for one-off companion lines. */
export function useCompanionSpeech() {
  const { bus } = useStudio();
  return useCallback(
    (text: string, opts?: { priority?: number; ttl?: number }) => bus.say(text, opts),
    [bus],
  );
}
