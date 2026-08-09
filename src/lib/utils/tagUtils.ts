/**
 * Adds a tag to `currentTags`, normalizing to trimmed-lowercase exactly
 * once and then deduping against that normalized value (fix for #38).
 *
 * The previous inline implementations in QuestionForm normalized the value
 * being stored but tested the *raw* input against the (already lowercase)
 * stored list, so "React" typed after "react" passed the duplicate check
 * and was pushed anyway. Normalizing once, up front, and comparing like
 * with like avoids that.
 *
 * No-ops (empty/whitespace input, a duplicate, or already at `max`) return
 * the same `currentTags` reference so callers can skip a re-render with a
 * `newTags !== currentTags` check.
 */
export function addTagNormalized(currentTags: string[], input: string, max: number): string[] {
  const normalized = input.trim().toLowerCase();

  if (!normalized) return currentTags;
  if (currentTags.includes(normalized)) return currentTags;
  if (currentTags.length >= max) return currentTags;

  return [...currentTags, normalized];
}
