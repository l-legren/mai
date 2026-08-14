import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { DetailHeader } from '@/components/detail/detail-header';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from '@/components/ui/category-grid';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import {
  CATEGORY_ICONS,
  CATEGORY_IDS,
  CATEGORY_LABEL_KEYS,
  type CategoryId,
} from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useAddExpense } from '@/hooks/use-expenses';

export default function AddExpenseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [note, setNote] = useState('');
  const addExpense = useAddExpense();

  const parsedAmount = parseFloat(amount ?? '');
  const display = `€${amount}`;
  const isOther = category === 'other';

  const handleSelectCategory = (id: CategoryId) => {
    setCategory(id);
    if (id !== 'other') setNote('');
  };

  const handleConfirm = async () => {
    if (category === null || !(parsedAmount > 0)) return;
    const trimmedNote = note.trim();
    // Await so the write (and its optimistic cache update) is guaranteed to land before we
    // navigate away — a fire-and-forget mutate() raced with router.back() when the keyboard
    // was open for the note field, since the Confirm button sat hidden behind it.
    await addExpense.mutateAsync({
      category,
      amount: parsedAmount,
      note: isOther && trimmedNote ? trimmedNote : undefined,
    });
    router.back();
  };

  return (
    <Screen edges={['top']} background="flat">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <DetailHeader
          title={t('today.chooseCategory')}
          onBack={() => router.back()}
          variant="modal"
        />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText
            variant="hero"
            style={styles.center}
            accessibilityLabel={t('today.amount', { amount: display })}
          >
            {display}
          </AppText>

          <View style={styles.gridBlock}>
            <CategoryGrid
              ids={CATEGORY_IDS}
              category={category}
              labelKeys={CATEGORY_LABEL_KEYS}
              icons={CATEGORY_ICONS}
              onSelect={handleSelectCategory}
            />
          </View>

          {isOther && (
            <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
              <TextField
                label={t('today.noteLabel')}
                value={note}
                onChangeText={setNote}
                placeholder={t('today.notePlaceholder')}
                autoCapitalize="sentences"
              />
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            label={t('common.confirm')}
            disabled={category === null}
            onPress={handleConfirm}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
  gridBlock: {
    paddingBottom: Spacing.four,
  },
  actions: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
