import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { FontFamily, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type AssistantMessageProps = {
  /** Each line is its own short message, per the design's "reaction, substance, aside" rhythm. */
  lines: string[];
  /** Muted "what I looked at" line shown once the reply has finished. */
  statusLine?: string;
};

const BOLD_MARKER = /\*\*(.+?)\*\*/g;

/** Splits `**amount**`-marked segments out of a translated line for inline-bold rendering. */
function renderLine(line: string) {
  const segments: { text: string; bold: boolean }[] = [];
  let cursor = 0;

  for (const match of line.matchAll(BOLD_MARKER)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ text: line.slice(cursor, index), bold: false });
    segments.push({ text: match[1], bold: true });
    cursor = index + match[0].length;
  }
  if (cursor < line.length) segments.push({ text: line.slice(cursor), bold: false });

  return segments;
}

/**
 * The agent's own talk: bare text on the background, never a bubble — only the user's messages
 * and the permission-confirm block get a container (see `UserMessageBubble` / `ConfirmActionCard`).
 * Numbers stay bold inline rather than in their own stat block, per the design.
 */
export function AssistantMessage({ lines, statusLine }: AssistantMessageProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.stack}>
      {lines.map((line, index) => (
        <AppText key={index}>
          {renderLine(line).map((segment, segmentIndex) => (
            <Fragment key={segmentIndex}>
              {segment.bold ? <AppText style={styles.bold}>{segment.text}</AppText> : segment.text}
            </Fragment>
          ))}
        </AppText>
      ))}
      {statusLine ? (
        <View style={styles.statusRow}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[styles.dot, { backgroundColor: palette.text3 }]}
          />
          <AppText variant="small" color="text3">
            {statusLine}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.two,
  },
  bold: {
    fontFamily: FontFamily.bold,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.half,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
