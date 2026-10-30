import { PostgresStore } from '@langchain/langgraph-checkpoint-postgres/store';
import { indexUserMemory, searchUserMemories } from './store.ts';

jest.mock('@langchain/langgraph-checkpoint-postgres/store', () => ({
  PostgresStore: { fromConnString: jest.fn() },
}));
jest.mock('./embeddings.ts', () => ({ embedTexts: jest.fn(), EMBEDDING_DIMS: 1536 }));

const mockedFromConnString = PostgresStore.fromConnString as jest.MockedFunction<
  typeof PostgresStore.fromConnString
>;

const put = jest.fn();
const search = jest.fn();

beforeEach(() => {
  process.env.LANGGRAPH_DATABASE_URL = 'postgresql://example';
  mockedFromConnString.mockReturnValue({ put, search } as never);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('indexUserMemory', () => {
  it('does not throw when the store write fails', async () => {
    put.mockRejectedValue(new Error('connection refused'));

    await expect(indexUserMemory('user-1', 'saving for a house')).resolves.toBeUndefined();
  });

  it('writes the fact keyed by a deterministic hash of its content', async () => {
    put.mockResolvedValue(undefined);

    await indexUserMemory('user-1', 'saving for a house');
    await indexUserMemory('user-1', 'saving for a house');

    const [, firstKey] = put.mock.calls[0];
    const [, secondKey] = put.mock.calls[1];
    expect(firstKey).toBe(secondKey);
  });
});

describe('searchUserMemories', () => {
  it('returns [] when the search fails', async () => {
    search.mockRejectedValue(new Error('connection refused'));

    await expect(searchUserMemories('user-1', 'rent')).resolves.toEqual([]);
  });

  it('maps search results to their content strings, in order', async () => {
    search.mockResolvedValue([
      { value: { content: 'landlord payment due the 1st' } },
      { value: { content: 'saving for a house' } },
    ]);

    await expect(searchUserMemories('user-1', 'rent')).resolves.toEqual([
      'landlord payment due the 1st',
      'saving for a house',
    ]);
  });
});
