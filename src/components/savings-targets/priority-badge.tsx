import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing, type PaletteColor } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { SavingsTargetPriority } from '@/services/savings-targets.service';

const TONE: Record<SavingsTargetPriority, { bg: PaletteColor; text: PaletteColor }> = {
  high: { bg: 'neutralSel', text: 'text' },
  medium: { bg: 'card', text: 'text2' },
  low: { bg: 'card', text: 'text3' },
};

type PriorityBadgeProps = {
  priority: SavingsTargetPriority;
  /** Worded label (e.g. "High priority") — the badge never relies on color alone. */
  label: string;
};

/** Small pill showing a savings target's priority. Always a worded label, never color-only. */
export function PriorityBadge({ priority, label }: PriorityBadgeProps) {
  const { palette } = useAppTheme();
  const tone = TONE[priority];

  return (
    <View style={[styles.badge, { backgroundColor: palette[tone.bg] }]}>
      <AppText variant="small" color={tone.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
});
