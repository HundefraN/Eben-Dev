import type {
  CapabilityChip,
  FounderInfo,
  ProjectHighlight,
  ServiceItem,
  StageMeta,
} from '../core/types';

import kenaProof from '../assets/proof/kena.png';

export const COMPANY_INFO = {
  name: 'Eben Dev Solutions',
  shortName: 'Eben Dev',
  role: 'Software Studio',
  tagline: 'Software that feels as good as it performs',
  subtext:
    'We design and engineer full-stack platforms, AI-powered products, and interactive interfaces — from first sketch to production.',
  stats: [
    { value: '60+', label: 'Products shipped' },
    { value: '7yrs', label: 'In production' },
    { value: '4.5×', label: 'Median speed-up' },
    { value: '99.99%', label: 'Uptime' },
  ],
};

/** Stage sequence. `greeting` is spoken by the companion on arrival. */
export const STAGE_META: StageMeta[] = [
  {
    id: 'home',
    label: 'Home',
    greeting: "Hi, I'm Ebbi. Scroll and I'll show you around the studio.",
    side: 'none',
  },
  {
    id: 'work',
    label: 'Work',
    greeting: 'Four builds — three you can watch, one you can visit.',
    side: 'right',
  },
  {
    id: 'founder',
    label: 'Founder',
    greeting: 'And this is Hundefra — the one who actually writes the code.',
    side: 'left',
  },
  {
    id: 'contact',
    label: 'Contact',
    greeting: 'Tell us what you are building. We reply within two hours.',
    side: 'right',
  },
];

export const FOUNDER_INFO: FounderInfo = {
  name: 'Hundefra Nassir',
  title: 'Founder & Principal Engineer',
  bio: 'Seven years building software that has to hold up in production. I work end to end — architecture, interface, and the unglamorous performance work in between — and I stay on a project until it ships.',
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Flutter',
    'Python',
    'Tailwind CSS',
    'PostgreSQL',
    'WebGL',
  ],
  experienceYears: '7+ years',
  location: 'Addis Ababa · working globally',
  phone: '+251925526298',
  email: 'hundefra@gmail.com',
  telegram: '@Hundefra',
  disciplines: [
    { label: 'Architecture', value: 96, caption: 'Systems & scale' },
    { label: 'Interface', value: 92, caption: 'Design engineering' },
    { label: 'Delivery', value: 98, caption: 'Ship & maintain' },
  ],
};

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'fullstack',
    title: 'Full-stack platforms',
    summary: 'React and Node systems built to stay fast under load.',
    detail:
      'End-to-end web applications with a typed API layer, sensible caching, and a front end that stays responsive as the data grows.',
    iconName: 'Layers',
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    quip: 'This is the bread and butter — typed all the way down.',
  },
  {
    id: 'ai',
    title: 'AI product engineering',
    summary: 'LLM features that survive contact with real users.',
    detail:
      'Retrieval, agents, and streaming interfaces wired into your existing product, with evaluation and cost controls built in from the start.',
    iconName: 'Sparkles',
    tags: ['Gemini', 'RAG', 'Agents', 'Evals'],
    quip: 'Model calls are the easy part. The guardrails are the work.',
  },
  {
    id: 'interactive',
    title: 'Interactive interfaces',
    summary: 'Motion and 3D used to explain, not decorate.',
    detail:
      'Canvas, WebGL, and physics-based motion applied where it clarifies a product — configurators, data stories, and interfaces worth exploring.',
    iconName: 'Orbit',
    tags: ['WebGL', 'Canvas', 'Motion', 'Shaders'],
    quip: 'Everything moving on this page runs on one animation frame.',
  },
  {
    id: 'mobile',
    title: 'Cross-platform mobile',
    summary: 'One codebase, native feel on both stores.',
    detail:
      'Flutter and React Native apps with offline sync, push, and gesture work that holds sixty frames a second on mid-range hardware.',
    iconName: 'Smartphone',
    tags: ['Flutter', 'React Native', 'Offline-first'],
    quip: 'Tested on the cheap phones, not just the flagship.',
  },
];

/**
 * Chips arranged around the companion on the home stage. Angles are degrees
 * clockwise from her right (90 = below her, 270 = above her). Straight up is
 * left clear for her speech bubble, straight down for the advance control, and
 * the set leans right so it never crowds the hero copy on the left.
 */
export const CAPABILITY_CHIPS: CapabilityChip[] = [
  {
    id: 'perf',
    label: 'Performance',
    iconName: 'Gauge',
    angle: 25,
    detail: 'Sub-second loads, 60fps interaction, measured on real devices.',
    quip: 'I keep an eye on the frame budget so you never have to.',
  },
  {
    id: 'ai',
    label: 'Applied AI',
    iconName: 'Sparkles',
    angle: 350,
    detail: 'Retrieval, agents, and streaming UX wired into real products.',
    quip: 'Applied AI — the useful kind, not the demo kind.',
  },
  {
    id: 'motion',
    label: 'Motion & 3D',
    iconName: 'Orbit',
    angle: 315,
    detail: 'Canvas, WebGL, and spring physics used with restraint.',
    quip: 'Motion should point at something. Usually, that is me.',
  },
  {
    id: 'cloud',
    label: 'Cloud & scale',
    iconName: 'Cloud',
    angle: 215,
    detail: 'Containerised services, autoscaling, and boring reliable deploys.',
    quip: 'Boring infrastructure is the highest compliment there is.',
  },
  {
    id: 'security',
    label: 'Security',
    iconName: 'ShieldCheck',
    angle: 175,
    detail: 'Threat modelling, least privilege, and audited dependencies.',
    quip: 'Least privilege, every time. No exceptions.',
  },
];

