'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export type TurnstileWidgetProps = {
  siteKey: string;
};

// `onReady` (unlike `onLoad`) fires on every mount, not just the first — required since sign-in and
// sign-up are separate route navigations that each mount a fresh widget against the same cached script.
const TurnstileWidget = ({ siteKey }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={() => {
          if (containerRef.current && window.turnstile && !widgetIdRef.current) {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
            });
          }
        }}
      />
      <div ref={containerRef} />
    </>
  );
};

export default TurnstileWidget;
