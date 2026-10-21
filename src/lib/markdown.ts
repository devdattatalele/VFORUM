// Markdown reduced to one line of text, for list excerpts and search results.
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?(```|$)/g, " ") // fenced code blocks
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "") // headings, quotes, lists
    .replace(/(\*\*|__|~~)(.+?)\1/g, "$2") // bold, strikethrough
    .replace(/(^|\W)[*_](\S[^*_]*?)[*_](?=\W|$)/g, "$1$2") // italics
    .replace(/\s+/g, " ")
    .trim()
}

export function excerpt(markdown: string, length = 150): string {
  const text = plainText(markdown)
  return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text
}
