import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeOnboarding,
  getProfile,
  updateProfile,
  type NewProfile,
  type ProfileUpdate,
} from '@/services/profile.service';

import { queryKeys } from './query-keys';

/** `data` is `null` when the signed-in user hasn't completed onboarding yet. */
export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile(), queryFn: getProfile });
}

export function useCompleteOnboarding() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: NewProfile) => completeOnboarding(input),
    onSuccess: (profile) => client.setQueryData(queryKeys.profile(), profile),
  });
}

export function useUpdateProfile() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileUpdate) => updateProfile(input),
    onSuccess: (profile) => client.setQueryData(queryKeys.profile(), profile),
  });
}
