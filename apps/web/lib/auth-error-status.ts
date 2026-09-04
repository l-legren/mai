import type { AuthErrorCode } from '@moniq/auth';

const STATUS_BY_CODE: Record<AuthErrorCode, number> = {
  invalidInput: 400,
  invalidCredentials: 401,
  emailInUse: 409,
  unknown: 500,
};

export function authErrorStatus(code: AuthErrorCode): number {
  return STATUS_BY_CODE[code];
}
