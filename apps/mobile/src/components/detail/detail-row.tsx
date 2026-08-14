import { StyleSheet, View } from 'react-native';

import { RowDeleteButton } from '@/components/ui/row-delete-button';
import { RowIcon } from '@/components/ui/row-icon';
import { AppText } from '@/components/ui/text';
import { type IoniconName } from '@/constants/categories';
import { Spacing, type PaletteColor } from '@/constants/theme';

export type DetailRowData = {
  id: string;
  primary: string;
  secondary?: string;
  amount: string;
  amountColor: PaletteColor;
  accessibilityLabel: string;
  /** Optional leading icon (e.g. the row's expense category). */
  icon?: IoniconName;
  /** Present when the row can be deleted — renders a trailing trash icon. */
  onDelete?: () => void;
};

/**
 * Unified Detail-overlay row (14px primary / 11px secondary / 14px amount) used across every
 * source (income, costs, breakdown, activity) — distinct from each card's own smaller
 * 13px preview-row style.
 */
export function DetailRow({
  primary,
  secondary,
  amount,
  amountColor,
  accessibilityLabel,
  icon,
  onDelete,
}: DetailRowData) {
  return (
    <View style={styles.row}>
      {icon && <RowIcon name={icon} />}
      <View accessible accessibilityLabel={accessibilityLabel} style={styles.body}>
        <View importantForAccessibility="no-hide-descendants">
          <AppText variant="bodyMedium">{primary}</AppText>
          {secondary ? (
            <AppText variant="small" color="text3">
              {secondary}
            </AppText>
          ) : null}
        </View>
        <AppText variant="mono" color={amountColor} importantForAccessibility="no">
          {amount}
        </AppText>
      </View>
      {onDelete && <RowDeleteButton itemName={primary} onConfirm={onDelete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
