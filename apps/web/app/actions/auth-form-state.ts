import type { AuthErrorCode } from '@moniq/auth';

export type AuthFormState = {
  errorCode: AuthErrorCode | null;
  confirmationPending: boolean;
};

export const initialAuthFormState: AuthFormState = {
  errorCode: null,
  confirmationPending: false,
};
