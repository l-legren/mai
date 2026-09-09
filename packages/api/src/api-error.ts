/**
 * Data layer — single error type for every Supabase call (auth + Postgres), instead of rethrowing
 * the raw client error inconsistently. Services catch this and decide what, if anything, to surface.
 */
export class ApiError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.cause = cause;
  }
}

/** Thrown when the `expenses_row_cap` trigger (SQLSTATE 'MQ001') rejects a write — see the
 * `enforce_expenses_row_cap` migration. Callers can special-case this instead of falling back to a
 * generic "something went wrong". */
export class RowLimitExceededError extends ApiError {
  constructor(cause?: unknown) {
    super('Row limit exceeded', cause);
    this.name = 'RowLimitExceededError';
  }
}

/** Used by the two functions that insert into `expenses` (single insert, bulk CSV upsert) so both
 * surface `RowLimitExceededError` the same way instead of duplicating the SQLSTATE check. */
export function throwApiError(error: { message: string; code: string }): never {
  if (error.code === 'MQ001') throw new RowLimitExceededError(error);
  throw new ApiError(error.message, error);
}
