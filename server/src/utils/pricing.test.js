import { describe, expect, it } from 'vitest';
import { calculateSubtotal, formatMoney } from './pricing.js';

describe('pricing helpers', () => {
  it('calculates totals from integer minor units and quantities', () => {
    expect(calculateSubtotal([
      { unitPriceCents: 1299, quantity: 2 },
      { unitPriceCents: 450, quantity: 1 },
    ])).toBe(3048);
  });

  it('formats a minor-unit total as a currency amount', () => {
    expect(formatMoney(1299)).toContain('12,99');
    expect(formatMoney(1299)).toContain('€');
  });
});
