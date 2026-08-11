import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

import { GradientBackground } from '@/components/ui/gradient-background';
import { useAppTheme } from '@/hooks/use-app-theme';

type ScreenProps = ViewProps & {
  /** Which safe-area edges to inset. Defaults to all. */
  edges?: readonly Edge[];
  /**
   * `gradient` (default) is the subtle `bgGradient` glow — the app's default background.
   * `flat` is the plain `bg` fill, reserved for screens that opt out (e.g. Login).
   */
  background?: 'flat' | 'gradient';
};

/** Full-screen container with the app background + safe-area insets. */
export function Screen({ style, edges, background = 'gradient', children, ...rest }: ScreenProps) {
  const { palette } = useAppTheme();

  if (background === 'gradient') {
    return (
      <GradientBackground>
        <SafeAreaView edges={edges} style={[{ flex: 1 }, style]} {...rest}>
          {children}
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: palette.bg }, style]} {...rest}>
      {children}
    </SafeAreaView>
  );
}
