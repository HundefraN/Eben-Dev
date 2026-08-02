import { ServiceItem, FloatingBadge, ProjectHighlight, CeoInfo } from '../types';

export const COMPANY_INFO = {
  name: 'Eben Dev Solutions',
  tagline: 'Engineering the Next Generation of Digital Experiences',
  subtext: 'We blend high-performance full-stack engineering, interactive 3D graphics, and AI intelligence into remarkable software products.',
  stats: [
    { label: 'Projects Delivered', value: '60+' },
    { label: 'Client Satisfaction', value: '99.9%' },
    { label: 'Average Speedup', value: '4.5x' },
    { label: 'Uptime Reliability', value: '99.99%' },
  ],
};

export const CEO_INFO: CeoInfo = {
  name: 'Hundefra Nassir',
  title: 'CEO & FOUNDER',
  bio: 'With 7+ years of hands-on experience in software development, I lead Eben Dev Solutions with a passion for crafting stunning digital experiences. From mobile apps to full-stack web platforms, I turn complex problems into elegant, powerful solutions.',
  skills: ['Flutter', 'Python', 'HTML', 'CSS', 'React', 'Node.js', 'TypeScript', 'Tailwind CSS'],
  experienceYears: '7+ Years',
  phone: '+251925526298',
  email: 'hundefra@gmail.com',
  telegram: '@Hundefra',
};

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Systems',
    shortDesc: 'Ultra-fast React, Next, Vite & Node backend architectures.',
    fullDesc: 'End-to-end web applications engineered for extreme speed, rock-solid security, and effortless scalability under high load.',
    iconName: 'Code2',
    tags: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind'],
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'ai-gen',
    title: 'AI & Machine Learning',
    shortDesc: 'Generative AI workflows, LLM agents & smart automation.',
    fullDesc: 'Seamlessly embed Gemini, OpenAI, and custom fine-tuned models directly into your business software to automate workflows and elevate user capabilities.',
    iconName: 'Sparkles',
    tags: ['Gemini API', 'LLM Agents', 'Automation', 'NLP'],
    gradient: 'from-amber-500 to-rose-500',
  },
  {
    id: '3d-interactive',
    title: 'Interactive 3D & Motion',
    shortDesc: 'Immersive WebGL, Canvas physics & responsive parallax.',
    fullDesc: 'Turn static web pages into engaging story-driven interactive stages that captivate visitors and dramatically boost conversion rates.',
    iconName: 'Box',
    tags: ['Motion', 'Three.js / WebGL', 'Parallax', 'Canvas'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'mobile',
    title: 'Cross-Platform Mobile',
    shortDesc: 'High-performance iOS & Android application suites.',
    fullDesc: 'Native-feel mobile apps with fluid multi-touch animations, offline synchronization, and push messaging.',
    iconName: 'Smartphone',
    tags: ['React Native', 'Flutter', 'Mobile UI', 'iOS & Android'],
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export const FLOATING_BADGES: FloatingBadge[] = [
  {
    id: 'b1',
    label: '⚡ High Performance',
    iconName: 'Zap',
    xOffsetPct: -32,
    yOffsetPct: -22,
    depth: 0.35,
    category: 'Speed',
  },
  {
    id: 'b2',
    label: '🤖 AI Systems',
    iconName: 'Bot',
    xOffsetPct: 30,
    yOffsetPct: -28,
    depth: 0.42,
    category: 'Intelligence',
  },
  {
    id: 'b3',
    label: '🎨 3D & Parallax',
    iconName: 'Layers',
    xOffsetPct: -36,
    yOffsetPct: 20,
    depth: 0.38,
    category: 'Design',
  },
  {
    id: 'b4',
    label: '🚀 Cloud Scalability',
    iconName: 'Cloud',
    xOffsetPct: 34,
    yOffsetPct: 18,
    depth: 0.3,
    category: 'Backend',
  },
  {
    id: 'b5',
    label: '🔒 Security First',
    iconName: 'ShieldCheck',
    xOffsetPct: 0,
    yOffsetPct: 34,
    depth: 0.45,
    category: 'Architecture',
  },
];

export const PROJECT_HIGHLIGHTS: ProjectHighlight[] = [
  {
    id: 'p1',
    title: 'Nexus Real-time AI Analytics',
    category: 'AI / Enterprise Architecture',
    metrics: '10M+ events/day processed',
    description: 'High-frequency streaming data visualization platform with instant anomaly detection and predictive modeling.',
    tags: ['React', 'Python AI', 'WebSockets', 'Tailwind'],
    accentColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'p2',
    title: 'Aura Interactive 3D Configurator',
    category: '3D WebGL / Interactive Spatial',
    metrics: '+140% Conversion Lift',
    description: 'Real-time photorealistic product preview stage with dynamic lighting studio controls and material customizer.',
    tags: ['Three.js', 'WebGL', 'Framer Motion', 'Tailwind'],
    accentColor: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'p3',
    title: 'Kinetix Global Cloud Logistics Engine',
    category: 'Cloud / Microservices',
    metrics: '99.99% Guaranteed SLA',
    description: 'Distributed cloud backend running global autonomous shipment routing across 24 regional server clusters.',
    tags: ['Node.js', 'Go', 'Docker', 'Kubernetes'],
    accentColor: 'from-amber-500 to-orange-600',
  },
];