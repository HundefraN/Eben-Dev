import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Maximize2, Play } from 'lucide-react';
import { useCompanionLink, useStudio } from '../core/studio';
import { COMPANY_INFO, PROJECT_HIGHLIGHTS } from '../data/companyData';
import type { ProjectHighlight } from '../core/types';
import { StagePanel } from './StagePanel';
import { ProofPlate, ProofViewer } from './ProofViewer';
import { resolveMedia } from '../utils/media';
import { soundFx } from '../utils/audio';

/* ------------------------------------------------------------------ */

const TONE: Record<ProjectHighlight['status']['tone'], { color: string; pulse: boolean }> = {
  live: { color: 'var(--accent-strong)', pulse: true },
  building: { color: 'var(--copper-500)', pulse: true },
  shipped: { color: 'var(--fg-subtle)', pulse: false },
};

const StatusPill: React.FC<{ status: ProjectHighlight['status'] }> = ({ status }) => {
  const { color, pulse } = TONE[status.tone];

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em]"
      style={{
        border: '1px solid var(--hairline)',
        background: 'color-mix(in srgb, var(--fg) 4%, transparent)',
        color: 'var(--fg-muted)',
      }}
    >
      <span className="relative grid h-1.5 w-1.5 place-items-center">
        <span className="absolute inset-0 rounded-full" style={{ background: color }} />
        {pulse && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: color }}
            animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </span>
      {status.label}
    </span>
  );
};

/* ------------------------------------------------------------------ */

/**
 * The evidence, sat right in the card. Auto-plays a muted video thumbnail when available,
 * falling back to derived/custom poster stills or designed plates.
 */
const ProofThumb: React.FC<{ project: ProjectHighlight; index: number; onOpen: () => void }> = ({
  project,
  index,
  onOpen,
}) => {
  const [posterFailed, setPosterFailed] = useState(false);
  const { proof } = project;
  const media = resolveMedia(proof.url, proof.kind);

  const derived =
    media.mode === 'embed' ? media.poster : media.mode === 'image' ? media.src : undefined;
  const poster = posterFailed ? undefined : (proof.poster ?? derived);

  const Glyph = proof.kind === 'video' ? Play : Maximize2;

  const handleVideoRef = useCallback((el: HTMLVideoElement | null) => {
    if (el) {
      el.muted = true;
      el.play().catch(() => {});
    }
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ scale: 1.008 }}
      whileTap={{ scale: 0.994 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      aria-label={`${proof.label} — ${project.title}`}
      className="group/proof relative mt-3.5 block w-full overflow-hidden rounded-[var(--radius-md)]"
      style={{ aspectRatio: '2.2 / 1', border: '1px solid var(--hairline)' }}
    >
      {media.mode === 'video' ? (
        <>
          {poster && (
            <img
              src={poster}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-lg"
            />
          )}
          <video
            ref={handleVideoRef}
            src={media.src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </>
      ) : poster ? (
        <>
          {/* Blurred cover behind, contained image in front: portrait phone
              captures and wide desktop stills both sit in the frame properly. */}
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-lg"
          />
          <img
            src={poster}
            alt=""
            onError={() => setPosterFailed(true)}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </>
      ) : (
        <ProofPlate index={index} />
      )}

      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(4,9,26,0.78) 0%, rgba(4,9,26,0.04) 58%)',
        }}
      />

      <span className="absolute inset-0 grid place-items-center">
        <span
          className="relative grid h-11 w-11 place-items-center rounded-full transition-transform duration-300 group-hover/proof:scale-110"
          style={{
            background: 'var(--gold-300)',
            color: 'var(--ink-950)',
            boxShadow: '0 10px 34px -10px rgba(197,155,39,0.75)',
          }}
        >
          <Glyph
            className="h-[15px] w-[15px]"
            style={{ transform: proof.kind === 'video' ? 'translateX(1px)' : undefined }}
            fill={proof.kind === 'video' ? 'currentColor' : 'none'}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover/proof:opacity-100"
            style={{ boxShadow: '0 0 0 6px rgba(221,182,74,0.18)' }}
          />
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 pb-2.5">
        <span
          className="font-mono text-[9.5px] uppercase tracking-[0.16em]"
          style={{ color: 'rgba(247,231,189,0.92)' }}
        >
          {proof.label}
        </span>
        <Maximize2 className="h-3 w-3" style={{ color: 'rgba(247,231,189,0.55)' }} />
      </span>
    </motion.button>
  );
};

