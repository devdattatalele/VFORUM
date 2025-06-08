import type { Community } from './types';
import { Users, Cpu, Bot, ToyBrick, Code, CalendarDays, MessageSquareQuote, Home } from 'lucide-react';

export const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/qna', label: 'Q&A Forum', icon: MessageSquareQuote },
];

export const COMMUNITIES: Community[] = [
  { id: 'all', name: 'All Communities', icon: Users },
  { id: 'gdg', name: 'Google Developer Groups (GDG)', icon: Code },
  { id: 'acm', name: 'ACM Chapter', icon: Cpu },
  { id: 'ai-club', name: 'AI Club', icon: Bot },
  { id: 'robotics-club', name: 'Robotics Club', icon: ToyBrick },
];

export const DEFAULT_COMMUNITY_ID = 'all';

export const MOCK_USER_ID = 'mock-user-123';
export const MOCK_USER_DISPLAY_NAME = 'Campus User';
export const MOCK_USER_PHOTO_URL = 'https://placehold.co/100x100.png?text=CU';
