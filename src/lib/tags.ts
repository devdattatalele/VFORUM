export const MAX_TAGS = 5
export const MAX_TAG_LENGTH = 30

// "Machine Learning" -> "machine-learning", "CI/CD" -> "cicd", "C++" -> "c++".
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9+#.-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_TAG_LENGTH)
}

export function normalizeTags(raw: string[]): string[] {
  return Array.from(new Set(raw.map(normalizeTag).filter(Boolean)))
}
