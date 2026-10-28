import { embedMany } from 'ai';
import { embedTexts } from './embeddings.ts';

jest.mock('ai', () => ({
  embedMany: jest.fn(),
}));
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: () => ({ embeddingModel: (id: string) => id }),
}));

const mockedEmbedMany = embedMany as jest.MockedFunction<typeof embedMany>;

afterEach(() => {
  jest.resetAllMocks();
});

describe('embedTexts', () => {
  it('returns [] without calling embedMany for an empty input', async () => {
    await expect(embedTexts([])).resolves.toEqual([]);
    expect(mockedEmbedMany).not.toHaveBeenCalled();
  });

  it('returns the embeddings for the given texts', async () => {
    mockedEmbedMany.mockResolvedValue({ embeddings: [[0.1, 0.2]] } as never);

    await expect(embedTexts(['rent payment'])).resolves.toEqual([[0.1, 0.2]]);
  });

  it('propagates a rejection from embedMany', async () => {
    mockedEmbedMany.mockRejectedValue(new Error('rate limited'));

    await expect(embedTexts(['rent payment'])).rejects.toThrow('rate limited');
  });
});
