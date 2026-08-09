import type { Question } from '@/lib/types';

export interface QuestionFilterOptions {
  communityFilter?: string | null;
  tagFilter?: string | null;
  searchTerm?: string | null;
}

/**
 * Filters a list of questions by community, tag, and free-text search term.
 * Any option that is omitted, null, or (for communityFilter) 'all' is
 * skipped. Always returns a new array - never mutates `questions`.
 */
export function filterQuestions(
  questions: Question[],
  { communityFilter, tagFilter, searchTerm }: QuestionFilterOptions = {}
): Question[] {
  let filtered = questions;

  if (communityFilter && communityFilter !== 'all') {
    filtered = filtered.filter(q => q.communityId === communityFilter);
  }
  if (tagFilter) {
    filtered = filtered.filter(q => q.tags.includes(tagFilter));
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      q =>
        q.title.toLowerCase().includes(term) ||
        q.content.toLowerCase().includes(term) ||
        q.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  return filtered;
}

/**
 * Sorts questions by the given key. Always returns a new array and never
 * mutates `questions` - the original bug (#40) called
 * Array.prototype.sort() directly on the array that was also the React
 * `questions` state, silently reordering it in place whenever no filter
 * was active (since `filtered = questions` was then the same reference).
 */
export function sortQuestions(questions: Question[], sortBy: string): Question[] {
  const sorted = [...questions];

  sorted.sort((a, b) => {
    const aActivity = a.lastActivityAt || a.createdAt;
    const bActivity = b.lastActivityAt || b.createdAt;

    switch (sortBy) {
      case 'recent-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'recent-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'activity-asc':
        return new Date(aActivity).getTime() - new Date(bActivity).getTime();
      case 'popular-desc': // by views
        return (b.views || 0) - (a.views || 0);
      case 'replies-desc':
        return (b.replyCount || 0) - (a.replyCount || 0);
      case 'upvotes-desc':
        return (b.upvotes || 0) - (a.upvotes || 0);
      case 'activity-desc':
      default:
        return new Date(bActivity).getTime() - new Date(aActivity).getTime();
    }
  });

  return sorted;
}
