import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParallaxConfig, ThemePreset } from '../types';
import { Sliders, Sparkles, Move3d, RotateCcw, X, Layers, Volume2 } from 'lucide-react';

interface ControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: ParallaxConfig;
  onChangeConfig: (newConfig: ParallaxConfig) => void;
  theme: ThemePreset;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  theme,
}) => {
  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({
      ...config,
      intensity: parseFloat(e.target.value),
    });
  };

  const resetDefaults = () => {
    onChangeConfig({
      intensity: 1.2,
      enable3dTilt: true,
      enableParticles: true,
      enableFloatingBadges: true,
      enableLightFollow: true,
      soundEnabled: true,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-80 p-5 rounded-2xl border shadow-2xl backdrop-blur-xl pointer-events-auto bg-slate-900/90 text-white border-slate-700/80"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold tracking-tight">Motion & 3D Controls</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Parallax Intensity Slider */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1.5 text-slate-300">
                <span>Parallax Depth Intensity</span>
                <span className="text-cyan-400 font-mono">{config.intensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={config.intensity}
                onChange={handleIntensityChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Subtle (0.2x)</span>
                <span>Balanced</span>
                <span>Hyper (2.5x)</span>
              </div>
            </div>

            {/* Toggle Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              {/* 3D Tilt */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Move3d className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-slate-200">3D Tilt Mechanics</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enable3dTilt}
                  onChange={(e) => onChangeConfig({ ...config, enable3dTilt: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-500"
                />
              </label>

              {/* Floating Badges */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-slate-200">Floating Capability Badges</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableFloatingBadges}
                  onChange={(e) =>
                    onChangeConfig({ ...config, enableFloatingBadges: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-500"
                />
              </label>

              {/* Particles */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-slate-200">Background Particle Grid</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableParticles}
                  onChange={(e) =>
                    onChangeConfig({ ...config, enableParticles: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-500"
                />
              </label>

              {/* Audio feedback */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">Interaction Sound Chimes</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={(e) =>
                    onChangeConfig({ ...config, soundEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-500"
                />
              </label>
            </div>

            {/* Reset Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={resetDefaults}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default Parameters</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
