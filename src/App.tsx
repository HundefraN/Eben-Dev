import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemePreset, ParallaxConfig } from './types';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { TextLayer3D } from './components/3DTextLayer';
import { CharacterLayer } from './components/CharacterLayer';
import { HeaderNav } from './components/HeaderNav';
import { ServicesModal } from './components/ServicesModal';
import { ShowcaseModal } from './components/ShowcaseModal';
import { ContactModal } from './components/ContactModal';
import { ProjectsRightPanel } from './components/ProjectsRightPanel';
import { CeoLeftPanel } from './components/CeoLeftPanel';
import { ContactPage } from './components/ContactPage';
import { soundFx } from './utils/audio';
import { ChevronDown } from 'lucide-react';

export default function App() {
  const [theme] = useState<ThemePreset>('studio-light');
  const [config] = useState<ParallaxConfig>({
    intensity: 1.0,
    enable3dTilt: true,
    enableParticles: true,
    enableFloatingBadges: true,
    enableLightFollow: true,
    soundEnabled: true,
  });

  const [scrollStage, setScrollStage] = useState<number>(0);
  const targetScrollStage = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);
  const isAnimating = useRef<boolean>(false);

  const targetMousePos = useRef<{ xRatio: number; yRatio: number }>({ xRatio: 0, yRatio: 0 });
  const [mousePos, setMousePos] = useState<{ xRatio: number; yRatio: number }>({
    xRatio: 0,
    yRatio: 0,
  });

  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const isModalOpen = isServicesOpen || isShowcaseOpen || isContactOpen;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    targetMousePos.current = {
      xRatio: (e.clientX / width) * 2 - 1,
      yRatio: (e.clientY / height) * 2 - 1,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const width = window.innerWidth;
      const height = window.innerHeight;
      targetMousePos.current = {
        xRatio: (touch.clientX / width) * 2 - 1,
        yRatio: (touch.clientY / height) * 2 - 1,
      };
    }
  }, []);

  const navigateToStage = useCallback((stageIndex: number) => {
    const next = Math.max(0, Math.min(3, stageIndex));
    if (next === targetScrollStage.current) return;

    if (config.soundEnabled) {
      soundFx.playParallaxSwoosh();
    }
    isAnimating.current = true;
    lastScrollTime.current = Date.now();
    targetScrollStage.current = next;

    setTimeout(() => {
      isAnimating.current = false;
    }, 700);
  }, [config.soundEnabled]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (isModalOpen) return;

      const now = Date.now();
      if (isAnimating.current || now - lastScrollTime.current < 650) {
        return;
      }

      if (Math.abs(e.deltaY) > 15) {
        const currentStage = Math.round(targetScrollStage.current);

        if (e.deltaY > 0) {
          navigateToStage(currentStage + 1);
        } else {
          navigateToStage(currentStage - 1);
        }
      }
    },
    [isModalOpen, navigateToStage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isModalOpen) return;
      const currentStage = Math.round(targetScrollStage.current);

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        navigateToStage(currentStage + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateToStage(currentStage - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToStage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToStage(3);
      }
    },
    [isModalOpen, navigateToStage]
  );

  // Smooth animation loop for mouse physics & scrollStage lerp
  useEffect(() => {
    let animId: number;

    const loop = () => {
      setMousePos((prev) => {
        const dx = targetMousePos.current.xRatio - prev.xRatio;
        const dy = targetMousePos.current.yRatio - prev.yRatio;

        // Skip update when movement is negligible — avoids burning frames
        if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) {
          return prev;
        }

        return {
          xRatio: prev.xRatio + dx * 0.11,
          yRatio: prev.yRatio + dy * 0.11,
        };
      });

      setScrollStage((prev) => {
        const target = targetScrollStage.current;
        const ds = target - prev;
        if (Math.abs(ds) < 0.002) return target;
        return prev + ds * 0.12;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Event listeners setup
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isModalOpen || e.changedTouches.length === 0) return;
      const now = Date.now();
      if (isAnimating.current || now - lastScrollTime.current < 650) return;

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaY) > 40) {
        const currentStage = Math.round(targetScrollStage.current);
        if (deltaY > 0) {
          navigateToStage(currentStage + 1);
        } else {
          navigateToStage(currentStage - 1);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleTouchMove, handleWheel, handleKeyDown, isModalOpen, navigateToStage]);

  const getStageLabel = () => {
    if (scrollStage < 0.5) return 'Scroll for Projects Showcase';
    if (scrollStage < 1.5) return 'Scroll for CEO / Founder Profile';
    if (scrollStage < 2.5) return 'Scroll for Contact Us Page';
    return 'Return to Home Hero';
  };

  const handleNextStage = () => {
    const currentStage = Math.round(targetScrollStage.current);
    if (currentStage >= 3) {
      navigateToStage(0);
    } else {
      navigateToStage(currentStage + 1);
    }
  };

  const currentStageIndex = Math.round(scrollStage);
  const stageLabels = ['Home', 'Showcase', 'CEO', 'Contact'];

  return (
    <div className="relative h-screen w-full overflow-hidden select-none font-sans bg-white text-[#0b2545]">
      {/* One-shot cinematic reveal curtain */}
      <AnimatePresence>
        <motion.div
          key="intro-curtain"
          className="fixed inset-0 z-[999] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: 'easeOut', delay: 0.05 }}
          style={{ background: 'linear-gradient(135deg,#0b2545 0%,#071930 100%)' }}
        />
      </AnimatePresence>
      <BackgroundCanvas
        theme={theme}
        mouseXRatio={mousePos.xRatio}
        mouseYRatio={mousePos.yRatio}
        enableParticles={config.enableParticles}
        scrollStage={scrollStage}
      />

      <TextLayer3D
        theme={theme}
        mouseXRatio={mousePos.xRatio}
        mouseYRatio={mousePos.yRatio}
        intensity={config.intensity}
        enable3dTilt={config.enable3dTilt}
        scrollStage={scrollStage}
      />

      <CharacterLayer
        theme={theme}
        config={config}
        mouseXRatio={mousePos.xRatio}
        mouseYRatio={mousePos.yRatio}
        scrollStage={scrollStage}
        onBadgeSelect={() => {
          if (config.soundEnabled) soundFx.playHoverSound();
        }}
      />

      <ProjectsRightPanel
        theme={theme}
        scrollStage={scrollStage}
        mouseXRatio={mousePos.xRatio}
        mouseYRatio={mousePos.yRatio}
        onOpenContact={() => {
          navigateToStage(3);
        }}
        soundEnabled={config.soundEnabled}
      />

      <CeoLeftPanel
        theme={theme}
        scrollStage={scrollStage}
        mouseXRatio={mousePos.xRatio}
        mouseYRatio={mousePos.yRatio}
        onOpenContact={() => {
          navigateToStage(3);
        }}
        soundEnabled={config.soundEnabled}
      />

      <ContactPage
        theme={theme}
        scrollStage={scrollStage}
        mouseXRatio={mousePos.xRatio}
        mouseYRatio={mousePos.yRatio}
        soundEnabled={config.soundEnabled}
      />

      <HeaderNav
        onOpenServices={() => setIsServicesOpen(true)}
        onOpenProjects={() => navigateToStage(1)}
        onOpenCeo={() => navigateToStage(2)}
        onOpenContact={() => navigateToStage(3)}
      />

      {/* Stage Navigation Dots */}
      <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 sm:gap-3">
        {stageLabels.map((label, idx) => (
          <button
            key={label}
            onClick={() => navigateToStage(idx)}
            className="group relative flex items-center p-1 cursor-pointer"
            title={label}
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                idx === currentStageIndex
                  ? 'w-3 h-3 bg-[#c59b27] shadow-[0_0_12px_rgba(197,155,39,0.5)]'
                  : 'w-2 h-2 bg-[#0b2545]/25 hover:bg-[#0b2545]/50'
              }`}
            />
            <span className="absolute right-7 px-2 py-1 rounded-md text-[10px] font-bold bg-[#0b2545] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom CTA Button */}
      <button
        onClick={handleNextStage}
        className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#c59b27]/40 bg-white/90 backdrop-blur-md shadow-xl text-[11px] sm:text-xs font-extrabold text-[#0b2545] flex items-center gap-1.5 sm:gap-2 hover:bg-[#0b2545] hover:text-[#c59b27] hover:border-[#0b2545] transition-all cursor-pointer max-w-[90vw]"
      >
        <span>{getStageLabel()}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-500 ${
            scrollStage >= 2.8 ? 'rotate-180' : 'animate-bounce'
          }`}
        />
      </button>

      <ServicesModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        onOpenContact={() => navigateToStage(3)}
        theme={theme}
      />

      <ShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
        onOpenContact={() => navigateToStage(3)}
        theme={theme}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        theme={theme}
        soundEnabled={config.soundEnabled}
      />
    </div>
  );
}
