'use client';

import CountUp from 'react-countup';
import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface CounterAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  triggerOnView?: boolean;
}

export function CounterAnimation({
  end,
  start = 0,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  triggerOnView = true,
}: CounterAnimationProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [shouldAnimate, setShouldAnimate] = useState(!triggerOnView);

  useEffect(() => {
    if (triggerOnView && isInView) {
      setShouldAnimate(true);
    }
  }, [isInView, triggerOnView]);

  return (
    <span ref={ref} className={className}>
      {shouldAnimate ? (
        <CountUp
          start={start}
          end={end}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          separator=","
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  );
}

interface LiveCounterProps {
  value: number;
  className?: string;
}

export function LiveCounter({ value, className = '' }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsChanging(true);

      const diff = value - prevValue.current;
      const steps = Math.abs(diff);
      const stepDuration = Math.min(500 / Math.max(steps, 1), 50);

      let current = prevValue.current;
      const interval = setInterval(() => {
        if (diff > 0) current++;
        else current--;

        setDisplayValue(current);

        if (current === value) {
          clearInterval(interval);
          setIsChanging(false);
        }
      }, stepDuration);

      prevValue.current = value;

      return () => clearInterval(interval);
    }
  }, [value]);

  return (
    <span
      className={`transition-all duration-200 ${
        isChanging ? 'scale-110 text-yellow-400' : ''
      } ${className}`}
    >
      {displayValue.toLocaleString()}
    </span>
  );
}
