import type { Comment } from '@/lib/types';

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

/**
 * Builds a threaded comment tree from a flat list of comments.
 *
 * Comments are matched to their parent via `parentId`. A comment whose
 * `parentId` doesn't resolve to another comment in the input (e.g. the
 * parent was filtered out or deleted) is promoted to top-level rather than
 * dropped. Both passes are flat iterations with no recursion, so a
 * `parentId` cycle in the input can never cause unbounded recursion -
 * construction always terminates.
 */
export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const topLevelComments: CommentWithReplies[] = [];

  // First pass: create all comment objects
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build the tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentWithReplies);
      } else {
        // Parent not found, treat as top-level
        topLevelComments.push(commentWithReplies);
      }
    } else {
      topLevelComments.push(commentWithReplies);
    }
  });

  return topLevelComments;
}
