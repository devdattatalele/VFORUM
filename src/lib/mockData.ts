import type { Event, Question, UserProfile, Comment } from './types';
import { MOCK_USER_ID, MOCK_USER_DISPLAY_NAME, MOCK_USER_PHOTO_URL, COMMUNITIES } from './constants';

export const mockUser: UserProfile = {
  uid: MOCK_USER_ID,
  displayName: MOCK_USER_DISPLAY_NAME,
  email: 'student@vit.edu.in',
  photoURL: MOCK_USER_PHOTO_URL,
};

const getRandomCommunityId = () => {
  const communities = COMMUNITIES.filter(c => c.id !== 'all');
  return communities[Math.floor(Math.random() * communities.length)].id;
}

export const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Web Dev Workshop: Mastering React Hooks',
    description: 'Join us for an in-depth workshop on React Hooks. Suitable for intermediate developers.',
    posterImageUrl: 'https://placehold.co/600x400.png?text=React+Workshop',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    clubName: 'GDG VIT',
    communityId: 'gdg',
    rsvpCount: 120,
  },
  {
    id: 'event2',
    title: 'AI and Ethics: A Panel Discussion',
    description: 'Explore the ethical implications of AI with experts in the field. Q&A session included.',
    posterImageUrl: 'https://placehold.co/600x400.png?text=AI+Ethics+Talk',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    clubName: 'AI Club VIT',
    communityId: 'ai-club',
    rsvpCount: 75,
  },
  {
    id: 'event3',
    title: 'ACM Competitive Programming Contest',
    description: 'Test your coding skills in our monthly programming challenge. Prizes for top performers!',
    posterImageUrl: 'https://placehold.co/600x400.png?text=Coding+Contest',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    clubName: 'ACM Chapter VIT',
    communityId: 'acm',
    rsvpCount: 200,
  },
  {
    id: 'event4',
    title: 'Introduction to Robotics with Arduino',
    description: 'A beginner-friendly session to get started with robotics using Arduino kits.',
    posterImageUrl: 'https://placehold.co/600x400.png?text=Robotics+Intro',
    dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (past event)
    clubName: 'Robotics Club VIT',
    communityId: 'robotics-club',
    rsvpCount: 90,
  },
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    title: 'How to deploy a Next.js app to Vercel?',
    content: 'I have a Next.js project and I want to deploy it on Vercel. What are the steps involved? Are there any common pitfalls to avoid?',
    tags: ['nextjs', 'vercel', 'deployment', 'webdev'],
    author: mockUser,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    upvotes: 25,
    downvotes: 2,
    communityId: 'gdg',
    views: 150,
    replyCount: 3,
  },
  {
    id: 'q2',
    title: 'Best resources for learning Python for Data Science?',
    content: 'I\'m new to Python and want to focus on data science applications. Can anyone recommend good books, courses, or websites?',
    tags: ['python', 'datascience', 'learning', 'resources'],
    author: { ...mockUser, uid: 'user2', displayName: 'Data Enthusiast' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    upvotes: 42,
    downvotes: 1,
    communityId: 'ai-club',
    views: 280,
    replyCount: 5,
  },
  {
    id: 'q3',
    title: 'Trouble with Arduino motor shield',
    content: 'My Arduino motor shield isn\'t working as expected. The motors just hum but don\'t spin. I\'ve checked the wiring and power supply. Any ideas?',
    tags: ['arduino', 'robotics', 'hardware', 'troubleshooting'],
    author: { ...mockUser, uid: 'user3', displayName: 'Robo Builder' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 15,
    downvotes: 0,
    communityId: 'ieee',
    views: 90,
    replyCount: 1,
  },
  {
    id: 'q4',
    title: 'Difference between pass by value and pass by reference in C++?',
    content: 'Can someone explain this concept with a clear example? I find it confusing.',
    tags: ['c++', 'programming', 'concepts'],
    author: { ...mockUser, uid: 'user4', displayName: 'Cpp Learner' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    upvotes: 30,
    downvotes: 3,
    communityId: 'acm',
    views: 120,
    replyCount: 2,
  }
];

export const mockComments: Comment[] = [
    {
        id: 'c1',
        questionId: 'q1',
        content: 'Make sure your build command in Vercel project settings is `next build` and the output directory is `.next`. Also, check environment variables!',
        author: { ...mockUser, uid: 'user-helper1', displayName: 'DevOps Guru' },
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
        upvotes: 10,
        downvotes: 1,
        parentId: null,
    },
    {
        id: 'c2',
        questionId: 'q1',
        content: 'Thanks @DevOps Guru! That helped. I also had an issue with my `next.config.js` file.',
        author: mockUser,
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
        upvotes: 3,
        downvotes: 0,
        parentId: 'c1', 
    },
    {
        id: 'c3',
        questionId: 'q2',
        content: 'I highly recommend "Python for Data Analysis" by Wes McKinney and the DataCamp platform.',
        author: { ...mockUser, uid: 'user-datasci', displayName: 'Senior Data Scientist' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        upvotes: 15,
        downvotes: 2,
        parentId: null,
    },
    {
        id: 'c4',
        questionId: 'q2',
        content: 'Kaggle Learn courses are also great for practical experience.',
        author: { ...mockUser, uid: 'user-kaggle', displayName: 'Kaggler' },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        upvotes: 8,
        downvotes: 0,
        parentId: null,
    }
];