/* ==========================================================================
   PROOF LINKS — paste the recordings and the screenshot here.

   Any share URL works: a YouTube watch page, a youtu.be shortener, a Short, a
   Vimeo or Loom link, a Google Drive file link, or a direct .mp4 / .jpg URL.
   Google Drive links have to be shared as "Anyone with the link".

   Leave one blank and that card falls back to its placeholder plate rather
   than rendering a broken player.
   ========================================================================== */
export const PROOF_LINKS = {
  /** Abosto Dental Clinic — walkthrough video */
  abosto: 'https://res.cloudinary.com/dqosuzul4/video/upload/q_auto,f_mp4/v1785660982/ADC_DB-2_dzzcrr.mp4',
  /** Zamar App — walkthrough video (portrait phone capture preferred) */
  zamar: 'https://res.cloudinary.com/dqosuzul4/video/upload/q_auto,f_mp4/v1785662883/0322_2_oszktu.mp4',
  /** Ethiopian Genet Church Database — walkthrough video */
  genet: 'https://res.cloudinary.com/dqosuzul4/video/upload/q_auto,f_mp4/v1785665631/0802_obiamq.mp4',
  /** Kena Fiberglass — screenshot of the live site */
  kena: kenaProof,
};

/**
 * Cloudinary can derive a still frame from any hosted video by swapping the
 * file extension to .jpg. This gives us a real poster for each video card
 * without needing separate image uploads.
 */
export const PROOF_POSTERS = {
  abosto: PROOF_LINKS.abosto.replace(/\.\w+$/, '.jpg'),
  zamar: PROOF_LINKS.zamar.replace(/\.\w+$/, '.jpg'),
  genet: PROOF_LINKS.genet.replace(/\.\w+$/, '.jpg'),
};

/** Years are best guesses — correct them to the real delivery dates. */
export const PROJECT_HIGHLIGHTS: ProjectHighlight[] = [
  {
    id: 'abosto',
    title: 'Abosto Dental Clinic',
    discipline: 'Clinic database',
    role: 'Frontend + backend',
    status: { label: 'Shipped', tone: 'shipped' },
    description:
      'A dental clinic database where both the frontend and backend were built by me.',
    tags: ['Web app', 'Database', 'Full-stack'],
    year: '2024',
    quip: 'Both halves of that one are his. Front to back, nobody else.',
    proof: { kind: 'video', url: PROOF_LINKS.abosto, label: 'Watch the demo', poster: PROOF_POSTERS.abosto },
  },
  {
    id: 'zamar',
    title: 'Zamar App',
    discipline: "Musician's app",
    role: 'Full-stack',
    status: { label: 'In development', tone: 'building' },
    description:
      "A musician's app built with Flutter and Supabase. It is currently in development and not yet released.",
    tags: ['Flutter', 'Supabase', 'Mobile'],
    year: '2026',
    quip: 'Still in the workshop, that one. Flutter on top, Supabase underneath.',
    proof: {
      kind: 'video',
      url: PROOF_LINKS.zamar,
      // Screen capture off a phone, so it gets a tall frame instead of bars.
      orientation: 'portrait',
      label: 'Watch the demo',
      poster: PROOF_POSTERS.zamar,
    },
  },
  {
    id: 'genet',
    title: 'Ethiopian Genet Church Database',
    discipline: 'Church database',
    role: 'Full-stack',
    status: { label: 'Shipped', tone: 'shipped' },
    description:
      'Built with React and Tailwind. I served as the full-stack developer on this project.',
    tags: ['React', 'Tailwind CSS', 'Database'],
    year: '2025',
    quip: 'Full-stack on that one — React and Tailwind, start to finish.',
    proof: { kind: 'video', url: PROOF_LINKS.genet, label: 'Watch the demo', poster: PROOF_POSTERS.genet },
  },
  {
    id: 'kena',
    title: 'Kena Fiberglass',
    discipline: 'Company website',
    role: 'Full-stack',
    status: { label: 'Live', tone: 'live' },
    description:
      'A modern website built using TypeScript and Tailwind CSS. I was the full-stack developer for this.',
    tags: ['TypeScript', 'Tailwind CSS', 'Website'],
    year: '2025',
    quip: 'That one is live. Go and click around it yourself.',
    proof: { kind: 'image', url: PROOF_LINKS.kena, label: 'View the screenshot' },
    link: { label: 'www.kenafiber.com', href: 'https://www.kenafiber.com' },
  },
];

/** Lines the companion uses when nothing else is happening. */
export const IDLE_LINES = [
  'Still here. Take your time.',
  'Try hovering something — I will point at it.',
  'The little threads follow my hand, by the way.',
  'Everything here was built from scratch. No template.',
];
