import React, { useState, useEffect } from 'react';
import { Timer, Plus, SkipForward, Play, Pause } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  exerciseName?: string;
  onFinish?: () => void;
  onCancel?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  exerciseName,
  onFinish,
  onCancel,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      // Play audio chime if Web Audio API is available
      playChime();
      if (onFinish) onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onFinish]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // AudioContext fallback
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-gray-900/95 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl glow-emerald transition-all transform animate-in fade-in slide-in-from-bottom-4">
      {/* Top progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Timer className={`w-5 h-5 ${isActive ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wide uppercase text-emerald-400">
              Resting • {exerciseName || 'Rest Timer'}
            </div>
            <div className="text-2xl font-black tracking-tight text-white font-mono">
              {formatTime(secondsLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSecondsLeft((prev) => prev + 30)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors btn-press"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            30s
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors btn-press"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onCancel}
            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors btn-press"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
