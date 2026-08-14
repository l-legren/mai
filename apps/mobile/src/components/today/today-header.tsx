import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAvatarUrl } from '@/hooks/use-avatar';
import { useProfile } from '@/hooks/use-profile';

function greetingKey(hour: number): string {
  if (hour < 12) return 'today.greetingMorning';
  if (hour < 18) return 'today.greetingAfternoon';
  return 'today.greetingEvening';
}

export function TodayHeader() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: avatarUrl } = useAvatarUrl(profile?.avatarUrl ?? null);

  const now = new Date();
  const dateLabel = format(now, "EEEE '·' d MMMM");
  const firstName = profile?.firstName ?? '';
  const initial = firstName.trim().charAt(0).toUpperCase() || '?';
  const greeting = t(greetingKey(now.getHours()), { name: firstName });

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel={t('today.openSettings')}
        style={[styles.avatar, { backgroundColor: palette.card, borderColor: palette.hairline }]}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.photo}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <AppText variant="bodyMedium" importantForAccessibility="no">
            {initial}
          </AppText>
        )}
      </Pressable>

      <View style={styles.textColumn}>
        <AppText variant="small" color="text3">
          {dateLabel}
        </AppText>
        <AppText variant="title">{greeting}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  textColumn: {
    flex: 1,
    gap: Spacing.half,
  },
});
