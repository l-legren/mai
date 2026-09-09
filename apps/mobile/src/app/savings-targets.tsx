import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TargetRow } from '@/components/savings-targets/target-row';
import { DetailHeader } from '@/components/detail/detail-header';
import { Hairline } from '@/components/ui/hairline';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { Spacing } from '@/constants/theme';
import { useSavingsTargets } from '@/hooks/use-savings-targets';
import { sortByPriority } from '@/services/savings-targets.service';

export default function SavingsTargetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: targets = [] } = useSavingsTargets();
  const sorted = sortByPriority(targets);

  return (
    <Screen edges={['top']}>
      <DetailHeader
        title={t('savingsTargets.title')}
        onBack={() => router.back()}
        onAdd={() => router.push('/add-savings-target')}
        addLabel={t('savingsTargets.addTarget')}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WidgetCard>
          {sorted.length === 0 ? (
            <AppText variant="caption" color="text3">
              {t('savingsTargets.empty')}
            </AppText>
          ) : (
            sorted.map((target, rowIndex) => (
              <View key={target.id}>
                {rowIndex > 0 && <Hairline style={styles.rowDivider} />}
                <TargetRow target={target} />
              </View>
            ))
          )}
        </WidgetCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  rowDivider: {
    marginVertical: Spacing.half,
  },
});
