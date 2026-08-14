import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { DetailHeader } from '@/components/detail/detail-header';
import { MonthPicker } from '@/components/recurring/month-picker';
import { PriorityBadge } from '@/components/savings-targets/priority-badge';
import { VerdictBanner } from '@/components/savings-targets/verdict-banner';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from '@/components/ui/category-grid';
import { FormError } from '@/components/ui/form-error';
import { PillToggle } from '@/components/ui/pill-toggle';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import {
  SAVINGS_TARGET_CATEGORY_ICONS,
  SAVINGS_TARGET_CATEGORY_IDS,
  SAVINGS_TARGET_CATEGORY_LABEL_KEYS,
  type SavingsTargetCategoryId,
} from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useDraftSavingsTarget } from '@/hooks/use-savings-target-draft';
import { useCreateSavingsTarget } from '@/hooks/use-savings-targets';
import type { SavingsTargetPriority } from '@/services/savings-targets.service';

type Step = 'prompt' | 'review';

const PRIORITY_LABEL_KEYS = {
  high: 'savingsTargets.priority.high',
  medium: 'savingsTargets.priority.medium',
  low: 'savingsTargets.priority.low',
} as const;

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export default function AddSavingsTargetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const draftTarget = useDraftSavingsTarget();
  const createTarget = useCreateSavingsTarget();

  const [step, setStep] = useState<Step>('prompt');
  const [prompt, setPrompt] = useState('');
  const [approxAmount, setApproxAmount] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SavingsTargetCategoryId>('other');
  const [goalAmount, setGoalAmount] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [priority, setPriority] = useState<SavingsTargetPriority>('medium');
  const [verdict, setVerdict] = useState('');

  const parsedApproxAmount = parseFloat(approxAmount) || 0;
  const canContinue = prompt.trim().length > 0 && parsedApproxAmount > 0;

  const parsedGoalAmount = parseFloat(goalAmount) || 0;
  const canConfirm =
    name.trim().length > 0 && parsedGoalAmount > 0 && MONTH_PATTERN.test(targetMonth);

  const handleContinue = async () => {
    if (!canContinue) return;
    const draft = await draftTarget.mutateAsync({
      prompt: prompt.trim(),
      approxAmount: parsedApproxAmount,
    });
    setName(draft.name);
    setCategory(draft.category);
    setGoalAmount(String(draft.goalAmount));
    setTargetMonth(draft.targetDate.slice(0, 7));
    setPriority(draft.priority);
    setVerdict(draft.aiVerdict);
    setStep('review');
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await createTarget.mutateAsync({
      name: name.trim(),
      category,
      goalAmount: parsedGoalAmount,
      targetDate: `${targetMonth}-01`,
      priority,
      aiVerdict: verdict,
    });
    router.back();
  };

  const title =
    step === 'prompt' ? t('addSavingsTarget.promptTitle') : t('addSavingsTarget.reviewTitle');

  return (
    <Screen edges={['top']} background="flat">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <DetailHeader title={title} onBack={() => router.back()} variant="modal" />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'prompt' ? (
            <>
              <TextField
                label={t('addSavingsTarget.promptLabel')}
                value={prompt}
                onChangeText={setPrompt}
                placeholder={t('addSavingsTarget.promptPlaceholder')}
                autoCapitalize="sentences"
              />
              <TextField
                label={t('addSavingsTarget.amountLabel')}
                value={approxAmount}
                onChangeText={(text) => setApproxAmount(text.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                keyboardType="decimal-pad"
              />
              <FormError message={draftTarget.isError ? draftTarget.error?.message : null} />
            </>
          ) : (
            <>
              <VerdictBanner verdict={verdict} />

              <TextField
                label={t('addSavingsTarget.nameLabel')}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <View style={styles.field}>
                <AppText variant="sectionLabel" color="text3">
                  {t('addSavingsTarget.categoryLabel')}
                </AppText>
                <CategoryGrid
                  ids={SAVINGS_TARGET_CATEGORY_IDS}
                  category={category}
                  labelKeys={SAVINGS_TARGET_CATEGORY_LABEL_KEYS}
                  icons={SAVINGS_TARGET_CATEGORY_ICONS}
                  onSelect={setCategory}
                />
              </View>

              <TextField
                label={t('addSavingsTarget.goalAmountLabel')}
                value={goalAmount}
                onChangeText={(text) => setGoalAmount(text.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                keyboardType="decimal-pad"
              />

              <View style={styles.field}>
                <AppText variant="sectionLabel" color="text3">
                  {t('addSavingsTarget.targetDateLabel')}
                </AppText>
                <MonthPicker value={targetMonth} onChange={setTargetMonth} />
              </View>

              <View style={styles.field}>
                <View style={styles.priorityHeader}>
                  <AppText variant="sectionLabel" color="text3">
                    {t('addSavingsTarget.priorityLabel')}
                  </AppText>
                  <PriorityBadge priority={priority} label={t(PRIORITY_LABEL_KEYS[priority])} />
                </View>
                <PillToggle
                  options={[
                    { value: 'low', label: t('savingsTargets.priority.low') },
                    { value: 'medium', label: t('savingsTargets.priority.medium') },
                    { value: 'high', label: t('savingsTargets.priority.high') },
                  ]}
                  value={priority}
                  onChange={setPriority}
                />
              </View>

              <FormError message={createTarget.isError ? createTarget.error?.message : null} />
            </>
          )}
        </ScrollView>

        <View style={styles.actions}>
          {step === 'prompt' ? (
            <Button
              label={t('addSavingsTarget.continue')}
              disabled={!canContinue || draftTarget.isPending}
              onPress={handleContinue}
            />
          ) : (
            <View style={styles.reviewActions}>
              <Button
                label={t('common.cancel')}
                variant="secondary"
                onPress={() => router.back()}
                style={styles.flexButton}
              />
              <Button
                label={t('common.confirm')}
                disabled={!canConfirm || createTarget.isPending}
                onPress={handleConfirm}
                style={styles.flexButton}
              />
            </View>
          )}
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
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flexButton: {
    flex: 1,
  },
});
