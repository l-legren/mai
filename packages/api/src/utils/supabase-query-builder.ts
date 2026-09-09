/**
 * Minimal chainable stand-in for Supabase's PostgrestFilterBuilder, for data-layer tests that stub
 * `supabase.from(...)`. Every filter/modifier method returns the same builder; awaiting it (or calling
 * `.single()`) resolves to the configured `{ data, error }` result.
 */

export type QueryResult<T> = {
  data: T;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

export function mockQueryBuilder<T>(result: QueryResult<T>) {
  const builder: Record<string, unknown> = {
    select: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    upsert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    order: jest.fn(() => builder),
    range: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(result)),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: (onFulfilled: (result: QueryResult<T>) => unknown) =>
      Promise.resolve(result).then(onFulfilled),
  };
  return builder;
}
