import { Timestamp } from 'firebase-admin/firestore';

// Server actions can only return plain JSON. Firestore hands back Timestamp
// instances (createdAt, updatedAt, ...) which React refuses to serialize at the
// server->client boundary, so every read path runs its result through this.
export function serialize<T>(value: T): T {
  if (value instanceof Timestamp) return value.toDate().toISOString() as unknown as T;
  if (Array.isArray(value)) return value.map(serialize) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serialize(v)])
    ) as T;
  }
  return value;
}
