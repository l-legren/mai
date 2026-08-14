import { useMutation } from '@tanstack/react-query';

import { deleteAccountAndSignOut } from '@/services/auth.service';

export function useDeleteAccount() {
  return useMutation({ mutationFn: deleteAccountAndSignOut });
}
