import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { RecurringItemRow } from '@/components/recurring/recurring-item-row';
import { Hairline } from '@/components/ui/hairline';
import { AppText } from '@/components/ui/text';
import { SeeMoreLink } from '@/components/ui/see-more-link';
import { WidgetCard } from '@/components/ui/widget-card';
import { recurringCategoryIcon } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { fmtR } from '@/utils/money';
import type { RecurringItem, RecurringType } from '@/services/recurring.service';

/** Widget cards preview at most this many rows; "See more" always links to the full list. */
const PREVIEW_LIMIT = 3;

type SectionHeaderProps = {
  title: string;
  totalLabel: string;
};

function SectionHeader({ title, totalLabel }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <AppText variant="sectionLabel" color="text3">
        {title}
      </AppText>
      <AppText variant="mono" color="text2">
        {totalLabel}
      </AppText>
    </View>
  );
}

type RecurringListProps = {
  items: RecurringItem[];
  emptyLabel: string;
};

function RecurringList({ items, emptyLabel }: RecurringListProps) {
  if (items.length === 0) {
    return (
      <AppText variant="caption" color="text3" style={styles.empty}>
        {emptyLabel}
      </AppText>
    );
  }

  return (
    <View>
      {items.slice(0, PREVIEW_LIMIT).map((item, index) => (
        <View key={item.id}>
          {index > 0 && <Hairline style={styles.rowDivider} />}
          <RecurringItemRow
            item={item}
            icon={
              item.category
                ? recurringCategoryIcon(item.type === 'income', item.category)
                : undefined
            }
          />
        </View>
      ))}
    </View>
  );
}

type RecurringSectionProps = {
  title: string;
  total: number;
  items: RecurringItem[];
  type: RecurringType;
  emptyLabel: string;
};

export function RecurringSection({ title, total, items, type, emptyLabel }: RecurringSectionProps) {
  const router = useRouter();
  const totalLabel = `${type === 'income' ? '+' : '−'}${fmtR(total)}`;

  return (
    <WidgetCard>
      <SectionHeader title={title} totalLabel={totalLabel} />
      <RecurringList items={items} emptyLabel={emptyLabel} />
      <SeeMoreLink
        section={title}
        onPress={() => router.push({ pathname: '/detail', params: { source: type } })}
      />
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
  },
  rowDivider: {
    marginVertical: Spacing.half,
  },
  empty: {
    paddingVertical: Spacing.two,
  },
});
