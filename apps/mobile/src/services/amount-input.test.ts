import { applyAmountKey } from './amount-input';

describe('applyAmountKey', () => {
  it('appends digits and replaces a lone leading zero', () => {
    expect(applyAmountKey('', '1')).toBe('1');
    expect(applyAmountKey('0', '5')).toBe('5');
    expect(applyAmountKey('12', '3')).toBe('123');
  });

  it('allows only one decimal point and prefixes a zero', () => {
    expect(applyAmountKey('', '.')).toBe('0.');
    expect(applyAmountKey('12', '.')).toBe('12.');
    expect(applyAmountKey('12.5', '.')).toBe('12.5');
  });

  it('caps at two decimals', () => {
    expect(applyAmountKey('12.50', '9')).toBe('12.50');
    expect(applyAmountKey('12.5', '9')).toBe('12.59');
  });

  it('caps at six significant digits', () => {
    expect(applyAmountKey('123456', '7')).toBe('123456');
  });

  it('deletes the last character', () => {
    expect(applyAmountKey('12.5', 'del')).toBe('12.');
    expect(applyAmountKey('', 'del')).toBe('');
  });
});
