import { Laminar } from '@lmnr-ai/lmnr';
import { initializeObservability } from './observability.ts';

jest.mock('@lmnr-ai/lmnr', () => ({
  Laminar: { initialize: jest.fn() },
}));

const mockedInitialize = Laminar.initialize as jest.MockedFunction<typeof Laminar.initialize>;

// Importing the module itself auto-invokes `initializeObservability` once as a side effect
// (see observability.ts) — clear that call before each test, not just between them.
beforeEach(() => {
  jest.clearAllMocks();
});

describe('initializeObservability', () => {
  it('skips Laminar.initialize when no API key is set', () => {
    initializeObservability(undefined);

    expect(mockedInitialize).not.toHaveBeenCalled();
  });

  it('initializes Laminar with the given API key', () => {
    initializeObservability('test-key');

    expect(mockedInitialize).toHaveBeenCalledWith({ projectApiKey: 'test-key' });
  });
});
