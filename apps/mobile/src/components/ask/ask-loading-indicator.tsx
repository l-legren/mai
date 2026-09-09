import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo } from 'react-native';

import { AppText } from '@/components/ui/text';

/**
 * Shown while waiting on a reply. `accessibilityLiveRegion` covers Android; iOS ignores live
 * regions, so this also announces imperatively on mount, mirroring `FormError`'s pattern (WCAG 4.1.3).
 */
export function AskLoadingIndicator() {
  const { t } = useTranslation();
  const label = t('ask.loading');

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(label);
  }, [label]);

  return (
    <AppText variant="small" color="text3" accessibilityLiveRegion="polite">
      {label}
    </AppText>
  );
}
