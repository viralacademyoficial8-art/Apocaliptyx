'use client';

import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const hasTriggered = useRef(false);

  const fireConfetti = useCallback(() => {
    const burstColors: string[] = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    // Confetti desde la izquierda
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors: burstColors,
    });

    // Confetti desde la derecha
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: burstColors,
    });

    // Confetti desde el centro
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ffd700', '#ff6b6b', '#a855f7'],
      });
    }, 200);

    if (onComplete) {
      setTimeout(onComplete, 2000);
    }
  }, [onComplete]);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  return null;
}

// Función utilitaria global
export function triggerConfetti(type: 'win' | 'steal' | 'celebrate' = 'celebrate') {
  const colors: Record<'win' | 'steal' | 'celebrate', string[]> = {
    win: ['#ffd700', '#f59e0b', '#eab308'],
    steal: ['#a855f7', '#ec4899', '#8b5cf6'],
    celebrate: ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  };

  const duration = type === 'win' ? 3000 : 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: type === 'win' ? 5 : 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors[type],
    });

    confetti({
      particleCount: type === 'win' ? 5 : 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors[type],
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}

export function triggerStarConfetti() {
  const defaults: {
    spread: number;
    ticks: number;
    gravity: number;
    decay: number;
    startVelocity: number;
    colors: string[];
  } = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ffd700', '#ffec8b', '#fff8dc'],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 20,
      scalar: 0.75,
      shapes: ['circle'],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}
