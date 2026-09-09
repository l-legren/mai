import { StyleSheet, View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

/** 1px separator. Used instead of card borders/shadows. Hidden from assistive tech. */
export function Hairline({ style, ...rest }: ViewProps) {
  const { palette } = useAppTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.line, { backgroundColor: palette.hairline }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
