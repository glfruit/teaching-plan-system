import { describe, expect, it } from 'bun:test';
import { isDatabaseTestEnabled } from './withDatabase';

describe('isDatabaseTestEnabled', () => {
  it('returns false when DATABASE_URL is missing', () => {
    expect(isDatabaseTestEnabled({})).toBe(false);
  });

  it('returns true when DATABASE_URL exists', () => {
    expect(isDatabaseTestEnabled({ DATABASE_URL: 'postgresql://localhost/test' })).toBe(true);
  });
});
