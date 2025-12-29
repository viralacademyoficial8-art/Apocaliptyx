'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideInProps {
  children: ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export function SlideIn({
  children,
  isOpen,
  direction = 'right',
  className = '',
}: SlideInProps) {
  const variants = {
    left: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 },
    },
    right: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
    },
    top: {
      initial: { y: '-100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '-100%', opacity: 0 },
    },
    bottom: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 },
    },
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={variants[direction].initial}
          animate={variants[direction].animate}
          exit={variants[direction].exit}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BounceInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function BounceIn({
  children,
  delay = 0,
  className = '',
}: BounceInProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export function Pulse({ children, isActive = true, className = '' }: PulseProps) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ShakeProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

export function Shake({ children, trigger, className = '' }: ShakeProps) {
  return (
    <motion.div
      animate={
        trigger
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
