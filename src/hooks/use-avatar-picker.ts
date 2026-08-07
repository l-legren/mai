import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useTransition } from 'react';

import { useUploadAvatar } from './use-avatar';

type AvatarPickerState = 'empty' | 'granted' | 'denied';

/**
 * Avatars are only ever displayed at small sizes (≤96px, even at 3x density that's ~288px) — no
 * need to upload anything larger. Square-cropped + resized + JPEG-compressed client-side keeps
 * uploads in the tens-of-KB range instead of whatever the camera roll originally produced.
 */
const AVATAR_EDGE_PX = 256;
const AVATAR_JPEG_QUALITY = 0.7;

async function processPickedImage(uri: string): Promise<Blob> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: AVATAR_EDGE_PX, height: AVATAR_EDGE_PX } }],
    { compress: AVATAR_JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  const response = await fetch(manipulated.uri);
  return response.blob();
}

type UseAvatarPickerOptions = {
  onUploaded: (path: string) => void;
  onStateChange: (state: AvatarPickerState) => void;
};

/** Shared pick → resize → upload flow, used by both the avatar circle and the "Choose photo" button. */
export function useAvatarPicker({ onUploaded, onStateChange }: UseAvatarPickerOptions) {
  const uploadAvatar = useUploadAvatar();
  const [isPending, startPicking] = useTransition();

  const pick = () => {
    startPicking(async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        onStateChange('denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (result.canceled || !result.assets[0]) return;

      const blob = await processPickedImage(result.assets[0].uri);
      const path = await uploadAvatar.mutateAsync({ bytes: blob, contentType: 'image/jpeg' });
      onUploaded(path);
      onStateChange('granted');
    });
  };

  return { pick, isProcessing: isPending, isError: uploadAvatar.isError };
}
