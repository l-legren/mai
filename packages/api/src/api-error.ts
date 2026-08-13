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
