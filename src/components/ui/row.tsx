import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import { AppText } from './text';

const CHEVRON_SIZE = 18;

type RowBaseProps = {
  label: string;
  /** Secondary line under the label, e.g. "A short recap every Monday". */
  subtitle?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type RowProps = RowBaseProps &
  (
    | {
        /** Tappable — opens a sheet or triggers an action. Shows `value` + a chevron. */
        onPress: () => void;
        accessibilityLabel: string;
        value?: string;
        toggle?: undefined;
      }
    | {
        /** Non-tappable — trailing `Switch`. */
        toggle: { value: boolean; onValueChange: (next: boolean) => void };
        onPress?: undefined;
        accessibilityLabel?: undefined;
        value?: undefined;
      }
    | {
        /** Non-tappable, non-toggle — plain display value (e.g. a derived field like Currency). */
        value: string;
        onPress?: undefined;
        accessibilityLabel?: undefined;
        toggle?: undefined;
      }
  );

/** Row for a `CardGroup` — label (+ optional subtitle) with either a chevron+value (tappable) or a trailing `Switch`. */
export function Row({ label, subtitle, tone = 'default', disabled, ...rest }: RowProps) {
  const { palette } = useAppTheme();

  const text = (
    <View style={styles.text}>
      <AppText variant="bodyMedium" color={tone === 'danger' ? 'bad' : 'text'}>
        {label}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" color="text3" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );

  if (rest.toggle) {
    return (
      <View style={styles.row}>
        {text}
        <Switch
          value={rest.toggle.value}
          onValueChange={rest.toggle.onValueChange}
          disabled={disabled}
          trackColor={{ false: palette.hairline, true: palette.accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={palette.hairline}
          accessibilityLabel={label}
          accessibilityState={{ selected: rest.toggle.value }}
        />
      </View>
    );
  }

  if (rest.onPress) {
    return (
      <Pressable
        onPress={rest.onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={rest.accessibilityLabel}
        style={({ pressed }) => [styles.row, { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }]}
      >
        {text}
        <View style={styles.trailing}>
          {rest.value ? (
            <AppText color="text2" accessibilityElementsHidden importantForAccessibility="no">
              {rest.value}
            </AppText>
          ) : null}
          <Ionicons
            name="chevron-forward"
            size={CHEVRON_SIZE}
            color={palette.text3}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View accessible accessibilityLabel={`${label}: ${rest.value}`} style={styles.row}>
      <View importantForAccessibility="no-hide-descendants" style={styles.staticRow}>
        {text}
        <AppText color="text3">{rest.value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 54,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  text: {
    flex: 1,
  },
  staticRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    marginTop: Spacing.half,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
