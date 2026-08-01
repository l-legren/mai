// NativeTabs renders a real native UITabBar/BottomNavigationView (gets iOS 26 Liquid Glass for
// free), unlike expo-router's plain `Tabs`, which is a JS-rendered React Navigation view. The
// `unstable-native-tabs` import path is genuinely unstable upstream — active development through
// SDK 56 (icons, Android props, a11y) but Expo has committed to no stabilization date, so expect
// to revisit this on future SDK bumps.
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <NativeTabs
      iconColor={{ default: palette.text3, selected: palette.accent }}
      // backgroundColor is read on both platforms (per expo-router's NativeTabOptions),
      // so it's gated to Android only — iOS keeps its native Liquid Glass background.
      backgroundColor={Platform.OS === 'android' ? palette.tabBarBg : undefined}
      indicatorColor={palette.accentLight}
      rippleColor={palette.accentLight}
      labelVisibilityMode="unlabeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house" md="home" />
        {/* Icon-only per the redesign; `hidden` keeps the title as the native accessibility label. */}
        <NativeTabs.Trigger.Label hidden>{t('tabs.today')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recurring">
        <NativeTabs.Trigger.Icon sf="repeat" md="repeat" />
        <NativeTabs.Trigger.Label hidden>{t('tabs.recurring')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Icon sf="chart.bar" md="bar_chart" />
        <NativeTabs.Trigger.Label hidden>{t('tabs.insights')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
