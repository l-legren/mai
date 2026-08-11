import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldEditSheet } from '@/components/ui/field-edit-sheet';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { useUpdateProfile } from '@/hooks/use-profile';
import { type Profile } from '@/services/profile.service';

type NameEditFormProps = {
  onClose: () => void;
  profile: Profile;
};

/** Mounted fresh each time the sheet opens, so its local state can seed from `profile` once. */
function NameEditForm({ onClose, profile }: NameEditFormProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [surname, setSurname] = useState(profile.surname);

  const saveDisabled = firstName.trim().length === 0;

  const handleSave = () => {
    if (saveDisabled) return;
    updateProfile.mutate({ firstName: firstName.trim(), surname: surname.trim() });
    onClose();
  };

  return (
    <FieldEditSheet
      visible
      onClose={onClose}
      title={t('settings.nameSheet.title')}
      onSave={handleSave}
      saveDisabled={saveDisabled}
      errorMessage={updateProfile.isError ? t('settings.nameSheet.saveError') : null}
    >
      <TextField
        label={t('settings.nameSheet.firstNameLabel')}
        placeholder={t('settings.nameSheet.firstNamePlaceholder')}
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        autoFocus
      />
      <TextField
        label={t('settings.nameSheet.surnameLabel')}
        placeholder={t('settings.nameSheet.surnamePlaceholder')}
        value={surname}
        onChangeText={setSurname}
        autoCapitalize="words"
      />
    </FieldEditSheet>
  );
}

type NameEditSheetProps = {
  visible: boolean;
  onClose: () => void;
  profile: Profile;
};

/** Edit sheet for the Personal group's "Name" row — first name + surname. */
export function NameEditSheet({ visible, onClose, profile }: NameEditSheetProps) {
  if (!visible)
    return (
      <Sheet visible={false} onClose={onClose} size="compact">
        {null}
      </Sheet>
    );
  return <NameEditForm onClose={onClose} profile={profile} />;
}
