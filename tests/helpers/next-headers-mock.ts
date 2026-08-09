// A minimal stand-in for `next/headers`'s cookies(), aliased in for the
// `integration` Vitest project (see vitest.config.ts) so route handlers and
// server-only helpers - src/app/api/auth/session/route.ts and
// src/lib/auth/session.ts - can run outside the real Next.js request
// runtime, which has nothing to back a `next/headers` import on its own.
//
// Both of those call sites `await cookies()`, since it is async in Next 15;
// this mock matches that shape. State lives in a single module-scope jar
// shared by every import of this file within one test file's module graph -
// call __resetCookieJar() between tests (wired into
// tests/helpers/setup.integration.ts's beforeEach) to avoid one test's
// cookie leaking into the next.

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  path?: string;
  maxAge?: number;
  domain?: string;
  expires?: Date | number;
}

export interface CapturedCookie {
  value: string;
  options?: CookieOptions;
}

const jar = new Map<string, CapturedCookie>();

function get(name: string): { name: string; value: string } | undefined {
  const entry = jar.get(name);
  return entry ? { name, value: entry.value } : undefined;
}

function getAll(): Array<{ name: string; value: string }> {
  return Array.from(jar.entries()).map(([name, entry]) => ({ name, value: entry.value }));
}

function has(name: string): boolean {
  return jar.has(name);
}

function set(name: string, value: string, options?: CookieOptions): void {
  jar.set(name, { value, options });
}

function deleteCookie(name: string): void {
  jar.delete(name);
}

/** Aliased over `next/headers` for the `integration` project - see vitest.config.ts. */
export async function cookies() {
  return { get, getAll, has, set, delete: deleteCookie };
}

/**
 * Test-only: inspect exactly what was passed to set(), including the
 * options object (real next/headers exposes no such introspection - this is
 * why the mock exists rather than just using the real thing under a
 * different runtime).
 */
export function __getCapturedCookie(name: string): CapturedCookie | undefined {
  return jar.get(name);
}

/** Test-only: wipe the jar. Not part of the real next/headers surface. */
export function __resetCookieJar(): void {
  jar.clear();
}
