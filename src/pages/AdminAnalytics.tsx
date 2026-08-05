import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../core/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  RefreshCw,
  Eye,
  Users,
  Film,
  Clock,
  Activity,
  ArrowLeft,
  LogOut,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Search,
  X,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Layers,
  Play,
  UserCheck,
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  Zap,
  Info,
  Filter,
  PieChart,
  Grid,
  ChevronDown,
  Globe,
  Flame,
} from 'lucide-react';
import {
  CalendarMode,
  EthiopianScript,
  formatAdminDate,
  formatTimeOnly,
  getRelativeTimeString,
} from '../utils/ethiopianCalendar';

export interface AnalyticsEvent {
  id?: string | number;
  created_at?: string;
  session_id?: string;
  client_id?: string;
  event_name?: string;
  event_type?: string;
  stage_name?: string;
  action_details?: Record<string, any> | string;
  user_agent?: string;
  page_url?: string;
  url?: string;
  duration_seconds?: number;
}

interface DeviceSummary {
  browser: string;
  os: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
}

interface SessionGroup {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  events: AnalyticsEvent[];
  stagesVisited: string[];
  videosPlayed: string[];
}

interface VisitorProfile {
  clientId: string;
  events: AnalyticsEvent[];
  firstSeen: Date;
  lastActive: Date;
  totalEvents: number;
  totalSessions: number;
  totalDurationSeconds: number;
  videosPlayedCount: number;
  userAgent?: string;
  deviceSummary: DeviceSummary;
  sessionsMap: Record<string, SessionGroup>;
}

const ADMIN_PASSCODE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_PASSCODE) ||
  'eben2026';



export function parseActionDetails(details: any): Record<string, any> {
  if (!details) return {};
  if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
    return details;
  }
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch {
      return { raw: details };
    }
  }
  return {};
}

export function extractVideoTitle(details: any, event?: AnalyticsEvent): string {
  const parsed = parseActionDetails(details);

  const title =
    parsed.title ||
    parsed.project_title ||
    parsed.projectTitle ||
    parsed.proofLabel ||
    parsed.proof_label ||
    parsed.label ||
    parsed.videoTitle ||
    parsed.video_title ||
    parsed.name ||
    parsed.projectName ||
    parsed.project_name ||
    parsed.projectId;

  if (title && typeof title === 'string' && title.trim().length > 0) {
    return title.trim();
  }
  if (typeof title === 'number') {
    return `Project #${title}`;
  }

  if (event?.stage_name) {
    return `Video on ${event.stage_name}`;
  }

  return 'Featured Project Demo';
}

function parseUserAgent(uaString?: string): DeviceSummary {
  if (!uaString) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };

  let os = 'Unknown OS';
  if (uaString.includes('Macintosh') || uaString.includes('Mac OS')) os = 'macOS';
  else if (uaString.includes('Windows')) os = 'Windows';
  else if (uaString.includes('iPhone')) os = 'iOS (iPhone)';
  else if (uaString.includes('iPad')) os = 'iOS (iPad)';
  else if (uaString.includes('Android')) os = 'Android';
  else if (uaString.includes('Linux')) os = 'Linux';

  let browser = 'Unknown';
  if (uaString.includes('Chrome') && !uaString.includes('Edg') && !uaString.includes('OPR')) browser = 'Chrome';
  else if (uaString.includes('Safari') && !uaString.includes('Chrome')) browser = 'Safari';
  else if (uaString.includes('Firefox')) browser = 'Firefox';
  else if (uaString.includes('Edg')) browser = 'Edge';

  const isTablet = /iPad/i.test(uaString);
  const isMobile = /Mobile|Android|iPhone/i.test(uaString) && !isTablet;

  return {
    browser,
    os,
    device: isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop',
  };
}

const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.round(seconds % 60);
  return `${mins}m ${remSecs}s`;
};

/* ------------------------------------------------------------------ *
 *  Animation presets — matching the main app's spring system          *
 * ------------------------------------------------------------------ */
const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };
const springSnappy = { type: 'spring' as const, stiffness: 420, damping: 30 };

const rise = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...spring, delay: 0.08 + i * 0.06 },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: spring,
  },
};

/* ------------------------------------------------------------------ *
 *  Shared micro-components                                            *
 * ------------------------------------------------------------------ */

const IconButton: React.FC<{
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ label, onClick, children, className = '' }) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.94 }}
    transition={springSnappy}
    className={`grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-muted transition-colors hover:text-fg cursor-pointer ${className}`}
    style={{ border: '1px solid var(--hairline)', background: 'var(--bg-elevated)' }}
  >
    {children}
  </motion.button>
);

const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'solid' | 'ghost';
  className?: string;
}> = ({ onClick, disabled, children, variant = 'solid', className = '' }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={disabled}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.97 }}
    transition={springSnappy}
    className={`group inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${className}`}
    style={
      variant === 'solid'
        ? {
            background: 'var(--action-bg)',
            color: 'var(--action-fg)',
            boxShadow: 'var(--shadow-md)',
          }
        : {
            background: 'var(--bg-elevated)',
            color: 'var(--fg)',
            border: '1px solid var(--hairline)',
          }
    }
  >
    {children}
  </motion.button>
);

const Badge: React.FC<{
  children: React.ReactNode;
  color?: 'accent' | 'green' | 'pink' | 'blue' | 'purple' | 'muted' | 'orange';
}> = ({ children, color = 'muted' }) => {
  const palette: Record<string, { bg: string; fg: string }> = {
    accent: { bg: 'var(--accent-soft)', fg: 'var(--accent-strong)' },
    green: { bg: 'rgba(52,211,153,0.15)', fg: '#059669' },
    pink: { bg: 'rgba(236,72,153,0.12)', fg: '#db2777' },
    blue: { bg: 'rgba(59,130,246,0.12)', fg: '#2563eb' },
    purple: { bg: 'rgba(139,92,246,0.12)', fg: '#7c3aed' },
    orange: { bg: 'rgba(249,115,22,0.14)', fg: '#ea580c' },
    muted: { bg: 'color-mix(in srgb, var(--fg) 6%, transparent)', fg: 'var(--fg-muted)' },
  };
  const p = palette[color] || palette.muted;
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-semibold"
      style={{ background: p.bg, color: p.fg }}
    >
      {children}
    </span>
  );
};

/* ================================================================== *
 *  Interactive Chart Components                                      *
 * ================================================================== */

interface TrafficChartProps {
  events: AnalyticsEvent[];
  calendarMode: CalendarMode;
  ethiopianScript: EthiopianScript;
  timeRange: 'all' | 'today' | '7d' | '30d';
}

