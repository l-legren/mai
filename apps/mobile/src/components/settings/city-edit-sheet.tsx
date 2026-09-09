import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldEditSheet } from '@/components/ui/field-edit-sheet';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { useUpdateProfile } from '@/hooks/use-profile';
import { type Profile } from '@/services/profile.service';

type CityEditFormProps = {
  onClose: () => void;
  profile: Profile;
};

/** Mounted fresh each time the sheet opens, so its local state can seed from `profile` once. */
function CityEditForm({ onClose, profile }: CityEditFormProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [city, setCity] = useState(profile.city);

  const saveDisabled = city.trim().length === 0;

  const handleSave = () => {
    if (saveDisabled) return;
    updateProfile.mutate({ city: city.trim() });
    onClose();
  };

  return (
    <FieldEditSheet
      visible
      onClose={onClose}
      title={t('settings.citySheet.title')}
      onSave={handleSave}
      saveDisabled={saveDisabled}
      errorMessage={updateProfile.isError ? t('settings.citySheet.saveError') : null}
    >
      <TextField
        label={t('settings.citySheet.cityLabel')}
        placeholder={t('settings.citySheet.cityPlaceholder')}
        value={city}
        onChangeText={setCity}
        autoCapitalize="words"
        autoFocus
      />
    </FieldEditSheet>
  );
}

type CityEditSheetProps = {
  visible: boolean;
  onClose: () => void;
  profile: Profile;
};

/** Edit sheet for the Personal group's "City" row. */
export function CityEditSheet({ visible, onClose, profile }: CityEditSheetProps) {
  if (!visible)
    return (
      <Sheet visible={false} onClose={onClose} size="compact">
        {null}
      </Sheet>
    );
  return <CityEditForm onClose={onClose} profile={profile} />;
}
