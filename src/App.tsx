import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StudioProvider, useStudio } from './core/studio';
import { Backdrop } from './components/Backdrop';
import { Hero } from './components/Hero';
import { Companion } from './components/Companion';
import { CompanionBubble } from './components/CompanionBubble';
import { ConnectorLayer } from './components/ConnectorLayer';
import { OrbitField } from './components/OrbitField';
import { HeaderNav } from './components/HeaderNav';
import { StageAdvance, StageRail } from './components/StageRail';
import { WorkPanel } from './components/WorkPanel';
import { FounderPanel } from './components/FounderPanel';
import { ContactPanel } from './components/ContactPanel';
import { ServicesSheet } from './components/ServicesSheet';
import { LoadingCounter } from './components/LoadingCounter';
import { COMPANY_INFO, IDLE_LINES, STAGE_META } from './data/companyData';
import { trackEvent, initSessionDurationTracking } from './utils/analytics';
import { AdminAnalytics } from './pages/AdminAnalytics';

/* ------------------------------------------------------------------ */

const Studio: React.FC = () => {
  const { stage, bus, viewport, pointer, goTo } = useStudio();
  const [servicesOpen, setServicesOpen] = useState(false);
  const firstRun = useRef(true);

  /* Companion narrates each stage on arrival. */
  useEffect(() => {
    const meta = STAGE_META[stage];
    const delay = firstRun.current ? 1500 : 420;
    firstRun.current = false;
    const t = setTimeout(() => bus.say(meta.greeting, { priority: 3, ttl: 5200 }), delay);
    return () => clearTimeout(t);
  }, [stage, bus]);

  /* Track stage duration. */
  useEffect(() => {
    const startTime = Date.now();
    const currentStage = stage;
    return () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      if (durationSeconds > 0) {
        trackEvent('stage_duration', { stage: currentStage, durationSeconds });
      }
    };
  }, [stage]);

  /* After a stretch of inactivity on the home stage she offers a nudge. */
  useEffect(() => {
    if (stage !== 0) return;
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;

    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        bus.say(IDLE_LINES[index % IDLE_LINES.length], { priority: 0, ttl: 4200 });
        index += 1;
        arm();
      }, 15000);
    };

    arm();
    window.addEventListener('pointermove', arm, { passive: true });
    window.addEventListener('keydown', arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', arm);
      window.removeEventListener('keydown', arm);
    };
  }, [stage, bus, pointer]);

  return (
    <div
      className="relative w-full overflow-hidden bg-bg text-fg"
      style={{ height: 'var(--vh, 100vh)' }}
    >
      <Backdrop />
      <Hero />
      <Companion />
      <OrbitField />

      <main aria-label={`${COMPANY_INFO.name} — ${STAGE_META[stage].label}`}>
        <WorkPanel />
        <FounderPanel />
        <ContactPanel />
      </main>

      <ConnectorLayer />
      {/* On phones she only speaks while she's on screen (the home stage). */}
      {(!viewport.isMobile || stage === 0) && <CompanionBubble />}

      <HeaderNav onOpenServices={() => setServicesOpen(true)} />
      <StageRail />
      <StageAdvance />

      <ServicesSheet
        open={servicesOpen}
        onClose={() => setServicesOpen(false)}
        onEnquire={() => goTo(3)}
      />

      {/* Announce section changes to assistive tech. */}
      <p className="sr-only" aria-live="polite">
        {STAGE_META[stage].label} section
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return <AdminAnalytics />;
  }

  /* The stage is held back until the counter has the artwork warm, so its
     entrance plays into the opening curtain instead of behind it. */
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    initSessionDurationTracking();
    trackEvent('visit', { source: 'App load' });
  }, []);

  return (
    <StudioProvider>
      {revealed && <Studio />}
      <LoadingCounter onReveal={reveal} />
    </StudioProvider>
  );
}
