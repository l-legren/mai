import type { AuthErrorCode } from '@mai/auth';

export type AuthFormState = {
  errorCode: AuthErrorCode | null;
  confirmationPending: boolean;
};

export const initialAuthFormState: AuthFormState = {
  errorCode: null,
  confirmationPending: false,
};
