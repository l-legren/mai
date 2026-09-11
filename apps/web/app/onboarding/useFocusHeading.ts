import { useEffect, useRef, type RefObject } from 'react';

// Focuses the step heading on mount so screen readers notice client-side step transitions (WCAG 4.1.3).
export function useFocusHeading<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