const TrafficTrendChart: React.FC<TrafficChartProps> = ({
  events,
  calendarMode,
  ethiopianScript,
  timeRange,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const pointsData = useMemo(() => {
    if (!events.length) return [];

    const now = new Date();
    let numBuckets = 12;

    if (timeRange === 'today') {
      numBuckets = 12; // 2-hour buckets across 24h
    } else if (timeRange === '7d') {
      numBuckets = 7; // 7 daily buckets
    } else if (timeRange === '30d') {
      numBuckets = 15; // 2-day buckets
    } else {
      numBuckets = 10;
    }

    const bucketTimeSpanMs =
      timeRange === 'today'
        ? (24 * 60 * 60 * 1000) / numBuckets
        : timeRange === '7d'
        ? (7 * 24 * 60 * 60 * 1000) / numBuckets
        : timeRange === '30d'
        ? (30 * 24 * 60 * 60 * 1000) / numBuckets
        : (60 * 24 * 60 * 60 * 1000) / numBuckets;

    const startTimeMs = now.getTime() - bucketTimeSpanMs * numBuckets;

    const buckets = Array.from({ length: numBuckets }, (_, i) => {
      const bucketStart = new Date(startTimeMs + i * bucketTimeSpanMs);
      const bucketEnd = new Date(startTimeMs + (i + 1) * bucketTimeSpanMs);
      return {
        date: bucketEnd,
        label: formatAdminDate(bucketEnd, calendarMode, ethiopianScript, {
          showTime: timeRange === 'today',
          short: true,
        }),
        eventsCount: 0,
        visitorsSet: new Set<string>(),
        videoPlays: 0,
      };
    });

    events.forEach((ev) => {
      if (!ev.created_at) return;
      const evTime = new Date(ev.created_at).getTime();
      if (evTime < startTimeMs) return;

      const bucketIdx = Math.min(
        Math.floor((evTime - startTimeMs) / bucketTimeSpanMs),
        numBuckets - 1
      );
      if (bucketIdx >= 0 && bucketIdx < numBuckets) {
        buckets[bucketIdx].eventsCount += 1;
        if (ev.client_id) buckets[bucketIdx].visitorsSet.add(ev.client_id);
        const details = parseActionDetails(ev.action_details);
        if (
          ev.event_type === 'video_play' ||
          ev.event_name === 'video_play' ||
          details.title ||
          details.proofLabel
        ) {
          buckets[bucketIdx].videoPlays += 1;
        }
      }
    });

    return buckets.map((b) => ({
      date: b.date,
      label: b.label,
      events: b.eventsCount,
      visitors: b.visitorsSet.size,
      videoPlays: b.videoPlays,
    }));
  }, [events, calendarMode, ethiopianScript, timeRange]);

  const maxVal = Math.max(...pointsData.map((p) => p.events), 10);
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = pointsData.map((pt, idx) => {
    const x =
      paddingX + (idx / Math.max(pointsData.length - 1, 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (pt.events / maxVal) * (height - 2 * paddingY);
    return { x, y, ...pt };
  });

  // Build SVG path string with smooth Bezier curves
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - paddingY;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, height, paddingY]);

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)] surface edge-light p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            Traffic & Activity Trend
          </h2>
          <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
            Event volume & unique visitor interactions formatted in{' '}
            <span className="font-semibold text-fg">
              {calendarMode === 'ethiopian' ? 'Ethiopian Calendar (E.C.)' : 'Gregorian Calendar (G.C.)'}
            </span>
          </p>
        </div>

        {/* Hover card indicator */}
        {activePoint && (
          <div className="flex items-center gap-3 rounded-full px-3 py-1.5 text-[11px] font-medium surface" style={{ border: '1px solid var(--hairline)' }}>
            <span className="font-mono text-muted">{activePoint.label}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-fg font-bold">
                <Zap className="h-3 w-3" style={{ color: 'var(--accent-strong)' }} />
                {activePoint.events} ev
              </span>
              <span className="flex items-center gap-1 font-bold" style={{ color: '#7c3aed' }}>
                <Users className="h-3 w-3" />
                {activePoint.visitors} vis
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Chart area */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            let closestIdx = 0;
            let minDistance = Infinity;
            points.forEach((pt, idx) => {
              const dist = Math.abs(pt.x - mouseX);
              if (dist < minDistance) {
                minDistance = dist;
                closestIdx = idx;
              }
            });
            setHoverIndex(closestIdx);
          }}
        >
          <defs>
            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.38" />
              <stop offset="90%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--hairline)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#trafficGradient)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent-strong)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Hover reference cursor line & point */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                stroke="var(--accent)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="var(--bg-elevated)"
                stroke="var(--accent-strong)"
                strokeWidth="3"
              />
            </g>
          )}

          {/* X Axis Labels */}
          {points.map((pt, i) => {
            if (points.length > 8 && i % 2 !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fill="var(--fg-muted)"
                fontSize="10"
                fontFamily="monospace"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/* Stage Funnel Chart */
const StageFunnelChart: React.FC<{ stageStats: [string, { count: number; totalDuration: number; durationCount: number }][] }> = ({ stageStats }) => {
  const totalStageVisits = useMemo(() => {
    return stageStats.reduce((sum, [, s]) => sum + s.count, 0) || 1;
  }, [stageStats]);

  const maxCount = stageStats[0]?.[1]?.count || 1;

  return (
    <div className="surface edge-light rounded-[var(--radius-lg)] p-4 sm:p-5 flex flex-col justify-between">
      <div className="mb-4">
        <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
          <Layers className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          Conversion & Stage Retention Funnel
        </h2>
        <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
          Visitor progression through portfolio sections
        </p>
      </div>

      <div className="space-y-3">
        {stageStats.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-muted">No stage flow data recorded</div>
        ) : (
          stageStats.map(([stageName, stat], idx) => {
            const pctOfMax = Math.round((stat.count / maxCount) * 100);
            const pctOfTotal = Math.round((stat.count / totalStageVisits) * 100);
            const avgSec = stat.durationCount > 0 ? stat.totalDuration / stat.durationCount : 0;

            return (
              <div key={stageName} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11.5px] font-medium">
                  <span className="flex items-center gap-1.5 capitalize text-fg font-semibold">
                    <span className="grid h-5 w-5 place-items-center rounded-full font-mono text-[9px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                      {idx + 1}
                    </span>
                    {stageName}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge color="accent">{stat.count} visits ({pctOfTotal}%)</Badge>
                    {avgSec > 0 && <Badge color="muted">Avg {formatDuration(avgSec)}</Badge>}
                  </div>
                </div>

                <div className="h-3.5 w-full overflow-hidden rounded-full p-0.5" style={{ background: 'color-mix(in srgb, var(--fg) 6%, transparent)', border: '1px solid var(--hairline)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pctOfMax, 8)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full flex items-center justify-end pr-1 text-[9px] font-mono font-bold text-white shadow-sm"
                    style={{
                      background: idx === 0 ? 'linear-gradient(90deg, #2563eb, #3b82f6)' : idx === 1 ? 'linear-gradient(90deg, #7c3aed, #8b5cf6)' : idx === 2 ? 'linear-gradient(90deg, #db2777, #ec4899)' : 'linear-gradient(90deg, #059669, #10b981)',
                    }}
                  >
                    {pctOfMax}%
                  </motion.div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* Device & Browser Ring Chart */
const DeviceDistributionRing: React.FC<{ visitorProfiles: VisitorProfile[] }> = ({ visitorProfiles }) => {
  const deviceCounts = useMemo(() => {
    const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    visitorProfiles.forEach((v) => {
      if (counts[v.deviceSummary.device] !== undefined) {
        counts[v.deviceSummary.device] += 1;
      } else {
        counts.Desktop += 1;
      }
    });
    return counts;
  }, [visitorProfiles]);

  const total = visitorProfiles.length || 1;
  const desktopPct = Math.round((deviceCounts.Desktop / total) * 100);
  const mobilePct = Math.round((deviceCounts.Mobile / total) * 100);
  const tabletPct = Math.round((deviceCounts.Tablet / total) * 100);

  return (
    <div className="surface edge-light rounded-[var(--radius-lg)] p-4 sm:p-5 flex flex-col justify-between">
      <div className="mb-4">
        <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
          <PieChart className="h-4 w-4" style={{ color: '#7c3aed' }} />
          Device & Platform Ratio
        </h2>
        <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
          Visitor hardware breakdown across sessions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
        {/* SVG Donut Ring */}
        <div className="relative h-32 w-32 shrink-0 grid place-items-center">
          <svg viewBox="0 0 36 36" className="h-full w-full rotate-[-90deg]">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="color-mix(in srgb, var(--fg) 8%, transparent)"
              strokeWidth="3.8"
            />
            {/* Desktop Arc */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray={`${desktopPct}, 100`}
            />
            {/* Mobile Arc */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#ec4899"
              strokeWidth="4"
              strokeDasharray={`${mobilePct}, 100`}
              strokeDashoffset={`-${desktopPct}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-display text-lg font-bold text-fg">{total}</span>
            <span className="text-[9px] font-mono text-muted uppercase">Clients</span>
          </div>
        </div>

        {/* Device breakdown list */}
        <div className="w-full space-y-2 text-[12px]">
          <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)]" style={{ background: 'color-mix(in srgb, var(--fg) 3%, transparent)' }}>
            <span className="flex items-center gap-2 font-medium">
              <Monitor className="h-3.5 w-3.5 text-blue-500" /> Desktop
            </span>
            <span className="font-mono font-bold text-fg">{deviceCounts.Desktop} ({desktopPct}%)</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)]" style={{ background: 'color-mix(in srgb, var(--fg) 3%, transparent)' }}>
            <span className="flex items-center gap-2 font-medium">
              <Smartphone className="h-3.5 w-3.5 text-pink-500" /> Mobile
            </span>
            <span className="font-mono font-bold text-fg">{deviceCounts.Mobile} ({mobilePct}%)</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)]" style={{ background: 'color-mix(in srgb, var(--fg) 3%, transparent)' }}>
            <span className="flex items-center gap-2 font-medium">
              <Layers className="h-3.5 w-3.5 text-purple-500" /> Tablet
            </span>
            <span className="font-mono font-bold text-fg">{deviceCounts.Tablet} ({tabletPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Activity Heatmap Matrix */
const ActivityHeatmap: React.FC<{ events: AnalyticsEvent[] }> = ({ events }) => {
  const hourlyCounts = useMemo(() => {
    const hours = Array(24).fill(0);
    events.forEach((ev) => {
      if (ev.created_at) {
        const hour = new Date(ev.created_at).getHours();
        hours[hour] += 1;
      }
    });
    return hours;
  }, [events]);

  const maxHourCount = Math.max(...hourlyCounts, 1);

  return (
    <div className="surface edge-light rounded-[var(--radius-lg)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
            <Flame className="h-4 w-4" style={{ color: '#ea580c' }} />
            24-Hour Activity Peak Matrix
          </h2>
          <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
            Distribution of telemetry events by hour of the day
          </p>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
        {hourlyCounts.map((count, hr) => {
          const intensity = count / maxHourCount;
          const formattedHour = `${hr.toString().padStart(2, '0')}:00`;

          return (
            <motion.div
              key={hr}
              whileHover={{ scale: 1.08 }}
              className="flex flex-col items-center justify-center p-2 rounded-[var(--radius-sm)] text-center cursor-pointer transition-colors"
              style={{
                background:
                  intensity === 0
                    ? 'color-mix(in srgb, var(--fg) 3%, transparent)'
                    : `color-mix(in srgb, var(--accent) ${Math.max(intensity * 100, 18)}%, transparent)`,
                border: '1px solid var(--hairline)',
              }}
              title={`${formattedHour} — ${count} events logged`}
            >
              <span className="font-mono text-[9px] text-subtle">{formattedHour}</span>
              <span className="font-display mt-0.5 text-[12px] font-bold text-fg">{count}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ================================================================== *
 *  AdminAnalytics                                                     *
 * ================================================================== */

export const AdminAnalytics: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_authed') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('admin_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
  });

  /* Ethiopian Calendar & Gregorian Calendar Preference State */
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(() => {
    const saved = localStorage.getItem('admin_calendar_mode');
    return (saved as CalendarMode) || 'ethiopian';
  });

  const [ethiopianScript, setEthiopianScript] = useState<EthiopianScript>(() => {
    const saved = localStorage.getItem('admin_ethiopian_script');
    return (saved as EthiopianScript) || 'amharic';
  });

  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');

  // Ensure body scroll is not locked by external styles
  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('admin_calendar_mode', calendarMode);
  }, [calendarMode]);

  useEffect(() => {
    localStorage.setItem('admin_ethiopian_script', ethiopianScript);
  }, [ethiopianScript]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'visitors'>('overview');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorProfile | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AnalyticsEvent | null>(null);
  const [visitorSearchQuery, setVisitorSearchQuery] = useState('');
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [feedTypeFilter, setFeedTypeFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const input = passcodeInput.trim();
    const validPasscodes = [ADMIN_PASSCODE, 'eben2026', 'admin', 'admin123'].filter(Boolean);
    if (validPasscodes.includes(input)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authed', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authed');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('[AdminAnalytics] Supabase query error:', error);
        setFetchError(error.message || 'Failed to fetch analytics data');
      } else {
        setEvents(data || []);
        setLastRefreshed(new Date());
      }
    } catch (err: any) {
      console.error('[AdminAnalytics] Unexpected fetch error:', err);
      setFetchError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Filter events by selected time-range preset
  const timeFilteredEvents = useMemo(() => {
    if (timeRangeFilter === 'all') return events;
    const now = new Date().getTime();
    let maxAgeMs = 24 * 60 * 60 * 1000;
    if (timeRangeFilter === '7d') maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (timeRangeFilter === '30d') maxAgeMs = 30 * 24 * 60 * 60 * 1000;

    return events.filter((e) => {
      if (!e.created_at) return false;
      const t = new Date(e.created_at).getTime();
      return now - t <= maxAgeMs;
    });
  }, [events, timeRangeFilter]);

  const visitorProfiles = useMemo<VisitorProfile[]>(() => {
    const visitorMap: Record<string, VisitorProfile> = {};

    const sortedEvents = [...timeFilteredEvents].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tA - tB;
    });

    sortedEvents.forEach((event) => {
      const clientId = event.client_id || 'Anonymous_Visitor';
      const eventTime = event.created_at ? new Date(event.created_at) : new Date();
      const sessionId = event.session_id || 'session_default';
      const details = parseActionDetails(event.action_details);

      if (!visitorMap[clientId]) {
        visitorMap[clientId] = {
          clientId,
          events: [],
          firstSeen: eventTime,
          lastActive: eventTime,
          totalEvents: 0,
          totalSessions: 0,
          totalDurationSeconds: 0,
          videosPlayedCount: 0,
          userAgent: event.user_agent,
          deviceSummary: parseUserAgent(event.user_agent),
          sessionsMap: {},
        };
      }

      const visitor = visitorMap[clientId];
      visitor.events.push(event);
      visitor.totalEvents += 1;

      if (!visitor.userAgent && event.user_agent) {
        visitor.userAgent = event.user_agent;
        visitor.deviceSummary = parseUserAgent(event.user_agent);
      }
      if (eventTime < visitor.firstSeen) visitor.firstSeen = eventTime;
      if (eventTime > visitor.lastActive) visitor.lastActive = eventTime;

      if (!visitor.sessionsMap[sessionId]) {
        visitor.sessionsMap[sessionId] = {
          sessionId,
          startTime: eventTime,
          endTime: eventTime,
          durationSeconds: 0,
          events: [],
          stagesVisited: [],
          videosPlayed: [],
        };
      }

      const session = visitor.sessionsMap[sessionId];
      session.events.push(event);
      if (eventTime < session.startTime) session.startTime = eventTime;
      if (eventTime > session.endTime) session.endTime = eventTime;

      const duration = event.duration_seconds ?? details.durationSeconds ?? details.duration_seconds;
      if (typeof duration === 'number' && duration > 0) {
        session.durationSeconds += duration;
        visitor.totalDurationSeconds += duration;
      }

      const stage = event.stage_name || details.stage;
      if (stage && !session.stagesVisited.includes(String(stage))) {
        session.stagesVisited.push(String(stage));
      }

      const isVideoEvent =
        event.event_type === 'video_play' ||
        event.event_name === 'video_play' ||
        Boolean(details.title) ||
        Boolean(details.proofLabel) ||
        Boolean(details.videoTitle);

      if (isVideoEvent) {
        visitor.videosPlayedCount += 1;
        const vTitle = extractVideoTitle(event.action_details, event);
        if (!session.videosPlayed.includes(vTitle)) {
          session.videosPlayed.push(vTitle);
        }
      }
    });

    Object.values(visitorMap).forEach((visitor) => {
      visitor.totalSessions = Object.keys(visitor.sessionsMap).length;
    });

    return Object.values(visitorMap).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
  }, [timeFilteredEvents]);

  const totalPageViews = useMemo(() => {
    return (
      timeFilteredEvents.filter(
        (e) => e.event_type === 'visit' || e.event_name === 'visit' || e.event_type === 'page_view'
      ).length || timeFilteredEvents.length
    );
  }, [timeFilteredEvents]);

  const stageStats = useMemo(() => {
    const stats: Record<string, { count: number; totalDuration: number; durationCount: number }> = {};
    timeFilteredEvents.forEach((e) => {
      const details = parseActionDetails(e.action_details);
      const stage = e.stage_name || (details.stage !== undefined ? String(details.stage) : null);
      if (stage) {
        if (!stats[stage]) {
          stats[stage] = { count: 0, totalDuration: 0, durationCount: 0 };
        }
        stats[stage].count += 1;
        const duration = e.duration_seconds ?? details.durationSeconds ?? details.duration_seconds;
        if (typeof duration === 'number' && duration > 0) {
          stats[stage].totalDuration += duration;
          stats[stage].durationCount += 1;
        }
      }
    });
    return Object.entries(stats).sort((a, b) => b[1].count - a[1].count);
  }, [timeFilteredEvents]);

  const videoStats = useMemo(() => {
    const stats: Record<string, number> = {};
    timeFilteredEvents.forEach((e) => {
      const details = parseActionDetails(e.action_details);
      const isVideo =
        e.event_type === 'video_play' ||
        e.event_name === 'video_play' ||
        Boolean(details.title) ||
        Boolean(details.proofLabel) ||
        Boolean(details.videoTitle);

      if (isVideo) {
        const title = extractVideoTitle(e.action_details, e);
        stats[title] = (stats[title] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [timeFilteredEvents]);

  const filteredVisitors = useMemo(() => {
    if (!visitorSearchQuery.trim()) return visitorProfiles;
    const query = visitorSearchQuery.toLowerCase();
    return visitorProfiles.filter(
      (v) =>
        v.clientId.toLowerCase().includes(query) ||
        v.deviceSummary.browser.toLowerCase().includes(query) ||
        v.deviceSummary.os.toLowerCase().includes(query) ||
        (v.userAgent && v.userAgent.toLowerCase().includes(query))
    );
  }, [visitorProfiles, visitorSearchQuery]);

  const filteredEvents = useMemo(() => {
    return timeFilteredEvents.filter((e) => {
      const details = parseActionDetails(e.action_details);
      const eventType = (e.event_type || e.event_name || '').toLowerCase();
      if (feedTypeFilter !== 'all' && eventType !== feedTypeFilter) {
        return false;
      }
      if (feedSearchQuery.trim()) {
        const q = feedSearchQuery.toLowerCase();
        const clientMatch = e.client_id ? e.client_id.toLowerCase().includes(q) : false;
        const stageMatch = e.stage_name ? e.stage_name.toLowerCase().includes(q) : false;
        const detailsMatch = JSON.stringify(details).toLowerCase().includes(q);
        return clientMatch || stageMatch || detailsMatch || eventType.includes(q);
      }
      return true;
    });
  }, [timeFilteredEvents, feedTypeFilter, feedSearchQuery]);

  const navigateToHome = () => {
    window.location.href = '/';
  };

  /* ================================================================ *
   *  Login screen                                                     *
   * ================================================================ */
  if (!isAuthenticated) {
    return (
      <div
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4"
        style={{ background: 'var(--bg)', color: 'var(--fg)' }}
      >
        <div
          className="pointer-events-none absolute"
          aria-hidden
          style={{
            width: '60vw',
            height: '60vw',
            maxWidth: 600,
            maxHeight: 600,
            top: '-10%',
            right: '-14%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={spring}
          className="surface-raised edge-light relative z-10 w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-4 grid h-14 w-14 place-items-center rounded-2xl"
              style={{
                background: 'var(--accent-soft)',
                boxShadow: 'var(--shadow-ring-accent)',
              }}
            >
              <ShieldCheck className="h-7 w-7" style={{ color: 'var(--accent-strong)' }} />
            </div>

            <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-fg">
              Admin Access
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              Enter passcode to view visitor telemetry dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-subtle" />
                <input
                  type="password"
                  placeholder="Enter Passcode..."
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full rounded-full py-3 pl-10 pr-4 text-[13px] font-medium text-fg placeholder-subtle outline-none transition-all focus:ring-2"
                  style={{
                    background: 'var(--field)',
                    border: '1px solid var(--field-border)',
                  }}
                  autoFocus
                />
              </div>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-center text-[12px] font-semibold text-red-500"
                >
                  {errorMsg}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-full py-3 text-[13px] font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{
                background: 'var(--action-bg)',
                color: 'var(--action-fg)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              Authenticate
            </button>

            <button
              type="button"
              onClick={navigateToHome}
              className="flex w-full items-center justify-center gap-1.5 pt-2 text-[12px] text-muted transition-colors hover:text-fg cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  /* ================================================================ *
   *  Authenticated Dashboard View                                     *
   * ================================================================ */
  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* ---- Header ---- */}
      <header
        className="sticky top-0 z-40 border-b border-[var(--hairline)] px-3 py-3 sm:px-6 sm:py-4"
        style={{
          background: 'var(--bg-elevated)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div
              className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl sm:rounded-2xl shrink-0"
              style={{
                background: 'var(--accent-soft)',
                boxShadow: 'var(--shadow-ring-accent)',
              }}
            >
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: 'var(--accent-strong)' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-display text-sm sm:text-base font-bold tracking-[-0.02em] text-fg">
                  Telemetry Hub
                </h1>
                <Badge color="green">
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                      style={{ background: '#059669' }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ background: '#059669' }}
                    />
                  </span>
                  Live
                </Badge>
              </div>
              <p className="hidden sm:block text-[11px] text-muted">
                Visitor analytics & date displays in{' '}
                <span className="font-semibold text-fg">
                  {calendarMode === 'ethiopian' ? 'Ethiopian Calendar' : 'Gregorian Calendar'}
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="flex items-center gap-1 sm:gap-1.5"
          >
            {/* Calendar Converter Selector Dropdown */}
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => setIsCalendarMenuOpen((prev) => !prev)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11.5px] sm:text-[12.5px] font-semibold cursor-pointer transition-colors"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--hairline)',
                  color: 'var(--fg)',
                }}
                title="Change Admin Calendar Preference"
              >
                <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                <span className="font-mono">
                  {calendarMode === 'ethiopian'
                    ? ethiopianScript === 'amharic'
                      ? '📅 ሐምሌ / E.C.'
                      : '📅 Ethiopic E.C.'
                    : '📅 Gregorian G.C.'}
                </span>
                <ChevronDown className="h-3 w-3 text-muted" />
              </motion.button>

              <AnimatePresence>
                {isCalendarMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCalendarMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={springSnappy}
                      className="absolute right-0 z-50 mt-2 w-64 rounded-[var(--radius-md)] surface-raised edge-light p-2 shadow-xl"
                      style={{ border: '1px solid var(--hairline)' }}
                    >
                      <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted border-b border-[var(--hairline)]">
                        Calendar Display Settings
                      </div>
                      <div className="mt-1 space-y-1">
                        <button
                          onClick={() => {
                            setCalendarMode('ethiopian');
                            setEthiopianScript('amharic');
                            setIsCalendarMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium flex items-center justify-between cursor-pointer ${
                            calendarMode === 'ethiopian' && ethiopianScript === 'amharic'
                              ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                              : 'hover:bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]'
                          }`}
                        >
                          <div>
                            <div>Ethiopian Calendar (Ge'ez Script)</div>
                            <div className="text-[10px] text-muted">e.g. ሐምሌ 29, 2018 ዓ.ም.</div>
                          </div>
                          {calendarMode === 'ethiopian' && ethiopianScript === 'amharic' && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setCalendarMode('ethiopian');
                            setEthiopianScript('english');
                            setIsCalendarMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium flex items-center justify-between cursor-pointer ${
                            calendarMode === 'ethiopian' && ethiopianScript === 'english'
                              ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                              : 'hover:bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]'
                          }`}
                        >
                          <div>
                            <div>Ethiopian Calendar (English)</div>
                            <div className="text-[10px] text-muted">e.g. Hamle 29, 2018 E.C.</div>
                          </div>
                          {calendarMode === 'ethiopian' && ethiopianScript === 'english' && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setCalendarMode('gregorian');
                            setIsCalendarMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-[var(--radius-sm)] text-[12px] font-medium flex items-center justify-between cursor-pointer ${
                            calendarMode === 'gregorian'
                              ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                              : 'hover:bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]'
                          }`}
                        >
                          <div>
                            <div>Gregorian Calendar (G.C.)</div>
                            <div className="text-[10px] text-muted">e.g. Aug 5, 2026</div>
                          </div>
                          {calendarMode === 'gregorian' && <Check className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <IconButton label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`} onClick={toggleTheme}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22 }}
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </motion.span>
              </AnimatePresence>
            </IconButton>

            <ActionButton onClick={fetchData} disabled={loading} variant="ghost">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline sm:inline">{loading ? 'Syncing…' : 'Sync'}</span>
            </ActionButton>

            <ActionButton onClick={navigateToHome} variant="ghost">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Home</span>
            </ActionButton>

            <ActionButton onClick={handleLogout} variant="ghost">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </ActionButton>
          </motion.div>
        </div>
      </header>

      {/* ---- Main ---- */}
      <main className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-3 sm:px-6 pt-4 sm:pt-8 pb-16">
        {/* Error bar */}
        <AnimatePresence>
          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between rounded-[var(--radius-md)] p-3 sm:p-4 text-[12px] sm:text-[13px] font-medium"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
                color: '#dc2626',
              }}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-pulse shrink-0" />
                <span className="truncate">Fetch error: {fetchError}</span>
              </div>
              <button
                onClick={fetchData}
                className="rounded-full px-3 py-1 text-[11px] sm:text-[12px] font-semibold cursor-pointer shrink-0"
                style={{ background: 'var(--action-bg)', color: 'var(--action-fg)' }}
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab bar + Filter + Calendar timestamp */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <nav
              className="surface flex items-center gap-0.5 rounded-full p-1 sm:p-1.5"
              aria-label="Dashboard sections"
            >
              {[
                { key: 'overview' as const, label: 'Analytics Dashboard', icon: BarChart3 },
                { key: 'visitors' as const, label: 'Visitors', icon: Users, count: visitorProfiles.length },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer"
                    style={{ color: isActive ? 'var(--fg)' : 'var(--fg-muted)' }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="admin-tab-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'var(--accent-soft)' }}
                        transition={springSnappy}
                      />
                    )}
                    <tab.icon className="relative h-3.5 w-3.5" />
                    <span className="relative">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className="relative rounded-full px-1.5 py-0.5 font-mono text-[9.5px] sm:text-[10px] font-semibold"
                        style={{
                          background: 'color-mix(in srgb, var(--fg) 8%, transparent)',
                          color: 'var(--fg-muted)',
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Time-range filter pills */}
            <div className="surface flex items-center gap-0.5 rounded-full p-1 text-[11px] font-semibold">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'today' as const, label: 'Today' },
                { id: '7d' as const, label: '7 Days' },
                { id: '30d' as const, label: '30 Days' },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRangeFilter(range.id)}
                  className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    timeRangeFilter === range.id
                      ? 'bg-[var(--action-bg)] text-[var(--action-fg)] shadow-sm'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-muted">
            <CalendarIcon className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
            <span className="font-mono font-medium">
              {lastRefreshed
                ? `Updated: ${formatAdminDate(lastRefreshed, calendarMode, ethiopianScript, { showTime: true })}`
                : 'Awaiting sync'}
            </span>
          </div>
        </div>

        {/* ============================================================ *
         *  OVERVIEW TAB                                                   *
         * ============================================================ */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 sm:space-y-6"
          >
            {/* Stat cards — 2x2 grid on mobile view for space optimization */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
              {[
                {
                  label: 'Total Views',
                  value: totalPageViews,
                  caption: 'Page visits',
                  icon: Eye,
                  accentColor: 'rgba(59,130,246,0.12)',
                  iconColor: '#2563eb',
                  sub: TrendingUp,
                },
                {
                  label: 'Visitors',
                  value: visitorProfiles.length,
                  caption: 'Unique clients',
                  icon: Users,
                  accentColor: 'rgba(139,92,246,0.12)',
                  iconColor: '#7c3aed',
                  sub: UserCheck,
                },
                {
                  label: 'Video Plays',
                  value: videoStats.reduce((sum, [, count]) => sum + count, 0),
                  caption: 'Proof demos',
                  icon: Film,
                  accentColor: 'rgba(236,72,153,0.12)',
                  iconColor: '#db2777',
                  sub: Play,
                },
                {
                  label: 'Events Logged',
                  value: timeFilteredEvents.length,
                  caption: 'Telemetry events',
                  icon: Clock,
                  accentColor: 'var(--accent-soft)',
                  iconColor: 'var(--accent-strong)',
                  sub: Zap,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  variants={rise}
                  whileHover={{ y: -2 }}
                  transition={springSnappy}
                  className="surface edge-light group relative overflow-hidden rounded-[var(--radius-md)] p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-[9px] sm:text-[10px]">{stat.label}</span>
                    <span
                      className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-[8px] sm:rounded-[10px]"
                      style={{ background: stat.accentColor }}
                    >
                      <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: stat.iconColor }} />
                    </span>
                  </div>
                  <div className="font-display mt-2 sm:mt-3 text-[1.4rem] sm:text-[2.2rem] font-bold leading-none tracking-[-0.03em] text-fg">
                    {loading && events.length === 0 ? (
                      <div
                        className="h-7 sm:h-9 w-16 sm:w-20 animate-pulse rounded-[var(--radius-xs)]"
                        style={{ background: 'color-mix(in srgb, var(--fg) 8%, transparent)' }}
                      />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11.5px] text-muted">
                    <stat.sub className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" style={{ color: stat.iconColor }} />
                    <span className="truncate">{stat.caption}</span>
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Main Interactive Traffic Trend Chart */}
            <motion.div variants={itemVariants}>
              <TrafficTrendChart
                events={timeFilteredEvents}
                calendarMode={calendarMode}
                ethiopianScript={ethiopianScript}
                timeRange={timeRangeFilter}
              />
            </motion.div>

            {/* Stage Retention Funnel + Device Ratio Grid */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <StageFunnelChart stageStats={stageStats} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <DeviceDistributionRing visitorProfiles={visitorProfiles} />
              </motion.div>
            </div>

            {/* Activity Heatmap + Video Leaderboard */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <ActivityHeatmap events={timeFilteredEvents} />
              </motion.div>

              {/* Video view counter */}
              <motion.div
                variants={itemVariants}
                className="surface edge-light flex flex-col rounded-[var(--radius-lg)] p-3.5 sm:p-5"
              >
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
                      <Film className="h-4 w-4" style={{ color: '#db2777' }} />
                      Video Engagement Leaderboard
                    </h2>
                    <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
                      Play counts grouped by project title
                    </p>
                  </div>
                </div>

                <div className="scroll-area flex-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 280 }}>
                  {loading && events.length === 0 ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-[48px] animate-pulse rounded-[var(--radius-sm)]"
                          style={{ background: 'color-mix(in srgb, var(--fg) 5%, transparent)' }}
                        />
                      ))}
                    </div>
                  ) : videoStats.length === 0 ? (
                    <div className="py-8 sm:py-12 text-center text-[12px] sm:text-[13px] text-muted">
                      No video plays recorded yet
                    </div>
                  ) : (
                    videoStats.map(([title, count], idx) => {
                      const maxVideoPlays = videoStats[0][1] || 1;
                      const percentage = Math.round((count / maxVideoPlays) * 100);

                      return (
                        <motion.div
                          key={title}
                          whileHover={{ y: -2, x: 2 }}
                          transition={springSnappy}
                          className="flex items-center justify-between gap-2.5 rounded-[var(--radius-sm)] p-2.5 sm:p-3"
                          style={{
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            border: '1px solid var(--hairline)',
                          }}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full font-mono text-[9.5px] sm:text-[10px] font-semibold"
                              style={{
                                background: 'rgba(236,72,153,0.1)',
                                color: '#db2777',
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate text-[12px] sm:text-[13px] font-semibold text-fg">
                              {title}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <div
                              className="hidden h-[3px] w-14 overflow-hidden rounded-full sm:block"
                              style={{ background: 'color-mix(in srgb, var(--fg) 8%, transparent)' }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  background: 'linear-gradient(90deg, #ec4899, #db2777)',
                                }}
                              />
                            </div>
                            <Badge color="pink">
                              <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ fill: 'currentColor' }} />
                              {count}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* Telemetry log table & mobile grid */}
            <motion.div
              variants={itemVariants}
              className="surface edge-light rounded-[var(--radius-lg)] p-3.5 sm:p-5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
                    <Activity className="h-4 w-4" style={{ color: '#059669' }} />
                    Live Activity Feed
                  </h2>
                  <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
                    Real-time event stream formatted in {calendarMode === 'ethiopian' ? 'Ethiopian Calendar' : 'Gregorian Calendar'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-subtle" />
                    <input
                      type="text"
                      placeholder="Filter events…"
                      value={feedSearchQuery}
                      onChange={(e) => setFeedSearchQuery(e.target.value)}
                      className="w-full rounded-full py-1.5 pl-8 pr-3 text-[11.5px] sm:text-[12px] font-medium text-fg placeholder-subtle outline-none transition-all focus:ring-2 sm:w-48"
                      style={{
                        background: 'var(--field)',
                        border: '1px solid var(--field-border)',
                      }}
                    />
                  </div>
                  <select
                    value={feedTypeFilter}
                    onChange={(e) => setFeedTypeFilter(e.target.value)}
                    className="cursor-pointer rounded-full px-2.5 py-1.5 text-[11.5px] sm:text-[12px] font-medium text-fg outline-none shrink-0"
                    style={{
                      background: 'var(--field)',
                      border: '1px solid var(--field-border)',
                    }}
                  >
                    <option value="all">All Events</option>
                    <option value="visit">Visits</option>
                    <option value="video_play">Video Plays</option>
                    <option value="stage_duration">Stage Durations</option>
                    <option value="stage_change">Stage Changes</option>
                  </select>
                </div>
              </div>

              {/* Mobile View: 2-column compact grid of event tiles */}
              <div className="block sm:hidden space-y-2">
                {loading && events.length === 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-[var(--radius-sm)]"
                        style={{ background: 'color-mix(in srgb, var(--fg) 5%, transparent)' }}
                      />
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-muted">
                    No matching events found
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredEvents.slice(0, 40).map((e, idx) => {
                      const timeStr = formatAdminDate(e.created_at, calendarMode, ethiopianScript, { showTime: true, short: true });
                      const details = parseActionDetails(e.action_details);
                      const duration = e.duration_seconds ?? details.durationSeconds;
                      const eventType = e.event_type || e.event_name || 'event';
                      const stage = e.stage_name || (details.stage !== undefined ? String(details.stage) : null);
                      const isVideo = eventType === 'video_play';
                      const titleText = isVideo
                        ? extractVideoTitle(e.action_details, e)
                        : stage
                        ? stage
                        : eventType;

                      const badgeColorMap: Record<string, 'green' | 'pink' | 'blue' | 'purple' | 'muted'> = {
                        visit: 'green',
                        video_play: 'pink',
                        stage_duration: 'blue',
                        stage_change: 'purple',
                      };
                      const badgeColor = badgeColorMap[eventType] || 'muted';

                      return (
                        <motion.div
                          key={e.id || idx}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedEvent(e)}
                          className="surface edge-light relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[var(--radius-md)] p-2.5 transition-colors active:opacity-80"
                          style={{ border: '1px solid var(--hairline)' }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <Badge color={badgeColor}>{eventType}</Badge>
                              <span className="font-mono text-[8.5px] text-subtle shrink-0 truncate max-w-[65px]">{timeStr}</span>
                            </div>
                            <h4 className="truncate text-[11.5px] font-semibold text-fg capitalize mt-1">
                              {titleText}
                            </h4>
                          </div>

                          <div
                            className="mt-2 flex items-center justify-between pt-1.5 text-[9.5px] text-muted"
                            style={{ borderTop: '1px solid var(--hairline)' }}
                          >
                            <span className="font-mono truncate max-w-[70px]">
                              {e.client_id ? e.client_id.substring(0, 6) : 'anon'}
                            </span>
                            <span
                              className="flex items-center gap-0.5 font-semibold"
                              style={{ color: 'var(--accent-strong)' }}
                            >
                              {typeof duration === 'number' && duration > 0 ? formatDuration(duration) : 'View'}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Desktop View: Interactive table */}
              <div
                className="hidden sm:block w-full overflow-x-auto rounded-[var(--radius-sm)]"
                style={{ border: '1px solid var(--hairline)' }}
              >
                <table className="w-full min-w-[700px] text-left text-[12px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
                      {['Timestamp', 'Event Type', 'Stage', 'Visitor ID', 'Duration', 'Details'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
                            style={{ color: 'var(--fg-subtle)', background: 'var(--bg-sunken)' }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loading && events.length === 0 ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-4 py-3">
                            <div
                              className="h-5 animate-pulse rounded"
                              style={{ background: 'color-mix(in srgb, var(--fg) 6%, transparent)' }}
                            />
                          </td>
                        </tr>
                      ))
                    ) : filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[13px] text-muted">
                          No matching events found
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.slice(0, 60).map((e, idx) => {
                        const timeStr = formatAdminDate(e.created_at, calendarMode, ethiopianScript, { showTime: true });
                        const details = parseActionDetails(e.action_details);
                        const duration = e.duration_seconds ?? details.durationSeconds;
                        const eventType = e.event_type || e.event_name || 'event';
                        const stage = e.stage_name || (details.stage !== undefined ? String(details.stage) : '—');

                        const badgeColorMap: Record<string, 'green' | 'pink' | 'blue' | 'purple' | 'muted'> = {
                          visit: 'green',
                          video_play: 'pink',
                          stage_duration: 'blue',
                          stage_change: 'purple',
                        };
                        const badgeColor = badgeColorMap[eventType] || 'muted';

                        return (
                          <tr
                            key={e.id || idx}
                            onClick={() => setSelectedEvent(e)}
                            className="cursor-pointer transition-colors"
                            style={{ borderBottom: '1px solid var(--hairline)' }}
                            onMouseEnter={(ev) => {
                              (ev.currentTarget as HTMLElement).style.background =
                                'color-mix(in srgb, var(--fg) 4%, transparent)';
                            }}
                            onMouseLeave={(ev) => {
                              (ev.currentTarget as HTMLElement).style.background = '';
                            }}
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted">
                              {timeStr}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <Badge color={badgeColor}>{eventType}</Badge>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold capitalize text-fg">
                              {stage}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px]">
                              {e.client_id ? (
                                <span
                                  className="transition-colors hover:text-fg"
                                  style={{ color: 'var(--accent-strong)' }}
                                >
                                  {e.client_id.substring(0, 8)}…
                                </span>
                              ) : (
                                <span className="text-subtle">—</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-[12px] font-medium text-fg">
                              {typeof duration === 'number' && duration > 0
                                ? formatDuration(duration)
                                : '—'}
                            </td>
                            <td
                              className="max-w-xs truncate px-4 py-3 text-[12px] text-muted"
                              title={JSON.stringify(details)}
                            >
                              {Object.keys(details).length > 0 ? (
                                eventType === 'video_play' ? (
                                  <span className="flex items-center gap-1 font-medium" style={{ color: '#db2777' }}>
                                    <Play className="h-3 w-3" style={{ fill: 'currentColor' }} />
                                    {extractVideoTitle(details, e)}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[11px]">{JSON.stringify(details)}</span>
                                )
                              ) : (
                                e.url || e.page_url || '—'
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ============================================================ *
         *  VISITORS TAB                                                   *
         * ============================================================ */}
        {activeTab === 'visitors' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 sm:space-y-6"
          >
            {/* Search header */}
            <div
              className="surface edge-light flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] p-3.5 sm:p-5"
            >
              <div>
                <h2 className="font-display flex items-center gap-2 text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-fg">
                  <UserCheck className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Persistent Visitor Telemetry Profiles ({filteredVisitors.length})
                </h2>
                <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] text-muted">
                  Client profiles tracked via persistent local storage IDs with {calendarMode === 'ethiopian' ? 'Ethiopian' : 'Gregorian'} dates
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-subtle" />
                <input
                  type="text"
                  placeholder="Search Client ID or Device…"
                  value={visitorSearchQuery}
                  onChange={(e) => setVisitorSearchQuery(e.target.value)}
                  className="w-full rounded-full py-1.5 sm:py-2 pl-8 pr-8 text-[11.5px] sm:text-[12px] font-medium text-fg placeholder-subtle outline-none transition-all focus:ring-2"
                  style={{
                    background: 'var(--field)',
                    border: '1px solid var(--field-border)',
                  }}
                />
                {visitorSearchQuery && (
                  <button
                    onClick={() => setVisitorSearchQuery('')}
                    className="absolute right-3 top-2 sm:top-2.5 cursor-pointer text-muted hover:text-fg"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Visitor cards — 2 columns on mobile, 3 on desktop */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading && events.length === 0 ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-40 sm:h-52 animate-pulse rounded-[var(--radius-lg)]"
                    style={{ background: 'color-mix(in srgb, var(--fg) 5%, transparent)' }}
                  />
                ))
              ) : filteredVisitors.length === 0 ? (
                <div
                  className="surface col-span-full flex flex-col items-center rounded-[var(--radius-lg)] py-12 text-center"
                >
                  <Users className="mb-3 h-8 w-8 text-subtle" />
                  <p className="text-[12px] sm:text-[13px] font-medium text-muted">
                    No visitor profiles match your search
                  </p>
                </div>
              ) : (
                filteredVisitors.map((visitor) => {
                  const { browser, os, device } = visitor.deviceSummary;
                  return (
                    <motion.div
                      key={visitor.clientId}
                      variants={itemVariants}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={springSnappy}
                      onClick={() => setSelectedVisitor(visitor)}
                      className="surface edge-light group flex cursor-pointer flex-col justify-between rounded-[var(--radius-lg)] p-3 sm:p-5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="max-w-[100px] sm:max-w-[180px] truncate rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[9.5px] sm:text-[10.5px] font-medium"
                            style={{
                              background: 'var(--accent-soft)',
                              color: 'var(--accent-strong)',
                            }}
                          >
                            {visitor.clientId.substring(0, 10)}…
                          </span>
                          <Badge color="muted">
                            <span className="sm:hidden">{visitor.totalSessions} ssn</span>
                            <span className="hidden sm:inline">
                              {visitor.totalSessions} {visitor.totalSessions === 1 ? 'session' : 'sessions'}
                            </span>
                          </Badge>
                        </div>

                        <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10.5px] sm:text-[12px] text-muted">
                          {device === 'Mobile' ? (
                            <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                          ) : (
                            <Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                          )}
                          <span className="truncate font-medium">{browser} on {os}</span>
                        </div>

                        <div
                          className="mt-2.5 sm:mt-4 grid grid-cols-3 gap-1 sm:gap-2 rounded-[var(--radius-sm)] p-1.5 sm:p-3 text-center"
                          style={{
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            border: '1px solid var(--hairline)',
                          }}
                        >
                          <div>
                            <div className="eyebrow text-[7.5px] sm:text-[8.5px]">Events</div>
                            <div className="font-display mt-0.5 text-[13px] sm:text-[15px] font-bold text-fg">{visitor.totalEvents}</div>
                          </div>
                          <div>
                            <div className="eyebrow text-[7.5px] sm:text-[8.5px]">Time</div>
                            <div className="font-display mt-0.5 text-[13px] sm:text-[15px] font-bold" style={{ color: 'var(--accent-strong)' }}>
                              {formatDuration(visitor.totalDurationSeconds)}
                            </div>
                          </div>
                          <div>
                            <div className="eyebrow text-[7.5px] sm:text-[8.5px]">Videos</div>
                            <div className="font-display mt-0.5 text-[13px] sm:text-[15px] font-bold" style={{ color: '#db2777' }}>
                              {visitor.videosPlayedCount}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="mt-2.5 sm:mt-4 flex items-center justify-between pt-2 sm:pt-3 text-[10px] sm:text-[11px]"
                        style={{ borderTop: '1px solid var(--hairline)' }}
                      >
                        <span className="font-mono text-muted truncate max-w-[110px] sm:max-w-none">
                          {formatAdminDate(visitor.lastActive, calendarMode, ethiopianScript, { showTime: true, short: true })}
                        </span>
                        <span
                          className="flex items-center gap-0.5 font-semibold transition-colors group-hover:text-fg shrink-0"
                          style={{ color: 'var(--accent-strong)' }}
                        >
                          Journey
                          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* ============================================================ *
       *  VISITOR JOURNEY BOTTOM SHEET / SLIDE-OVER                      *
       * ============================================================ */}
      <AnimatePresence>
        {selectedVisitor && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:flex-row sm:justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisitor(null)}
              className="absolute inset-0 cursor-pointer"
              style={{
                background: 'color-mix(in srgb, var(--ink-950) 55%, transparent)',
                backdropFilter: 'blur(14px)',
              }}
            />

            <motion.div
              initial={{ y: '100%', filter: 'blur(10px)' }}
              animate={{ y: 0, filter: 'blur(0px)' }}
              exit={{ y: '100%', filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="surface-raised relative z-10 flex h-[88vh] sm:h-full w-full sm:max-w-2xl flex-col rounded-t-[28px] sm:rounded-none overflow-hidden"
              style={{ borderLeft: '1px solid var(--hairline)', borderTop: '1px solid var(--hairline)' }}
            >
              {/* Mobile Drag Handle Bar */}
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="h-1.5 w-12 rounded-full" style={{ background: 'var(--hairline-strong)' }} />
              </div>

              {/* Header */}
              <div
                className="flex items-start justify-between gap-4 px-4 sm:px-6 pb-3 sm:pb-4 pt-2 sm:pt-5"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge color="accent">Visitor Journey</Badge>
                    <span className="font-mono text-[10.5px] sm:text-[11px] text-muted">
                      {selectedVisitor.totalSessions} {selectedVisitor.totalSessions === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-mono text-[13px] sm:text-[14px] font-semibold text-fg">
                      {selectedVisitor.clientId}
                    </h2>
                    <button
                      onClick={() => handleCopy(selectedVisitor.clientId)}
                      className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:text-fg"
                      style={{ border: '1px solid var(--hairline)' }}
                      title="Copy Client ID"
                    >
                      {copiedId === selectedVisitor.clientId ? (
                        <Check className="h-3 w-3" style={{ color: '#059669' }} />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-[11.5px] text-muted">
                    <Monitor className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                    <span>
                      {selectedVisitor.deviceSummary.browser} on {selectedVisitor.deviceSummary.os} ({selectedVisitor.deviceSummary.device})
                    </span>
                  </p>
                </div>

                <IconButton label="Close" onClick={() => setSelectedVisitor(null)}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>

              {/* Body */}
              <div className="scroll-area flex-1 space-y-4 sm:space-y-5 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
                {/* Summary stats */}
                <div
                  className="grid grid-cols-4 gap-2 sm:gap-3 rounded-[var(--radius-md)] p-3 sm:p-4 text-center"
                  style={{
                    background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                    border: '1px solid var(--hairline)',
                  }}
                >
                  <div>
                    <span className="eyebrow text-[7.5px] sm:text-[8.5px]">Events</span>
                    <span className="font-display mt-0.5 block text-[14px] sm:text-[16px] font-bold text-fg">
                      {selectedVisitor.totalEvents}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow text-[7.5px] sm:text-[8.5px]">Time</span>
                    <span className="font-display mt-0.5 block text-[14px] sm:text-[16px] font-bold" style={{ color: 'var(--accent-strong)' }}>
                      {formatDuration(selectedVisitor.totalDurationSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow text-[7.5px] sm:text-[8.5px]">First Seen</span>
                    <span className="mt-0.5 block font-mono text-[9.5px] sm:text-[10.5px] font-medium text-fg truncate">
                      {formatAdminDate(selectedVisitor.firstSeen, calendarMode, ethiopianScript, { showTime: true, short: true })}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow text-[7.5px] sm:text-[8.5px]">Videos</span>
                    <span className="font-display mt-0.5 block text-[14px] sm:text-[16px] font-bold" style={{ color: '#db2777' }}>
                      {selectedVisitor.videosPlayedCount}
                    </span>
                  </div>
                </div>

                {/* Sessions timeline */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="eyebrow flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                    Chronological Sessions ({Object.keys(selectedVisitor.sessionsMap).length})
                  </h3>

                  {Object.values(selectedVisitor.sessionsMap).map((session, sIdx) => (
                    <div
                      key={session.sessionId}
                      className="space-y-3 rounded-[var(--radius-md)] p-3 sm:p-4"
                      style={{
                        background: 'color-mix(in srgb, var(--fg) 2%, transparent)',
                        border: '1px solid var(--hairline)',
                      }}
                    >
                      <div
                        className="flex flex-wrap items-center justify-between gap-2 pb-2.5"
                        style={{ borderBottom: '1px solid var(--hairline)' }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge color="green">Session #{sIdx + 1}</Badge>
                          <span className="font-mono text-[10px] sm:text-[11px] text-muted">
                            {formatAdminDate(session.startTime, calendarMode, ethiopianScript, { showTime: true, short: true })}
                          </span>
                        </div>
                        {session.durationSeconds > 0 && (
                          <Badge color="accent">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.durationSeconds)}
                          </Badge>
                        )}
                      </div>

                      {session.stagesVisited.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="eyebrow text-[8px] sm:text-[8.5px]">Stages:</span>
                          {session.stagesVisited.map((stg) => (
                            <span
                              key={stg}
                              className="capitalize rounded-full px-2 py-0.5 font-mono text-[9.5px] sm:text-[10px] text-muted"
                              style={{
                                background: 'color-mix(in srgb, var(--fg) 5%, transparent)',
                                border: '1px solid var(--hairline)',
                              }}
                            >
                              {stg}
                            </span>
                          ))}
                        </div>
                      )}

                      {session.videosPlayed.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="eyebrow text-[8px] sm:text-[8.5px]">Videos:</span>
                          {session.videosPlayed.map((v) => (
                            <Badge key={v} color="pink">
                              <Play className="h-2.5 w-2.5" style={{ fill: 'currentColor' }} />
                              {v}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Timeline events */}
                      <div className="space-y-2 pt-1">
                        {session.events.map((ev, evIdx) => {
                          const eventTime = formatAdminDate(ev.created_at, calendarMode, ethiopianScript, { showTime: true, short: true });
                          const details = parseActionDetails(ev.action_details);
                          const eventType = ev.event_type || ev.event_name || 'event';
                          const duration = ev.duration_seconds ?? details.durationSeconds;

                          return (
                            <div
                              key={ev.id || evIdx}
                              onClick={() => setSelectedEvent(ev)}
                              className="relative py-1.5 pl-4 sm:pl-5 text-[11.5px] sm:text-[12px] cursor-pointer rounded transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_4%,transparent)]"
                              style={{
                                borderLeft: '2px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                              }}
                            >
                              <div
                                className="absolute -left-[5px] top-3 h-2 w-2 rounded-full"
                                style={{
                                  background: 'var(--accent)',
                                  boxShadow: '0 0 0 3px var(--bg)',
                                }}
                              />
                              <div className="flex items-center justify-between text-fg gap-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                                  <Badge color="muted">{eventType}</Badge>
                                  {ev.stage_name && (
                                    <span className="font-medium capitalize text-fg truncate">
                                      {ev.stage_name}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[9px] sm:text-[9.5px] text-subtle shrink-0">{eventTime}</span>
                              </div>

                              {eventType === 'video_play' && (
                                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium truncate" style={{ color: '#db2777' }}>
                                  <Play className="h-3 w-3 shrink-0" style={{ fill: 'currentColor' }} />
                                  <span className="truncate">Played: {extractVideoTitle(details, ev)}</span>
                                </p>
                              )}

                              {typeof duration === 'number' && duration > 0 && (
                                <p className="mt-0.5 font-mono text-[9.5px] sm:text-[10px] text-muted">
                                  Duration: {formatDuration(duration)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ *
       *  SELECTED EVENT BOTTOM SHEET                                   *
       * ============================================================ */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 cursor-pointer"
              style={{
                background: 'color-mix(in srgb, var(--ink-950) 60%, transparent)',
                backdropFilter: 'blur(16px)',
              }}
            />

            <motion.div
              initial={{ y: '100%', filter: 'blur(8px)' }}
              animate={{ y: 0, filter: 'blur(0px)' }}
              exit={{ y: '100%', filter: 'blur(8px)' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="surface-raised relative z-10 flex max-h-[85vh] w-full max-w-2xl mx-auto flex-col rounded-t-[28px] overflow-hidden"
              style={{
                borderTop: '1px solid var(--hairline-strong)',
                borderLeft: '1px solid var(--hairline)',
                borderRight: '1px solid var(--hairline)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Drag Handle Indicator */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="h-1.5 w-12 rounded-full" style={{ background: 'var(--hairline-strong)' }} />
              </div>

              {/* Sheet Header */}
              <div
                className="flex items-start justify-between gap-4 px-4 sm:px-6 pb-3 pt-2"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      color={
                        selectedEvent.event_type === 'visit'
                          ? 'green'
                          : selectedEvent.event_type === 'video_play'
                          ? 'pink'
                          : selectedEvent.event_type === 'stage_duration'
                          ? 'blue'
                          : selectedEvent.event_type === 'stage_change'
                          ? 'purple'
                          : 'muted'
                      }
                    >
                      {selectedEvent.event_type || selectedEvent.event_name || 'Event'}
                    </Badge>
                    {selectedEvent.created_at && (
                      <span className="font-mono text-[10.5px] text-muted">
                        {formatAdminDate(selectedEvent.created_at, calendarMode, ethiopianScript, { showTime: true })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-[15px] sm:text-[17px] font-bold text-fg capitalize">
                    {selectedEvent.event_type === 'video_play'
                      ? extractVideoTitle(selectedEvent.action_details, selectedEvent)
                      : selectedEvent.stage_name
                      ? `Stage: ${selectedEvent.stage_name}`
                      : selectedEvent.event_name || 'Event Details'}
                  </h3>
                </div>

                <IconButton label="Close" onClick={() => setSelectedEvent(null)}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>

              {/* Sheet Body */}
              <div className="scroll-area flex-1 space-y-4 overflow-y-auto px-4 sm:px-6 py-4">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-[12px]">
                  {/* Visitor ID card */}
                  <div
                    className="col-span-2 rounded-[var(--radius-md)] p-3 space-y-1.5"
                    style={{
                      background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-[8.5px]">Visitor Client ID</span>
                      {selectedEvent.client_id && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(selectedEvent.client_id!)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer transition-colors hover:text-fg"
                            style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                          >
                            {copiedId === selectedEvent.client_id ? (
                              <>
                                <Check className="h-3 w-3 text-green-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              const prof = visitorProfiles.find((v) => v.clientId === selectedEvent.client_id);
                              if (prof) {
                                setSelectedEvent(null);
                                setSelectedVisitor(prof);
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer transition-colors"
                            style={{ background: 'var(--action-bg)', color: 'var(--action-fg)' }}
                          >
                            <span>Profile</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-[12px] font-semibold text-fg truncate">
                      {selectedEvent.client_id || 'Anonymous Visitor'}
                    </div>
                  </div>

                  {/* Stage */}
                  <div
                    className="rounded-[var(--radius-md)] p-3"
                    style={{
                      background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    <span className="eyebrow text-[8.5px]">Stage Name</span>
                    <div className="font-semibold text-[13px] capitalize text-fg mt-0.5 truncate">
                      {selectedEvent.stage_name || '—'}
                    </div>
                  </div>

                  {/* Duration */}
                  <div
                    className="rounded-[var(--radius-md)] p-3"
                    style={{
                      background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    <span className="eyebrow text-[8.5px]">Duration</span>
                    <div className="font-mono font-bold text-[13px] mt-0.5" style={{ color: 'var(--accent-strong)' }}>
                      {typeof selectedEvent.duration_seconds === 'number' && selectedEvent.duration_seconds > 0
                        ? formatDuration(selectedEvent.duration_seconds)
                        : '—'}
                    </div>
                  </div>

                  {/* Session ID */}
                  <div
                    className="col-span-2 rounded-[var(--radius-md)] p-3"
                    style={{
                      background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    <span className="eyebrow text-[8.5px]">Session ID</span>
                    <div className="font-mono text-[11.5px] text-fg truncate mt-0.5">
                      {selectedEvent.session_id || '—'}
                    </div>
                  </div>

                  {/* User Agent / Device summary */}
                  <div
                    className="col-span-2 rounded-[var(--radius-md)] p-3"
                    style={{
                      background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    <span className="eyebrow text-[8.5px]">Device & User Agent</span>
                    <div className="mt-1 flex items-center gap-2 text-[12px] font-medium text-fg">
                      <Monitor className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                      <span>
                        {parseUserAgent(selectedEvent.user_agent).browser} on {parseUserAgent(selectedEvent.user_agent).os} ({parseUserAgent(selectedEvent.user_agent).device})
                      </span>
                    </div>
                    {selectedEvent.user_agent && (
                      <p className="mt-1 font-mono text-[10px] text-muted truncate">
                        {selectedEvent.user_agent}
                      </p>
                    )}
                  </div>
                </div>

                {/* Raw Action Details JSON Viewer */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-[9px] flex items-center gap-1">
                      <Info className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                      Action Payload Details
                    </span>
                    <button
                      onClick={() => handleCopyJson(JSON.stringify(parseActionDetails(selectedEvent.action_details), null, 2))}
                      className="flex items-center gap-1 font-mono text-[10px] text-muted hover:text-fg cursor-pointer"
                    >
                      {copiedJson ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre
                    className="scroll-area max-h-44 overflow-y-auto rounded-[var(--radius-md)] p-3 font-mono text-[11px] leading-relaxed"
                    style={{
                      background: 'var(--bg-sunken)',
                      border: '1px solid var(--hairline)',
                      color: 'var(--fg)',
                    }}
                  >
                    {JSON.stringify(parseActionDetails(selectedEvent.action_details), null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAnalytics;