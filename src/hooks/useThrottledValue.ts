import { useEffect, useRef, useState } from 'react';

export const useThrottledValue = <T,>(value: T, delayMs: number) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
    const now = Date.now();
    const elapsed = now - lastCallRef.current;

    if (elapsed >= delayMs) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      lastCallRef.current = now;
      setThrottledValue(value);
      return;
    }

    if (!timeoutRef.current) {
      const remaining = delayMs - elapsed;
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        setThrottledValue(latestValueRef.current);
        timeoutRef.current = null;
      }, remaining);
    }
  }, [value, delayMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledValue;
};
