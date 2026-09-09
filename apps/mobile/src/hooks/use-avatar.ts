import { useMutation, useQuery } from '@tanstack/react-query';

import { getAvatarUrl, uploadAvatar } from '@/services/avatar.service';

import { queryKeys } from './query-keys';

export function useUploadAvatar() {
  return useMutation({
    mutationFn: ({ bytes, contentType }: { bytes: ArrayBuffer; contentType: string }) =>
      uploadAvatar(bytes, contentType),
  });
}

/** Resolves a stored avatar path to a displayable (time-limited) signed URL. */
export function useAvatarUrl(path: string | null) {
  return useQuery({
    queryKey: queryKeys.avatarUrl(path ?? ''),
    queryFn: () => getAvatarUrl(path as string),
    enabled: !!path,
  });
}
