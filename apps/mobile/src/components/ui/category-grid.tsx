import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { type IoniconName } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const TILE_ICON_SIZE = 26;
const TILE_BADGE_SIZE = 52;

type CategoryTileProps<T extends string> = {
  id: T;
  label: string;
  icon: IoniconName;
  selected: boolean;
  onSelect: (id: T) => void;
};

function CategoryTile<T extends string>({
  id,
  label,
  icon,
  selected,
  onSelect,
}: CategoryTileProps<T>) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <Pressable
      onPress={() => onSelect(id)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={t('today.selectCategory', { category: label })}
      style={styles.tile}
    >
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[
          styles.badge,
          {
            backgroundColor: selected ? palette.accentLight : palette.card,
            borderColor: selected ? palette.accent : palette.hairline,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={TILE_ICON_SIZE}
          color={selected ? palette.accent : palette.text2}
        />
      </View>
      <AppText
        variant="caption"
        color={selected ? 'accent' : 'text2'}
        style={styles.label}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export type CategoryGridProps<T extends string> = {
  ids: readonly T[];
  category: T | null;
  labelKeys: Record<T, string>;
  icons: Record<T, IoniconName>;
  onSelect: (id: T) => void;
};

/** Grid of icon tiles for picking a category from any fixed id set (expense, income, recurring cost…). */
export function CategoryGrid<T extends string>({
  ids,
  category,
  labelKeys,
  icons,
  onSelect,
}: CategoryGridProps<T>) {
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {ids.map((id) => (
        <CategoryTile
          key={id}
          id={id}
          label={t(labelKeys[id])}
          icon={icons[id]}
          selected={id === category}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tile: {
    width: '30%',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    width: TILE_BADGE_SIZE,
    height: TILE_BADGE_SIZE,
    borderRadius: TILE_BADGE_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
