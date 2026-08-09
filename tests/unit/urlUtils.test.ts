import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { isSafeHttpUrl, safeHttpUrl } from '@/lib/utils/urlUtils';

describe('isSafeHttpUrl', () => {
  it('rejects javascript: URLs', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: URLs', () => {
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects vbscript: URLs', () => {
    expect(isSafeHttpUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('rejects ftp: URLs', () => {
    expect(isSafeHttpUrl('ftp://x')).toBe(false);
  });

  it('rejects a mixed-case JavaScript: scheme', () => {
    expect(isSafeHttpUrl('JavaScript:alert(1)')).toBe(false);
  });

  it('rejects javascript: with leading whitespace', () => {
    expect(isSafeHttpUrl(' javascript:alert(1)')).toBe(false);
  });

  it('rejects a newline-obfuscated javascript: scheme', () => {
    expect(isSafeHttpUrl('java\nscript:alert(1)')).toBe(false);
  });

  it('rejects garbage that is not a URL at all', () => {
    expect(isSafeHttpUrl('not a url')).toBe(false);
    expect(isSafeHttpUrl('')).toBe(false);
  });

  it('accepts http:// URLs', () => {
    expect(isSafeHttpUrl('http://example.com')).toBe(true);
  });

  it('accepts https:// URLs', () => {
    expect(isSafeHttpUrl('https://example.com/path?q=1')).toBe(true);
  });
});

describe('safeHttpUrl (Zod refinement)', () => {
  it('rejects javascript: through safeParse', () => {
    expect(safeHttpUrl().safeParse('javascript:alert(1)').success).toBe(false);
  });

  it('accepts a valid https URL through safeParse', () => {
    expect(safeHttpUrl().safeParse('https://example.com').success).toBe(true);
  });

  it('bare z.string().url() accepts javascript: while safeHttpUrl rejects it', () => {
    // Regression guard: don't let anyone "simplify" the refinement back to
    // a bare z.string().url() later - it is not an equivalent check, see
    // isSafeHttpUrl's docstring for why.
    const bareUrlSchema = z.string().url();
    expect(bareUrlSchema.safeParse('javascript:alert(1)').success).toBe(true);
    expect(safeHttpUrl().safeParse('javascript:alert(1)').success).toBe(false);
  });
});
