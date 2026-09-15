import { HAIKU_MODEL_ID, SONNET_MODEL_ID, getModelLimits, selectModelTier } from './modelLimits.ts';

describe('selectModelTier', () => {
  const sonnetCap = getModelLimits(SONNET_MODEL_ID).dailyLimitPerUser;
  const haikuCap = getModelLimits(HAIKU_MODEL_ID).dailyLimitPerUser;

  it('returns sonnet when no tokens have been used today', () => {
    expect(selectModelTier(0)).toBe('sonnet');
  });

  it('returns sonnet just under the sonnet threshold', () => {
    expect(selectModelTier(sonnetCap - 1)).toBe('sonnet');
  });

  it('returns haiku exactly at the sonnet threshold', () => {
    expect(selectModelTier(sonnetCap)).toBe('haiku');
  });

  it('returns haiku just under the hard cap', () => {
    expect(selectModelTier(haikuCap - 1)).toBe('haiku');
  });

  it('returns blocked exactly at the hard cap', () => {
    expect(selectModelTier(haikuCap)).toBe('blocked');
  });

  it('returns blocked well past the hard cap', () => {
    expect(selectModelTier(haikuCap + 10000)).toBe('blocked');
  });
});
