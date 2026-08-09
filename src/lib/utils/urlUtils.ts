import { z } from 'zod';

/**
 * Returns true only for absolute http(s) URLs (fix for #20).
 *
 * Empirically verified against this project's installed Zod 3.24.2:
 * `z.string().url()` accepts `javascript:`, `data:`, `vbscript:`, and even
 * `ftp:` - it only checks that the value parses as *some* absolute URL, not
 * that its scheme is safe to put in an href/src. We allowlist http/https
 * explicitly instead.
 *
 * Relying on the WHATWG URL parser (via the global `URL`) rather than a
 * regex also takes care of the classic bypass tricks for free: per spec,
 * `new URL()` lowercases the scheme and strips leading/trailing C0-control-
 * or-space and *all* embedded tab/newline characters before it ever looks
 * at the scheme, so `"JavaScript:"`, `" javascript:..."`, and
 * `"java\nscript:..."` all resolve to protocol `javascript:` here, same as
 * the unobfuscated form, and get rejected the same way.
 */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * A Zod string schema that only accepts safe absolute http(s) URLs. Use
 * this in place of `z.string().url(...)` for any user-supplied URL that
 * will end up in an href/src - see isSafeHttpUrl for why the bare Zod
 * `.url()` check isn't sufficient on its own.
 */
export function safeHttpUrl(message = 'Please enter a valid http(s) URL.') {
  return z.string().refine(isSafeHttpUrl, { message });
}
