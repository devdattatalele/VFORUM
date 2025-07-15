import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { Question, Event } from '@/lib/types';
import { COMMUNITIES } from '@/lib/constants';

export interface SearchResult {
  type: 'question' | 'event' | 'community';
  id: string;
  title: string;
  content: string;
  url: string;
  community?: string;
  tags?: string[];
  metadata?: any;
}

export interface SearchOptions {
  includeQuestions?: boolean;
  includeEvents?: boolean;
  includeCommunities?: boolean;
  maxResults?: number;
  communityId?: string;
}

export async function searchAll(
  searchTerm: string, 
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    includeQuestions = true,
    includeEvents = true,
    includeCommunities = true,
    maxResults = 20,
    communityId
  } = options;

  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const results: SearchResult[] = [];
  const searchQuery = searchTerm.toLowerCase().trim();

  try {
    // Search Questions
    if (includeQuestions) {
      const questionsResults = await searchQuestions(searchQuery, communityId, Math.ceil(maxResults * 0.6));
      results.push(...questionsResults);
    }

    // Search Events
    if (includeEvents) {
      const eventsResults = await searchEvents(searchQuery, communityId, Math.ceil(maxResults * 0.3));
      results.push(...eventsResults);
    }

    // Search Communities
    if (includeCommunities && !communityId) {
      const communitiesResults = searchCommunities(searchQuery, Math.ceil(maxResults * 0.1));
      results.push(...communitiesResults);
    }

    // Sort by relevance (exact matches first, then partial matches)
    return results
      .sort((a, b) => {
        const aExactMatch = a.title.toLowerCase().includes(searchQuery) ? 1 : 0;
        const bExactMatch = b.title.toLowerCase().includes(searchQuery) ? 1 : 0;
        return bExactMatch - aExactMatch;
      })
      .slice(0, maxResults);
  } catch (error) {
    console.error('Error during search:', error);
    return [];
  }
}

async function searchQuestions(searchTerm: string, communityId?: string, maxResults: number = 12): Promise<SearchResult[]> {
  try {
    const questionsRef = collection(db, 'questions');
    let q = query(questionsRef, orderBy('createdAt', 'desc'), limit(50)); // Get more to filter locally
    
    if (communityId) {
      q = query(questionsRef, where('communityId', '==', communityId), orderBy('createdAt', 'desc'), limit(50));
    }

    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        communityId: data.communityId,
        author: data.author,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        lastActivityAt: data.lastActivityAt?.toDate ? data.lastActivityAt.toDate().toISOString() : data.lastActivityAt,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        views: data.views || 0,
        replyCount: data.replyCount || 0,
      });
    });

    // Filter questions that match the search term
    const filteredQuestions = questions.filter(question => {
      const titleMatch = question.title.toLowerCase().includes(searchTerm);
      const contentMatch = question.content.toLowerCase().includes(searchTerm);
      const tagMatch = question.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      return titleMatch || contentMatch || tagMatch;
    });

    return filteredQuestions.slice(0, maxResults).map(question => {
      const community = COMMUNITIES.find(c => c.id === question.communityId);
      return {
        type: 'question' as const,
        id: question.id,
        title: question.title,
        content: question.content.substring(0, 150) + (question.content.length > 150 ? '...' : ''),
        url: `/qna/${question.id}`,
        community: community?.name,
        tags: question.tags,
        metadata: {
          author: question.author.displayName,
          upvotes: question.upvotes,
          replyCount: question.replyCount,
          createdAt: question.createdAt
        }
      };
    });
  } catch (error) {
    console.error('Error searching questions:', error);
    return [];
  }
}

async function searchEvents(searchTerm: string, communityId?: string, maxResults: number = 6): Promise<SearchResult[]> {
  try {
    const eventsRef = collection(db, 'events');
    let q = query(eventsRef, orderBy('dateTime', 'desc'), limit(30));
    
    if (communityId) {
      q = query(eventsRef, where('communityId', '==', communityId), orderBy('dateTime', 'desc'), limit(30));
    }

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        clubName: data.clubName,
        communityId: data.communityId,
        dateTime: data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : data.dateTime,
        posterImageUrl: data.posterImageUrl,
        rsvpLink: data.rsvpLink,
        rsvpCount: data.rsvpCount || 0,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      });
    });

    // Filter events that match the search term
    const filteredEvents = events.filter(event => {
      const titleMatch = event.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = event.description.toLowerCase().includes(searchTerm);
      const clubMatch = event.clubName.toLowerCase().includes(searchTerm);
      return titleMatch || descriptionMatch || clubMatch;
    });

    return filteredEvents.slice(0, maxResults).map(event => {
      const community = COMMUNITIES.find(c => c.id === event.communityId);
      return {
        type: 'event' as const,
        id: event.id,
        title: event.title,
        content: event.description.substring(0, 150) + (event.description.length > 150 ? '...' : ''),
        url: `/events/${event.id}`,
        community: community?.name,
        metadata: {
          clubName: event.clubName,
          dateTime: event.dateTime,
          rsvpCount: event.rsvpCount
        }
      };
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

function searchCommunities(searchTerm: string, maxResults: number = 2): SearchResult[] {
  try {
    const filteredCommunities = COMMUNITIES.filter(community => {
      if (community.id === 'all') return false;
      const nameMatch = community.name.toLowerCase().includes(searchTerm);
      const descriptionMatch = community.description?.toLowerCase().includes(searchTerm);
      return nameMatch || descriptionMatch;
    });

    return filteredCommunities.slice(0, maxResults).map(community => ({
      type: 'community' as const,
      id: community.id,
      title: community.name,
      content: community.description || `Explore ${community.name} community`,
      url: `/community/${community.id}`,
      metadata: {
        icon: community.icon
      }
    }));
  } catch (error) {
    console.error('Error searching communities:', error);
    return [];
  }
}

// Quick search for autocomplete/suggestions
export async function quickSearch(searchTerm: string, maxResults: number = 8): Promise<SearchResult[]> {
  return searchAll(searchTerm, {
    includeQuestions: true,
    includeEvents: true,
    includeCommunities: true,
    maxResults
  });
} 