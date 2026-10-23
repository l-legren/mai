import { withScopedRead, withScopedWrite } from '../db.ts';
import { addDailyTokensUsed, getDailyTokensUsed, getGlobalDailyTokensUsed } from './usage.ts';

jest.mock('../db.ts');

const mockedWithScopedRead = withScopedRead as jest.MockedFunction<typeof withScopedRead>;
const mockedWithScopedWrite = withScopedWrite as jest.MockedFunction<typeof withScopedWrite>;

function fakeTx(rows: unknown[]) {
  return (() => Promise.resolve(rows)) as unknown as Parameters<
    Parameters<typeof withScopedRead>[1]
  >[0];
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('getDailyTokensUsed', () => {
  it('returns the stored count for today', async () => {
    mockedWithScopedRead.mockImplementation((_userId, fn) => fn(fakeTx([{ tokens_used: 4200 }])));

    await expect(getDailyTokensUsed('user-1')).resolves.toBe(4200);
  });

  it('returns 0 when there is no row for today', async () => {
    mockedWithScopedRead.mockImplementation((_userId, fn) => fn(fakeTx([])));

    await expect(getDailyTokensUsed('user-1')).resolves.toBe(0);
  });

  it('fails open to 0 when the read throws', async () => {
    mockedWithScopedRead.mockRejectedValue(new Error('connection refused'));

    await expect(getDailyTokensUsed('user-1')).resolves.toBe(0);
  });
});

describe('getGlobalDailyTokensUsed', () => {
  it('returns the global total for today', async () => {
    mockedWithScopedRead.mockImplementation((_userId, fn) => fn(fakeTx([{ total: 84000 }])));

    await expect(getGlobalDailyTokensUsed('user-1')).resolves.toBe(84000);
  });

  it('returns 0 when there is no usage yet today', async () => {
    mockedWithScopedRead.mockImplementation((_userId, fn) => fn(fakeTx([])));

    await expect(getGlobalDailyTokensUsed('user-1')).resolves.toBe(0);
  });

  it('fails open to 0 when the read throws', async () => {
    mockedWithScopedRead.mockRejectedValue(new Error('connection refused'));

    await expect(getGlobalDailyTokensUsed('user-1')).resolves.toBe(0);
  });
});

describe('addDailyTokensUsed', () => {
  it('does not throw when the write fails', async () => {
    mockedWithScopedWrite.mockRejectedValue(new Error('connection refused'));

    await expect(addDailyTokensUsed('user-1', 500)).resolves.toBeUndefined();
  });
});
