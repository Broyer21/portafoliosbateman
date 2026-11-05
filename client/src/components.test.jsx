import { describe, expect, it } from 'vitest';
import { money } from './components.jsx';

describe('money helper', () => {
  it('formats minor units to euro currency', () => {
    expect(money(2599)).toContain('25,99');
    expect(money(2599)).toContain('€');
  });
});
