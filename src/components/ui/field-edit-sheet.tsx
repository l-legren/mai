import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { EditSheetHeader } from './edit-sheet-header';
import { FormError } from './form-error';
import { Sheet } from './sheet';

type FieldEditSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSave: () => void;
  saveDisabled?: boolean;
  errorMessage?: string | null;
  /** The sheet's `TextField`(s) — one for a single-field edit (City), several for a group (Name). */
  children: ReactNode;
};

/**
 * Shell for a single-purpose edit sheet: Cancel/Save header + field(s) + error message. Each field
 * is a plain `TextField` passed in as a child — state and save logic stay with the caller, since
 * those are specific to what's being edited (e.g. Settings' Name/City sheets).
 */
export function FieldEditSheet({
  visible,
  onClose,
  title,
  onSave,
  saveDisabled,
  errorMessage,
  children,
}: FieldEditSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} size="compact">
      <EditSheetHeader
        title={title}
        onCancel={onClose}
        onSave={onSave}
        saveDisabled={saveDisabled}
      />
      <View style={styles.content}>
        {children}
        <FormError message={errorMessage ?? null} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
});
