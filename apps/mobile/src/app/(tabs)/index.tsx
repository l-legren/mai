import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { BalancePage } from '@/components/today/balance-page';
import { EntryArea } from '@/components/today/entry-area';
import { ResistedPager } from '@/components/today/resisted-pager';
import { ScrollHint } from '@/components/today/scroll-hint';
import { TodayHeader } from '@/components/today/today-header';
import { Spacing } from '@/constants/theme';
import { applyAmountKey, type AmountKey } from '@/services/amount-input';

export default function TodayScreen() {
  const router = useRouter();
  const [draftAmount, setDraftAmount] = useState('');

  const hasAmount = parseFloat(draftAmount) > 0;

  const handleKey = (key: AmountKey) => setDraftAmount((current) => applyAmountKey(current, key));

  const openCategoryPicker = () => {
    if (hasAmount) router.push({ pathname: '/add-expense', params: { amount: draftAmount } });
  };

  // The add-expense modal owns category selection + submission; clear the draft whenever this
  // screen regains focus (confirmed or cancelled — either way the keypad should start fresh).
  useFocusEffect(
    useCallback(() => {
      setDraftAmount('');
    }, [])
  );

  return (
    // `NativeTabs` renders a real, edge-to-edge translucent tab bar — content isn't shrunk to
    // make room for it like a JS tab bar would; only the bottom safe-area inset grows to cover
    // it. Without the `bottom` edge here, the pager's absolutely-positioned scroll hint renders
    // underneath the tab bar instead of above it.
    <Screen edges={['top', 'bottom']}>
      <ResistedPager
        hint={<ScrollHint />}
        front={
          <View style={styles.front}>
            <TodayHeader />
            <EntryArea
              draftAmount={draftAmount}
              hasAmount={hasAmount}
              onKeyPress={handleKey}
              onAdd={openCategoryPicker}
            />
          </View>
        }
        back={<BalancePage />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  front: {
    flex: 1,
    // Reserve room at the bottom for the "scroll for balance" hint.
    paddingBottom: Spacing.six,
  },
});
