import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/text';

type FormErrorProps = {
  /** The resolved, translated error message, or `null`/`undefined` when there is no error. */
  message: string | null | undefined;
};

/**
 * Accessible inline form error. Renders nothing when there is no message.
 *
 * Screen-reader feedback (WCAG 4.1.3): the text is a live `alert` region so Android/TalkBack
 * announces it when it appears; iOS ignores live regions, so we also announce imperatively
 * whenever the message changes.
 */
export function FormError({ message }: FormErrorProps) {
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  if (!message) return null;

  return (
    <AppText
      color="bad"
      variant="caption"
      style={styles.center}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {message}
    </AppText>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});
