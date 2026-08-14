import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import { Hairline } from './hairline';

type CardGroupProps = {
  children: ReactNode;
};

/** Flat card grouping rows, with a hairline divider between (not after) each — e.g. Settings' grouped lists. */
export function CardGroup({ children }: CardGroupProps) {
  const { palette } = useAppTheme();
  const rows = Children.toArray(children);

  return (
    <View style={[styles.card, { backgroundColor: palette.card }]}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <Hairline />}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
});
