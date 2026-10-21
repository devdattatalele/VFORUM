// Links stored by users are rendered as href/src. Only http(s) may pass, so a
// stored "javascript:" URL can never run.
export function safeHttpUrl(
  url: string | null | undefined
): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined
  } catch {
    return undefined
  }
}
