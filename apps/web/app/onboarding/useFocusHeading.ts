import { useEffect, useRef, type RefObject } from 'react';

/**
 * Focuses the step heading on mount. Step transitions are client-side route swaps within the same
 * layout (no full page load), so without this, screen reader users get no signal a new step
 * rendered — WCAG 4.1.3.
 */
export function useFocusHeading<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