/* ------------------------------------------------------------------ */

const ProjectCard: React.FC<{
  project: ProjectHighlight;
  index: number;
  onEnquire: () => void;
  onOpenProof: () => void;
}> = ({ project, index, onEnquire, onOpenProof }) => {
  const { sound } = useStudio();
  const { ref, linkProps } = useCompanionLink({ weight: 1, quip: project.quip });

  return (
    <motion.article
      ref={ref}
      {...linkProps}
      onMouseEnter={() => {
        linkProps.onMouseEnter();
        if (sound) soundFx.playHoverSound();
      }}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.08 + index * 0.08 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] p-4 transition-colors duration-300 sm:p-5"
      style={{
        background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
        border: '1px solid var(--hairline)',
      }}
    >
      {/* Accent wash that arrives on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(120% 100% at 100% 0%, var(--accent-soft) 0%, transparent 62%)',
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow truncate">
            {String(index + 1).padStart(2, '0')} · {project.discipline}
          </span>
          <span className="font-mono text-[10px] text-subtle">{project.year}</span>
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.22rem] font-bold leading-[1.15] tracking-[-0.03em] text-fg">
            {project.title}
          </h3>
          <span className="mt-1">
            <StatusPill status={project.status} />
          </span>
        </div>

        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{project.description}</p>

        <ProofThumb project={project} index={index} onOpen={onOpenProof} />

        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent-strong)',
            }}
          >
            {project.role}
          </span>
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 font-mono text-[10px] text-muted"
              style={{
                background: 'color-mix(in srgb, var(--fg) 5%, transparent)',
                border: '1px solid var(--hairline)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="mt-3.5 flex items-center justify-end gap-3 border-t pt-3"
          style={{ borderColor: 'var(--hairline)' }}
        >
          {project.link && (
            <a
              href={project.link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="mr-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-fg transition-opacity hover:opacity-70"
            >
              {project.link.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={onEnquire}
            className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold transition-colors"
            style={{ color: 'var(--accent-strong)' }}
          >
            Discuss a build
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/* ------------------------------------------------------------------ */

export const WorkPanel: React.FC = () => {
  const { goTo, stage } = useStudio();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // The viewer lives outside the panel, so it would otherwise survive a
  // navigation away from this stage.
  useEffect(() => {
    if (stage !== 1) setOpenIndex(null);
  }, [stage]);

  return (
    <>
      <StagePanel
        index={1}
        side="right"
        eyebrow="Selected work"
        title="Four builds, with the proof attached"
        intro="Three come with a recorded walkthrough. Kena is live at kenafiber.com — go click around it yourself."
        showScrollControls
      >
        {/* Studio numbers */}
        <dl className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] @md:grid-cols-4"
          style={{ background: 'var(--hairline)', border: '1px solid var(--hairline)' }}
        >
          {COMPANY_INFO.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="px-3 py-2.5"
              style={{ background: 'var(--bg)' }}
            >
              <dd className="font-display text-[15px] font-bold tabular-nums text-fg">{s.value}</dd>
              <dt className="eyebrow mt-0.5" style={{ fontSize: 8.5 }}>
                {s.label}
              </dt>
            </motion.div>
          ))}
        </dl>

        <div className="flex flex-col gap-3">
          {PROJECT_HIGHLIGHTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onEnquire={() => goTo(3)}
              onOpenProof={() => setOpenIndex(i)}
            />
          ))}
        </div>
      </StagePanel>

      <ProofViewer
        project={openIndex === null ? null : PROJECT_HIGHLIGHTS[openIndex]}
        index={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
};
