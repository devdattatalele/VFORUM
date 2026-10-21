import type { Comment } from "@/lib/types"

export type ThreadNode = Comment & { replies: ThreadNode[] }

// Replies attach to their parent; a reply whose parent is missing becomes
// top-level. The accepted answer leads; the rest keep the chosen order.
export function buildTree(
  comments: Comment[],
  acceptedId?: string | null
): ThreadNode[] {
  const byId = new Map<string, ThreadNode>(
    comments.map((c) => [c.id, { ...c, replies: [] }])
  )
  const roots: ThreadNode[] = []
  for (const c of comments) {
    const node = byId.get(c.id)!
    const parent = c.parentId ? byId.get(c.parentId) : undefined
    if (parent && parent !== node) parent.replies.push(node)
    else roots.push(node)
  }
  if (!acceptedId) return roots
  return roots.sort(
    (a, b) => Number(b.id === acceptedId) - Number(a.id === acceptedId)
  )
}
