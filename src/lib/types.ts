export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'user' | 'moderator' | 'admin';
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  rsvpLink?: string; // Optional external RSVP link
  // location?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: UserProfile;
  createdAt: string; // Store as ISO string
  updatedAt?: string; // ISO string, for tracking edits
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
  updatedAt?: string; // ISO string, for tracking edits
  upvotes: number;
  downvotes: number; // Add downvotes field
}

export interface Tag {
  name: string;
  count?: number; // Optional: for tag clouds or popular tags
}
