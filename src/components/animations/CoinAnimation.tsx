'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface CoinAnimationProps {
  amount: number;
  type: 'gain' | 'spend';
  trigger: boolean;
  onComplete?: () => void;
}

export function CoinAnimation({
  amount,
  type,
  trigger,
  onComplete,
}: CoinAnimationProps) {
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>(
    []
  );

  useEffect(() => {
    if (trigger) {
      const newCoins = Array.from(
        { length: Math.min(Math.floor(amount / 10), 10) },
        (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * 100 - 50,
          y: Math.random() * 50,
        })
      );
      setCoins(newCoins);

      setTimeout(() => {
        setCoins([]);
        onComplete?.();
      }, 1500);
    }
  }, [trigger, amount, onComplete]);

  return (
    <AnimatePresence>
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{
            opacity: 1,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: coin.x,
            y: type === 'gain' ? -100 - coin.y : 100 + coin.y,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
          }}
          className="fixed pointer-events-none z-50"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm
            ${
              type === 'gain'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            {type === 'gain' ? '+' : '-'}
            {amount}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

interface FlyingCoinsProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  amount: number;
  trigger: boolean;
  onComplete?: () => void;
}

export function FlyingCoins({
  from,
  to,
  amount,
  trigger,
  onComplete,
}: FlyingCoinsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 1000);
    }
  }, [trigger, onComplete]);

  if (!isAnimating) return null;

  const coinCount = Math.min(Math.ceil(amount / 20), 8);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: coinCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: from.x,
            y: from.y,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: to.x + (Math.random() * 20 - 10),
            y: to.y + (Math.random() * 20 - 10),
            scale: [0, 1.2, 1],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
          className="absolute"
        >
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <Flame className="w-4 h-4 text-yellow-900" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
