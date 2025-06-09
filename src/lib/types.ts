export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Add other profile fields like 'role' if needed for moderation
  // role?: 'user' | 'moderator' | 'admin';
}

export interface Community {
  id: string;
  name: string;
  icon?: React.ElementType; // Lucide icon component
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  posterImageUrl: string;
  dateTime: string; // Store as ISO string, format on display
  clubName: string; 
  communityId: string; // Link to Community
  rsvpCount?: number; // Optional
  // location?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: UserProfile;
  createdAt: string; // Store as ISO string
  upvotes: number;
  downvotes: number;
  communityId: string; // Link to Community
  views: number;
  replyCount: number;
  lastActivityAt?: string; // ISO string, for sorting or display
}

export interface Comment {
  id: string;
  questionId: string;
  parentId?: string | null; // For threaded comments
  content: string;
  author: UserProfile;
  createdAt: string; // Store as ISO string
  upvotes: number;
}

export interface Tag {
  name: string;
  count?: number; // Optional: for tag clouds or popular tags
}
