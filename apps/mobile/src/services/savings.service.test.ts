import { setSavingsGoal } from './savings.service';

jest.mock('@mai/api', () => ({
  ...jest.requireActual('@mai/api'),
  saveSavingsGoalValue: jest.fn().mockResolvedValue(undefined),
}));

describe('setSavingsGoal', () => {
  it('rounds to the nearest whole number', () => {
    expect(setSavingsGoal(349.6)).resolves.toBe(350);
  });

  it('clamps negative input to 0', () => {
    expect(setSavingsGoal(-20)).resolves.toBe(0);
  });
});
