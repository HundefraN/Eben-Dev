import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Link2Off, X } from 'lucide-react';
import { useStudio } from '../core/studio';
import type { ProjectHighlight } from '../core/types';
import { hostLabel, resolveMedia } from '../utils/media';
import { trackEvent } from '../utils/analytics';

/**
 * The unlit film frame behind every piece of proof: deep ink, one gold bloom,
 * a fine dot grid. It stands in for a poster that hasn't loaded or a link that
 * hasn't been pasted yet, and it reads as a paused player either way.
 */
export const ProofPlate: React.FC<{ index?: number; children?: React.ReactNode }> = ({
  index,
  children,
}) => (
  <span className="absolute inset-0 overflow-hidden">
    <span
      aria-hidden
      className="absolute inset-0"
      style={{ background: 'linear-gradient(150deg, #0b2545 0%, #04091a 100%)' }}
    />
    <span
      aria-hidden
      className="absolute inset-0"
      style={{ background: 'radial-gradient(120% 140% at 16% -12%, rgba(221,182,74,0.26), transparent 58%)' }}
    />
    <span
      aria-hidden
      className="absolute inset-0 opacity-50"
      style={{
        backgroundImage: 'radial-gradient(rgba(180,206,255,0.18) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    />
    {index != null && (
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -bottom-4 right-3 select-none font-extrabold leading-none"
        style={{ fontSize: 82, color: 'rgba(247,231,189,0.09)', letterSpacing: '-0.05em' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    )}
    {children}
  </span>
);

/* ------------------------------------------------------------------ */

/** Animated gold-ring loading overlay. */
const ProofLoader: React.FC = () => (
  <div className="proof-loader">
    <div className="proof-loader__rings">
      <span className="proof-loader__ring" />
      <span className="proof-loader__ring" />
      <span className="proof-loader__ring" />
      <span className="proof-loader__dot" />
      <span className="proof-loader__label">Loading…</span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */

interface ProofViewerProps {
  project: ProjectHighlight | null;
  index: number;
  onClose: () => void;
}

export const ProofViewer: React.FC<ProofViewerProps> = ({ project, index, onClose }) => {
  const { setNavLocked, bus, viewport } = useStudio();
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const open = !!project;
  const [loading, setLoading] = useState(true);

  // Reset loading state whenever a new project opens.
  useEffect(() => {
    if (open) setLoading(true);
  }, [open, project]);

  useEffect(() => {
    setNavLocked(open);
    if (open) closeRef.current?.focus();
    return () => setNavLocked(false);
  }, [open, setNavLocked]);

  useEffect(() => {
    if (!project) return;
    bus.say(project.quip, { priority: 4, ttl: 4600 });
  }, [project, bus]);

  useEffect(() => {
    if (open && project && project.proof?.kind === 'video') {
      trackEvent('video_play', {
        projectId: project.id,
        title: project.title,
        proofLabel: project.proof.label,
      });
    }
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  // Auto-play direct video files once they're ready to play.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !open) return;
    const tryPlay = () => {
      const promise = el.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay blocked by browser — fallback to muted autoplay
          el.muted = true;
          el.play().catch(() => {});
        });
      }
    };
    // If data is already loaded, play immediately.
    if (el.readyState >= 2) {
      tryPlay();
    } else {
      el.addEventListener('loadeddata', tryPlay, { once: true });
      el.addEventListener('canplay', tryPlay, { once: true });
      return () => {
        el.removeEventListener('loadeddata', tryPlay);
        el.removeEventListener('canplay', tryPlay);
      };
    }
  }, [open, project]);

  const handleMediaReady = useCallback(() => setLoading(false), []);

  const handleIframeLoad = useCallback(() => setLoading(false), []);

  const handleImageLoad = useCallback(() => setLoading(false), []);

  const proof = project?.proof;
  const media = proof ? resolveMedia(proof.url, proof.kind) : { mode: 'empty' as const };
  const portrait = proof?.orientation === 'portrait';

  // Media modes that should show a loader while content is buffering.
  const showLoader = loading && (media.mode === 'embed' || media.mode === 'video' || media.mode === 'image');

  return (
    <AnimatePresence>
      {project && proof && (
        <>
          <motion.button
            type="button"
            aria-label={`Close ${project.title} preview`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[58] h-full w-full cursor-default"
            style={{
              background: 'color-mix(in srgb, var(--ink-950) 68%, transparent)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Centred with inset-0 + margin auto rather than a translate pair:
              Motion writes its own inline transform here and would win. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} — ${proof.label}`}
            initial={{ opacity: 0, y: 26, scale: 0.97, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
            transition={{ type: 'spring', stiffness: 240, damping: 30 }}
            className="surface-raised edge-light fixed inset-0 z-[60] m-auto flex h-fit w-[min(94vw,58rem)] flex-col overflow-hidden rounded-[var(--radius-xl)]"
            style={{
              width: portrait ? 'min(94vw, 26rem)' : undefined,
              maxHeight: 'calc(var(--vh, 100vh) - 1.5rem)',
            }}
          >
            <header className="flex items-start justify-between gap-4 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
              <div className="min-w-0">
                <span className="eyebrow">
                  {String(index + 1).padStart(2, '0')} · {project.discipline}
                </span>
                <h2 className="font-display mt-1 truncate text-[1.05rem] font-bold tracking-[-0.025em] text-fg sm:text-[1.2rem]">
                  {project.title}
                </h2>
              </div>
              <motion.button
                ref={closeRef}
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:text-fg"
                style={{ border: '1px solid var(--hairline)', background: 'var(--bg-elevated)' }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </header>

            <div className="px-4 sm:px-5">
              <div
                className="relative w-full overflow-hidden rounded-[var(--radius-md)]"
                style={{
                  aspectRatio: portrait ? '9 / 16' : '16 / 9',
                  maxHeight: `calc(var(--vh, 100vh) - ${viewport.isMobile ? 14 : 16}rem)`,
                  border: '1px solid var(--hairline)',
                  background: '#04091a',
                }}
              >
                {/* Loading overlay — shows while media is buffering */}
                {showLoader && <ProofLoader />}

                {media.mode === 'embed' && (
                  <iframe
                    key={media.src}
                    src={media.src}
                    title={`${project.title} — ${proof.label}`}
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                  />
                )}

                {media.mode === 'video' && (
                  <video
                    ref={videoRef}
                    key={media.src}
                    src={media.src}
                    className="absolute inset-0 h-full w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    onLoadedData={handleMediaReady}
                    onCanPlay={handleMediaReady}
                    onPlay={handleMediaReady}
                    onPlaying={handleMediaReady}
                    onError={handleMediaReady}
                  />
                )}

                {media.mode === 'image' && (
                  <img
                    key={media.src}
                    src={media.src}
                    alt={`${project.title} — ${proof.label}`}
                    className="absolute inset-0 h-full w-full object-contain"
                    onLoad={handleImageLoad}
                  />
                )}

                {(media.mode === 'empty' || media.mode === 'external') && (
                  <ProofPlate index={index}>
                    <span className="absolute inset-0 grid place-items-center px-6 text-center">
                      {media.mode === 'external' ? (
                        <a
                          href={media.src}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
                          style={{ background: 'var(--gold-300)', color: 'var(--ink-950)' }}
                        >
                          Open the recording
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="flex flex-col items-center gap-2.5">
                          <Link2Off className="h-5 w-5" style={{ color: 'rgba(247,231,189,0.5)' }} />
                          <span
                            className="font-mono text-[10px] uppercase tracking-[0.16em]"
                            style={{ color: 'rgba(247,231,189,0.62)' }}
                          >
                            {proof.kind === 'video' ? 'Recording' : 'Screenshot'} not linked yet
                          </span>
                        </span>
                      )}
                    </span>
                  </ProofPlate>
                )}
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="max-w-[34rem] text-[12px] leading-relaxed text-muted">
                {project.description}
              </p>
              {project.link && (
                <motion.a
                  href={project.link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 440, damping: 26 }}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold"
                  style={{
                    background: 'var(--action-bg)',
                    color: 'var(--action-fg)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  Visit {hostLabel(project.link.href)}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.a>
              )}
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
