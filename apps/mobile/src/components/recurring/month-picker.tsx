import Ionicons from '@expo/vector-icons/Ionicons';
import { addMonths, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

// Month abbreviations (Jan…Dec) — date formatting, exempt from i18n.
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i, 1), 'MMM'));
const SHORTCUT_MONTHS = [3, 6, 12];

const CHEVRON_SIZE = 18;
/** Grow the year chevrons to the 44px minimum target (WCAG 2.5.5) without changing their size. */
const CHEVRON_HIT_SLOP = (44 - CHEVRON_SIZE) / 2;

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** `YYYY-MM` for `n` months from today. */
function monthsAhead(n: number): string {
  return format(addMonths(new Date(), n), 'yyyy-MM');
}

type MonthShortcutsProps = {
  value: string;
  onChange: (value: string) => void;
};

function MonthShortcuts({ value, onChange }: MonthShortcutsProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View style={styles.shortcutRow}>
      {SHORTCUT_MONTHS.map((n) => {
        const target = monthsAhead(n);
        const isSelected = target === value;
        const label = t('recurring.monthsShortcut', { count: n });
        return (
          <Pressable
            key={n}
            onPress={() => onChange(target)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={label}
            style={[
              styles.shortcut,
              {
                backgroundColor: isSelected ? palette.neutralSel : palette.card,
                borderColor: isSelected ? palette.text3 : palette.hairline,
              },
            ]}
          >
            <AppText variant="bodyMedium" color={isSelected ? 'text' : 'text2'}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

type MonthPillProps = {
  label: string;
  year: number;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function MonthPill({ label, year, selected, disabled, onPress }: MonthPillProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={t('recurring.selectMonth', { month: label, year })}
      style={[
        styles.monthPill,
        {
          backgroundColor: selected ? palette.neutralSel : palette.card,
          borderColor: selected ? palette.text3 : palette.hairline,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <AppText color={disabled ? 'text3' : selected ? 'text' : 'text2'}>{label}</AppText>
    </Pressable>
  );
}

type MonthPickerProps = {
  /** Selected month as `YYYY-MM`. */
  value: string;
  onChange: (value: string) => void;
};

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1–12

  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr); // 1–12

  const canGoPrevYear = year > currentYear;
  const setYear = (nextYear: number) => onChange(`${nextYear}-${pad(month)}`);
  const setMonth = (nextMonth: number) => onChange(`${year}-${pad(nextMonth)}`);

  return (
    <View style={styles.container}>
      <MonthShortcuts value={value} onChange={onChange} />

      <View style={styles.yearRow}>
        <Pressable
          onPress={() => setYear(year - 1)}
          disabled={!canGoPrevYear}
          accessibilityRole="button"
          accessibilityLabel={t('recurring.previousYear')}
          accessibilityState={{ disabled: !canGoPrevYear }}
          hitSlop={CHEVRON_HIT_SLOP}
          style={{ opacity: canGoPrevYear ? 1 : 0.3 }}
        >
          <Ionicons name="chevron-back" size={CHEVRON_SIZE} color={palette.text2} />
        </Pressable>
        <AppText variant="bodyMedium">{year}</AppText>
        <Pressable
          onPress={() => setYear(year + 1)}
          accessibilityRole="button"
          accessibilityLabel={t('recurring.nextYear')}
          hitSlop={CHEVRON_HIT_SLOP}
        >
          <Ionicons name="chevron-forward" size={CHEVRON_SIZE} color={palette.text2} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {MONTH_LABELS.map((label, index) => {
          const monthNumber = index + 1;
          const isPast = year === currentYear && monthNumber < currentMonth;
          return (
            <MonthPill
              key={label}
              label={label}
              year={year}
              selected={monthNumber === month}
              disabled={isPast}
              onPress={() => setMonth(monthNumber)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  shortcut: {
    flex: 1,
    height: 40,
    borderRadius: Radius.base,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  monthPill: {
    flexGrow: 1,
    flexBasis: '28%',
    height: 44,
    borderRadius: Radius.base,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
