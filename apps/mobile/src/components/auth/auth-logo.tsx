import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

const MARK_SIZE = 52;

/** App icon mark, circularly cropped to match the auth screen's monogram treatment. */
export function AuthLogo() {
  const { palette } = useAppTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.mark, { borderColor: palette.hairline }]}
    >
      <Image style={styles.image} source={require('@/assets/images/icon.png')} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: MARK_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
